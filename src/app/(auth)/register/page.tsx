import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  return <RegisterForm />;
}
