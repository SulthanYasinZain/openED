import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";
import LoginForm from "./login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return <LoginForm />;
}
