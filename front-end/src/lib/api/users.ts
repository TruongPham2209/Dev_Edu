import { apiGet, apiPost, apiPut } from "./client";
import type {
  CustomPaging,
  RegisterUser,
  RoleEnum,
  UserResponse,
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

export async function batchCreateUsers(users: RegisterUser[]): Promise<string> {
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

export async function searchUsers(
  page: number,
  keyword: string,
  role: RoleEnum,
): Promise<CustomPaging<UserResponse>> {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("role", role);
  query.append("keyword", keyword?.trim() || "");

  return apiGet<CustomPaging<UserResponse>>(
    `/api/v1/users?${query.toString()}`,
  );
}
