"use client";

import { useEffect } from "react";
import {
  getAuthToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
} from "@/lib/auth-storage";
import { useMeQuery } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { decodeJwt } from "@/lib/auth/jwt";
import { getPrimaryRole } from "@/lib/auth/constants";

interface AuthSyncProps {
  serverToken: string | null;
}

export function AuthSync({ serverToken }: AuthSyncProps) {
  const { refetch: fetchMe } = useMeQuery({ enabled: false });
  const { handleError } = useApiWithToast();

  useEffect(() => {
    async function sync() {
      try {
        const token = serverToken;

        if (token) {
          const localToken = getAuthToken();
          const localUser = getStoredUser();

          if (localToken !== token || !localUser) {
            localStorage.setItem("auth_token", token);

            const meResult = await fetchMe();
            if (!meResult.data) throw new Error("No user data");
            const me = meResult.data;
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
        handleError(err, "Failed to sync profile");
      }
    }

    sync();
  }, [serverToken, fetchMe, handleError]);

  return null;
}
