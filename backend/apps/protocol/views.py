from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import AnchorRep, WeeklySession
from .serializers import UserProtocolSerializer, AnchorRepSerializer, WeeklySessionSerializer
from apps.progression.snapshot import get_or_create_protocol


@extend_schema_view(
    get=extend_schema(
        tags=['protocol'],
        summary='Get training protocol state',
        responses={200: UserProtocolSerializer},
    ),
    put=extend_schema(
        tags=['protocol'],
        summary='Replace training protocol state',
        request=UserProtocolSerializer,
        responses={200: UserProtocolSerializer},
    ),
    patch=extend_schema(
        tags=['protocol'],
        summary='Update training protocol state',
        request=UserProtocolSerializer,
        responses={200: UserProtocolSerializer},
    ),
    post=extend_schema(
        tags=['protocol'],
        summary='Replace training protocol state',
        request=UserProtocolSerializer,
        responses={200: UserProtocolSerializer},
    ),
)
class UserProtocolView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def get_object(self):
        return get_or_create_protocol(self.request.user)

    def get(self, request):
        return Response(UserProtocolSerializer(self.get_object()).data)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        serializer = UserProtocolSerializer(self.get_object(), data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProtocolSerializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Log a daily recall session',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'date': {'type': 'string', 'description': 'Date of recall session'},
            },
            'required': ['date'],
        }
    },
    responses={
        200: UserProtocolSerializer,
        400: OpenApiResponse(description='Missing date'),
    },
)
class LogRecallView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def post(self, request):
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)

        protocol = get_or_create_protocol(request.user)
        dates = list(protocol.p1_dates or [])
        if date_str not in dates:
            dates.append(date_str)
            protocol.p1_dates = dates
            protocol.save(update_fields=['p1_dates', 'updated_at'])

        return Response(UserProtocolSerializer(protocol).data)


@extend_schema(
    tags=['protocol'],
    summary='Increment anchor script rep count',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'anchor_index': {'type': 'integer'},
            },
            'required': ['anchor_index'],
        }
    },
    responses={
        200: UserProtocolSerializer,
        400: OpenApiResponse(description='Missing anchor_index'),
    },
)
class IncAnchorView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def post(self, request):
        anchor_index = request.data.get('anchor_index')
        if anchor_index is None:
            return Response({'error': 'anchor_index is required'}, status=status.HTTP_400_BAD_REQUEST)

        protocol = get_or_create_protocol(request.user)
        reps = dict(protocol.anchor_reps or {})
        key = str(anchor_index)
        reps[key] = int(reps.get(key, 0)) + 1
        protocol.anchor_reps = reps
        protocol.save(update_fields=['anchor_reps', 'updated_at'])

        return Response(UserProtocolSerializer(protocol).data)


@extend_schema(
    tags=['protocol'],
    summary='Set drill pass condition',
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
        200: UserProtocolSerializer,
        400: OpenApiResponse(description='Missing drill_number'),
    },
)
class SetD12View(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def post(self, request):
        drill_number = request.data.get('drill_number')
        if not drill_number:
            return Response({'error': 'drill_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        protocol = get_or_create_protocol(request.user)
        d12 = dict(protocol.d12_pass or {})
        d12[str(drill_number)] = True
        protocol.d12_pass = d12
        protocol.save(update_fields=['d12_pass', 'updated_at'])

        return Response(UserProtocolSerializer(protocol).data)


@extend_schema(
    tags=['protocol'],
    summary='Log a weekly session',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'drill_number': {'type': 'integer'},
                'date': {'type': 'string'},
            },
            'required': ['drill_number', 'date'],
        }
    },
    responses={
        200: UserProtocolSerializer,
        400: OpenApiResponse(description='Missing drill_number or date'),
    },
)
class LogWeeklyView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def post(self, request):
        drill_number = request.data.get('drill_number')
        date_str = request.data.get('date')
        if not drill_number or not date_str:
            return Response(
                {'error': 'drill_number and date are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        protocol = get_or_create_protocol(request.user)
        weekly = list(protocol.weekly_sessions or [])
        weekly.append({'drill_number': drill_number, 'date': date_str})
        protocol.weekly_sessions = weekly
        protocol.save(update_fields=['weekly_sessions', 'updated_at'])

        return Response(UserProtocolSerializer(protocol).data)


@extend_schema(
    tags=['protocol'],
    summary='Advance to next protocol phase',
    request=None,
    responses={200: UserProtocolSerializer},
)
class AdvancePhaseView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProtocolSerializer

    def post(self, request):
        protocol = get_or_create_protocol(request.user)
        if protocol.phase < 4:
            protocol.phase += 1
            protocol.save(update_fields=['phase', 'updated_at'])
        return Response(UserProtocolSerializer(protocol).data)


@extend_schema_view(
    list=extend_schema(tags=['protocol'], summary='List anchor reps'),
    retrieve=extend_schema(tags=['protocol'], summary='Get anchor rep'),
)
class AnchorRepViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = AnchorRepSerializer

    def get_queryset(self):
        return AnchorRep.objects.filter(user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=['protocol'], summary='List weekly sessions'),
    retrieve=extend_schema(tags=['protocol'], summary='Get weekly session'),
)
class WeeklySessionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = WeeklySessionSerializer

    def get_queryset(self):
        return WeeklySession.objects.filter(user=self.request.user)
