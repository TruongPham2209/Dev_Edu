"use server";

import { setAuthCookies } from "@/lib/auth/cookies";
import { loginWithPasswordGrant } from "@/lib/auth/login";
import { AuthError } from "@/lib/type/api";

export type LoginActionState = {
  error: string | null;
  fieldErrors?: {
    username?: string;
    password?: string;
  };
  success?: boolean;
  username?: string;
  token?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginActionState["fieldErrors"] = {};

  if (!username) {
    fieldErrors.username = "Please enter your email.";
  }

  if (!password) {
    fieldErrors.password = "Please enter your password.";
  }

  if (fieldErrors.username || fieldErrors.password) {
    return { error: null, fieldErrors };
  }

  try {
    const tokens = await loginWithPasswordGrant(username, password);
    await setAuthCookies(tokens);
    return { error: null, success: true, username, token: tokens.access_token };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.reason === "invalid_credentials") {
        return {
          error: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
        };
      }
      if (error.reason === "missing_config") {
        return {
          error: "Hệ thống đăng nhập chưa được cấu hình. Vui lòng thử lại sau.",
        };
      }
    }

    return {
      error: "Không thể đăng nhập. Vui lòng thử lại.",
    };
  }
}
