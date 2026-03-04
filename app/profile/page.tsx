import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Mail, User2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "My Profile | CentralCore EMR Dashboard",
  description: "Manage your account details, profile information, and user role.",
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  const avatar = profile?.avatar_url || "/default-avatar.png";
  const fullName = profile?.full_name || "Not set";
  const role = profile?.role || "User";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-8 bg-white shadow-lg rounded-2xl border border-teal-100 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teal-600 shadow-md">
          <Image src={avatar} alt="Profile Avatar" fill className="object-cover" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-teal-900">{fullName}</h1>
          <p className="text-gray-600 text-lg">{user.email}</p>
        </div>
      </div>

      <hr className="border-teal-200" />

      {/* DETAILS */}
      <div className="space-y-6">

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Mail className="w-6 h-6 text-teal-700" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-gray-800">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <User2 className="w-6 h-6 text-teal-700" />
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-semibold text-gray-800">{fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <ShieldCheck className="w-6 h-6 text-teal-700" />
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-semibold text-gray-800 capitalize">{role}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
