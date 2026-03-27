import { createServerDbClient } from "../supabase/server";

export async function getUserAndRole() {
  const { db, token } = await createServerDbClient();

  // Load session + user
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return { user: null, role: null };
  }

  return {
    user: session.user,
    role: session.user.role,
  };
}
