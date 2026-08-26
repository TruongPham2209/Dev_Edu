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
import type { RoleEnum } from "@/lib/type/enum";
import {
  requestAndRegisterPushNotification,
  listenForegroundNotifications,
} from "@/lib/push-notification";
import { useToast } from "@/lib/toast-context";

interface AuthSyncProps {
  serverToken: string | null;
}

export function AuthSync({ serverToken }: AuthSyncProps) {
  const { refetch: fetchMe } = useMeQuery({ enabled: false });
  const { handleError } = useApiWithToast();
  const toast = useToast();

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
            const roles = decoded?.roles || (me.role ? [me.role as RoleEnum] : []);
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

          // Register FCM push notification token when authenticated
          requestAndRegisterPushNotification();
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

  useEffect(() => {
    if (!serverToken) return;

    let unsubscribe: (() => void) | undefined;
    listenForegroundNotifications((payload) => {
      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;
      const message = title
        ? `${title}${body ? `: ${body}` : ""}`
        : body || "New notification received";
      toast.info(message);
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [serverToken, toast]);

  return null;
}
