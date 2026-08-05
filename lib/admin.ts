import { cookies } from "next/headers";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "shanti_admin_session";

export const ORDER_STATUSES = [
  "baru",
  "dikonfirmasi",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MENU_TYPES = ["makanan", "minuman", "jajanan"] as const;
export type MenuType = (typeof MENU_TYPES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  baru: "Baru",
  dikonfirmasi: "Dikonfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

type StoredSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

export type AdminUser = {
  id: string;
  email: string;
};

export type AdminAccess =
  | { state: "setup" }
  | { state: "signed-out" }
  | { state: "forbidden" }
  | { state: "ready"; user: AdminUser };

export type AdminMenuItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  menu_type: MenuType;
  price_idr: number | null;
  tag: string | null;
  description: string | null;
  image_path: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type AdminPackageCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AdminPackage = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  summary: string | null;
  included_items: string[] | null;
  price_from_idr: number | null;
  price_unit: string | null;
  minimum_servings: number | null;
  image_path: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  package_categories?: { name: string; slug: string } | null;
};

export type AdminOrder = {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  selection_type: "menu" | "package" | "custom";
  selection_name: string;
  selection_price_idr: number | null;
  selection_price_unit: string | null;
  servings: number;
  event_date: string;
  delivery_address: string;
  notes: string | null;
  custom_request: string | null;
  status: OrderStatus;
  email_status: "pending" | "sent" | "failed" | "skipped";
  email_error: string | null;
  created_at: string;
};

export type AdminOverview = {
  ordersToday: number;
  openOrders: number;
  recentOrders: AdminOrder[];
};

function parseStoredSession(value?: string): StoredSession | null {
  if (!value) return null;

  try {
    const session = JSON.parse(value) as StoredSession;
    if (!session.access_token) return null;
    if (session.expires_at && session.expires_at * 1000 <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

async function readStoredSession(): Promise<StoredSession | null> {
  const store = await cookies();
  return parseStoredSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function setAdminSession(session: StoredSession) {
  const store = await cookies();
  const expires = session.expires_at
    ? new Date(session.expires_at * 1000)
    : new Date(Date.now() + 60 * 60 * 1000);

  store.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!hasSupabaseConfig()) return { state: "setup" };

  const session = await readStoredSession();
  if (!session) return { state: "signed-out" };

  const supabase = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabase.auth.getUser(
    session.access_token,
  );

  if (authError || !authData.user?.email) {
    return { state: "signed-out" };
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredEmail && authData.user.email.toLowerCase() !== configuredEmail) {
    return { state: "forbidden" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { state: "forbidden" };
  }

  return {
    state: "ready",
    user: { id: authData.user.id, email: authData.user.email },
  };
}

export async function requireAdmin(): Promise<AdminUser> {
  const access = await getAdminAccess();
  if (access.state !== "ready") {
    throw new Error("Akses admin tidak tersedia.");
  }
  return access.user;
}

function toNumber(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSlug(value: string): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function assertRequired(value: string, label: string) {
  if (!value) throw new Error(`${label} wajib diisi.`);
  return value;
}

function parseIncludedItems(value: FormDataEntryValue | null) {
  return toText(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadCatalogImage(
  file: FormDataEntryValue | null,
  userId: string,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Foto harus JPG, PNG, atau WebP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("catalog-images")
    .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });

  if (error) throw new Error(`Foto tidak dapat diunggah: ${error.message}`);
  return path;
}

export function publicCatalogImageUrl(path: string | null) {
  if (!path || !hasSupabaseConfig()) return null;
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return getSupabaseAdmin().storage.from("catalog-images").getPublicUrl(path).data.publicUrl;
}

export async function signInAdmin(email: string, password: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase belum diatur. Lengkapi environment terlebih dahulu.");
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredEmail && email.trim().toLowerCase() !== configuredEmail) {
    throw new Error("Email ini tidak memiliki akses admin.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error("Email atau kata sandi tidak sesuai.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Akun ini belum diberi peran admin.");
  }

  await setAdminSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [ordersToday, openOrders, recentOrders] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["baru", "dikonfirmasi", "diproses"]),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return {
    ordersToday: ordersToday.count ?? 0,
    openOrders: openOrders.count ?? 0,
    recentOrders: (recentOrders.data ?? []) as AdminOrder[],
  };
}

export async function getAdminMenuItems(): Promise<AdminMenuItem[]> {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminMenuItem[];
}

export async function getAdminPackageCatalog(): Promise<{
  categories: AdminPackageCategory[];
  packages: AdminPackage[];
}> {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const [categoriesResult, packagesResult] = await Promise.all([
    supabase
      .from("package_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("packages")
      .select("*, package_categories(name, slug)")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (packagesResult.error) throw new Error(packagesResult.error.message);

  return {
    categories: (categoriesResult.data ?? []) as AdminPackageCategory[],
    packages: (packagesResult.data ?? []) as AdminPackage[],
  };
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminOrder[];
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as AdminOrder | null;
}

export async function saveAdminMenuItem(formData: FormData) {
  const admin = await requireAdmin();
  const id = toText(formData.get("id"));
  const name = assertRequired(toText(formData.get("name")), "Nama menu");
  const category = assertRequired(toText(formData.get("category")), "Kategori menu");
  const menuType = toText(formData.get("menuType"));
  if (!MENU_TYPES.includes(menuType as MenuType)) {
    throw new Error("Jenis menu tidak valid.");
  }
  const slugInput = toText(formData.get("slug"));
  const slug = assertRequired(toSlug(slugInput || name), "Slug");
  const price = toNullableNumber(formData.get("priceIdr"));
  if (price === null) throw new Error("Harga menu wajib diisi.");
  const existingImagePath = toText(formData.get("existingImagePath"));
  const uploadedImagePath = await uploadCatalogImage(formData.get("image"), admin.id);
  const payload = {
    slug,
    name,
    category,
    menu_type: menuType,
    price_idr: price,
    tag: toText(formData.get("tag")) || null,
    description: toText(formData.get("description")) || null,
    image_path: uploadedImagePath ?? (existingImagePath || null),
    is_featured: formData.get("isFeatured") === "on",
    is_active: formData.get("isActive") === "on",
    sort_order: toNumber(formData.get("sortOrder")),
  };

  const supabase = getSupabaseAdmin();
  const result = id
    ? await supabase.from("menu_items").update(payload).eq("id", id)
    : await supabase.from("menu_items").insert(payload);
  if (result.error) throw new Error(result.error.message);
}

export async function archiveAdminMenuItem(id: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("menu_items")
    .update({ is_active: false, is_featured: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveAdminPackageCategory(formData: FormData) {
  const admin = await requireAdmin();
  const id = toText(formData.get("id"));
  const name = assertRequired(toText(formData.get("name")), "Nama kategori");
  const slugInput = toText(formData.get("slug"));
  const slug = assertRequired(toSlug(slugInput || name), "Slug");
  const existingImagePath = toText(formData.get("existingImagePath"));
  const uploadedImagePath = await uploadCatalogImage(formData.get("image"), admin.id);
  const payload = {
    name,
    slug,
    description: toText(formData.get("description")) || null,
    image_path: uploadedImagePath ?? (existingImagePath || null),
    sort_order: toNumber(formData.get("sortOrder")),
    is_active: formData.get("isActive") === "on",
  };
  const supabase = getSupabaseAdmin();
  const result = id
    ? await supabase.from("package_categories").update(payload).eq("id", id)
    : await supabase.from("package_categories").insert(payload);
  if (result.error) throw new Error(result.error.message);
}

export async function saveAdminPackage(formData: FormData) {
  const admin = await requireAdmin();
  const id = toText(formData.get("id"));
  const name = assertRequired(toText(formData.get("name")), "Nama paket");
  const categoryId = assertRequired(toText(formData.get("categoryId")), "Kategori paket");
  const slugInput = toText(formData.get("slug"));
  const slug = assertRequired(toSlug(slugInput || name), "Slug");
  const existingImagePath = toText(formData.get("existingImagePath"));
  const uploadedImagePath = await uploadCatalogImage(formData.get("image"), admin.id);
  const payload = {
    category_id: categoryId,
    name,
    slug,
    summary: toText(formData.get("summary")) || null,
    included_items: parseIncludedItems(formData.get("includedItems")),
    price_from_idr: toNullableNumber(formData.get("priceFromIdr")),
    price_unit: toText(formData.get("priceUnit")) || null,
    minimum_servings: toNullableNumber(formData.get("minimumServings")),
    image_path: uploadedImagePath ?? (existingImagePath || null),
    is_featured: formData.get("isFeatured") === "on",
    is_active: formData.get("isActive") === "on",
    sort_order: toNumber(formData.get("sortOrder")),
  };
  const supabase = getSupabaseAdmin();
  const result = id
    ? await supabase.from("packages").update(payload).eq("id", id)
    : await supabase.from("packages").insert(payload);
  if (result.error) throw new Error(result.error.message);
}

export async function archiveAdminPackageCategory(id: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("package_categories")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function archiveAdminPackage(id: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("packages")
    .update({ is_active: false, is_featured: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateAdminOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Status pesanan tidak valid.");
  }
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
