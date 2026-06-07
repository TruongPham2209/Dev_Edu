import type { RoleEnum } from "../type/enum";

export interface JwtPayload {
  sub?: string;
  roles?: RoleEnum[];
  exp?: number;
  [key: string]: any;
}

/**
 * Decodes a JWT token payload without validating the signature.
 * Compatible with Browser, Node.js, and Edge Runtime (Next.js middleware).
 */
export function decodeJwt(token: string): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Convert base64url to base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    
    let raw = "";
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      raw = window.atob(base64);
    } else if (typeof atob === "function") {
      raw = atob(base64);
    } else {
      raw = Buffer.from(base64, "base64").toString("binary");
    }
    
    // Decode percent-encoded multi-byte characters
    const jsonPayload = decodeURIComponent(
      raw
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (e) {
    console.error("Failed to decode JWT token:", e);
    return null;
  }
}
