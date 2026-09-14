from rest_framework import serializers
from .models import BotConversation, BotMessage


class BotMessageSerializer(serializers.ModelSerializer):
    who = serializers.SerializerMethodField()
    text = serializers.CharField(source='content')

    class Meta:
        model = BotMessage
        fields = ['id', 'role', 'who', 'text', 'created_at']
        read_only_fields = fields

    def get_who(self, obj):
        return 'bot' if obj.role == BotMessage.Role.ASSISTANT else 'user'


class BotConversationSerializer(serializers.ModelSerializer):
    messages = BotMessageSerializer(many=True, read_only=True)

    class Meta:
        model = BotConversation
        fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
        read_only_fields = fields


class BotSendMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    playbook_context = serializers.CharField(required=False, allow_blank=True)
