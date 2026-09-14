import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Notification, NotificationType, NotificationPriority

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Web-only notification service.
    Saves to DB and pushes via WebSocket (Django Channels).
    No FCM / mobile push notifications.
    """

    @staticmethod
    def send_notification(
        user,
        notification_type: str,
        title: str,
        body: str,
        data: dict = None,
        priority: str = NotificationPriority.NORMAL,
    ):
        # Save to DB
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority
        )

        # Push via WebSocket
        ws_success = NotificationService._send_websocket(
            user_id=str(user.id),
            notification_id=str(notification.id),
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority,
            created_at=notification.created_at.isoformat(),
        )

        if ws_success:
            logger.info(f'Notification sent via WebSocket to {user.email}: {notification_type}')
        else:
            logger.warning(f'WebSocket delivery failed for {user.email}: {notification_type}')

        return notification

    @staticmethod
    def _send_websocket(
        user_id, notification_id, notification_type,
        title, body, data, priority, created_at
    ):
        try:
            channel_layer = get_channel_layer()
            group_name = f'user_{user_id}'

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification_id': notification_id,
                    'notification_type': notification_type,
                    'title': title,
                    'body': body,
                    'data': data,
                    'priority': priority,
                    'created_at': created_at,
                }
            )
            return True

        except Exception as e:
            logger.error(f'WebSocket send failed for user {user_id}: {str(e)}')
            return False

    @staticmethod
    def send_to_players(notification_type, title, body, data=None):
        """Send notification to all active player accounts."""
        players = User.objects.filter(is_superuser=False, is_active=True)
        for user in players:
            NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data,
            )


class NotificationTemplates:
    """
    Ready-made notification templates for all events in the system.
    Call these from views, signals, or Celery tasks.
    """

    # ==================== AUTH ====================

    @staticmethod
    def welcome(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.WELCOME,
            title='Welcome to Red Panda Academy',
            body=f'Hi {user.full_name or user.email}, your player account is ready. Start your learning journey and keep pushing your progress.',
            priority=NotificationPriority.NORMAL,
        )

    @staticmethod
    def new_user_joined(user):
        admins = User.objects.filter(is_superuser=True, is_active=True)
        for admin in admins:
            NotificationService.send_notification(
                user=admin,
                notification_type=NotificationType.PLAYER_JOINED,
                title='A new player joined Red Panda Academy',
                body=f'{user.full_name or user.email} just joined the platform.',
                data={'user_id': str(user.id), 'email': user.email},
                priority=NotificationPriority.NORMAL,
            )

    @staticmethod
    def password_updated(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.PASSWORD_UPDATED,
            title='Password reset successful',
            body="Your password has been reset successfully. If this wasn't you, contact support immediately.",
            priority=NotificationPriority.HIGH,
        )

    @staticmethod
    def password_changed(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.PASSWORD_CHANGED,
            title='Password changed',
            body="Your password was changed successfully. If this wasn't you, contact support right away.",
            priority=NotificationPriority.HIGH,
        )

    # ==================== TRAINING PROGRESS ====================

    @staticmethod
    def _safe_send(user, notification_type, title, body, data=None, priority=NotificationPriority.NORMAL):
        try:
            return NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data or {},
                priority=priority,
            )
        except Exception as exc:
            logger.error('Notification failed for %s: %s', getattr(user, 'email', user), exc)
            return None

    @staticmethod
    def rank_upgraded(user, old_rank, new_rank):
        ranks = ['Newcomer', 'Apprentice', 'Closer', 'Top Rep']
        title = f'Rank upgraded: {ranks[new_rank] if new_rank < len(ranks) else f"Rank {new_rank}"}'
        body = f'Nice work. You moved from {ranks[old_rank] if old_rank < len(ranks) else old_rank} to {ranks[new_rank] if new_rank < len(ranks) else new_rank}.'
        return NotificationTemplates._safe_send(
            user,
            NotificationType.RANK_UPGRADED,
            title,
            body,
            {'old_rank': old_rank, 'new_rank': new_rank},
            NotificationPriority.HIGH,
        )

    @staticmethod
    def quiz_attempt(user, attempt):
        if attempt.passed:
            return NotificationTemplates._safe_send(
                user,
                NotificationType.QUIZ_PASSED,
                f'{attempt.quiz_name} passed',
                f'You scored {attempt.score_percent}% and cleared the pass line.',
                {'quiz_id': str(attempt.id), 'quiz_index': attempt.quiz_index, 'score_percent': attempt.score_percent},
                NotificationPriority.HIGH,
            )
        return NotificationTemplates._safe_send(
            user,
            NotificationType.QUIZ_FAILED,
            f'{attempt.quiz_name} needs one more run',
            f'You scored {attempt.score_percent}%. Review the missed topics and retake it.',
            {
                'quiz_id': str(attempt.id),
                'quiz_index': attempt.quiz_index,
                'score_percent': attempt.score_percent,
                'missed_topics': attempt.missed_topics,
            },
        )

    @staticmethod
    def call_graded(user, grade):
        failed = sum(1 for row in grade.scorecard or [] if row.get('score') == 'fail')
        partial = sum(1 for row in grade.scorecard or [] if row.get('score') == 'partial')
        return NotificationTemplates._safe_send(
            user,
            NotificationType.CALL_GRADED,
            'Call grade is ready',
            grade.summary or f'Grade saved with {failed} failed KPIs and {partial} partial KPIs.',
            {'grade_id': str(grade.id), 'failed_kpis': failed, 'partial_kpis': partial},
            NotificationPriority.HIGH if failed else NotificationPriority.NORMAL,
        )

    @staticmethod
    def assignment_completed(user, assignment):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.ASSIGNMENT_COMPLETED,
            'Assignment completed',
            f'{assignment.name} is marked complete.',
            {'assignment_id': str(assignment.id), 'name': assignment.name},
        )

    @staticmethod
    def card_mastered(user, card):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.CARD_MASTERED,
            'Script card mastered',
            f'Card {card.card_index + 1} is now mastered.',
            {'card_id': str(card.id), 'card_index': card.card_index, 'mastery': card.mastery},
        )

    @staticmethod
    def drill_milestone(user, drill):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.DRILL_MILESTONE,
            f'Drill {drill.drill_number} milestone',
            f'You have logged {drill.sets_completed} completed sets for Drill {drill.drill_number}.',
            {'drill_id': str(drill.id), 'drill_number': drill.drill_number, 'sets_completed': drill.sets_completed},
        )

    @staticmethod
    def custom_training_completed(user, total):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.CUSTOM_TRAINING_COMPLETED,
            'Custom training completed',
            f'Custom sessions completed: {total}.',
            {'custom_done': total},
        )

    @staticmethod
    def protocol_phase_advanced(user, phase):
        names = {1: 'Skeleton', 2: 'Verbatim Anchors', 3: 'Universal Flow', 4: 'Interleaved Routing'}
        return NotificationTemplates._safe_send(
            user,
            NotificationType.PROTOCOL_PHASE_ADVANCED,
            f'Protocol Phase {phase} unlocked',
            f'You advanced to {names.get(phase, f"Phase {phase}")}.',
            {'phase': phase},
            NotificationPriority.HIGH,
        )

    @staticmethod
    def protocol_recall_streak(user, streak):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.PROTOCOL_RECALL_STREAK,
            f'{streak}-day recall streak',
            'Blank-page recall is stacking. Keep the skeleton cold and in order.',
            {'streak': streak},
        )

    @staticmethod
    def anchor_mastered(user, anchor_index, reps):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.ANCHOR_MASTERED,
            f'Anchor {anchor_index + 1} mastered',
            f'You logged {reps} clean reps on this anchor script.',
            {'anchor_index': anchor_index, 'reps': reps},
        )

    @staticmethod
    def protocol_drill_passed(user, drill_number):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.PROTOCOL_DRILL_PASSED,
            f'Drill {drill_number} pass condition met',
            f'Protocol Drill {drill_number} is marked as passed.',
            {'drill_number': drill_number},
        )

    @staticmethod
    def weekly_session_logged(user, drill_number, date):
        return NotificationTemplates._safe_send(
            user,
            NotificationType.WEEKLY_SESSION_LOGGED,
            'Weekly live session logged',
            f'Drill {drill_number} was logged for {date}.',
            {'drill_number': drill_number, 'date': date},
        )

