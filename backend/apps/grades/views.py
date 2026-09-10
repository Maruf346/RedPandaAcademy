from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import QuizAttempt, CallGrade, GradeKpiScore
from .serializers import QuizAttemptSerializer, CallGradeSerializer, GradeKpiScoreSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


@extend_schema_view(
    list=extend_schema(
        tags=['grades'],
        summary='List quiz attempts',
        description='Get all quiz/rank exam attempts for the current player.',
    ),
    create=extend_schema(
        tags=['grades'],
        summary='Create quiz attempt',
        description='Record a new quiz/rank exam attempt with score and pass/fail status.',
    ),
    retrieve=extend_schema(
        tags=['grades'],
        summary='Get quiz attempt',
    ),
    update=extend_schema(
        tags=['grades'],
        summary='Update quiz attempt',
    ),
    partial_update=extend_schema(
        tags=['grades'],
        summary='Partially update quiz attempt',
    ),
    destroy=extend_schema(
        tags=['grades'],
        summary='Delete quiz attempt',
    ),
)
class QuizAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        tags=['grades'],
        summary='List call grades',
        description='Get all AI-graded sales call records for the current player.',
    ),
    create=extend_schema(
        tags=['grades'],
        summary='Create call grade',
        description='Record a new AI-graded sales call with full scorecard, failures, and scenario tags.',
    ),
    retrieve=extend_schema(
        tags=['grades'],
        summary='Get call grade',
    ),
    update=extend_schema(
        tags=['grades'],
        summary='Update call grade',
    ),
    partial_update=extend_schema(
        tags=['grades'],
        summary='Partially update call grade',
    ),
    destroy=extend_schema(
        tags=['grades'],
        summary='Delete call grade',
    ),
)
class CallGradeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CallGradeSerializer

    def get_queryset(self):
        return CallGrade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        tags=['grades'],
        summary='List KPI scores per grade',
        description='Get all individual KPI scores for the current player call grades.',
    ),
    create=extend_schema(
        tags=['grades'],
        summary='Create KPI score record',
    ),
    retrieve=extend_schema(
        tags=['grades'],
        summary='Get KPI score',
    ),
    update=extend_schema(
        tags=['grades'],
        summary='Update KPI score',
    ),
    partial_update=extend_schema(
        tags=['grades'],
        summary='Partially update KPI score',
    ),
    destroy=extend_schema(
        tags=['grades'],
        summary='Delete KPI score',
    ),
)
class GradeKpiScoreViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GradeKpiScoreSerializer

    def get_queryset(self):
        return GradeKpiScore.objects.filter(call_grade__user=self.request.user)
