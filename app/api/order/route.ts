import { NextRequest, NextResponse } from "next/server";
import { resolveCatalogSelection } from "@/lib/catalog";
import { sendOrderNotificationEmail } from "@/lib/email/orders";
import {
    createOrder,
    normalizeOrderInput,
    orderInputSchema,
    updateOrderEmailStatus,
} from "@/lib/orders";
import {
    BackendConfigurationError,
    requireProductionServices,
} from "@/lib/server/config";

export const runtime = "nodejs";

/**
 * Create an order record, notify the admin, then let the browser open
 * WhatsApp. The trusted item and price are always looked up on the server.
 *
 * Accepted legacy body: { name, phone, menuId, porsi, date, alamat, notes }
 * Preferred body: { name, phone, selectionType, selectionId, porsi, date,
 *                   alamat, notes, customRequest? }
 */
export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Format data pesanan tidak valid", code: "INVALID_JSON" },
            { status: 400 }
        );
    }

    const parsed = orderInputSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Periksa kembali data pesanan Anda",
                code: "VALIDATION_ERROR",
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    try {
        // A production instance must not acknowledge an order without the
        // persistence and notification services named in the launch plan.
        requireProductionServices();

        const input = normalizeOrderInput(parsed.data);
        const selection = await resolveCatalogSelection(
            input.selectionType,
            input.selectionId
        );
        if (!selection) {
            return NextResponse.json(
                {
                    error: "Menu atau paket ini sudah tidak tersedia. Silakan pilih yang lain.",
                    code: "CATALOG_ITEM_NOT_AVAILABLE",
                },
                { status: 400 }
            );
        }

        if (selection.minimumServings && input.porsi < selection.minimumServings) {
            return NextResponse.json(
                {
                    error: `Minimal pemesanan untuk pilihan ini adalah ${selection.minimumServings} porsi.`,
                    code: "MINIMUM_SERVINGS_NOT_MET",
                },
                { status: 400 }
            );
        }

        const order = await createOrder(input, selection);
        const email = await sendOrderNotificationEmail(order, input, selection);
        await updateOrderEmailStatus(order.id, email.status, email.error);

        return NextResponse.json(
            {
                success: true,
                reference: order.reference,
                persistence: order.persistence,
                email: { status: email.status },
                message:
                    order.persistence === "database"
                        ? "Pesanan tercatat. Lanjutkan kirim pesan di WhatsApp untuk konfirmasi."
                        : "Mode lokal: lanjutkan kirim pesan di WhatsApp untuk konfirmasi.",
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof BackendConfigurationError) {
            return NextResponse.json(
                {
                    error: "Layanan pesanan sedang belum siap. Silakan hubungi kami lewat WhatsApp.",
                    code: "SERVICE_NOT_CONFIGURED",
                },
                { status: 503 }
            );
        }

        console.error("Order API error", error);
        return NextResponse.json(
            {
                error: "Pesanan belum dapat disimpan. Silakan coba lagi atau hubungi kami lewat WhatsApp.",
                code: "ORDER_SAVE_FAILED",
            },
            { status: 500 }
        );
    }
}
