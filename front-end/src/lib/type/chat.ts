export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessageRequest {
  conversationId?: string | null;
  message: string;
  history?: HistoryItem[];
}

export interface CourseCardResponse {
  courseId: string;
  title: string;
  shortDescription: string;
  price: number;
  thumbnailUrl: string;
  matchReason: string;
}

export interface ChatMessageResponse {
  conversationId: string | null;
  reply: {
    role: "assistant";
    content: string;
  };
  courses: CourseCardResponse[];
}

export interface ChatConversationSummary {
  id: string;
  lastMessagePreview: string;
  updatedAt: string;
}

export interface ChatMessageDetail {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedCourseIds?: string[];
  courses: CourseCardResponse[];
  createdAt: string;
}
