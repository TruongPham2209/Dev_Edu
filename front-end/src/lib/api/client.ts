const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9020";

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
  eyJraWQiOiJlYzlkMTIwOS02NWM0LTQ2NTItODM4NC0yMDM4ZTBiNzkzZjUiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYl9jbGllbnQiLCJuYmYiOjE3ODAxMzIxODgsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiXSwicm9sZXMiOlsiQURNSU4iXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDIwIiwiZXhwIjoxNzgwMTY4MTg4LCJ0b2tlbl90eXBlIjoiYWNjZXNzIHRva2VuIiwiaWF0IjoxNzgwMTMyMTg4LCJqdGkiOiJjMjNkNzYxZS03Yjk2LTQ4NzItOWNhYS1kZWNmMjRiODgzNzAifQ.WdWNnLeOEqkT9kRuLDwciyIAmWqIuP3W6M0VBJ8WzsdfdbUpgvrB0ikggbVaucm86GJ9PzfNE0FQh5auPfHX3KDZUXtoKLGdXg3s_vYhj18ow-JaOXICiZEVGMvPOdaYqclv0XaIIqhhuV07ldCL3qYtKi2rNgPwc0PQj4tv5ZSTinSkKDzsSMODy1q6U5VOQJrTjhirIdqdfqumo78aVvQsHI7fz3SyLfJJfxG-vx7yA9up-e8hswigbA8bz6Tc7ibDKkqzcmm9mwREDzR5tx1mzgWn-WLgUoN_bjjj3WI8KnBKAtPxGOQwZLtd_aKHaFoJrvleW9-doVmLd6E5So9a86UUq-a8FrQnsNXJcSlogV6N5KfF8VFDtHzQnmsRClWkmMoob8KMu2Vn52QfFfxJOwr8sSpxSREj0sTZe9R2ev68VuYk6q7OLqN6lffZ4o-3h2YynAYpRvXdSGA39KtJ5Uj_ChjmPWmhNz9m_wOMBayhsDBZRaoccYQt8NNQ
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
