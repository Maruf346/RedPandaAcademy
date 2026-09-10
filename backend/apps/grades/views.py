from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import QuizAttempt, CallGrade, GradeKpiScore
from .serializers import QuizAttemptSerializer, CallGradeSerializer, GradeKpiScoreSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """Viewset for managing quiz attempts."""
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CallGradeViewSet(viewsets.ModelViewSet):
    """Viewset for managing call grades."""
    permission_classes = [IsAuthenticated]
    serializer_class = CallGradeSerializer

    def get_queryset(self):
        return CallGrade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GradeKpiScoreViewSet(viewsets.ModelViewSet):
    """Viewset for managing individual KPI scores per grade."""
    permission_classes = [IsAuthenticated]
    serializer_class = GradeKpiScoreSerializer

    def get_queryset(self):
        return GradeKpiScore.objects.filter(call_grade__user=self.request.user)