from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class UserProtocol(models.Model):
    """
    Training protocol state for a player.
    Tracks phase progression, daily recall, anchor reps, and weekly sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='protocol',
        help_text="The player this protocol belongs to"
    )
    
    # Current phase (1-4)
    phase = models.IntegerField(
        default=1,
        help_text="Current training phase (1-4)"
    )
    
    # Phase 1: Daily recall dates (skeleton recall)
    p1_dates = models.JSONField(
        default=list,
        blank=True,
        help_text="Dates when Phase 1 recall was completed"
    )
    
    # Phase 2: Anchor script reps (by anchor index)
    anchor_reps = models.JSONField(
        default=dict,
        blank=True,
        help_text="Anchor script reps by index {index: count}"
    )
    
    # Phase 3: Drill pass conditions (Drill 1 and Drill 2)
    d12_pass = models.JSONField(
        default=dict,
        blank=True,
        help_text="Drill pass conditions {drill_number: bool}"
    )
    
    # Phase 4: Weekly session history
    weekly_sessions = models.JSONField(
        default=list,
        blank=True,
        help_text="Weekly session history [{drill_number, date}]"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Protocol"
        verbose_name_plural = "User Protocols"
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - Phase {self.phase}"


class AnchorRep(models.Model):
    """
    Individual anchor script rep tracking.
    Optional detailed tracking for Phase 2.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='anchor_reps_detail'
    )
    protocol = models.ForeignKey(
        UserProtocol,
        on_delete=models.CASCADE,
        related_name='anchor_rep_details',
        null=True,
        blank=True
    )
    
    anchor_index = models.IntegerField(help_text="Anchor script index (0-N)")
    rep_number = models.IntegerField(help_text="Rep number (1-5)")
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Anchor Rep"
        verbose_name_plural = "Anchor Reps"
        unique_together = ['user', 'anchor_index', 'rep_number']
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} - Anchor {self.anchor_index} Rep {self.rep_number}"


class WeeklySession(models.Model):
    """
    Individual weekly session tracking for Phase 4.
    Optional detailed tracking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='weekly_sessions_detail'
    )
    protocol = models.ForeignKey(
        UserProtocol,
        on_delete=models.CASCADE,
        related_name='weekly_session_details',
        null=True,
        blank=True
    )
    
    drill_number = models.IntegerField(help_text="Drill number (1-N)")
    session_date = models.DateField(help_text="Date of session")
    duration_minutes = models.IntegerField(null=True, blank=True, help_text="Session duration")
    notes = models.TextField(blank=True, help_text="Optional notes")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Weekly Session"
        verbose_name_plural = "Weekly Sessions"
        unique_together = ['user', 'drill_number', 'session_date']
        ordering = ['-session_date']

    def __str__(self):
        return f"{self.user.email} - Drill {self.drill_number} on {self.session_date}"