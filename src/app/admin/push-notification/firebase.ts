// Import the functions you need from the SDKs you need
import {
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY,
} from '@/app-config';
import * as firebase from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseCloudMessaging = {
  //checking whether token is available in indexed DB
  tokenInlocalforage: async () => {
    return localStorage.getItem('fcmToken');
  },
  //initializing firebase app
  init: async function () {
    if (!firebase.getApps().length) {
      firebase.initializeApp({
        apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      });

      try {
        const messaging = getMessaging();
        const tokenInLocalForage = await this.tokenInlocalforage();
        //if FCM token is already there just return the token
        if (tokenInLocalForage !== null) {
          return tokenInLocalForage;
        }
        //requesting notification permission from browser
        const status = await Notification.requestPermission();
        if (status && status === 'granted') {
          //getting token from FCM
          const fcmToken = await getToken(messaging, {
            vapidKey: NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (fcmToken) {
            //setting FCM token in indexed db using localforage
            localStorage.setItem('fcmToken', fcmToken);
            //return the FCM token after saving it
            return fcmToken;
          }
        }
      } catch (error: unknown) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
        return null;
      }
    } else {
      try {
        const tokenInLocalForage = await this.tokenInlocalforage();
        //if FCM token is already there just return the token
        if (tokenInLocalForage !== null) {
          return tokenInLocalForage;
        }
        const messaging = getMessaging();
        const status = await Notification.requestPermission();
        if (status && status === 'granted') {
          //getting token from FCM
          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
          });
          if (fcmToken) {
            //setting FCM token in indexed db using localforage
            localStorage.setItem('fcmToken', fcmToken);
            //return the FCM token after saving it
            return fcmToken;
          }
        }
      } catch (error: unknown) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
        return null;
      }
    }
  },
  getMessage: async function () {
    if (firebase.getApps().length > 0) {
      try {
        const messaging = getMessaging();
        onMessage(messaging, () => {
          return null;
        });
      } catch (error: unknown) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
        return null;
      }
    }

  },
};
export { firebaseCloudMessaging };
