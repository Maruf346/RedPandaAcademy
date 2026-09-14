from rest_framework import serializers
from .models import BotConversation, BotMessage


class BotMessageSerializer(serializers.ModelSerializer):
    who = serializers.SerializerMethodField()
    text = serializers.CharField(source='content')

    class Meta:
        model = BotMessage
        fields = ['id', 'role', 'who', 'text', 'created_at']
        read_only_fields = fields

    def get_who(self, obj) -> str:
        return 'bot' if obj.role == BotMessage.Role.ASSISTANT else 'user'


class BotConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = BotConversation
        fields = ['id', 'title', 'message_count', 'created_at', 'updated_at']
        read_only_fields = fields

    def get_message_count(self, obj) -> int:
        return getattr(obj, 'message_count', None) or obj.messages.count()


class BotConversationSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    has_more_messages = serializers.SerializerMethodField()
    next_before = serializers.SerializerMethodField()

    class Meta:
        model = BotConversation
        fields = [
            'id', 'title', 'messages', 'message_count',
            'has_more_messages', 'next_before', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def _message_page(self, obj):
        cache_name = f'_message_page_{obj.pk}'
        if hasattr(self, cache_name):
            return getattr(self, cache_name)

        limit = int(self.context.get('message_limit') or 30)
        before = self.context.get('before')
        queryset = obj.messages.all()
        if before:
            queryset = queryset.filter(created_at__lt=before)

        newest = list(queryset.order_by('-created_at')[:limit + 1])
        has_more = len(newest) > limit
        page = list(reversed(newest[:limit]))
        next_before = page[0].created_at.isoformat() if has_more and page else None
        value = (page, has_more, next_before)
        setattr(self, cache_name, value)
        return value

    def get_messages(self, obj):
        page, _, _ = self._message_page(obj)
        return BotMessageSerializer(page, many=True).data

    def get_message_count(self, obj) -> int:
        return getattr(obj, 'message_count', None) or obj.messages.count()

    def get_has_more_messages(self, obj) -> bool:
        _, has_more, _ = self._message_page(obj)
        return has_more

    def get_next_before(self, obj):
        _, _, next_before = self._message_page(obj)
        return next_before


class BotSendMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    playbook_context = serializers.CharField(required=False, allow_blank=True)


class AIGradeCallSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=60000)


class AITrainWeaknessSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=30000)
