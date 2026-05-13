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
    const company_name = form.get("company_name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    // 1️⃣ Create user
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setMessage(signupError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Login immediately
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setMessage("Signup succeeded but login failed.");
      setLoading(false);
      return;
    }

    const user = loginData?.user;

    // ⭐ LAYER 1 — LOOKUP COMPANY BY NAME
    let company = null;

    if (company_name && user) {
      const { data, error: lookupError } = await supabase
        .from("companies")
        .select("*")
        .ilike("name", company_name.trim())
        .single();

      company = data;

      console.log("COMPANY LOOKUP RESULT:", data);
      console.log("LOOKUP ERROR:", lookupError);
    }

    // ⭐ LAYER 2 — ATTACH USER TO EXISTING COMPANY
    if (company && user) {
      const { error: attachError } = await supabase
        .from("user_companies")
        .insert({
          user_id: user.id,
          company_id: company.id,
        });

      console.log("ATTACH EXISTING COMPANY ERROR:", attachError);
    }

    // ⭐ LAYER 3 — CREATE NEW COMPANY + ATTACH USER
    if (!company && user && company_name) {
      const { data: newCompany, error: insertError } = await supabase
        .from("companies")
        .insert({
          name: company_name.trim(),
        })
        .select()
        .single();

      console.log("NEW COMPANY CREATED:", newCompany);
      console.log("INSERT ERROR:", insertError);

      if (newCompany) {
        await supabase.from("user_companies").insert({
          user_id: user.id,
          company_id: newCompany.id,
        });
      }
    }

    // 3️⃣ Redirect
    router.push("/client/dashboard");
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
            <p className="text-center text-sm text-red-600 dark:text-red-400 mb-3">
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
        </form>
      </div>
    </div>
  );
}
