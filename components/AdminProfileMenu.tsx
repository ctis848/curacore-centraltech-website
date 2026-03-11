"use client";

import { useState } from "react";

export default function AdminProfileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${user.email}`}
          className="w-8 h-8 rounded-full"
        />
        <span>{user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 space-y-2 w-48">
          <a href="/admin/profile" className="block hover:text-teal-500">
            Profile
          </a>
          <form action="/auth/logout" method="post">
            <button className="text-red-600 hover:text-red-700">Logout</button>
          </form>
        </div>
      )}
    </div>
  );
}
