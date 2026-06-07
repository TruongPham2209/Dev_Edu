import type { RoleEnum } from "../type/enum";

export const PUBLIC_ROUTE_PREFIXES = [
  "/home",
  "/course",
  "/courses",
  "/forum",
  "/posts",
];

export const GUEST_ONLY_ROUTES = ["/login", "/register"];

export interface RouteRule {
  prefix: string;
  allowedRoles?: RoleEnum[];
}

export const PROTECTED_ROUTES: RouteRule[] = [
  { prefix: "/admin", allowedRoles: ["ADMIN"] },
  { prefix: "/lecturer", allowedRoles: ["LECTURER"] },
  { prefix: "/cart", allowedRoles: ["STUDENT"] },
  { prefix: "/checkout", allowedRoles: ["STUDENT"] },
  { prefix: "/profile", allowedRoles: undefined }, // any authenticated user
];

export interface RouteAccess {
  isPublic: boolean;
  isGuestOnly: boolean;
  requiresAuth: boolean;
  allowedRoles?: RoleEnum[];
}

/**
 * Checks if the requested pathname matches any public prefixes.
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

/**
 * Checks if the requested pathname is a guest-only route.
 */
export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Resolves the access requirements for a given pathname.
 */
export function getRouteAccess(pathname: string): RouteAccess {
  if (isGuestOnlyRoute(pathname)) {
    return {
      isPublic: false,
      isGuestOnly: true,
      requiresAuth: false,
    };
  }

  if (isPublicRoute(pathname)) {
    return {
      isPublic: true,
      isGuestOnly: false,
      requiresAuth: false,
    };
  }

  // Find matching protected route rule
  const matchedRule = PROTECTED_ROUTES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(rule.prefix + "/")
  );

  if (matchedRule) {
    return {
      isPublic: false,
      isGuestOnly: false,
      requiresAuth: true,
      allowedRoles: matchedRule.allowedRoles,
    };
  }

  // Default fallback for unmatched routes: treat as public to avoid breaking undocumented pages
  return {
    isPublic: true,
    isGuestOnly: false,
    requiresAuth: false,
  };
}
