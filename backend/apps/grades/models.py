from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class QuizAttempt(models.Model):
    """
    Quiz/rank exam attempt tracking.
    Records quiz name, score, pass/fail, and missed topics.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quiz_attempts'
    )
    
    quiz_name = models.CharField(max_length=255, help_text="Name of the quiz/exam")
    quiz_index = models.IntegerField(default=0, help_text="Quiz index (0-2 for rank exams)")
    total_questions = models.IntegerField(default=0, help_text="Total questions in quiz")
    correct_count = models.IntegerField(default=0, help_text="Number of correct answers")
    score_percent = models.IntegerField(default=0, help_text="Score as percentage")
    passed = models.BooleanField(default=False, help_text="Whether the pass threshold (80%) was met")
    
    # Missed topics (for assignment generation)
    missed_topics = models.JSONField(
        default=list,
        blank=True,
        help_text="List of missed question topics [{q, you, ans, w}]"
    )
    
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Quiz Attempt"
        verbose_name_plural = "Quiz Attempts"
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.user.email} - {self.quiz_name}: {self.score_percent}% ({'PASS' if self.passed else 'FAIL'})"


class CallGrade(models.Model):
    """
    Call grading records.
    Stores the full grade result from AI grading of sales call transcripts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='call_grades'
    )
    
    # Transcript
    transcript = models.TextField(blank=True, help_text="Original sales call transcript")
    
    # Grade summary
    summary = models.TextField(blank=True, help_text="One-sentence brutal summary")
    died = models.TextField(blank=True, help_text="KPI X at Step Y — why")
    
    # Scorecard: [{n, score, note}]
    scorecard = models.JSONField(
        default=list,
        blank=True,
        help_text="Per-KPI scores [{n, score, note}]"
    )
    
    # Failures: [{kpi, quote, why}]
    failures = models.JSONField(
        default=list,
        blank=True,
        help_text="Failed KPIs with transcript quotes [{kpi, quote, why}]"
    )
    
    # Scenario tags: [{scenario, handled, note}]
    scenario_tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Objection scenarios tagged [{scenario, handled, note}]"
    )
    
    # Assigned drills: [{name, sets, pass}]
    assigned_drills = models.JSONField(
        default=list,
        blank=True,
        help_text="Drills assigned from grade [{name, sets, pass}]"
    )
    
    # Overall pass/fail
    overall_pass = models.BooleanField(default=False, help_text="Whether the call was graded as passing")
    
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Call Grade"
        verbose_name_plural = "Call Grades"
        ordering = ['-graded_at']

    def __str__(self):
        return f"{self.user.email} - Call Grade ({'PASS' if self.overall_pass else 'FAIL'}) at {self.graded_at}"


class GradeKpiScore(models.Model):
    """
    Denormalized KPI scores for fast querying and analytics.
    Optional detailed tracking per grade.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    call_grade = models.ForeignKey(
        CallGrade,
        on_delete=models.CASCADE,
        related_name='kpi_scores'
    )
    
    kpi_number = models.IntegerField(help_text="KPI number (1-22)")
    score = models.CharField(max_length=10, help_text="pass|partial|fail|na")
    note = models.TextField(blank=True, help_text="Grader note")

    class Meta:
        verbose_name = "Grade KPI Score"
        verbose_name_plural = "Grade KPI Scores"
        ordering = ['kpi_number']

    def __str__(self):
        return f"Grade {self.call_grade_id} - KPI {self.kpi_number}: {self.score}"