import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  registerDeviceTokenApi,
  unregisterDeviceTokenApi,
} from "../notifications";

describe("notifications API endpoints", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("shouldCallPostEndpointWithDeviceTokenData", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        status: "OK",
        message: "Device token registered successfully",
        data: null,
      }),
    } as Response);

    await registerDeviceTokenApi({
      fcmToken: "mock-fcm-token-123",
      deviceType: "web",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:9020/api/v1/notifications/device-tokens",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          fcmToken: "mock-fcm-token-123",
          deviceType: "web",
        }),
      }),
    );
  });

  it("shouldCallDeleteEndpointWithFcmTokenData", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        status: "OK",
        message: "Device token unregistered successfully",
        data: null,
      }),
    } as Response);

    await unregisterDeviceTokenApi({
      fcmToken: "mock-fcm-token-123",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:9020/api/v1/notifications/device-tokens",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({
          fcmToken: "mock-fcm-token-123",
        }),
      }),
    );
  });
});
