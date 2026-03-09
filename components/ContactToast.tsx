// PATH: /components/ContactToast.tsx

"use client";

export function ContactToast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}
