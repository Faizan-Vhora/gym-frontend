// Import the functions you need from the SDKs you need
import { NEXT_PUBLIC_FIREBASE_VAPID_KEY } from "@/app-config";
import * as firebase from "firebase/app";
import {getMessaging, getToken, onMessage} from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseCloudMessaging = {
    //checking whether token is available in indexed DB
    tokenInlocalforage: async () => {
        return localStorage.getItem('fcm_token')
    },
    //initializing firebase app
    init: async function () {
        if (!firebase.getApps().length) {
            firebase.initializeApp({
                apiKey: "AIzaSyC_GCk91WFhvh6zBPV9tpwV5x570uZi-J8",
                authDomain: "gym-redstrength.firebaseapp.com",
                projectId: "gym-redstrength",
                storageBucket: "gym-redstrength.appspot.com",
                messagingSenderId: "416742758261",
                appId: "1:416742758261:web:d1ead03d8b0b474872653c",
                measurementId: "G-1J1VZEEMGX"

            })

            try {
                const messaging = getMessaging()
                const tokenInLocalForage = await this.tokenInlocalforage()
                //if FCM token is already there just return the token
                if (tokenInLocalForage !== null) {
                    return tokenInLocalForage
                }
                //requesting notification permission from browser
                const status = await Notification.requestPermission()
                if (status && status === 'granted') {
                    //getting token from FCM
                    const fcm_token = await getToken(messaging,{
                        vapidKey: "BFV7Be3lAmMfmMjrM0HnwIveUJHH72an90yShbh-1flKkvEXZDge-NzmDHu92e7abX1vLlvlSmQhFuW4vqsHqAw"
                    })
                    if (fcm_token) {
                        //setting FCM token in indexed db using localforage
                        localStorage.setItem('fcm_token', fcm_token)
                        //return the FCM token after saving it
                        return fcm_token
                    }
                }
            } catch (error) {
                console.error(error)
                return null
            }
        }else {
            try {
                const tokenInLocalForage = await this.tokenInlocalforage()
                //if FCM token is already there just return the token
                if (tokenInLocalForage !== null) {
                    return tokenInLocalForage
                }
                const messaging = getMessaging()
                const status = await Notification.requestPermission()
                if (status && status === 'granted') {
                    //getting token from FCM
                    const fcm_token = await getToken(messaging,{
                        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
                    })
                    if (fcm_token) {
                        //setting FCM token in indexed db using localforage
                        localStorage.setItem('fcm_token', fcm_token)
                        //return the FCM token after saving it
                        return fcm_token
                    }
                }
            }catch (error) {
                console.error(error)
                return null;
            }
        }
    },
    getMessage: async function() {
        if(firebase.getApps().length > 0) {
            try {
                const messaging = getMessaging();
                onMessage(messaging, (payload) => {
                    console.log("Message Received", payload)

                    //  TODO manually trigger
                } )

            }catch (error) {

            }
        }
    }
}
export { firebaseCloudMessaging }