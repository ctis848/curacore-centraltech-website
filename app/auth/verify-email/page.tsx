export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">
          Check your email
        </h1>
        <p className="text-gray-600">
          We sent you a verification link. Click it to activate your account.
        </p>
      </div>
    </div>
  );
}
