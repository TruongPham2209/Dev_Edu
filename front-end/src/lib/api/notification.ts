import type {
  CreateGroupNotificationRequest,
  NotificationCategory,
  NotificationResponse,
  UnreadCountResponse,
} from "@/lib/type/notification";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { apiDelete, apiGet, apiPost, apiPut } from "./client";

// --- API Functions ---

/**
 * Gets unified user notifications with cursor pagination.
 */
export async function getNotifications(
  cursor?: string,
): Promise<CustomPaging<NotificationResponse>> {
  const query = new URLSearchParams();
  if (cursor) query.append("cursor", cursor);

  const qs = query.toString();
  return apiGet<CustomPaging<NotificationResponse>>(
    `/api/v1/notifications${qs ? "?" + qs : ""}`,
  );
}

/**
 * Gets unread notification counts (personal, group, total) for current user.
 */
export async function getUnreadNotificationCount(): Promise<UnreadCountResponse> {
  return apiGet<UnreadCountResponse>("/api/v1/notifications/unread-count");
}

/**
 * Marks a single notification as read (if id is provided) or all notifications as read (if id is omitted).
 */
export async function markNotificationAsRead(params?: {
  id?: string;
  category?: NotificationCategory;
}): Promise<string> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.category) query.append("category", params.category);

  const qs = query.toString();
  return apiPut<string>(
    `/api/v1/notifications/read${qs ? "?" + qs : ""}`,
    {},
  );
}

/**
 * Admin action: Creates a group notification.
 */
export async function createGroupNotification(
  request: CreateGroupNotificationRequest,
): Promise<NotificationResponse> {
  return apiPost<NotificationResponse>("/api/v1/notifications/group", request);
}

/**
 * Admin action: Soft deletes a group notification.
 */
export async function deleteGroupNotification(
  id: string,
): Promise<string> {
  return apiDelete<string>(`/api/v1/notifications/group/${id}`);
}

/**
 * Deletes a personal notification by ID.
 */
export async function deletePersonalNotification(
  id: string,
): Promise<string> {
  return apiDelete<string>(`/api/v1/notifications/${id}`);
}

/**
 * Admin action: Gets all group notifications with cursor pagination.
 */
export async function getAllGroupNotifications(
  cursor?: string,
): Promise<CustomPaging<NotificationResponse>> {
  const query = new URLSearchParams();
  if (cursor) query.append("cursor", cursor);

  const qs = query.toString();
  return apiGet<CustomPaging<NotificationResponse>>(
    `/api/v1/notifications/group/all${qs ? "?" + qs : ""}`,
  );
}

// --- React Query Hooks ---

export function useNotificationsQuery(
  cursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<NotificationResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["notifications", "unified", cursor],
    queryFn: () => getNotifications(cursor),
    ...options,
  });
}

export function useNotificationsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<NotificationResponse>,
      Error,
      InfiniteData<CustomPaging<NotificationResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    ...options,
  });
}

export function useUnreadNotificationCountQuery(
  options?: Omit<
    UseQueryOptions<UnreadCountResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    ...options,
  });
}

export function useMarkNotificationAsReadMutation(
  options?: UseMutationOptions<
    string,
    Error,
    { id?: string; category?: NotificationCategory } | void
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => markNotificationAsRead(params || undefined),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCreateGroupNotificationMutation(
  options?: UseMutationOptions<
    NotificationResponse,
    Error,
    CreateGroupNotificationRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroupNotification,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteGroupNotificationMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroupNotification,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeletePersonalNotificationMutation(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePersonalNotification,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useAllGroupNotificationsQuery(
  cursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<NotificationResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["notifications", "group-all", cursor],
    queryFn: () => getAllGroupNotifications(cursor),
    ...options,
  });
}

export function useAllGroupNotificationsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<NotificationResponse>,
      Error,
      InfiniteData<CustomPaging<NotificationResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["notifications", "group-all-infinite"],
    queryFn: ({ pageParam }) => getAllGroupNotifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    ...options,
  });
}
