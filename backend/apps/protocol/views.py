from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import UserProtocol, AnchorRep, WeeklySession
from .serializers import UserProtocolSerializer, AnchorRepSerializer, WeeklySessionSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_protocol(user):
    protocol, _ = UserProtocol.objects.get_or_create(user=user)
    return protocol


@extend_schema(
    tags=['protocol'],
    summary='Get or update training protocol state',
    description='Retrieve the current player training protocol state including phase, daily recall dates, anchor reps, and weekly sessions. Use PATCH to update fields.',
    responses={
        200: OpenApiResponse(description='Protocol state retrieved or updated'),
    },
)
class UserProtocolView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_or_create_protocol(self.request.user)

    def get(self, request):
        protocol = self.get_object()
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        protocol = self.get_object()
        serializer = UserProtocolSerializer(protocol, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        protocol = self.get_object()
        serializer = UserProtocolSerializer(protocol, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Log a daily recall session',
    description='Record a completed daily 90-second recall session for Phase 1 protocol.',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'date': {'type': 'string', 'format': 'date', 'description': 'Date of recall session'},
            },
            'required': ['date'],
        }
    },
    responses={
        200: OpenApiResponse(description='Recall logged'),
        400: OpenApiResponse(description='Missing date'),
    },
)
class LogRecallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        protocol = get_or_create_protocol(request.user)
        if date_str not in protocol.p1_dates:
            protocol.p1_dates.append(date_str)
            protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Increment anchor script rep count',
    description='Increment the clean rep count for a specific anchor script (Phase 2).',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'anchor_index': {'type': 'integer', 'description': 'Anchor script index (0-N)'},
            },
            'required': ['anchor_index'],
        }
    },
    responses={
        200: OpenApiResponse(description='Anchor rep incremented'),
        400: OpenApiResponse(description='Missing anchor_index'),
    },
)
class IncAnchorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        anchor_index = request.data.get('anchor_index')
        if anchor_index is None:
            return Response({'error': 'anchor_index is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        protocol = get_or_create_protocol(request.user)
        current = protocol.anchor_reps.get(str(anchor_index), 0)
        protocol.anchor_reps[str(anchor_index)] = current + 1
        protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Set drill pass condition',
    description='Mark Drill 1 or Drill 2 pass condition as met (Phase 3).',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'drill_number': {'type': 'integer', 'description': 'Drill number (1 or 2)'},
            },
            'required': ['drill_number'],
        }
    },
    responses={
        200: OpenApiResponse(description='Drill pass condition set'),
        400: OpenApiResponse(description='Missing drill_number'),
    },
)
class SetD12View(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        drill_number = request.data.get('drill_number')
        if not drill_number:
            return Response({'error': 'drill_number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        protocol = get_or_create_protocol(request.user)
        protocol.d12_pass[str(drill_number)] = True
        protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Log a weekly session',
    description='Record a completed weekly partner drill session (Phase 4).',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'drill_number': {'type': 'integer', 'description': 'Drill number (1-N)'},
                'date': {'type': 'string', 'format': 'date', 'description': 'Date of session'},
            },
            'required': ['drill_number', 'date'],
        }
    },
    responses={
        200: OpenApiResponse(description='Weekly session logged'),
        400: OpenApiResponse(description='Missing drill_number or date'),
    },
)
class LogWeeklyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        drill_number = request.data.get('drill_number')
        date_str = request.data.get('date')
        if not drill_number or not date_str:
            return Response({'error': 'drill_number and date are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        protocol = get_or_create_protocol(request.user)
        protocol.weekly_sessions.append({'drill_number': drill_number, 'date': date_str})
        protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


@extend_schema(
    tags=['protocol'],
    summary='Advance to next protocol phase',
    description='Advance the player to the next training protocol phase (1-4).',
    responses={
        200: OpenApiResponse(description='Protocol phase advanced'),
    },
)
class AdvancePhaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        protocol = get_or_create_protocol(request.user)
        if protocol.phase < 4:
            protocol.phase += 1
            protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        tags=['protocol'],
        summary='List anchor reps',
        description='Get all individual anchor script rep records for the current player.',
    ),
    create=extend_schema(
        tags=['protocol'],
        summary='Create anchor rep record',
    ),
    retrieve=extend_schema(
        tags=['protocol'],
        summary='Get anchor rep',
    ),
    update=extend_schema(
        tags=['protocol'],
        summary='Update anchor rep',
    ),
    partial_update=extend_schema(
        tags=['protocol'],
        summary='Partially update anchor rep',
    ),
    destroy=extend_schema(
        tags=['protocol'],
        summary='Delete anchor rep',
    ),
)
class AnchorRepViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnchorRepSerializer

    def get_queryset(self):
        return AnchorRep.objects.filter(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        tags=['protocol'],
        summary='List weekly sessions',
        description='Get all weekly session records for the current player.',
    ),
    create=extend_schema(
        tags=['protocol'],
        summary='Create weekly session record',
    ),
    retrieve=extend_schema(
        tags=['protocol'],
        summary='Get weekly session',
    ),
    update=extend_schema(
        tags=['protocol'],
        summary='Update weekly session',
    ),
    partial_update=extend_schema(
        tags=['protocol'],
        summary='Partially update weekly session',
    ),
    destroy=extend_schema(
        tags=['protocol'],
        summary='Delete weekly session',
    ),
)
class WeeklySessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WeeklySessionSerializer

    def get_queryset(self):
        return WeeklySession.objects.filter(user=self.request.user)
