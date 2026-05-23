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
  const token = `
  eyJraWQiOiIwZjM5ZmU0NC1kOTNjLTRlZjUtODg2NC01NGUwY2FkMTJhN2IiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYl9jbGllbnQiLCJuYmYiOjE3Nzk1MzU5OTYsInNjb3BlIjpbInByb2ZpbGUiLCJvcGVuaWQiXSwicm9sZXMiOlsiQURNSU4iXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDIwIiwiZXhwIjoxNzc5NTM5NTk2LCJ0b2tlbl90eXBlIjoiYWNjZXNzIHRva2VuIiwiaWF0IjoxNzc5NTM1OTk2LCJqdGkiOiJiNzE0NmNmZS1hNWE1LTQxMDktYTVjOS1hNjhiNzAyMDQ3OGEifQ.ma1AJ6ldbxz198_lWZRsrdZwgj3W8UsNkccJb7o_cvIxkOnWuj8qlDfuLwCh-QUa2omcnCBcFyPY-2V_1B2TLTiSAU9XgN-X43caJ8nLq5SUECh8Wxhhc5Ic3cpIBcoZWDklKAbvDMGgpQeKaBohitxLkP2s7nI-PUIQopcMVntDPx_lpIj8FQkFqRPF9cUZXjYnEKo79SpB8disApAdcYmO9UtFmqfR9Qz7CLMKzvxX-T9njH4J5PUFiSP4ScPxSDPh8sO7UFCuiHp_vUYx43b8cvUKUGZiWi6FuTwKS2sqOuIoY0Ddrmq74GeqoVOmcUaHGR7GJ9gONzoCEZVW4lDlF6FPnE3rNjOL3PhiaW_Qexq1C_h0HBCwXFbjIwuD1PF6EoqYnnEh5ooMM44EWfYjUt_iK9X1CnsyB3n-jk-jTxCMIZDWGjWgWvsutoGAvqpBw0xpbXvEhHR0kWG5gQdShGN2JYUJBDnuSG6VRPfKDwDt0FacmxxvLI9v7gX0
  `;

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
    headers.Authorization = `Bearer ${token.trim()}`;
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
  const response = await apiCall<T>(endpoint, { method: "GET" });
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
