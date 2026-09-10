from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import (
    UserProgress, Assignment, UserCard, UserDrill,
    UserKpiStat, UserScenarioStat
)
from .serializers import (
    UserProgressSerializer, AssignmentSerializer,
    UserCardSerializer, UserDrillSerializer,
    UserKpiStatSerializer, UserScenarioStatSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_progress(user):
    """Get or create UserProgress for a user."""
    progress, _ = UserProgress.objects.get_or_create(user=user)
    return progress


class UserProgressView(APIView):
    """Single-object view for current user's progress."""
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_or_create_progress(self.request.user)

    def get(self, request):
        progress = self.get_object()
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        progress = self.get_object()
        serializer = UserProgressSerializer(progress, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        progress = self.get_object()
        serializer = UserProgressSerializer(progress, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AssignmentViewSet(viewsets.ModelViewSet):
    """Viewset for managing user assignments."""
    permission_classes = [IsAuthenticated]
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """Toggle assignment done status."""
        assignment = self.get_object()
        assignment.done = not assignment.done
        if assignment.done:
            assignment.completed_at = timezone.now()
        else:
            assignment.completed_at = None
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)


class UserCardViewSet(viewsets.ModelViewSet):
    """Viewset for managing flashcard mastery."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserCardSerializer

    def get_queryset(self):
        return UserCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)


class UserDrillViewSet(viewsets.ModelViewSet):
    """Viewset for managing drill completion."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserDrillSerializer

    def get_queryset(self):
        return UserDrill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)

    @action(detail=False, methods=['post'])
    def log_set(self, request):
        """Log a completed drill set."""
        drill_number = request.data.get('drill_number')
        if not drill_number:
            return Response({'error': 'drill_number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        drill, created = UserDrill.objects.get_or_create(
            user=request.user,
            drill_number=drill_number,
            defaults={'sets_completed': 0, 'progress': get_or_create_progress(request.user)}
        )
        drill.sets_completed += 1
        drill.save()
        serializer = self.get_serializer(drill)
        return Response(serializer.data)


class UserKpiStatViewSet(viewsets.ModelViewSet):
    """Viewset for managing KPI statistics."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserKpiStatSerializer

    def get_queryset(self):
        return UserKpiStat.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)


class UserScenarioStatViewSet(viewsets.ModelViewSet):
    """Viewset for managing scenario statistics."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserScenarioStatSerializer

    def get_queryset(self):
        return UserScenarioStat.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = get_or_create_progress(self.request.user)
        serializer.save(user=self.request.user, progress=progress)