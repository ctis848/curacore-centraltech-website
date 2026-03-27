import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function createServerDbClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  return {
    db,
    token,
  };
}
