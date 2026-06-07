import LoginForm from "@/app/login/login-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const store = await cookies();
  const accessToken = store.get("access_token")?.value;

  if (accessToken) {
    redirect("/home");
  }

  return <LoginForm />;
}
