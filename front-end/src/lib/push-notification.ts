import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";
import { registerDeviceTokenApi, unregisterDeviceTokenApi } from "./api/notifications";

export async function requestAndRegisterPushNotification(): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;

    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("Browser does not support push notifications.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Push notification permission denied by user.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      await registerDeviceTokenApi({
        fcmToken: currentToken,
        deviceType: "web",
      });
      console.log("Registered FCM Token successfully.");
      return currentToken;
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
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

    const registration = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js",
    );
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
