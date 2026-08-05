import "server-only";

import { z } from "zod";
import type { CatalogSelection, CatalogSelectionType } from "@/lib/catalog";
import { hasSupabaseConfig } from "@/lib/server/config";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const optionalText = (maxLength: number) =>
    z.string().trim().max(maxLength).optional().transform((value) => value || undefined);

export const orderInputSchema = z
    .object({
        name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
        phone: z
            .string()
            .trim()
            .min(9, "Nomor WhatsApp tidak valid")
            .max(25, "Nomor WhatsApp tidak valid")
            .regex(/^[0-9+()\-\s]+$/, "Format nomor WhatsApp tidak valid"),
        porsi: z.coerce.number().int().min(20, "Minimal 20 porsi").max(10000),
        date: z
            .string()
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal acara tidak valid")
            .refine(isValidDate, "Tanggal acara tidak valid")
            .refine(
                (value) => !isValidDate(value) || isTodayOrFutureInJakarta(value),
                "Tanggal acara tidak boleh sebelum hari ini"
            ),
        alamat: z.string().trim().min(5, "Alamat minimal 5 karakter").max(500),
        notes: optionalText(1000),
        selectionType: z.enum(["menu", "package", "custom"]).optional(),
        selectionId: optionalText(120),
        // Backward compatibility for the existing public form.
        menuId: z.union([z.string(), z.number()]).optional().transform((value) => value?.toString()),
        packageId: z.union([z.string(), z.number()]).optional().transform((value) => value?.toString()),
        customRequest: optionalText(1000),
    })
    .superRefine((value, context) => {
        const selectedType = inferSelectionType(value);
        const identifiers = [value.selectionId, value.menuId, value.packageId].filter(Boolean);

        if (value.menuId && value.packageId) {
            context.addIssue({
                code: "custom",
                message: "Pilih satu menu atau paket saja",
                path: ["selectionId"],
            });
        }

        const selectedIdentifier =
            value.selectionId ?? (selectedType === "menu" ? value.menuId : value.packageId);
        if ((selectedType === "menu" || selectedType === "package") && !selectedIdentifier) {
            context.addIssue({
                code: "custom",
                message: "Menu atau paket wajib dipilih",
                path: ["selectionId"],
            });
        }

        for (const identifier of identifiers) {
            if (!/^[A-Za-z0-9-]+$/.test(identifier!)) {
                context.addIssue({
                    code: "custom",
                    message: "Pilihan menu atau paket tidak valid",
                    path: ["selectionId"],
                });
            }
        }

        if (selectedType === "custom" && !value.customRequest) {
            context.addIssue({
                code: "custom",
                message: "Tulis kebutuhan katering yang ingin dikonsultasikan",
                path: ["customRequest"],
            });
        }
    });

export type OrderInput = z.output<typeof orderInputSchema>;

export type NormalizedOrderInput = OrderInput & {
    selectionType: CatalogSelectionType;
    selectionId?: string;
    phone: string;
};

export type OrderEmailStatus = "pending" | "sent" | "failed" | "skipped";

export type StoredOrder = {
    id: string | null;
    reference: string;
    persistence: "database" | "local";
};

export function isValidDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function jakartaToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .formatToParts(new Date())
        .reduce<Record<string, string>>((result, part) => {
            if (part.type !== "literal") result[part.type] = part.value;
            return result;
        }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Dates use an explicit Jakarta calendar day rather than server-local time. */
export function isTodayOrFutureInJakarta(value: string) {
    return value >= jakartaToday();
}

export function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
        throw new Error("Nomor WhatsApp tidak valid");
    }
    return value.trim().startsWith("+") ? `+${digits}` : digits;
}

export function inferSelectionType(
    value: Pick<OrderInput, "selectionType" | "menuId" | "packageId">
): CatalogSelectionType {
    if (value.selectionType) return value.selectionType;
    if (value.packageId) return "package";
    if (value.menuId) return "menu";
    return "custom";
}

export function normalizeOrderInput(value: OrderInput): NormalizedOrderInput {
    const selectionType = inferSelectionType(value);
    const selectionId =
        value.selectionId ?? (selectionType === "menu" ? value.menuId : value.packageId);

    return {
        ...value,
        selectionType,
        selectionId,
        phone: normalizePhone(value.phone),
    };
}

function createReference() {
    const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .formatToParts(new Date())
        .reduce<Record<string, string>>((parts, part) => {
            if (part.type !== "literal") parts[part.type] = part.value;
            return parts;
        }, {});
    const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
    return `SC-${date.year}${date.month}${date.day}-${random}`;
}

export async function createOrder(
    input: NormalizedOrderInput,
    selection: CatalogSelection
): Promise<StoredOrder> {
    if (!hasSupabaseConfig()) {
        const reference = createReference();
        // Local-only fallback keeps development and UI QA usable without
        // pretending this is persistent storage.
        console.info("[Shanti Catering] order accepted in local mode", {
            reference,
            selection: selection.name,
            servings: input.porsi,
        });
        return { id: null, reference, persistence: "local" };
    }

    const client = getSupabaseAdmin();
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const reference = createReference();
        const { data, error } = await client
            .from("orders")
            .insert({
                reference,
                customer_name: input.name,
                customer_phone: input.phone,
                selection_type: selection.type,
                selection_name: selection.name,
                selection_price_idr: selection.priceIdr,
                selection_price_unit: selection.priceUnit,
                servings: input.porsi,
                event_date: input.date,
                delivery_address: input.alamat,
                notes: input.notes ?? null,
                custom_request: input.customRequest ?? null,
                status: "baru",
                email_status: "pending",
            })
            .select("id, reference")
            .single();

        if (!error && data) {
            return { id: data.id, reference: data.reference, persistence: "database" };
        }
        if (error?.code !== "23505" || attempt === 2) {
            throw new Error(`Tidak dapat menyimpan pesanan: ${error?.message ?? "unknown error"}`);
        }
    }

    throw new Error("Tidak dapat membuat nomor pesanan");
}

export async function updateOrderEmailStatus(
    orderId: string | null,
    status: OrderEmailStatus,
    errorMessage?: string
) {
    if (!orderId || !hasSupabaseConfig()) return;

    const { error } = await getSupabaseAdmin()
        .from("orders")
        .update({
            email_status: status,
            email_error: errorMessage?.slice(0, 500) ?? null,
        })
        .eq("id", orderId);

    if (error) {
        console.error("Tidak dapat memperbarui status email pesanan", error.message);
    }
}
