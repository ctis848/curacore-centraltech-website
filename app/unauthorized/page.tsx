export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-red-600">
          You are not authorized to access this page.
        </h1>
        <p className="text-slate-600 text-sm">
          Please contact the administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
