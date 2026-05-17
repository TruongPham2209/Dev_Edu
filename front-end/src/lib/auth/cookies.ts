import { cookies } from "next/headers";
import type { OAuthTokenResponse } from "./login";

const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

function toMaxAge(value?: number | string) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const numeric = typeof value === "string" ? Number(value) : value;

  if (!numeric || Number.isNaN(numeric)) {
    return undefined;
  }

  return numeric > 0 ? Math.floor(numeric) : undefined;
}

export async function setAuthCookies(tokens: OAuthTokenResponse) {
  const store = await cookies();
  const accessMaxAge = toMaxAge(tokens.expires_in);
  const refreshMaxAge = toMaxAge(
    tokens.refresh_expires_in ?? tokens.refresh_token_expires_in,
  );

  store.set("access_token", tokens.access_token, {
    ...DEFAULT_COOKIE_OPTIONS,
    ...(accessMaxAge ? { maxAge: accessMaxAge } : {}),
  });

  if (tokens.refresh_token) {
    store.set("refresh_token", tokens.refresh_token, {
      ...DEFAULT_COOKIE_OPTIONS,
      ...(refreshMaxAge ? { maxAge: refreshMaxAge } : {}),
    });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete("access_token");
  store.delete("refresh_token");
}
