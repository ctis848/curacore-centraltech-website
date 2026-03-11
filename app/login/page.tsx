import { redirectIfLoggedIn } from "@/lib/auth/redirectIfLoggedIn";
import LoginPageClient from "./LoginPageClient";

export default async function Page() {
  await redirectIfLoggedIn();
  return <LoginPageClient />;
}
