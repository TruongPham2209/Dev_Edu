import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as pushNotification from "../push-notification";
import * as notificationsApi from "../api/notifications";

vi.mock("../firebase", () => ({
  getFirebaseMessaging: vi.fn(),
}));

vi.mock("firebase/messaging", () => ({
  getToken: vi.fn(),
  onMessage: vi.fn(),
}));

vi.mock("../api/notifications", () => ({
  registerDeviceTokenApi: vi.fn(),
  unregisterDeviceTokenApi: vi.fn(),
}));

describe("push-notification helper service", () => {
  const originalNotification = global.Notification;
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    vi.restoreAllMocks();

    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "valid-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = "valid-vapid-key";

    global.Notification = {
      requestPermission: vi.fn(),
    } as unknown as typeof Notification;

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: vi.fn(),
        getRegistration: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalNotification) {
      global.Notification = originalNotification;
    } else {
      // @ts-expect-error delete global mock
      delete global.Notification;
    }
    Object.defineProperty(navigator, "serviceWorker", {
      value: originalServiceWorker,
      writable: true,
      configurable: true,
    });
  });

  it("shouldConstructServiceWorkerUrlWithQueryParams", () => {
    const swUrl = pushNotification.getServiceWorkerUrl();
    expect(swUrl).toContain("/firebase-messaging-sw.js");
  });

  it("shouldReturnNullIfBrowserDoesNotSupportServiceWorkerOrNotification", async () => {
    // @ts-expect-error test unsupported case
    delete global.Notification;

    const token = await pushNotification.requestAndRegisterPushNotification();
    expect(token).toBeNull();
  });

  it("shouldReturnNullIfNotificationPermissionDenied", async () => {
    vi.spyOn(Notification, "requestPermission").mockResolvedValue("denied");

    const token = await pushNotification.requestAndRegisterPushNotification();
    expect(token).toBeNull();
  });

  it("shouldRegisterTokenSuccessfullyWhenPermissionGranted", async () => {
    vi.spyOn(Notification, "requestPermission").mockResolvedValue("granted");

    const mockRegistration = {} as ServiceWorkerRegistration;
    vi.spyOn(navigator.serviceWorker, "register").mockResolvedValue(
      mockRegistration,
    );

    const { getFirebaseMessaging } = await import("../firebase");
    const { getToken } = await import("firebase/messaging");

    const mockMessaging = { app: {} } as unknown as Awaited<ReturnType<typeof getFirebaseMessaging>>;
    vi.mocked(getFirebaseMessaging).mockResolvedValue(mockMessaging);
    vi.mocked(getToken).mockResolvedValue("sample-fcm-token");
    vi.mocked(notificationsApi.registerDeviceTokenApi).mockResolvedValue();

    const token = await pushNotification.requestAndRegisterPushNotification();

    expect(token).toBe("sample-fcm-token");
    expect(notificationsApi.registerDeviceTokenApi).toHaveBeenCalledWith({
      fcmToken: "sample-fcm-token",
      deviceType: "web",
    });
  });

  it("shouldListenForegroundNotifications", async () => {
    const { getFirebaseMessaging } = await import("../firebase");
    const { onMessage } = await import("firebase/messaging");

    const mockMessaging = { app: {} } as unknown as Awaited<ReturnType<typeof getFirebaseMessaging>>;
    vi.mocked(getFirebaseMessaging).mockResolvedValue(mockMessaging);

    const mockUnsub = vi.fn();
    vi.mocked(onMessage).mockReturnValue(mockUnsub);

    const callback = vi.fn();
    const unsub = await pushNotification.listenForegroundNotifications(callback);

    expect(onMessage).toHaveBeenCalledWith(mockMessaging, expect.any(Function));
    expect(unsub).toBe(mockUnsub);
  });

  it("shouldUnregisterTokenOnLogout", async () => {
    const mockRegistration = {} as ServiceWorkerRegistration;
    vi.spyOn(navigator.serviceWorker, "getRegistration").mockResolvedValue(
      mockRegistration,
    );

    const { getFirebaseMessaging } = await import("../firebase");
    const { getToken } = await import("firebase/messaging");

    const mockMessaging = { app: {} } as unknown as Awaited<ReturnType<typeof getFirebaseMessaging>>;
    vi.mocked(getFirebaseMessaging).mockResolvedValue(mockMessaging);
    vi.mocked(getToken).mockResolvedValue("token-to-unregister");
    vi.mocked(notificationsApi.unregisterDeviceTokenApi).mockResolvedValue();

    await pushNotification.unregisterPushNotificationOnLogout();

    expect(notificationsApi.unregisterDeviceTokenApi).toHaveBeenCalledWith({
      fcmToken: "token-to-unregister",
    });
  });
});

