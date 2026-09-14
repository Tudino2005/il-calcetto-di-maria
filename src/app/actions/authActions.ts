"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "calcetto2026";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return { success: true };
  } else {
    return { error: "Password errata" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}
