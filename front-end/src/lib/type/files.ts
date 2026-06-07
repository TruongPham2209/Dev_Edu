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
  publicUrl?: string;
  downloadUrl?: string;
};
