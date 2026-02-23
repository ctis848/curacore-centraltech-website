// components/ChatButton.tsx
import Link from 'next/link';

export default function ChatButton() {
  return (
    <Link
      href="/online-chat"
      className="fixed bottom-8 right-8 z-50 group"
    >
      <div className="bg-yellow-400 text-teal-900 w-20 h-20 rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-white">
        <span className="text-4xl mb-1">💬</span>
        <span className="text-xs font-bold uppercase tracking-wider">Chat</span>
      </div>
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-teal-800 text-white px-6 py-3 rounded-full text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
        Live Support 24/7
      </div>
    </Link>
  );
}