from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class NotificationType(models.TextChoices):
    # Auth
    WELCOME = 'welcome', 'Welcome'
    PASSWORD_UPDATED = 'pass_updated', 'Password Updated'
    PASSWORD_CHANGED = 'pass_changed', 'Password Changed'
    PLAYER_JOINED = 'player_joined', 'Player Joined'

    # Training progress
    RANK_UPGRADED = 'rank_upgraded', 'Rank Upgraded'
    QUIZ_PASSED = 'quiz_passed', 'Quiz Passed'
    QUIZ_FAILED = 'quiz_failed', 'Quiz Failed'
    CALL_GRADED = 'call_graded', 'Call Graded'
    ASSIGNMENT_COMPLETED = 'assignment_completed', 'Assignment Completed'
    CARD_MASTERED = 'card_mastered', 'Card Mastered'
    DRILL_MILESTONE = 'drill_milestone', 'Drill Milestone'
    CUSTOM_TRAINING_COMPLETED = 'custom_training_completed', 'Custom Training Completed'
    PROTOCOL_PHASE_ADVANCED = 'protocol_phase_advanced', 'Protocol Phase Advanced'
    PROTOCOL_RECALL_STREAK = 'protocol_recall_streak', 'Protocol Recall Streak'
    ANCHOR_MASTERED = 'anchor_mastered', 'Anchor Mastered'
    PROTOCOL_DRILL_PASSED = 'protocol_drill_passed', 'Protocol Drill Passed'
    WEEKLY_SESSION_LOGGED = 'weekly_session_logged', 'Weekly Session Logged'



class NotificationPriority(models.TextChoices):
    LOW = 'low', 'Low'
    NORMAL = 'normal', 'Normal'
    HIGH = 'high', 'High'
    URGENT = 'urgent', 'Urgent'


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=NotificationPriority.choices,
        default=NotificationPriority.NORMAL
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self):
        return f'{self.title} — {self.user.email}'
