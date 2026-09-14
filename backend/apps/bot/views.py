import logging

from django.db.models import Count
from django.utils.dateparse import parse_datetime
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import BotConversation, BotMessage
from .serializers import (
    AIGradeCallSerializer,
    AITrainWeaknessSerializer,
    BotConversationListSerializer,
    BotConversationSerializer,
    BotSendMessageSerializer,
)
from .services import complete_ai_text, complete_bot_reply

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(tags=['bot'], summary='List Panda Bot conversations'),
    retrieve=extend_schema(tags=['bot'], summary='Get a Panda Bot conversation'),
)
class BotConversationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = BotConversationSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return BotConversationListSerializer
        return BotConversationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            limit = int(self.request.query_params.get('message_limit', 30))
        except (TypeError, ValueError):
            limit = 30
        context['message_limit'] = max(10, min(80, limit))
        before = self.request.query_params.get('before')
        context['before'] = parse_datetime(before) if before else None
        return context

    def get_queryset(self):
        queryset = BotConversation.objects.filter(user=self.request.user)
        if self.action == 'list':
            return queryset.annotate(message_count=Count('messages'))
        return queryset.prefetch_related('messages')


class BotMessageView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BotSendMessageSerializer

    @extend_schema(
        tags=['bot'],
        summary='Send a message to Panda Bot',
        request=BotSendMessageSerializer,
        responses={
            200: BotConversationSerializer,
            400: OpenApiResponse(description='Invalid message payload'),
            502: OpenApiResponse(description='AI provider unavailable'),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['message'].strip()
        conversation_id = serializer.validated_data.get('conversation_id')

        conversation = None
        if conversation_id:
            conversation = BotConversation.objects.filter(
                id=conversation_id,
                user=request.user,
            ).first()
        if conversation is None:
            conversation = BotConversation.objects.create(
                user=request.user,
                title=text[:117] + '...' if len(text) > 120 else text,
            )

        try:
            reply = complete_bot_reply(
                conversation,
                text,
                serializer.validated_data.get('playbook_context', ''),
            )
        except Exception as exc:
            BotMessage.objects.create(
                conversation=conversation,
                role=BotMessage.Role.USER,
                content=text,
            )
            logger.exception('Panda Bot provider failed: %s', exc)
            reply = 'I cannot reach the AI backend right now. Try again in a minute, then keep the question tied to a step, KPI, script, or drill.'
            BotMessage.objects.create(
                conversation=conversation,
                role=BotMessage.Role.ASSISTANT,
                content=reply,
            )
            conversation.save(update_fields=['updated_at'])
            return Response(
                BotConversationSerializer(conversation).data,
                status=status.HTTP_502_BAD_GATEWAY,
            )

        BotMessage.objects.create(
            conversation=conversation,
            role=BotMessage.Role.USER,
            content=text,
        )
        BotMessage.objects.create(
            conversation=conversation,
            role=BotMessage.Role.ASSISTANT,
            content=reply,
        )
        conversation.save(update_fields=['updated_at'])
        return Response(BotConversationSerializer(conversation, context={'message_limit': 30}).data, status=status.HTTP_200_OK)


class AIGradeCallView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AIGradeCallSerializer

    @extend_schema(
        tags=['ai'],
        summary='Grade a call transcript with backend AI',
        request=AIGradeCallSerializer,
        responses={
            200: {'application/json': {'type': 'object', 'properties': {'text': {'type': 'string'}}}},
            400: OpenApiResponse(description='Invalid grading payload'),
            502: OpenApiResponse(description='AI provider unavailable'),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            text = complete_ai_text(serializer.validated_data['prompt'], max_tokens=2600, temperature=0.1)
        except Exception as exc:
            logger.exception('Call grading provider failed: %s', exc)
            return Response({'error': 'AI backend unavailable'}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({'text': text}, status=status.HTTP_200_OK)


class AITrainWeaknessView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AITrainWeaknessSerializer

    @extend_schema(
        tags=['ai'],
        summary='Generate a custom weakness training session with backend AI',
        request=AITrainWeaknessSerializer,
        responses={
            200: {'application/json': {'type': 'object', 'properties': {'text': {'type': 'string'}}}},
            400: OpenApiResponse(description='Invalid training payload'),
            502: OpenApiResponse(description='AI provider unavailable'),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            text = complete_ai_text(serializer.validated_data['prompt'], max_tokens=1400, temperature=0.3)
        except Exception as exc:
            logger.exception('Weakness training provider failed: %s', exc)
            return Response({'error': 'AI backend unavailable'}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({'text': text}, status=status.HTTP_200_OK)


