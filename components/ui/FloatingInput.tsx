"use client";

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: any) => void;
  error?: string;
}

export default function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  error,
}: FloatingInputProps) {
  return (
    <div className="relative mt-4">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`peer w-full border px-3 py-3 rounded-lg bg-white outline-none transition-all
          ${error ? "border-red-500" : "border-gray-300"}
        `}
        placeholder=" "
      />

      <label
        className={`absolute left-3 top-3 text-gray-500 transition-all pointer-events-none
          peer-placeholder-shown:top-3
          peer-placeholder-shown:text-base
          peer-focus:-top-2
          peer-focus:text-sm
          peer-focus:text-emerald-600
          ${value ? "-top-2 text-sm text-emerald-600" : ""}
        `}
      >
        {label}
      </label>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
