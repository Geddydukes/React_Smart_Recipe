import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { notificationService } from '../services/notifications';

interface NotificationData {
  achievementId: string;
  points: number;
  rarity: string;
}

export function NotificationHandler() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request notification permissions
    notificationService.requestPermissions();

    // Listen for incoming notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
          const data = notification.request.content.data as NotificationData;
          if (data.achievementId) {
            // Handle achievement notification
            router.push(`/achievements/${data.achievementId}` as any);
          }
        },
      );

    // Listen for notification responses (when user taps notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          const data = response.notification.request.content
            .data as NotificationData;
          if (data.achievementId) {
            router.push(`/achievements/${data.achievementId}` as any);
          }
        },
      );

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return null;
}
