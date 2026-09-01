// --- File ---

export type FilePreSignUploadRequest = {
  fileName: string;
  contentType: string;
  fileSize: number;
  isPublic?: boolean;
};

export type FileUploadResponse = {
  originalFileName: string;
  contentType: string;
  fileSize?: number;
  uploadUrl?: string;
  objectKey: string;
  publicUrl?: string | null;
  downloadUrl?: string | null;
};

// --- Chunked / Multipart Upload ---

export type ChunkUploadInitRequest = {
  fileName: string;
  contentType: string;
  fileSize: number;
  isPublic?: boolean;
};

export type ChunkUploadInitResponse = {
  sessionId: string;
  chunkSize: number;
  totalParts: number;
  windowSize: number;
  concurrency: number;
  objectKey: string;
  publicUrl: string | null;
};

export type ChunkPresignRequest = {
  fromPart: number;
  partCount?: number;
};

export type ChunkPresignPart = {
  partNumber: number;
  presignedUrl: string;
  expiresAt: string;
};

export type ChunkPresignResponse = {
  sessionId: string;
  parts: ChunkPresignPart[];
};

export type ChunkCompletedPart = {
  partNumber: number;
  eTag: string;
};

export type ChunkCompleteRequest = {
  parts: ChunkCompletedPart[];
};

export type ChunkStatusResponse = {
  sessionId: string;
  objectKey: string;
  status: string;
  totalParts: number;
  fileSize: number;
  chunkSize: number;
  uploadedParts: number[];
};
