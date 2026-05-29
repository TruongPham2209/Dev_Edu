import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type {
  PostResponse,
  PostRequest,
  SavedPostResponse,
  PostVersionUpdateRequest,
  ForumCommentResponse,
  ForumCommentRequest,
  CustomPaging,
  UpdatedPostResponse,
} from "./types";

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
