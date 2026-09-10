from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.conf.urls.static import static
from django.conf import settings

# Import viewsets for router registration
from apps.notifications.views import NotificationViewSet
from apps.progression.views import (
    UserProgressView,
    AssignmentViewSet,
    UserCardViewSet,
    UserDrillViewSet,
    UserKpiStatViewSet,
    UserScenarioStatViewSet,
)
from apps.protocol.views import (
    UserProtocolView,
    LogRecallView,
    IncAnchorView,
    SetD12View,
    LogWeeklyView,
    AdvancePhaseView,
    AnchorRepViewSet,
    WeeklySessionViewSet,
)
from apps.grades.views import (
    QuizAttemptViewSet,
    CallGradeViewSet,
    GradeKpiScoreViewSet,
)

# Single router for all viewsets (avoids format suffix converter conflicts)
router = DefaultRouter()

# Notifications
router.register(r'notifications', NotificationViewSet, basename='notification')

# Progression - assignments, cards, drills, kpi-stats, scenario-stats
router.register(r'progression/assignments', AssignmentViewSet, basename='assignment')
router.register(r'progression/cards', UserCardViewSet, basename='card')
router.register(r'progression/drills', UserDrillViewSet, basename='drill')
router.register(r'progression/kpi-stats', UserKpiStatViewSet, basename='kpi-stat')
router.register(r'progression/scenario-stats', UserScenarioStatViewSet, basename='scenario-stat')

# Protocol - anchor-reps, weekly-sessions
router.register(r'protocol/anchor-reps', AnchorRepViewSet, basename='anchor-rep')
router.register(r'protocol/weekly-sessions', WeeklySessionViewSet, basename='weekly-session')

# Grades
router.register(r'grades/quiz-attempts', QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'grades/call-grades', CallGradeViewSet, basename='call-grade')
router.register(r'grades/kpi-scores', GradeKpiScoreViewSet, basename='grade-kpi-score')

urlpatterns = [
    # User auth endpoints (existing path-based routes)
    path('users/', include('apps.users.urls')),

    # Progression - single object views
    path('progression/progress/', UserProgressView.as_view(), name='progress'),

    # Protocol - single object views
    path('protocol/protocol/', UserProtocolView.as_view(), name='protocol'),
    path('protocol/protocol/log-recall/', LogRecallView.as_view(), name='protocol-log-recall'),
    path('protocol/protocol/inc-anchor/', IncAnchorView.as_view(), name='protocol-inc-anchor'),
    path('protocol/protocol/set-d12/', SetD12View.as_view(), name='protocol-set-d12'),
    path('protocol/protocol/log-weekly/', LogWeeklyView.as_view(), name='protocol-log-weekly'),
    path('protocol/protocol/advance-phase/', AdvancePhaseView.as_view(), name='protocol-advance-phase'),

    # Notification and other viewsets
    path('', include(router.urls)),

    # API schema and documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)