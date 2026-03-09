"use server";

import { cookies } from "next/headers";

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("sb-access-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("sb-refresh-token", "", { maxAge: 0, path: "/" });
}
