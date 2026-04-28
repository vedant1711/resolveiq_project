import type { User } from "@/types";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("resolve_iq_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem("resolve_iq_token", user.token);
  localStorage.setItem("resolve_iq_user", JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem("resolve_iq_token");
  localStorage.removeItem("resolve_iq_user");
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("resolve_iq_token");
}
