import { RegisterUser, UserResponse } from "@/lib/type/users";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { RoleEnum } from "../type/enum";
import { apiGet, apiPost, apiPut } from "./client";
import { loginAction, type LoginActionState } from "@/app/login/actions";

// --- Call API ---

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

// --- React Query Hooks ---

export function useMeQuery(
  options?: Omit<UseQueryOptions<UserResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    ...options,
  });
}

export function useLoginMutation(
  options?: UseMutationOptions<
    LoginActionState,
    Error,
    { username: string; password: string }
  >,
) {
  return useMutation({
    mutationFn: async ({ username, password }) => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      const res = await loginAction({ error: null }, formData);
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    },
    ...options,
  });
}

export function useRegisterMutation(
  options?: UseMutationOptions<string, Error, RegisterUser>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useBatchCreateUsersMutation(
  options?: UseMutationOptions<string, Error, RegisterUser[]>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: batchCreateUsers,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useChangePasswordMutation(
  options?: UseMutationOptions<
    string,
    Error,
    { oldPassword: string; newPassword: string }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }) =>
      changePassword(oldPassword, newPassword),
    ...options,
    onSuccess: (...args) => {
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateAvatarMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAvatar,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSetUsernameFromGoogleMutation(
  options?: UseMutationOptions<
    string,
    Error,
    { email: string; username: string }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, username }) => setUsernameFromGoogle(email, username),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSearchUsersQuery(
  page: number,
  keyword: string,
  role: RoleEnum,
  options?: Omit<
    UseQueryOptions<CustomPaging<UserResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["users", "search", { page, keyword, role }],
    queryFn: () => searchUsers(page, keyword, role),
    ...options,
  });
}
