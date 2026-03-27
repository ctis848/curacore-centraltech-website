import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams?.token;

  if (token) {
    redirect(`/api/auth/verify-email?token=${token}`);
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Invalid or missing verification token</h1>
      <p className="text-gray-600 mt-2">
        The verification link may have expired or is incorrect.
      </p>
    </div>
  );
}
