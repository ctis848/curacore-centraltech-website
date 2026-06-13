"use client";

interface Props {
  password: string;
}

export default function PasswordRules({ password }: Props) {
  const rules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains uppercase letter (A–Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter (a–z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Contains a number (0–9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: "Contains a special character (!@#$%^&*)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="mt-3 space-y-1">
      {rules.map((rule, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className={`font-bold ${
              rule.valid ? "text-green-600" : "text-red-600"
            }`}
          >
            {rule.valid ? "✔" : "✖"}
          </span>
          <span
            className={`${
              rule.valid ? "text-green-700" : "text-red-700"
            }`}
          >
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
