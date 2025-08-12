/* Firebase Cloud Messaging Service Worker */
/* Using compat builds to simplify SW setup */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAbpCtOB_YkAWIdG010ihzPmV0R6bsMZyQ",
  authDomain: "raithu-mitra.firebaseapp.com",
  projectId: "raithu-mitra",
  storageBucket: "raithu-mitra.firebasestorage.app",
  messagingSenderId: "254676234883",
  appId: "1:254676234883:web:bfde04f469f6972d5a61b6",
  measurementId: "G-HXZDP6NQMX",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || "Weather Alert";
    const options = {
      body: payload?.notification?.body || "",
      icon: "/favicon.ico",
      data: payload?.data || {},
    };
    self.registration.showNotification(title, options);
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/dashboard"));
  });
} catch (e) {
  console.warn("Firebase SW init failed", e);
}
