import type {
  ForumCommentRequest,
  ForumCommentResponse,
  PostRequest,
  PostResponse,
  PostVersionUpdateRequest,
  SavedPostResponse,
  UpdatedPostResponse,
} from "@/lib/type/forums";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { PostStatus } from "../type/enum";
import { apiDelete, apiGet, apiPost, apiPut } from "./client";

// --- Posts ---

export async function createForumPost(
  post: PostRequest,
): Promise<PostResponse> {
  return apiPost<PostResponse>("/api/v1/forum/posts", post);
}

export async function updateForumPost(
  post: PostRequest,
): Promise<PostResponse> {
  return apiPut<PostResponse>("/api/v1/forum/posts", post);
}

export async function deleteForumPost(postId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/forum/posts?postId=${postId}`);
}

export async function getForumPostById(postId: string): Promise<PostResponse> {
  return apiGet<PostResponse>(`/api/v1/forum/posts?id=${postId}`);
}

// --- Feed / Search / Related ---

export async function getPostedPosts(
  status: PostStatus,
  nextCursor?: string,
): Promise<CustomPaging<PostResponse>> {
  const query = new URLSearchParams();
  query.append("status", status);
  if (nextCursor) query.append("lastCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<PostResponse>>(`/api/v1/forum/posts/posted?${qs}`);
}

export async function getForumFeed(
  nextCursor?: string,
): Promise<CustomPaging<PostResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<PostResponse>>(
    `/api/v1/forum/posts/feed${qs ? "?" + qs : ""}`,
  );
}

export async function searchForumPosts(
  keyword: string,
  nextCursor?: string,
): Promise<CustomPaging<PostResponse>> {
  const query = new URLSearchParams();
  query.append("keyword", keyword);
  if (nextCursor) query.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<PostResponse>>(
    `/api/v1/forum/posts/search?${query.toString()}`,
  );
}

export async function getRelatedPosts(postId: string): Promise<PostResponse[]> {
  return apiGet<PostResponse[]>(`/api/v1/forum/posts/${postId}/related`);
}

// --- Post Versions ---

export async function getPostVersions(
  status: string,
  lastCursor?: string,
): Promise<CustomPaging<PostResponse>> {
  const query = new URLSearchParams();
  query.append("status", status);
  if (lastCursor) query.append("lastCursor", lastCursor);

  return apiGet<CustomPaging<PostResponse>>(
    `/api/v1/forum/posts/versions?${query.toString()}`,
  );
}

export async function getPostVersionsByPostId(
  postId: string,
  status?: string,
): Promise<PostResponse[]> {
  const query = status ? `?status=${status}` : "";
  return apiGet<PostResponse[]>(
    `/api/v1/forum/posts/versions/${postId}${query}`,
  );
}

export async function updatePostVersion(
  request: PostVersionUpdateRequest,
): Promise<UpdatedPostResponse> {
  return apiPut<UpdatedPostResponse>("/api/v1/forum/posts/versions", request);
}

export async function deletePostVersion(postVersionId: string): Promise<void> {
  return apiDelete<void>(
    `/api/v1/forum/posts/versions?postVersionId=${postVersionId}`,
  );
}

// --- Saved Posts ---

export async function getSavedPosts(
  nextCursor?: string,
): Promise<CustomPaging<SavedPostResponse>> {
  const query = new URLSearchParams();
  if (nextCursor) query.append("nextCursor", nextCursor);

  const qs = query.toString();
  return apiGet<CustomPaging<SavedPostResponse>>(
    `/api/v1/forum/posts/saved${qs ? "?" + qs : ""}`,
  );
}

export async function savePost(postId: string): Promise<void> {
  return apiPost<void>(`/api/v1/forum/posts/${postId}/save`, {});
}

export async function unsavePost(postId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/forum/posts/${postId}/save`);
}

// --- Forum Comments ---

export async function getForumComments(
  postId: string,
  nextCursor?: string,
): Promise<CustomPaging<ForumCommentResponse>> {
  const query = new URLSearchParams();
  query.append("postId", postId);
  if (nextCursor) query.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<ForumCommentResponse>>(
    `/api/v1/forum/comments?${query.toString()}`,
  );
}

export async function getForumCommentReplies(
  parentCommentId: string,
  nextCursor?: string,
): Promise<CustomPaging<ForumCommentResponse>> {
  const query = new URLSearchParams();
  query.append("parentCommentId", parentCommentId);
  if (nextCursor) query.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<ForumCommentResponse>>(
    `/api/v1/forum/comments/replies?${query.toString()}`,
  );
}

export async function createForumComment(
  comment: ForumCommentRequest,
): Promise<ForumCommentResponse> {
  return apiPost<ForumCommentResponse>("/api/v1/forum/comments", comment);
}

