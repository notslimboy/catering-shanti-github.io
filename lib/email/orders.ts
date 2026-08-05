import "server-only";

import { Resend } from "resend";
import type { CatalogSelection } from "@/lib/catalog";
import type { NormalizedOrderInput, OrderEmailStatus, StoredOrder } from "@/lib/orders";
import { hasResendConfig, serverConfig } from "@/lib/server/config";

export type OrderEmailResult = {
    status: Exclude<OrderEmailStatus, "pending">;
    error?: string;
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatIdr(value: number | null) {
    return value === null
        ? "Harga perlu dikonfirmasi"
        : new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
          }).format(value);
}

export async function sendOrderNotificationEmail(
    order: StoredOrder,
    input: NormalizedOrderInput,
    selection: CatalogSelection
): Promise<OrderEmailResult> {
    if (!hasResendConfig()) {
        return { status: "skipped", error: "Resend belum dikonfigurasi" };
    }

    const rows: Array<[string, string]> = [
        ["Nomor pesanan", order.reference],
        ["Nama", input.name],
        ["WhatsApp", input.phone],
        ["Pilihan", selection.name],
        ["Harga", `${formatIdr(selection.priceIdr)}${selection.priceUnit ? ` / ${selection.priceUnit}` : ""}`],
        ["Jumlah", `${input.porsi} porsi`],
        ["Tanggal acara", input.date],
        ["Alamat", input.alamat],
        ["Catatan", input.notes ?? "-"],
    ];
    if (input.customRequest) rows.push(["Kebutuhan custom", input.customRequest]);

    try {
        const resend = new Resend(serverConfig.resendApiKey);
        const result = await resend.emails.send({
            from: serverConfig.resendFrom!,
            to: [serverConfig.orderNotificationTo!],
            subject: `Pesanan baru ${order.reference} — ${input.name}`,
            html: `
                <h1>Pesanan baru Shanti Catering</h1>
                <table cellpadding="8" cellspacing="0" style="border-collapse:collapse">
                    ${rows
                        .map(
                            ([label, value]) =>
                                `<tr><th align="left" style="border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</th><td style="border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`
                        )
                        .join("")}
                </table>
            `,
        });

        if (result.error) {
            return { status: "failed", error: result.error.message };
        }
        return { status: "sent" };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengirim email";
        return { status: "failed", error: message };
    }
}
