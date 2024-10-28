// import React from 'react';
// import { AppProps } from 'next/app';
// import { firebaseCloudMessaging } from '@/utils/firebase';

// function MyApp({ Component, pageProps }: AppProps) {
//   const [fcmToken, setFcmToken] = React.useState<string | undefined>(undefined);
//   const [message, setMessage] = React.useState<string>('');

//   const getToken = async () => {
//     try {
//       const token = await firebaseCloudMessaging.init();
//       if (token) {
//         await firebaseCloudMessaging.getMessage();
//         setFcmToken(token);
//       }AppProps
//     } catch (error) {}
//   };

//   React.useEffect(() => {
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker
//         .register('/firebase-messaging-sw.js')
//         .then((registration) => {
//           console.log('Service Worker registered Successfully', registration);
//         })
//         .catch((error) => {
//           console.log('Service Worker Registration Failed', error);
//         });

//       navigator.serviceWorker.addEventListener('message', (event) => {
//         setMessage(event.data.notification.title);
//       });
//     }
//     async function setToken() {
//       await getToken();
//     }
//     setToken();
//   }, [message]);

//   return <Component {...pageProps} fcmToken={fcmToken} getToken={getToken} messages={message} />;
// }