export async function deleteForumComment(commentId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/forum/comments?commentId=${commentId}`);
}

export function useCreateForumPostMutation(
  options?: UseMutationOptions<PostResponse, Error, PostRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForumPost,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateForumPostMutation(
  options?: UseMutationOptions<PostResponse, Error, PostRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateForumPost,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteForumPostMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteForumPost,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useForumPostByIdQuery(
  postId: string,
  options?: Omit<UseQueryOptions<PostResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["forum", "post", postId],
    queryFn: () => getForumPostById(postId),
    enabled: !!postId,
    ...options,
  });
}

export function useForumFeedQuery(
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<PostResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "feed", nextCursor],
    queryFn: () => getForumFeed(nextCursor),
    ...options,
  });
}

export function useForumFeedInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<PostResponse>,
      Error,
      InfiniteData<CustomPaging<PostResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "feed-infinite"],
    queryFn: ({ pageParam }) => getForumFeed(pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function usePostedPostsInfiniteQuery(
  status: PostStatus,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<PostResponse>,
      Error,
      InfiniteData<CustomPaging<PostResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "posted-infinite", status],
    queryFn: ({ pageParam }) => getPostedPosts(status, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useSearchForumPostsQuery(
  keyword: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<PostResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "search", { keyword, nextCursor }],
    queryFn: () => searchForumPosts(keyword, nextCursor),
    enabled: !!keyword,
    ...options,
  });
}

export function useSearchForumPostsInfiniteQuery(
  keyword: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<PostResponse>,
      Error,
      InfiniteData<CustomPaging<PostResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "search-infinite", keyword],
    queryFn: ({ pageParam }) =>
      searchForumPosts(keyword, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!keyword,
    ...options,
  });
}

export function useRelatedPostsQuery(
  postId: string,
  options?: Omit<
    UseQueryOptions<PostResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "post", postId, "related"],
    queryFn: () => getRelatedPosts(postId),
    enabled: !!postId,
    ...options,
  });
}

export function usePostVersionsQuery(
  status: string,
  lastCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<PostResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "versions", { status, lastCursor }],
    queryFn: () => getPostVersions(status, lastCursor),
    ...options,
  });
}

export function usePostVersionsInfiniteQuery(
  status: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<PostResponse>,
      Error,
      InfiniteData<CustomPaging<PostResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "versions-infinite", status],
    queryFn: ({ pageParam }) => getPostVersions(status, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function usePostVersionsByPostIdQuery(
  postId: string,
  status?: string,
  options?: Omit<
    UseQueryOptions<PostResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "post-versions", postId, status],
    queryFn: () => getPostVersionsByPostId(postId, status),
    enabled: !!postId,
    ...options,
  });
}

export function useUpdatePostVersionMutation(
  options?: UseMutationOptions<
    UpdatedPostResponse,
    Error,
    PostVersionUpdateRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePostVersion,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeletePostVersionMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePostVersion,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSavedPostsQuery(
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<SavedPostResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "saved", nextCursor],
    queryFn: () => getSavedPosts(nextCursor),
    ...options,
  });
}

export function useSavedPostsInfiniteQuery(
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<SavedPostResponse>,
      Error,
      InfiniteData<CustomPaging<SavedPostResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "saved-infinite"],
    queryFn: ({ pageParam }) => getSavedPosts(pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    ...options,
  });
}

export function useSavePostMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePost,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUnsavePostMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsavePost,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useForumCommentsQuery(
  postId: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<ForumCommentResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "comments", postId, nextCursor],
    queryFn: () => getForumComments(postId, nextCursor),
    enabled: !!postId,
    ...options,
  });
}

export function useForumCommentsInfiniteQuery(
  postId: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<ForumCommentResponse>,
      Error,
      InfiniteData<CustomPaging<ForumCommentResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "comments-infinite", postId],
    queryFn: ({ pageParam }) =>
      getForumComments(postId, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!postId,
    ...options,
  });
}

export function useForumCommentRepliesQuery(
  parentCommentId: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<ForumCommentResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["forum", "replies", parentCommentId, nextCursor],
    queryFn: () => getForumCommentReplies(parentCommentId, nextCursor),
    enabled: !!parentCommentId,
    ...options,
  });
}

export function useForumCommentRepliesInfiniteQuery(
  parentCommentId: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<ForumCommentResponse>,
      Error,
      InfiniteData<CustomPaging<ForumCommentResponse>, string | null>,
      readonly unknown[],
      string | null
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["forum", "replies-infinite", parentCommentId],
    queryFn: ({ pageParam }) =>
      getForumCommentReplies(parentCommentId, pageParam || undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!parentCommentId,
    ...options,
  });
}

export function useCreateForumCommentMutation(
  options?: UseMutationOptions<
    ForumCommentResponse,
    Error,
    ForumCommentRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForumComment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteForumCommentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteForumComment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["forum"] });
      options?.onSuccess?.(...args);
    },
  });
}
