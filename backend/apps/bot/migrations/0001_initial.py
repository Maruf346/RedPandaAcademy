# Generated manually for Panda Bot conversation storage.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BotConversation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bot_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Bot Conversation',
                'verbose_name_plural': 'Bot Conversations',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='BotMessage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('user', 'User'), ('assistant', 'Assistant')], max_length=20)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='bot.botconversation')),
            ],
            options={
                'verbose_name': 'Bot Message',
                'verbose_name_plural': 'Bot Messages',
                'ordering': ['created_at'],
            },
        ),
    ]
