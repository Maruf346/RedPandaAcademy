from rest_framework import serializers
from .models import QuizAttempt, CallGrade, GradeKpiScore


def sync_grade_kpi_scores(grade):
    GradeKpiScore.objects.filter(call_grade=grade).delete()
    rows = []
    for item in grade.scorecard or []:
        if not isinstance(item, dict) or item.get('n') is None:
            continue
        rows.append(GradeKpiScore(
            call_grade=grade,
            kpi_number=item.get('n'),
            score=str(item.get('score') or '')[:10],
            note=item.get('note') or '',
        ))
    if rows:
        GradeKpiScore.objects.bulk_create(rows)


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for QuizAttempt model."""
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz_name', 'quiz_index', 'total_questions',
            'correct_count', 'score_percent', 'passed',
            'missed_topics', 'attempted_at'
        ]
        read_only_fields = ['id', 'attempted_at']


class GradeKpiScoreSerializer(serializers.ModelSerializer):
    """Serializer for GradeKpiScore model."""
    
    class Meta:
        model = GradeKpiScore
        fields = ['id', 'kpi_number', 'score', 'note']
        read_only_fields = ['id']


class CallGradeSerializer(serializers.ModelSerializer):
    """Serializer for CallGrade model."""
    kpi_scores = GradeKpiScoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = CallGrade
        fields = [
            'id', 'transcript', 'summary', 'died',
            'scorecard', 'failures', 'scenario_tags',
            'assigned_drills', 'overall_pass',
            'kpi_scores', 'graded_at'
        ]
        read_only_fields = ['id', 'graded_at']

    def create(self, validated_data):
        grade = super().create(validated_data)
        sync_grade_kpi_scores(grade)
        return grade

    def to_internal_value(self, data):
        data = dict(data)
        if 'scenario_tags' not in data and data.get('scenarioTags') is not None:
            data['scenario_tags'] = data.get('scenarioTags')
        if 'assigned_drills' not in data and data.get('drills') is not None:
            data['assigned_drills'] = data.get('drills')
        return super().to_internal_value(data)