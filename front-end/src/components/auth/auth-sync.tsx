"use client";

import { useEffect } from "react";
import {
  getAuthToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
} from "@/lib/auth-storage";
import { getMe } from "@/lib/api/users";
import { decodeJwt } from "@/lib/auth/jwt";
import { getPrimaryRole } from "@/lib/auth/constants";

interface AuthSyncProps {
  serverToken: string | null;
}

export function AuthSync({ serverToken }: AuthSyncProps) {
  useEffect(() => {
    async function sync() {
      try {
        const token = serverToken;

        if (token) {
          const localToken = getAuthToken();
          const localUser = getStoredUser();

          if (localToken !== token || !localUser) {
            // Token mismatch or not set in localStorage, let's sync it!
            localStorage.setItem("auth_token", token);

            // Fetch profile and store in auth session
            const me = await getMe();
             const decoded = decodeJwt(token);
             const roles = decoded?.roles || [me.role as any];
             const primaryRole = getPrimaryRole(roles);

             setAuthSession(token, {
               id: me.id || "",
               username: me.username || "User",
               fullName: me.fullName || me.username || "User",
               role: primaryRole,
               roles: roles,
               email: me.email || "",
               avatarUrl: me.avatarUrl,
             });
          }
        } else {
          // No token in cookies, clear localStorage too if present
          if (getAuthToken()) {
            clearAuthSession();
          }
        }
      } catch (err) {
        console.error("Failed to sync profile in AuthSync:", err);
      }
    }

    sync();
  }, [serverToken]);

  return null;
}
