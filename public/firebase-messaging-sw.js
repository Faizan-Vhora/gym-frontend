importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyC_GCk91WFhvh6zBPV9tpwV5x570uZi-J8",
    projectId: "gym-redstrength",
    messagingSenderId: "416742758261",
    appId:"1:416742758261:web:d1ead03d8b0b474872653c",
})


const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
    if (Notification.permission === 'granted') {
        if (navigator.serviceWorker)
            navigator.serviceWorker.getRegistration().then(async function (reg) {
                if (reg)
                    await reg.showNotification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/assets/red-strength-logo-dark.png',  // Main icon //TODO
                        badge: '/assets/red-strength-logo-dark.png'  // Badge icon
                    });
            });
    }
})