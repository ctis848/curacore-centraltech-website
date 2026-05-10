import { useEffect, useState } from "react";

interface ToastProps {
  title: string;
  description?: string;
  onClose: () => void;
}

export function Toast({ title, description, onClose }: ToastProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(onClose, 250);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 top-4 bg-white shadow-lg rounded-md p-4 border flex items-start gap-3
      ${closing ? "toast-slide-out" : "toast-slide-in"}`}
    >
      <div className="success-icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}
