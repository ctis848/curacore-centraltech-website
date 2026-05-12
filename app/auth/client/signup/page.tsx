"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(e.target);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    const company_name = form.get("company_name") as string;

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // 1️⃣ Create user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: company_name.trim(),
          full_name: company_name.trim(),
        },
      },
    });

    // Supabase returns an "error" even when signup succeeds (email confirmation required)
    if (signupError && signupError.message !== "User already registered") {
      setMessage("Signup successful! Please check your email to confirm your account.");
    }

    const user = signupData.user;
    if (!user) {
      setMessage("Signup successful! Please check your email to confirm your account.");
      setLoading(false);
      router.push("/auth/client/login");
      return;
    }

    // 2️⃣ Check if company exists
    let { data: company } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", company_name.trim())
      .single();

    // 3️⃣ If company does NOT exist → create it
    if (!company) {
      const { data: newCompany, error: createError } = await supabase
        .from("companies")
        .insert({
          name: company_name.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        setMessage("Failed to create company.");
        setLoading(false);
        return;
      }

      company = newCompany;
    }

    const companyId = company!.id;

    // 4️⃣ Update Profile with company_id
    const { error: profileError } = await supabase
      .from("Profile")
      .update({
        company_id: companyId,
        company: company_name.trim(),
        fullname: company_name.trim(),
      })
      .eq("userid", user.id);

    if (profileError) {
      setMessage("Failed to link company to profile.");
      setLoading(false);
      return;
    }

    // ⭐ Final message BEFORE redirect
    setMessage("Signup successful! Please check your email to confirm your account.");

    // ⭐ Instant redirect
    router.push("/auth/client/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleSignup}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6 text-center">
            Create Account
          </h1>

          <input
            name="company_name"
            type="text"
            placeholder="Company / Hospital Name"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          <input
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          {message && (
            <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Return Home
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/client/login")}
              className="text-teal-600 hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
