"use client";

import { useEffect, useState } from "react";
import {
  getAuthToken,
  getStoredUser,
  type AuthRole,
  type AuthUser,
} from "./auth-storage";

export type AuthStatus = {
  isAuthenticated: boolean;
  role: AuthRole | null;
  roles: AuthRole[];
  user: AuthUser | null;
};

export function useAuth(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    role: null,
    roles: [],
    user: null,
  });

  useEffect(() => {
    const sync = () => {
      const token = getAuthToken();
      const user = getStoredUser();
      setStatus({
        isAuthenticated: Boolean(token),
        role: user?.role ?? null,
        roles: user?.roles ?? (user?.role ? [user.role] : []),
        user,
      });
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-updated", sync);
    };
  }, []);

  return status;
}
