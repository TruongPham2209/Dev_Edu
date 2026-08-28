export type DocumentStatus = "PROCESSING" | "READY" | "FAILED" | "DELETED";

export type DocumentVisibility = "GLOBAL" | "COURSE" | "PRIVATE";

export type PromotionStatus = "PENDING" | "PROMOTED" | "REJECTED" | "FAILED";

export interface GlobalDocumentResponse {
  id: string;
  title?: string;
  fileName: string;
  fileObjectKey: string;
  fileSize: number;
  contentHash?: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  isPromoted: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentAuditResponse {
  id: string;
  uploadedBy: string;
  userRole: string;
  fileName: string;
  fileSize: number;
  contentHash?: string;
  quizId?: string;
  courseId?: string;
  generationJobId?: string;
  requestedSave: boolean;
  isPromoted: boolean;
  promotionStatus?: PromotionStatus;
  failureReason?: string | null;
  createdAt: string;
}

export interface UploadGlobalDocumentRequest {
  file: File;
  title?: string;
}