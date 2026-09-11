from django.db import transaction
from django.utils import timezone

from apps.grades.models import CallGrade
from apps.protocol.models import UserProtocol

from .models import (
    Assignment,
    UserCard,
    UserDrill,
    UserKpiStat,
    UserProgress,
    UserScenarioStat,
)


def get_or_create_progress(user):
    progress, _ = UserProgress.objects.get_or_create(user=user)
    return progress


def get_or_create_protocol(user):
    protocol, _ = UserProtocol.objects.get_or_create(user=user)
    return protocol


def _str_map(raw):
    if not isinstance(raw, dict):
        return {}
    return {str(key): value for key, value in raw.items()}


def proto_to_frontend(protocol):
    weekly = []
    for item in protocol.weekly_sessions or []:
        if not isinstance(item, dict):
            continue
        weekly.append({
            'd': item.get('d', item.get('drill_number')),
            't': item.get('t', item.get('date')),
        })
    return {
        'phase': protocol.phase,
        'p1': list(protocol.p1_dates or []),
        'anchors': protocol.anchor_reps or {},
        'd12': protocol.d12_pass or {},
        'weekly': weekly,
    }


def apply_proto(protocol, proto):
    if not isinstance(proto, dict):
        return protocol
    if 'phase' in proto and proto['phase'] is not None:
        protocol.phase = max(1, min(4, int(proto['phase'])))
    if 'p1' in proto:
        protocol.p1_dates = list(proto['p1'] or [])
    if 'anchors' in proto:
        protocol.anchor_reps = _str_map(proto['anchors'])
    if 'd12' in proto:
        protocol.d12_pass = _str_map(proto['d12'])
    if 'weekly' in proto:
        weekly = []
        for item in proto['weekly'] or []:
            if not isinstance(item, dict):
                continue
            weekly.append({
                'drill_number': item.get('d', item.get('drill_number')),
                'date': item.get('t', item.get('date')),
            })
        protocol.weekly_sessions = weekly
    protocol.save()
    return protocol


def last_grade_to_frontend(grade):
    if not grade:
        return None
    return {
        'id': str(grade.id),
        'summary': grade.summary,
        'scorecard': grade.scorecard,
        'failures': grade.failures,
        'scenarioTags': grade.scenario_tags,
        'died': grade.died,
        'drills': grade.assigned_drills,
    }


def assignment_to_frontend(assignment):
    return {
        'name': assignment.name,
        'why': assignment.why,
        'sets': assignment.sets,
        'pass': assignment.pass_condition,
        'done': assignment.done,
    }


def build_snapshot(user):
    progress = get_or_create_progress(user)
    protocol = get_or_create_protocol(user)

    cards = {
        str(card.card_index): card.mastery
        for card in UserCard.objects.filter(user=user)
    }
    drills = {
        str(drill.drill_number): drill.sets_completed
        for drill in UserDrill.objects.filter(user=user)
    }
    kpi_stats = {
        str(row.kpi_number): {
            'pass': row.pass_count,
            'partial': row.partial_count,
            'fail': row.fail_count,
        }
        for row in UserKpiStat.objects.filter(user=user)
    }
    scen_stats = {
        str(row.scenario_number): {
            'count': row.count,
            'fail': row.fail_count,
        }
        for row in UserScenarioStat.objects.filter(user=user)
    }
    assignments = [
        assignment_to_frontend(item)
        for item in Assignment.objects.filter(user=user).order_by('created_at')
    ]
    last_grade = CallGrade.objects.filter(user=user).first()

    return {
        'rank': progress.rank,
        'best': progress.best or {},
        'cards': cards,
        'drills': drills,
        'assignments': assignments,
        'kpiStats': kpi_stats,
        'scenStats': scen_stats,
        'customDone': progress.custom_done,
        'proto': proto_to_frontend(protocol),
        'lastGrade': last_grade_to_frontend(last_grade),
    }


def _upsert_int_map(user, progress, model, index_field, value_field, payload, value_getter):
    incoming = {}
    for key, value in _str_map(payload).items():
        try:
            incoming[int(key)] = value_getter(value)
        except (TypeError, ValueError):
            continue

    existing = {
        getattr(row, index_field): row
        for row in model.objects.filter(user=user)
    }
    for index, value in incoming.items():
        row = existing.pop(index, None)
        if row is None:
            model.objects.create(
                user=user,
                progress=progress,
                **{index_field: index, value_field: value},
            )
        elif getattr(row, value_field) != value:
            setattr(row, value_field, value)
            row.save(update_fields=[value_field, 'updated_at'])
    if existing:
        model.objects.filter(pk__in=[row.pk for row in existing.values()]).delete()


