import { ApiError, ApiResponse } from "../type/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9020";

/**
 * Standard API response envelope.
 * IMPORTANT: The backend returns HTTP 200 even on errors.
 * Always check `success` and `status` fields.
 */

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
  eyJraWQiOiJkNDc0ZDIzZS02OGMwLTQxZDMtOWRmOS04YThlMWE2MzFhZTAiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzdHVkZW50IiwiYXVkIjoid2ViX2NsaWVudCIsIm5iZiI6MTc4MDc2MTczNywic2NvcGUiOlsicHJvZmlsZSIsIm9wZW5pZCJdLCJyb2xlcyI6WyJTVFVERU5UIl0sImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6OTAyMCIsImV4cCI6MTc4MDc5NzczNywidG9rZW5fdHlwZSI6ImFjY2VzcyB0b2tlbiIsImlhdCI6MTc4MDc2MTczNywianRpIjoiMjNjMjA1MjQtMmNkNS00OWQ2LTg5NDAtMTg0NDI3M2U4Njk4In0.Ts8y2IA0J4eTLUyQdnGCBUZsH8tjXpcBrRF-S9V2ERMg6C-ysMhUXevGC75xDWs4cgVFeqSWO18UTMpCZEzGIKpN7mXGHbkwfY-_OJKm9Pmbx84ZpoMiQ7tT-uysow6Tr6TFopBzmMnY7HuADaKQYrTz4ZNLsvOF3XunrTkueltIwo1jAJJmE7HB7U9XLcS2n2H7tKBNsJAH-QdTQ95cMfhO126bTftWS4wZKOKV2LDVcDpiqJKn57cxA8b0U9dQ8w_N58kzIH-yUe9kZ6GNEK7DR75vjjxw5fZVtc1mzQKeLOJMVawTdFs29cW4ckwSruwfK40Pqqwwu64wA1JKxFN_J16Mtu4R5oTiwjqpGjHCyqvdLVujNwSBGfz5Skq1RMK7xlb7HTIuRzPLjJfE3ClH_b0GuGkO0O_aTaNFn90ruNJEdwFcZ_voEjXAPo0rG5C7XqzmvPrJDkb4haLlfyGFYOFqN-2HalODdJenG4px79-sa8fBnGJ2FDbr4aH1
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
