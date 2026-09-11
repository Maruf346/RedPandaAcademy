from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import QuizAttempt, CallGrade, GradeKpiScore
from .serializers import QuizAttemptSerializer, CallGradeSerializer, GradeKpiScoreSerializer


@extend_schema_view(
    list=extend_schema(tags=['grades'], summary='List quiz attempts'),
    create=extend_schema(tags=['grades'], summary='Create quiz attempt'),
    retrieve=extend_schema(tags=['grades'], summary='Get quiz attempt'),
)
class QuizAttemptViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['grades'], summary='List call grades'),
    create=extend_schema(
        tags=['grades'],
        summary='Create call grade',
        description='Store an AI-graded call. Per-KPI rows are created from scorecard automatically.',
    ),
    retrieve=extend_schema(tags=['grades'], summary='Get call grade'),
)
class CallGradeViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = CallGradeSerializer

    def get_queryset(self):
        return CallGrade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['grades'], summary='List KPI scores per grade'),
    retrieve=extend_schema(tags=['grades'], summary='Get KPI score'),
)
class GradeKpiScoreViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = GradeKpiScoreSerializer

    def get_queryset(self):
        return GradeKpiScore.objects.filter(call_grade__user=self.request.user)
