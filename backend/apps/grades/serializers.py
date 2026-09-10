from rest_framework import serializers
from .models import QuizAttempt, CallGrade, GradeKpiScore


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