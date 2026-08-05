"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveAdminPackageCategory,
  archiveAdminMenuItem,
  archiveAdminPackage,
  clearAdminSession,
  saveAdminMenuItem,
  saveAdminPackage,
  saveAdminPackageCategory,
  signInAdmin,
  updateAdminOrderStatus,
} from "@/lib/admin";

export type LoginActionState = { error?: string };

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.";
}

function safeAdminPath(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" && value.startsWith("/admin") ? value : fallback;
}

export async function loginAction(
  _previous: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeAdminPath(formData.get("next"), "/admin");

  try {
    await signInAdmin(email, password);
  } catch (error) {
    return { error: messageFrom(error) };
  }

  redirect(next);
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveMenuAction(formData: FormData) {
  try {
    await saveAdminMenuItem(formData);
  } catch (error) {
    redirect(`/admin/menu?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  redirect("/admin/menu?message=Menu%20disimpan");
}

export async function archiveMenuAction(formData: FormData) {
  try {
    await archiveAdminMenuItem(String(formData.get("id") ?? ""));
  } catch (error) {
    redirect(`/admin/menu?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  redirect("/admin/menu?message=Menu%20diarsipkan");
}

export async function savePackageCategoryAction(formData: FormData) {
  try {
    await saveAdminPackageCategory(formData);
  } catch (error) {
    redirect(`/admin/paket?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/paket");
  redirect("/admin/paket?message=Kategori%20disimpan");
}

export async function archivePackageCategoryAction(formData: FormData) {
  try {
    await archiveAdminPackageCategory(String(formData.get("id") ?? ""));
  } catch (error) {
    redirect(`/admin/paket?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/paket");
  redirect("/admin/paket?message=Kategori%20diarsipkan");
}

export async function savePackageAction(formData: FormData) {
  try {
    await saveAdminPackage(formData);
  } catch (error) {
    redirect(`/admin/paket?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/paket");
  redirect("/admin/paket?message=Paket%20disimpan");
}

export async function archivePackageAction(formData: FormData) {
  try {
    await archiveAdminPackage(String(formData.get("id") ?? ""));
  } catch (error) {
    redirect(`/admin/paket?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/paket");
  redirect("/admin/paket?message=Paket%20diarsipkan");
}

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    await updateAdminOrderStatus(id, String(formData.get("status") ?? ""));
  } catch (error) {
    redirect(`/admin/pesanan/${id}?error=${encodeURIComponent(messageFrom(error))}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${id}`);
  redirect(`/admin/pesanan/${id}?message=Status%20pesanan%20diperbarui`);
}
