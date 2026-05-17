const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Standard API response envelope.
 * IMPORTANT: The backend returns HTTP 200 even on errors.
 * Always check `success` and `status` fields.
 */
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

async function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

/**
 * Core API call. Parses the `ApiResponse` envelope and throws `ApiError`
 * when `success === false`, regardless of HTTP status code.
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  // const token = await getAuthToken();
  const token = `eyJraWQiOiJhZmRjYWI5NS1kODVhLTQwYzYtYTA1ZS02OTFkOGMwOTFiOWIiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJsZWN0dXJlciIsImF1ZCI6IndlYl9jbGllbnQiLCJuYmYiOjE3NzkwMDE1MDksInNjb3BlIjpbInByb2ZpbGUiLCJvcGVuaWQiXSwicm9sZXMiOlsiTEVDVFVSRVIiXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDIwIiwiZXhwIjoxNzc5MDA1MTA5LCJ0b2tlbl90eXBlIjoiYWNjZXNzIHRva2VuIiwiaWF0IjoxNzc5MDAxNTA5LCJqdGkiOiIzNTdiMmUxZS05ZDdkLTRjODItYTJjYi0xODQyZjNjMzMzNzUifQ.o2bk4UI2UvL9DF9F4bGE69chiau-kN1An8IUflqVoREY_Y_iOcW5ikYI8XKMK9ZLFHNvlnK7UzpKOIcc50fdwPwPZ0rRT2wWXebW8znOGeoql6H1vYNSdovnCNNOFXi5KHn8dvYs79cQ2h1FeNKWPQdOUpH8z8Neq7yMTTeMjIGRkfqjIwWA-BuL0YxbumYmXOPEJwiMIlT_0HzWjVy3w1ZDCWXf_SQbbkZBEp05hvtU14Kx2FtJ1lNdBikUjg66w93_yn32au8LRRA6lQ6-5sRK3CS-jHk4fYRjat6P4j95_HXvVl_HaPZNMG6R2DE2ra4fYs7_osJxvZ_gM5psFu-YtIBFjy4Bwg1D4ddS7kTrU4pYXD-aZ-VJPyCLtPTyUtsEGvOpTtJt7dfOCQo7a_ay8j74npSaNWWH3eeCeaR7p4NId14WVkdW01KWHBAT4VF4WQ4GgnieNQxjcXa5DtHQFCB6_u6DTg0tQisZEPOgQzuJ0M_ciQsrIVUaykIc`;

  const headers: Record<string, string> = {};

  // Only set Content-Type to JSON if not explicitly overridden
  // (e.g. form-urlencoded requests should not have JSON content type)
  if (!options.headers || !hasContentType(options.headers)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    for (const [key, value] of options.headers) {
      headers[key] = value;
    }
  } else if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Backend returns HTTP 200 even on error. Check the envelope.
  if (data && typeof data === "object" && "success" in data) {
    const envelope = data as ApiResponse<T>;
    if (!envelope.success) {
      throw new ApiError(envelope.status, envelope.message, envelope.data);
    }
    return envelope;
  }

  // Fallback: if response is not an ApiResponse envelope (e.g. OAuth endpoints)
  if (!response.ok) {
    throw new ApiError(
      "INTERNAL_SERVER_ERROR",
      data?.message || "API Error",
      data,
    );
  }

  return data as ApiResponse<T>;
}

function hasContentType(headers: HeadersInit): boolean {
  if (headers instanceof Headers) {
    return headers.has("Content-Type") || headers.has("content-type");
  }
  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === "content-type");
  }
  return Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
  );
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  console.log("[END POINT]", endpoint);
  const response = await apiCall<T>(endpoint, { method: "GET" });
  console.log("[RESPONSE]", response);
  return response.data;
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const response = await apiCall<T>(endpoint, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiCall<T>(endpoint, { method: "DELETE" });
  return response.data;
}
