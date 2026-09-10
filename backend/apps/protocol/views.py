from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProtocol, AnchorRep, WeeklySession
from .serializers import UserProtocolSerializer, AnchorRepSerializer, WeeklySessionSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_protocol(user):
    """Get or create UserProtocol for a user."""
    protocol, _ = UserProtocol.objects.get_or_create(user=user)
    return protocol


class UserProtocolView(APIView):
    """Single-object view for current user's protocol state."""
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


class LogRecallView(APIView):
    """Log a daily recall session."""
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


class IncAnchorView(APIView):
    """Increment anchor script rep count."""
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


class SetD12View(APIView):
    """Set Drill 1 or Drill 2 pass condition."""
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


class LogWeeklyView(APIView):
    """Log a weekly session."""
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


class AdvancePhaseView(APIView):
    """Advance to next protocol phase."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        protocol = get_or_create_protocol(request.user)
        if protocol.phase < 4:
            protocol.phase += 1
            protocol.save()
        
        serializer = UserProtocolSerializer(protocol)
        return Response(serializer.data)


class AnchorRepViewSet(viewsets.ModelViewSet):
    """Viewset for managing individual anchor reps."""
    permission_classes = [IsAuthenticated]
    serializer_class = AnchorRepSerializer

    def get_queryset(self):
        return AnchorRep.objects.filter(user=self.request.user)


class WeeklySessionViewSet(viewsets.ModelViewSet):
    """Viewset for managing weekly sessions."""
    permission_classes = [IsAuthenticated]
    serializer_class = WeeklySessionSerializer

    def get_queryset(self):
        return WeeklySession.objects.filter(user=self.request.user)