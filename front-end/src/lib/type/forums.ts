// --- Forum Post ---

import { PostStatus } from "./enum";

export type PostResponse = {
  id: string;
  title: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatarUrl: string | null;
  thumbUrl: string | null;
  shortDescription: string;
  content: string;
  views: number;
  status?: PostStatus;
  comments: number;
  createdAt: string;
  updatedAt: string;
};

export type PostRequest = {
  postId?: string | null;
  thumbObjectKey: string;
  title: string;
  shortDescription: string;
  content: string;
};

export type SavedPostResponse = {
  id: string;
  postId: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatarUrl: string | null;
  thumbUrl: string | null;
  title: string;
  shortDescription: string;
  savedAt: string;
};

export type UpdatedPostResponse = {
  affectedVersionIds: string[];
  newStatus: PostStatus;
  currentVersionId: string;
};

// --- Post Version ---

export type PostVersionUpdateRequest = {
  postVersionId: string;
  postStatus: PostStatus;
};

// --- Forum Comment ---

export type ForumCommentResponse = {
  id: string;
  author: string;
  content: string | null;
  replyCount: number;
  repliedToCommentId: string | null;
  createdAt: string;
  isDeleted: boolean;
  isMine: boolean;
};

export type ForumCommentRequest = {
  postId: string;
  content: string;
  repliedToCommentId?: string;
};
