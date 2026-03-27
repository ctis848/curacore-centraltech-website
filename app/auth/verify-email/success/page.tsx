import AuthCard from "@/components/auth/AuthCard";

export default function VerifyEmailSuccessPage() {
  return (
    <AuthCard title="Email Verified">
      <div className="text-center animate-fade-in">
        <h2 className="text-xl font-semibold text-teal-700 mb-2">
          Your email has been verified!
        </h2>
        <p className="text-gray-700 mb-4">
          You can now log in to your account.
        </p>

        <a
          href="/auth/login"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Go to Login
        </a>
      </div>
    </AuthCard>
  );
}
