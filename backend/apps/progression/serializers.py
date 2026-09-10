from rest_framework import serializers
from .models import (
    UserProgress, Assignment, UserCard, UserDrill,
    UserKpiStat, UserScenarioStat
)
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserProgress model."""
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'rank', 'best', 'custom_done',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Assignment model."""
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'name', 'why', 'sets', 'pass_condition', 'done',
            'completed_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class UserCardSerializer(serializers.ModelSerializer):
    """Serializer for UserCard model."""
    
    class Meta:
        model = UserCard
        fields = ['id', 'card_index', 'mastery', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserDrillSerializer(serializers.ModelSerializer):
    """Serializer for UserDrill model."""
    
    class Meta:
        model = UserDrill
        fields = ['id', 'drill_number', 'sets_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserKpiStatSerializer(serializers.ModelSerializer):
    """Serializer for UserKpiStat model."""
    
    class Meta:
        model = UserKpiStat
        fields = [
            'id', 'kpi_number', 'pass_count', 'partial_count', 'fail_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserScenarioStatSerializer(serializers.ModelSerializer):
    """Serializer for UserScenarioStat model."""
    
    class Meta:
        model = UserScenarioStat
        fields = [
            'id', 'scenario_number', 'count', 'fail_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgressSnapshotSerializer(serializers.Serializer):
    """
    Full progress snapshot for frontend sync.
    Matches the frontend's ProgressContext state shape.
    """
    rank = serializers.IntegerField(default=0)
    best = serializers.JSONField(default=dict)
    cards = serializers.JSONField(default=dict, help_text="Card mastery by index {index: mastery}")
    drills = serializers.JSONField(default=dict, help_text="Drill sets by drill number {number: count}")
    assignments = AssignmentSerializer(many=True, default=list)
    kpiStats = serializers.JSONField(default=dict, help_text="KPI stats by number")
    scenStats = serializers.JSONField(default=dict, help_text="Scenario stats by number")
    customDone = serializers.IntegerField(default=0)
    proto = serializers.JSONField(default=dict, help_text="Protocol state")
    lastGrade = serializers.JSONField(default=dict, allow_null=True, help_text="Last call grade")
    
    def create(self, validated_data):
        return validated_data
    
    def update(self, instance, validated_data):
        return validated_data