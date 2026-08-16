import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";
import {
  registerDeviceTokenApi,
  unregisterDeviceTokenApi,
} from "./api/notifications";

export function getServiceWorkerUrl(): string {
  return "/firebase-messaging-sw.js";
}

function isConfiguredValue(val?: string): boolean {
  if (!val) return false;
  if (val.startsWith("your_") || val.includes("xxxx")) return false;
  return true;
}

export async function requestAndRegisterPushNotification(): Promise<
  string | null
> {
  try {
    if (typeof window === "undefined") return null;

    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("Browser does not support push notifications.");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    console.log("[FCM Config Debug]", {
      apiKey: apiKey || "(not set)",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "(not set)",
      projectId: projectId || "(not set)",
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "(not set)",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "(not set)",
      vapidKey: vapidKey || "(not set)",
    });

    if (!isConfiguredValue(vapidKey) || !isConfiguredValue(apiKey)) {
      console.warn(
        "Push notifications skipped: Firebase credentials in .env are placeholder values.",
      );
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Push notification permission denied by user.");
      return null;
    }

    const swUrl = getServiceWorkerUrl();
    const registration = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    let currentToken: string | null = null;
    try {
      currentToken = await getToken(messaging, {
        vapidKey: vapidKey || undefined,
        serviceWorkerRegistration: registration,
      });
    } catch (tokenErr) {
      console.warn(
        "getToken with explicit registration failed, trying fallback:",
        tokenErr,
      );
      try {
        currentToken = await getToken(messaging, {
          vapidKey: vapidKey || undefined,
        });
      } catch (tokenErr2) {
        console.warn("getToken fallback failed:", tokenErr2);
        return null;
      }
    }

    if (currentToken) {
      await registerDeviceTokenApi({
        fcmToken: currentToken,
        deviceType: "web",
      });
      console.log("Registered FCM Token successfully.");
      return currentToken;
    }
  } catch (error) {
    console.warn(
      "Push notification setup warning (FCM Push Service error or unconfigured):",
      error,
    );
  }
  return null;
}

export async function listenForegroundNotifications(
  onMessageCallback: (payload: MessagePayload) => void,
) {
  if (typeof window === "undefined") return undefined;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return undefined;

  return onMessage(messaging, (payload) => {
    console.log("Received foreground push notification:", payload);
    onMessageCallback(payload);
  });
}

export async function unregisterPushNotificationOnLogout(): Promise<void> {
  try {
    if (typeof window === "undefined") return;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const swUrl = getServiceWorkerUrl();
    let registration = await navigator.serviceWorker
      .getRegistration(swUrl)
      .catch(() => undefined);

    if (!registration) {
      registration = await navigator.serviceWorker
        .getRegistration("/firebase-messaging-sw.js")
        .catch(() => undefined);
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration,
    }).catch(() => null);

    if (token) {
      await unregisterDeviceTokenApi({ fcmToken: token });
      console.log("Unregistered FCM Token successfully.");
    }
  } catch (error) {
    console.error("Error unregistering FCM token on logout:", error);
  }
}
