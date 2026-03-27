export type UserRole = "client" | "admin" | "superadmin";

export const isAdmin = (role: string | null | undefined) =>
  role === "admin" || role === "superadmin";