def _apply_kpi_stats(user, progress, payload):
    incoming = {}
    for key, value in _str_map(payload).items():
        if not isinstance(value, dict):
            continue
        try:
            incoming[int(key)] = {
                'pass_count': int(value.get('pass') or 0),
                'partial_count': int(value.get('partial') or 0),
                'fail_count': int(value.get('fail') or 0),
            }
        except (TypeError, ValueError):
            continue

    existing = {row.kpi_number: row for row in UserKpiStat.objects.filter(user=user)}
    for number, counts in incoming.items():
        row = existing.pop(number, None)
        if row is None:
            UserKpiStat.objects.create(
                user=user,
                progress=progress,
                kpi_number=number,
                **counts,
            )
        else:
            for field, val in counts.items():
                setattr(row, field, val)
            row.save(update_fields=['pass_count', 'partial_count', 'fail_count', 'updated_at'])
    if existing:
        UserKpiStat.objects.filter(pk__in=[row.pk for row in existing.values()]).delete()


def _apply_scen_stats(user, progress, payload):
    incoming = {}
    for key, value in _str_map(payload).items():
        if not isinstance(value, dict):
            continue
        try:
            incoming[int(key)] = {
                'count': int(value.get('count') or 0),
                'fail_count': int(value.get('fail') or 0),
            }
        except (TypeError, ValueError):
            continue

    existing = {
        row.scenario_number: row
        for row in UserScenarioStat.objects.filter(user=user)
    }
    for number, counts in incoming.items():
        row = existing.pop(number, None)
        if row is None:
            UserScenarioStat.objects.create(
                user=user,
                progress=progress,
                scenario_number=number,
                **counts,
            )
        else:
            for field, val in counts.items():
                setattr(row, field, val)
            row.save(update_fields=['count', 'fail_count', 'updated_at'])
    if existing:
        UserScenarioStat.objects.filter(pk__in=[row.pk for row in existing.values()]).delete()


def _apply_assignments(user, progress, items):
    Assignment.objects.filter(user=user).delete()
    for item in items or []:
        if not isinstance(item, dict):
            continue
        name = (item.get('name') or '').strip()
        if not name:
            continue
        done = bool(item.get('done'))
        Assignment.objects.create(
            user=user,
            progress=progress,
            name=name[:255],
            why=item.get('why') or '',
            sets=str(item.get('sets') if item.get('sets') not in (None, '') else '2'),
            pass_condition=item.get('pass_condition') or item.get('pass') or '',
            done=done,
            completed_at=timezone.now() if done else None,
        )


def _maybe_save_last_grade(user, last_grade):
    if not last_grade or not isinstance(last_grade, dict):
        return
    if last_grade.get('id'):
        return
    scorecard = last_grade.get('scorecard') or []
    summary = last_grade.get('summary') or ''
    if not scorecard and not summary:
        return

    latest = CallGrade.objects.filter(user=user).first()
    if latest and latest.summary == summary and latest.scorecard == scorecard:
        return

    from apps.grades.serializers import sync_grade_kpi_scores

    grade = CallGrade.objects.create(
        user=user,
        summary=summary,
        died=last_grade.get('died') or '',
        scorecard=scorecard,
        failures=last_grade.get('failures') or [],
        scenario_tags=last_grade.get('scenarioTags') or last_grade.get('scenario_tags') or [],
        assigned_drills=last_grade.get('drills') or last_grade.get('assigned_drills') or [],
        transcript=last_grade.get('transcript') or '',
        overall_pass=bool(last_grade.get('overall_pass')),
    )
    sync_grade_kpi_scores(grade)


@transaction.atomic
def apply_snapshot(user, data, partial=False):
    progress = get_or_create_progress(user)
    protocol = get_or_create_protocol(user)
    payload = data or {}

    if 'rank' in payload and payload.get('rank') is not None:
        progress.rank = max(0, min(3, int(payload['rank'])))
    if 'best' in payload:
        progress.best = payload.get('best') or {}
    if 'customDone' in payload:
        progress.custom_done = int(payload.get('customDone') or 0)
    progress.save()

    if 'cards' in payload:
        _upsert_int_map(
            user, progress, UserCard, 'card_index', 'mastery',
            payload.get('cards') or {},
            lambda value: int(value or 0),
        )
    if 'drills' in payload:
        _upsert_int_map(
            user, progress, UserDrill, 'drill_number', 'sets_completed',
            payload.get('drills') or {},
            lambda value: int(value or 0),
        )
    if 'kpiStats' in payload:
        _apply_kpi_stats(user, progress, payload.get('kpiStats') or {})
    if 'scenStats' in payload:
        _apply_scen_stats(user, progress, payload.get('scenStats') or {})
    if 'assignments' in payload:
        _apply_assignments(user, progress, payload.get('assignments') or [])
    if 'proto' in payload:
        apply_proto(protocol, payload.get('proto') or {})
    if 'lastGrade' in payload:
        _maybe_save_last_grade(user, payload.get('lastGrade'))

    return build_snapshot(user)
