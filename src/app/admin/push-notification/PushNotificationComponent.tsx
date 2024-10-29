'use client';

import * as React from 'react';
import { firebaseCloudMessaging } from '@/app/admin/push-notification/firebase';

import axiosInstance from '@/lib/axios';


interface NotificationDataI {
  title: string;
  body: string;
}

export default function PushNotificationComponent(): React.JSX.Element {
  const [fcmToken, setFcmToken] = React.useState<string | null>(null);
  const [lastFcmToken, setLastFcmToken] = React.useState<string | null>(null);

  const getFcmToken = async () => {
    try {
      const token = await firebaseCloudMessaging.init();
      if (token) {
        await firebaseCloudMessaging.getMessage();
        setFcmToken(token);
      }
    } catch (error: unknown) {
      // console.error('Failed to get FCM token:', error);
      error instanceof Error ? error.message : 'An unexpected error occurred';
    }
  };

  interface UpdateFccTokenPayloadI {
    deviceId: string;
  }

  const updateFccToken = async (currentToken: string) => {
    if (currentToken) {
      try {
        await axiosInstance.post<UpdateFccTokenPayloadI>('/auth/update-device-id', {
          deviceId: currentToken,
        });
      }  catch (error: unknown) {
        // console.error('Failed to get FCM token:', error);
        error instanceof Error ? error.message : 'An unexpected error occurred';
      }
    }
  };

  // React.useEffect(() => {
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.addEventListener('message', (event) => {
  //       console.info('Event from the service worker:', event);
  //     });
  //   }
  //   void getFcmToken();
  // }, []);


  React.useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const data = event.data as { notification?: NotificationDataI }; // Type assertion

      if (data?.notification) {
        showNotification(data.notification);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    void getFcmToken();

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);


  const showNotification = (notification: { title: string; body: string }) => {
    const createNotification = () => {
      return new Notification(notification.title, {
        body: notification.body,
        icon: '/assets/red-strength-logo-dark.png', // Main icon
        badge: '/assets/red-strength-logo-dark.png', // Badge icon
      });
    };

    if (Notification.permission === 'granted') {
      createNotification();
    } else if (Notification.permission !== 'denied') {
      void Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          createNotification();
        }
      });
    }
  };



  React.useEffect(() => {
    const interval = setInterval(() => {
      if (lastFcmToken !== fcmToken) {
        setLastFcmToken(fcmToken);
        if (fcmToken) {
         void updateFccToken(fcmToken);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {clearInterval(interval)} ;
  }, [fcmToken, lastFcmToken]);

  return <></>;
}
