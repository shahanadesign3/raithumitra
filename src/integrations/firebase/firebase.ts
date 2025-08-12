import { initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyAbpCtOB_YkAWIdG010ihzPmV0R6bsMZyQ",
  authDomain: "raithu-mitra.firebaseapp.com",
  projectId: "raithu-mitra",
  storageBucket: "raithu-mitra.firebasestorage.app",
  messagingSenderId: "254676234883",
  appId: "1:254676234883:web:bfde04f469f6972d5a61b6",
  measurementId: "G-HXZDP6NQMX",
};

export const firebaseApp = initializeApp(firebaseConfig);

let _messagingPromise: Promise<Messaging | null> | null = null;
export const getMessagingIfSupported = () => {
  if (!_messagingPromise) {
    _messagingPromise = isSupported().then((supported) =>
      supported ? getMessaging(firebaseApp) : null
    );
  }
  return _messagingPromise;
};

// IMPORTANT: Replace with your Web Push certificate public key from Firebase Console → Cloud Messaging → Web Push certificates
export const VAPID_PUBLIC_KEY = "ADD_YOUR_WEB_PUSH_CERT_PUBLIC_KEY";
