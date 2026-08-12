import { apiPost, apiDelete } from "./client";

export interface DeviceTokenRequest {
  fcmToken: string;
  deviceType: string;
}

export interface UnregisterDeviceTokenRequest {
  fcmToken: string;
}

export async function registerDeviceTokenApi(
  data: DeviceTokenRequest,
): Promise<void> {
  return apiPost<void>("/api/v1/notifications/device-tokens", data);
}

export async function unregisterDeviceTokenApi(
  data: UnregisterDeviceTokenRequest,
): Promise<void> {
  return apiDelete<void>("/api/v1/notifications/device-tokens", data);
}
