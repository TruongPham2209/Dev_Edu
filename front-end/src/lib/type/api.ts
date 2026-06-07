// --- Custom paging ---

export type CustomPaging<T> = {
  contents: T[];
  totalPages: number;
  pageSize: number;
  totalElements: number;
  currentPage: number;
  nextCursor?: string | null;
};

// --- API response ---

export type ApiResponse<T> = {
  success: boolean;
  status: string;
  message: string;
  data: T;
  timestamp: number;
};

export type ApiErrorStatus =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "METHOD_NOT_ALLOWED"
  | "REQUEST_TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class ApiError extends Error {
  constructor(
    public status: ApiErrorStatus | string,
    public serverMessage: string,
    public responseData: unknown,
  ) {
    super(serverMessage);
    this.name = "ApiError";
  }
}

// --- OAuth ---

export type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  refresh_token_expires_in?: number;
  token_type?: string;
  scope?: string;
};

export type AuthFailureReason =
  | "invalid_credentials"
  | "missing_config"
  | "network_error"
  | "server_error"
  | "invalid_response";

export class AuthError extends Error {
  constructor(
    public reason: AuthFailureReason,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
