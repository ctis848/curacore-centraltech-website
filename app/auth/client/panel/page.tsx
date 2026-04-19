import { redirect } from "next/navigation";

export default function OldClientPanelRedirect() {
  redirect("/client/dashboard");
}
