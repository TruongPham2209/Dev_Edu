import { ApiError, ApiResponse } from "../type/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9020";

async function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
  } catch {
    return null;
  }
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = await getAuthToken();

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
