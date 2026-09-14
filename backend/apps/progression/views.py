from rest_framework import mixins, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from django.utils import timezone

from .models import Assignment, UserCard, UserDrill, UserKpiStat, UserScenarioStat
from .serializers import (
    UserProgressSerializer, AssignmentSerializer,
    UserCardSerializer, UserDrillSerializer,
    UserKpiStatSerializer, UserScenarioStatSerializer,
    ProgressSnapshotSerializer,
)
from apps.notifications.services import NotificationTemplates
from .snapshot import (
    get_or_create_progress,
    build_snapshot,
    apply_snapshot,
)


@extend_schema_view(
    get=extend_schema(
        tags=['progression'],
        summary="Get progress snapshot",
        description="Return the current player's ProgressContext-shaped snapshot.",
        responses={200: ProgressSnapshotSerializer},
    ),
    put=extend_schema(
        tags=['progression'],
        summary="Replace progress snapshot",
        description="Replace rank, cards, drills, assignments, KPI/scenario stats, and protocol from the frontend snapshot.",
        request=ProgressSnapshotSerializer,
        responses={200: ProgressSnapshotSerializer},
    ),
    patch=extend_schema(
        tags=['progression'],
        summary="Partially update progress snapshot",
        request=ProgressSnapshotSerializer,
        responses={200: ProgressSnapshotSerializer},
    ),
    post=extend_schema(
        tags=['progression'],
        summary="Replace progress snapshot",
        request=ProgressSnapshotSerializer,
        responses={200: ProgressSnapshotSerializer},
    ),
)
class ProgressSnapshotView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgressSnapshotSerializer

    def get(self, request):
        return Response(build_snapshot(request.user))

    def post(self, request):
        return self.put(request)

    def put(self, request):
        serializer = ProgressSnapshotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        snapshot = apply_snapshot(request.user, serializer.validated_data, partial=False)
        return Response(snapshot)

    def patch(self, request):
        serializer = ProgressSnapshotSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        snapshot = apply_snapshot(request.user, serializer.validated_data, partial=True)
        return Response(snapshot)


@extend_schema_view(
    get=extend_schema(
        tags=['progression'],
        summary="Get player rank and best scores",
        responses={200: UserProgressSerializer},
    ),
    put=extend_schema(
        tags=['progression'],
        summary="Replace rank and best scores",
        request=UserProgressSerializer,
        responses={200: UserProgressSerializer},
    ),
    patch=extend_schema(
        tags=['progression'],
        summary="Update rank and best scores",
        request=UserProgressSerializer,
        responses={200: UserProgressSerializer},
    ),
    post=extend_schema(
        tags=['progression'],
        summary="Replace rank and best scores",
        request=UserProgressSerializer,
        responses={200: UserProgressSerializer},
    ),
)
class UserProgressView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProgressSerializer

    def get_object(self):
        return get_or_create_progress(self.request.user)

    def get(self, request):
        serializer = UserProgressSerializer(self.get_object())
        return Response(serializer.data)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        serializer = UserProgressSerializer(self.get_object(), data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        progress = self.get_object()
        previous_custom_done = progress.custom_done
        serializer = UserProgressSerializer(progress, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        progress = serializer.save()
        if progress.custom_done > previous_custom_done:
            NotificationTemplates.custom_training_completed(request.user, progress.custom_done)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['progression'], summary="List assignments"),
    create=extend_schema(tags=['progression'], summary="Create assignment"),
    retrieve=extend_schema(tags=['progression'], summary="Get assignment"),
)
class AssignmentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)

    @extend_schema(
        tags=['progression'],
        summary="Toggle assignment done status",
        responses={200: AssignmentSerializer},
    )
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        assignment = self.get_object()
        assignment.done = not assignment.done
        assignment.completed_at = timezone.now() if assignment.done else None
        assignment.save()
        if assignment.done:
            NotificationTemplates.assignment_completed(request.user, assignment)
        return Response(self.get_serializer(assignment).data)


@extend_schema_view(
    list=extend_schema(tags=['progression'], summary="List flashcard mastery"),
    create=extend_schema(tags=['progression'], summary="Create flashcard mastery record"),
    retrieve=extend_schema(tags=['progression'], summary="Get flashcard mastery"),
)
class UserCardViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = UserCardSerializer

    def get_queryset(self):
        return UserCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)

    @extend_schema(
        tags=['progression'],
        summary="Mark flashcard mastery",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'card_index': {'type': 'integer'},
                    'nailed': {'type': 'boolean'},
                },
                'required': ['card_index', 'nailed'],
            }
        },
        responses={
            200: UserCardSerializer,
            400: OpenApiResponse(description="Missing card_index or nailed"),
        },
    )
    @action(detail=False, methods=['post'])
    def mark(self, request):
        if 'card_index' not in request.data or 'nailed' not in request.data:
            return Response(
                {'error': 'card_index and nailed are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        card_index = request.data.get('card_index')
        nailed = bool(request.data.get('nailed'))
        card, _created = UserCard.objects.get_or_create(
            user=request.user,
            card_index=card_index,
            defaults={'mastery': 0, 'progress': get_or_create_progress(request.user)},
        )
        previous_mastery = card.mastery
        card.mastery = card.mastery + 1 if nailed else 0
        card.save(update_fields=['mastery', 'updated_at'])
        if previous_mastery < 2 <= card.mastery:
            NotificationTemplates.card_mastered(request.user, card)
        return Response(self.get_serializer(card).data)


@extend_schema_view(
    list=extend_schema(tags=['progression'], summary="List drill completion"),
    create=extend_schema(tags=['progression'], summary="Create drill completion record"),
    retrieve=extend_schema(tags=['progression'], summary="Get drill completion"),
)
class UserDrillViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = UserDrillSerializer

    def get_queryset(self):
        return UserDrill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)

    @extend_schema(
        tags=['progression'],
        summary="Log a completed drill set",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'drill_number': {'type': 'integer'},
                },
                'required': ['drill_number'],
            }
        },
        responses={
            200: UserDrillSerializer,
            400: OpenApiResponse(description="Missing drill_number"),
        },
    )
    @action(detail=False, methods=['post'])
    def log_set(self, request):
        drill_number = request.data.get('drill_number')
        if not drill_number:
            return Response({'error': 'drill_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        drill, _created = UserDrill.objects.get_or_create(
            user=request.user,
            drill_number=drill_number,
            defaults={'sets_completed': 0, 'progress': get_or_create_progress(request.user)}
        )
        drill.sets_completed += 1
        drill.save()
        if drill.sets_completed in (1, 5, 10, 25, 50, 100):
            NotificationTemplates.drill_milestone(request.user, drill)
        return Response(self.get_serializer(drill).data)


@extend_schema_view(
    list=extend_schema(tags=['progression'], summary="List KPI statistics"),
    retrieve=extend_schema(tags=['progression'], summary="Get KPI statistic"),
)
class UserKpiStatViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = UserKpiStatSerializer

    def get_queryset(self):
        return UserKpiStat.objects.filter(user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['progression'], summary="List scenario statistics"),
    retrieve=extend_schema(tags=['progression'], summary="Get scenario statistic"),
)
class UserScenarioStatViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = UserScenarioStatSerializer

    def get_queryset(self):
        return UserScenarioStat.objects.filter(user=self.request.user)

