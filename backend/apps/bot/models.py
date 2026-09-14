from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class BotConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bot_conversations'
    )
    title = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Bot Conversation'
        verbose_name_plural = 'Bot Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.user.email} - {self.title or self.id}'


class BotMessage(models.Model):
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'Assistant'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        BotConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Bot Message'
        verbose_name_plural = 'Bot Messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.conversation_id} - {self.role}'
