from django.contrib import admin
from .models import BotConversation, BotMessage


class BotMessageInline(admin.TabularInline):
    model = BotMessage
    extra = 0
    readonly_fields = ['role', 'content', 'created_at']
    can_delete = False


@admin.register(BotConversation)
class BotConversationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'created_at', 'updated_at']
    search_fields = ['user__email', 'title', 'messages__content']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [BotMessageInline]


@admin.register(BotMessage)
class BotMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'created_at']
    search_fields = ['conversation__user__email', 'content']
    readonly_fields = ['created_at']
