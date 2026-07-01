"use server";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";

export type AuthState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await authService.register(formData);
  if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await authService.login(formData);
  if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await authService.logout();
  redirect("/entrar");
}