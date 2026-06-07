"use client";

import { clearAuthSession } from "@/lib/auth-storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
