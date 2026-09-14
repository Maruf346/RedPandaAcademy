import logging

from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import BotConversation, BotMessage
from .serializers import BotConversationSerializer, BotSendMessageSerializer
from .services import complete_bot_reply


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

    def get_queryset(self):
        return BotConversation.objects.filter(user=self.request.user).prefetch_related('messages')


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
        return Response(BotConversationSerializer(conversation).data, status=status.HTTP_200_OK)
