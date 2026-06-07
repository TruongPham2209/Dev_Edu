import { AuthError, OAuthTokenResponse } from "../type/api";

export async function loginWithPasswordGrant(
  username: string,
  password: string,
): Promise<OAuthTokenResponse> {
  const baseUrl = process.env.AUTH_BASE_URL;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const scope = process.env.OAUTH_SCOPE;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new AuthError(
      "missing_config",
      "Missing OAuth environment configuration.",
    );
  }

  const url = new URL("/oauth2/token", baseUrl).toString();
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    scope: scope ?? "",
  });

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
      cache: "no-store",
    });
  } catch {
    throw new AuthError("network_error", "Network error.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  console.log("Body: ", body.toString());

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new AuthError("invalid_credentials", "Invalid credentials.");
    }
    throw new AuthError("server_error", "OAuth server error.");
  }

  if (!payload || typeof payload !== "object") {
    throw new AuthError("invalid_response", "Unexpected response payload.");
  }

  const tokenResponse = payload as OAuthTokenResponse;

  if (!tokenResponse.access_token) {
    throw new AuthError("invalid_response", "Missing access token.");
  }

  return tokenResponse;
}
