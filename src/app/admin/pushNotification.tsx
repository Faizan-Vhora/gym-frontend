// CmsPage.tsx
'use client';

import * as React from 'react';

import { firebaseCloudMessaging } from '@/config/firebase';
import axiosInstance from '@/lib/axios';

export default function PushNotificationComponent(): React.JSX.Element {
  const [fcmToken, setFcmToken] = React.useState<string | undefined>(undefined);

  const getToken = async () => {
    console.log('getToken called : ');
    try {
      const token = await firebaseCloudMessaging.init();
      if (token) {
        await firebaseCloudMessaging.getMessage();
        console.log(' ==> setting FCM token');
        setFcmToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  interface updateFccToken {
    deviceId: string;
  }

  const updateFccToken = async () => {
    try {
      // Call the API to change the password
      await axiosInstance.post<updateFccToken>('/auth/update-device-id', {
        deviceId: fcmToken,
      });

      // Success message
      // toast.success('DeviceId updated successfully');
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  };

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) =>
        console.log('event for the service worker', event)
      );
    }
    void getToken();
  }, []);

  React.useEffect(() => {
    if (fcmToken) {
      void updateFccToken();
    }
  }, [fcmToken]);

  return <></>;
}
