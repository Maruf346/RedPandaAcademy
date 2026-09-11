from rest_framework import serializers
from .models import (
    UserProgress, Assignment, UserCard, UserDrill,
    UserKpiStat, UserScenarioStat
)


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = [
            'id', 'rank', 'best', 'custom_done',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'id', 'name', 'why', 'sets', 'pass_condition', 'done',
            'completed_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']

    def to_internal_value(self, data):
        data = dict(data)
        if data.get('pass_condition') in (None, '') and data.get('pass') is not None:
            data['pass_condition'] = data.get('pass')
        if 'sets' in data and data['sets'] is not None:
            data['sets'] = str(data['sets'])
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['pass'] = instance.pass_condition
        return data


class UserCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCard
        fields = ['id', 'card_index', 'mastery', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserDrillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDrill
        fields = ['id', 'drill_number', 'sets_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserKpiStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserKpiStat
        fields = [
            'id', 'kpi_number', 'pass_count', 'partial_count', 'fail_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserScenarioStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScenarioStat
        fields = [
            'id', 'scenario_number', 'count', 'fail_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SnapshotAssignmentSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    why = serializers.CharField(required=False, allow_blank=True, default='')
    sets = serializers.CharField(required=False, allow_blank=True, default='2')
    done = serializers.BooleanField(required=False, default=False)
    pass_condition = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            data = {}
        else:
            data = dict(data)
        if data.get('pass_condition') in (None, '') and data.get('pass') is not None:
            data['pass_condition'] = data.get('pass')
        if 'sets' in data and data['sets'] is not None:
            data['sets'] = str(data['sets'])
        return super().to_internal_value(data)

    def to_representation(self, instance):
        if hasattr(instance, 'name'):
            return {
                'name': instance.name,
                'why': instance.why,
                'sets': instance.sets,
                'pass': instance.pass_condition,
                'done': instance.done,
            }
        data = dict(instance)
        data.setdefault('pass', data.get('pass_condition', ''))
        return data


class ProgressSnapshotSerializer(serializers.Serializer):
    """
    Full progress snapshot for frontend sync.
    Matches ProgressContext state (camelCase).
    """
    rank = serializers.IntegerField(required=False, min_value=0, max_value=3)
    best = serializers.JSONField(required=False)
    cards = serializers.JSONField(required=False)
    drills = serializers.JSONField(required=False)
    assignments = SnapshotAssignmentSerializer(many=True, required=False)
    kpiStats = serializers.JSONField(required=False)
    scenStats = serializers.JSONField(required=False)
    customDone = serializers.IntegerField(required=False, min_value=0)
    proto = serializers.JSONField(required=False)
    lastGrade = serializers.JSONField(required=False, allow_null=True)
