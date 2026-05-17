"use server";

import { clearAuthCookies } from "@/lib/auth/cookies";

export async function logoutAction() {
  await clearAuthCookies();
  return { success: true };
}
