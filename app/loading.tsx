export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="h-4 w-52 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}
