"use client";

export default function SearchBar() {
  return (
    <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl w-96">
      <input
        type="text"
        placeholder="Search licenses, invoices, machines..."
        className="bg-transparent w-full outline-none text-gray-700 dark:text-gray-200"
      />
    </div>
  );
}
