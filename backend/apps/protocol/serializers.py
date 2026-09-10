from rest_framework import serializers
from .models import UserProtocol, AnchorRep, WeeklySession


class UserProtocolSerializer(serializers.ModelSerializer):
    """Serializer for UserProtocol model."""
    
    class Meta:
        model = UserProtocol
        fields = [
            'id', 'phase', 'p1_dates', 'anchor_reps', 'd12_pass', 'weekly_sessions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnchorRepSerializer(serializers.ModelSerializer):
    """Serializer for AnchorRep model."""
    
    class Meta:
        model = AnchorRep
        fields = ['id', 'anchor_index', 'rep_number', 'completed_at']
        read_only_fields = ['id', 'completed_at']


class WeeklySessionSerializer(serializers.ModelSerializer):
    """Serializer for WeeklySession model."""
    
    class Meta:
        model = WeeklySession
        fields = ['id', 'drill_number', 'session_date', 'duration_minutes', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']