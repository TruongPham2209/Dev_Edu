import { apiPost, apiPut, apiGet } from "./client";
import type {
  RegisterUser,
  FileUploadResponse,
  FilePreSignUploadRequest,
  UserResponse
} from "./types";

// --- Users ---

export async function getMe(): Promise<UserResponse> {
  return apiGet("/api/v1/me");
}

export async function register(user: RegisterUser): Promise<string> {
  return apiPost<string>("/api/v1/users/register", user);
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<string> {
  return apiPost<string>("/api/v1/users/change-password", {
    oldPassword,
    newPassword,
  });
}

export async function batchCreateUsers(
  users: RegisterUser[],
): Promise<string> {
  return apiPost<string>("/api/v1/users/batch-users", users);
}

export async function updateAvatar(avatarObjectKey: string): Promise<string> {
  return apiPut<string>("/api/v1/users/avatar", { avatarObjectKey });
}

export async function setUsernameFromGoogle(
  email: string,
  username: string,
): Promise<string> {
  return apiPut<string>("/api/v1/users/username", { email, username });
}

// --- Files ---

export async function getPreSignedUploadUrl(
  request: FilePreSignUploadRequest,
): Promise<FileUploadResponse> {
  return apiPost<FileUploadResponse>("/api/v1/files/pre-signed-url", request);
}

export async function confirmImageUpload(
  fullObjectKey: string,
): Promise<string> {
  return apiPost<string>(
    `/api/v1/files/confirm-image-upload?fullObjectKey=${encodeURIComponent(fullObjectKey)}`,
    {},
  );
}

export async function getDownloadUrl(
  fullObjectKey: string,
): Promise<unknown> {
  return apiGet<unknown>(
    `/api/v1/files/download?fullObjectKey=${encodeURIComponent(fullObjectKey)}`,
  );
}
