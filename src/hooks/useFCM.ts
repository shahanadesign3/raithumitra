import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported, VAPID_PUBLIC_KEY } from "@/integrations/firebase/firebase";
import { supabase } from "@/integrations/supabase/client";
import { getGuestId } from "@/lib/guest";

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (typeof window === "undefined") return;
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;

        // Ensure service worker is registered
        const registration = (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js"))
          || (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));

        const messaging = await getMessagingIfSupported();
        if (!messaging) return;

        if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes("ADD_YOUR_WEB_PUSH")) {
          console.warn("FCM VAPID public key missing. Add it in src/integrations/firebase/firebase.ts");
          return;
        }

        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_PUBLIC_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) return;
        if (!active) return;
        setToken(fcmToken);

        // Avoid redundant writes
        const cached = localStorage.getItem("fcm_token");
        if (cached !== fcmToken) {
          localStorage.setItem("fcm_token", fcmToken);
          const id = getGuestId();
          await supabase.functions.invoke("guest-profile", {
            body: { id, fcm_token: fcmToken },
          });
        }

        // Foreground messages
        onMessage(messaging, (payload) => {
          // Optionally surface via Notification API if allowed
          try {
            const title = payload.notification?.title || "Weather Alert";
            const body = payload.notification?.body || "";
            if (Notification.permission === "granted") {
              new Notification(title, { body });
            }
          } catch {}
          console.log("FCM foreground message:", payload);
        });
      } catch (e) {
        console.error("FCM init failed", e);
      }
    })();

    return () => { active = false; };
  }, []);

  return { token };
}
