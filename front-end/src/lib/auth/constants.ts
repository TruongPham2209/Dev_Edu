import type { RoleEnum } from "../type/enum";

export const ROLE_PRIORITY: RoleEnum[] = ["ADMIN", "LECTURER", "STUDENT"];

export const DEFAULT_ROLE_REDIRECTS: Record<RoleEnum, string> = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/home",
};

/**
 * Gets the primary (highest priority) role from an array of roles.
 * Priority order: ADMIN > LECTURER > STUDENT
 */
export function getPrimaryRole(roles: RoleEnum[]): RoleEnum {
  if (!roles || roles.length === 0) {
    return "STUDENT";
  }
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return "STUDENT";
}

/**
 * Gets the default redirect path for a list of roles based on their priority.
 */
export function getRedirectPathForRoles(roles: RoleEnum[]): string {
  const primaryRole = getPrimaryRole(roles);
  return DEFAULT_ROLE_REDIRECTS[primaryRole] ?? "/home";
}
