"use client";

import { clearAuthSession } from "@/lib/auth-storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuthSession();

    async function performLogout() {
      try {
        await logoutAction();
      } catch (err) {
        console.error("Failed to perform server logout:", err);
      } finally {
        router.replace("/home");
        router.refresh();
      }
    }
    performLogout();
  }, [router]);

  return null;
}
