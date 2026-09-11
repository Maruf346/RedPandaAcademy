from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class UserProgress(models.Model):
    """
    Core player progression state.
    One-to-one relationship with User.
    Tracks rank, best scores, card mastery, drill counts, KPI and scenario stats.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='progress',
        help_text="The player this progress belongs to"
    )
    
    # Rank ladder (0=Newcomer, 1=Apprentice, 2=Journeyman, 3=Top Rep)
    rank = models.IntegerField(
        default=0,
        help_text="Current rank (0-3)"
    )
    
    # Best quiz scores by rank index
    best = models.JSONField(
        default=dict,
        blank=True,
        help_text="Best quiz scores by rank index {rank: score%}"
    )
    
    # Custom training sessions completed
    custom_done = models.IntegerField(
        default=0,
        help_text="Number of custom training sessions completed"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Progress"
        verbose_name_plural = "User Progress"
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - Rank {self.rank}"


class Assignment(models.Model):
    """
    Assigned drills and study tasks for a player.
    Created when a player misses a quiz question or fails a graded call.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='assignment_list',
        null=True,
        blank=True
    )
    
    name = models.CharField(max_length=255, help_text="Assignment title")
    why = models.TextField(blank=True, help_text="Why this was assigned")
    sets = models.CharField(
        max_length=255,
        default="2",
        help_text="Sets to complete, or a study instruction from a missed quiz",
    )
    pass_condition = models.TextField(blank=True, help_text="Pass condition")
    done = models.BooleanField(default=False, help_text="Mark as complete")
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class UserCard(models.Model):
    """
    Flashcard mastery tracking.
    cards[index] = 0 (not seen), 1 (seen once), 2+ (mastered)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='card_progress'
    )
    progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='card_list',
        null=True,
        blank=True
    )
    
    card_index = models.IntegerField(help_text="Index of the card in CARDS array")
    mastery = models.IntegerField(
        default=0,
        help_text="0=not seen, 1=seen once, 2+=mastered"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Card Progress"
        verbose_name_plural = "Card Progress"
        unique_together = ['user', 'card_index']
        ordering = ['card_index']

    def __str__(self):
        return f"{self.user.email} - Card {self.card_index} (mastery: {self.mastery})"


class UserDrill(models.Model):
    """
    Drill completion tracking.
    drills[drill_number] = count of completed sets
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='drill_progress'
    )
    progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='drill_list',
        null=True,
        blank=True
    )
    
    drill_number = models.IntegerField(help_text="Drill number (1-N)")
    sets_completed = models.IntegerField(default=0, help_text="Number of sets completed")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Drill Progress"
        verbose_name_plural = "Drill Progress"
        unique_together = ['user', 'drill_number']
        ordering = ['drill_number']

    def __str__(self):
        return f"{self.user.email} - Drill {self.drill_number} ({self.sets_completed} sets)"


class UserKpiStat(models.Model):
    """
    KPI pass/partial/fail statistics.
    kpiStats[kpi_number] = {pass: N, partial: N, fail: N}
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='kpi_stats'
    )
    progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='kpi_stat_list',
        null=True,
        blank=True
    )
    
    kpi_number = models.IntegerField(help_text="KPI number (1-22)")
    pass_count = models.IntegerField(default=0)
    partial_count = models.IntegerField(default=0)
    fail_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "KPI Statistic"
        verbose_name_plural = "KPI Statistics"
        unique_together = ['user', 'kpi_number']
        ordering = ['kpi_number']

    def __str__(self):
        return f"{self.user.email} - KPI {self.kpi_number} (P:{self.pass_count} F:{self.fail_count})"


class UserScenarioStat(models.Model):
    """
    Scenario handling statistics.
    scenStats[scenario_number] = {count: N, fail: N}
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='scenario_stats'
    )
    progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='scenario_stat_list',
        null=True,
        blank=True
    )
    
    scenario_number = models.IntegerField(help_text="Scenario number (1-20)")
    count = models.IntegerField(default=0, help_text="Total times encountered")
    fail_count = models.IntegerField(default=0, help_text="Times handled off-methodology")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Scenario Statistic"
        verbose_name_plural = "Scenario Statistics"
        unique_together = ['user', 'scenario_number']
        ordering = ['scenario_number']

    def __str__(self):
        return f"{self.user.email} - Scenario {self.scenario_number} (F:{self.fail_count}/{self.count})"