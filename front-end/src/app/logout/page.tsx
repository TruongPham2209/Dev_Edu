"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth-storage";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      await logoutAction();
      clearAuthSession();
      router.replace("/home");
      router.refresh();
    }
    performLogout();
  }, [router]);

  return null;
}
