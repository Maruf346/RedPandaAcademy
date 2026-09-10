import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Notification, NotificationType, NotificationPriority

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Web-only notification service.
    Saves to DB and pushes via WebSocket (Django Channels).
    No FCM / mobile push notifications.
    """

    @staticmethod
    def send_notification(
        user,
        notification_type: str,
        title: str,
        body: str,
        data: dict = None,
        priority: str = NotificationPriority.NORMAL,
    ):
        # Save to DB
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority
        )

        # Push via WebSocket
        ws_success = NotificationService._send_websocket(
            user_id=str(user.id),
            notification_id=str(notification.id),
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority,
            created_at=notification.created_at.isoformat(),
        )

        if ws_success:
            logger.info(f'Notification sent via WebSocket to {user.email}: {notification_type}')
        else:
            logger.warning(f'WebSocket delivery failed for {user.email}: {notification_type}')

        return notification

    @staticmethod
    def _send_websocket(
        user_id, notification_id, notification_type,
        title, body, data, priority, created_at
    ):
        try:
            channel_layer = get_channel_layer()
            group_name = f'user_{user_id}'

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification_id': notification_id,
                    'notification_type': notification_type,
                    'title': title,
                    'body': body,
                    'data': data,
                    'priority': priority,
                    'created_at': created_at,
                }
            )
            return True

        except Exception as e:
            logger.error(f'WebSocket send failed for user {user_id}: {str(e)}')
            return False

    @staticmethod
    def send_to_admins(notification_type, title, body, data=None):
        """Send notification to all active admins and managers."""
        staff = User.objects.filter(is_staff=True, is_active=True)
        for user in staff:
            NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data,
            )

    @staticmethod
    def send_to_managers(notification_type, title, body, data=None):
        """Send notification to managers only (not superusers)."""
        managers = User.objects.filter(
            is_staff=True,
            is_superuser=False,
            is_active=True
        )
        for user in managers:
            NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data,
            )


class NotificationTemplates:
    """
    Ready-made notification templates for all events in the system.
    Call these from views, signals, or Celery tasks.
    """

    # ==================== AUTH ====================

    @staticmethod
    def welcome(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.WELCOME,
            title='Welcome to Red Panda Academy',
            body=f'Hi {user.full_name or user.email}, your account is ready. Complete your profile to get started.',
            priority=NotificationPriority.NORMAL,
        )

    @staticmethod
    def new_user_joined(user):
        NotificationService.send_to_admins(
            notification_type='user_joined',
            title='New user joined',
            body=f'{user.full_name or user.email} created an account.',
            data={'user_id': str(user.id), 'email': user.email},
            priority=NotificationPriority.NORMAL,
        )

    @staticmethod
    def password_updated(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.PASSWORD_UPDATED,
            title='Password Reset Successfully',
            body="Your password was reset. If this wasn't you, contact your administrator immediately.",
            priority=NotificationPriority.HIGH,
        )

    @staticmethod
    def password_changed(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.PASSWORD_CHANGED,
            title='Password Changed',
            body="Your password was changed successfully. If this wasn't you, contact your administrator.",
            priority=NotificationPriority.HIGH,
        )


   