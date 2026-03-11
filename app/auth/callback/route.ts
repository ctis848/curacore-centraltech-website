import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect("/auth/login");
  }

  let role = user.user_metadata.role;

  // Assign default role if missing
  if (!role) {
    await supabase.auth.updateUser({
      data: { role: "client" },
    });
    role = "client";
  }

  // Redirect based on role
  if (role === "admin") {
    return NextResponse.redirect("/admin");
  }

  return NextResponse.redirect("/dashboard");
}
