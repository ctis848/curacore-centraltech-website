import { redirect } from "next/navigation";
import { createServerDbClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const { db, token } = await createServerDbClient();

  // Load session + user
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow rounded-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <p>
        <span className="font-semibold">Email:</span> {user.email}
      </p>

      <p>
        <span className="font-semibold">Name:</span> {user.name ?? "—"}
      </p>

      <p>
        <span className="font-semibold">Role:</span> {user.role}
      </p>
    </div>
  );
}
