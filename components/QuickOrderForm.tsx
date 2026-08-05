"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ChevronDown, Loader2, MessageCircle, XCircle } from "lucide-react";
import { WA_NUMBER } from "@/constants/config";
import { trackEvent } from "@/lib/analytics";
import type { PublicMenuItem, PublicPackage } from "@/lib/catalog";

const orderSchema = z.object({
  name: z.string().trim().min(3, "Tulis nama minimal 3 karakter."),
  phone: z.string().trim().min(9, "Nomor WhatsApp belum valid.").regex(/^[0-9+\-\s]+$/, "Gunakan angka untuk nomor WhatsApp."),
  selectionType: z.enum(["menu", "package", "custom"]),
  selectionId: z.string().min(1, "Pilih menu atau paket terlebih dahulu."),
  porsi: z.number({ message: "Masukkan jumlah porsi." }).min(20, "Minimal pemesanan 20 porsi."),
  date: z.string().min(1, "Pilih tanggal acara."),
  alamat: z.string().trim().min(5, "Tulis alamat minimal 5 karakter."),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional(),
  customRequest: z.string().trim().max(500, "Kebutuhan custom maksimal 500 karakter.").optional(),
}).superRefine((data, context) => {
  if (data.selectionType === "custom" && (!data.customRequest || data.customRequest.length < 5)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customRequest"],
      message: "Ceritakan kebutuhan menu custom minimal 5 karakter.",
    });
  }
});

type OrderFormData = z.infer<typeof orderSchema>;
type OrderStatus = "idle" | "loading" | "error" | "success";

function findMenu(menuItems: PublicMenuItem[], identifier: string) {
  return menuItems.find((item) => item.id === identifier || item.slug === identifier || String(item.legacyId) === identifier);
}

function findPackage(packages: PublicPackage[], identifier: string) {
  return packages.find((item) => item.id === identifier || item.slug === identifier);
}

function getSelectionLabel(
  selectionType: OrderFormData["selectionType"],
  selectionId: string,
  menuItems: PublicMenuItem[],
  packages: PublicPackage[],
  customTopic = ""
) {
  if (selectionType === "menu") return findMenu(menuItems, selectionId)?.name ?? "Menu pilihan";
  if (selectionType === "package") return findPackage(packages, selectionId)?.name ?? "Paket pilihan";
  return customTopic || "Pesanan custom";
}

function formatDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function makeWhatsAppUrl(
  data: OrderFormData,
  menuItems: PublicMenuItem[],
  packages: PublicPackage[],
  reference?: string,
  customTopic = ""
) {
  const selectionLabel = getSelectionLabel(data.selectionType, data.selectionId, menuItems, packages, customTopic);
  const message = [
    "Halo Shanti Catering, saya ingin memesan.",
    reference ? `Kode pesanan: ${reference}` : "",
    `Nama: ${data.name}`,
    `No. WhatsApp: ${data.phone}`,
    `Pilihan: ${selectionLabel}`,
    data.selectionType === "custom" && customTopic ? `Kebutuhan custom: ${customTopic}` : "",
    `Jumlah porsi: ${data.porsi}`,
    `Tanggal acara: ${formatDate(data.date)}`,
    `Alamat: ${data.alamat}`,
    `Catatan: ${data.notes || "-"}`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

interface QuickOrderFormProps {
  menuItems: PublicMenuItem[];
  packages: PublicPackage[];
}

export function QuickOrderForm({ menuItems, packages }: QuickOrderFormProps) {
  const searchParams = useSearchParams();
  const menuId = searchParams.get("menuId");
  const packageId = searchParams.get("package");
  const requestCustom = searchParams.get("request") === "custom";
  const customTopic = searchParams.get("topic")?.trim() || "";
  const initialSelection = useMemo(() => {
    if (requestCustom) return { selectionType: "custom" as const, selectionId: "custom", customRequest: customTopic };
    const selectedPackage = packageId ? findPackage(packages, packageId) : undefined;
    if (selectedPackage) return { selectionType: "package" as const, selectionId: selectedPackage.id };
    const selectedMenu = menuId ? findMenu(menuItems, menuId) : undefined;
    if (selectedMenu) return { selectionType: "menu" as const, selectionId: selectedMenu.id };
    return { selectionType: "menu" as const, selectionId: "" };
  }, [customTopic, menuId, menuItems, packageId, packages, requestCustom]);
  const [status, setStatus] = useState<OrderStatus>("idle");
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const formStarted = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialSelection,
  });

  useEffect(() => {
    reset(initialSelection);
    setStatus("idle");
    setFallbackUrl(null);
  }, [initialSelection, reset]);

  const selectedType = watch("selectionType");
  const selectedId = watch("selectionId");
  const selectedLabel = selectedId
    ? getSelectionLabel(selectedType, selectedId, menuItems, packages, customTopic)
    : "Pilih menu atau paket";

  const onFormStart = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent("form_started");
  };

  const chooseSelection = (selectionType: OrderFormData["selectionType"], selectionId: string) => {
    setValue("selectionType", selectionType, { shouldValidate: true });
    setValue("selectionId", selectionId, { shouldValidate: true });
    setSelectionOpen(false);
  };

  const onSubmit = async (data: OrderFormData) => {
    setStatus("loading");
    setFallbackUrl(null);

    try {
      const payload = {
        ...data,
        ...(data.selectionType === "menu" ? { menuId: data.selectionId } : {}),
        ...(data.selectionType === "custom" ? { customRequest: data.customRequest } : {}),
      };
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null) as { reference?: string; email?: { status?: string }; error?: string } | null;

      if (!response.ok || !result?.reference) throw new Error(result?.error || "Pesanan belum tersimpan.");

      trackEvent("order_saved", {
        selection_type: data.selectionType,
        email_status: result.email?.status ?? "unknown",
      });
      setStatus("success");
      window.location.assign(makeWhatsAppUrl(data, menuItems, packages, result.reference, data.customRequest || customTopic));
      reset(initialSelection);
    } catch {
      trackEvent("order_fallback", { selection_type: data.selectionType });
      setFallbackUrl(makeWhatsAppUrl(data, menuItems, packages, undefined, data.customRequest || customTopic));
      setStatus("error");
    }
  };

  return (
    <section id="pesan" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(6,78,59,0.06)] sm:p-7 dark:shadow-none">
      <div className="mb-6">
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Form pemesanan</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Ceritakan kebutuhan acara Anda</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Isi data singkat. Setelah tersimpan, Anda akan lanjut ke WhatsApp untuk konfirmasi.</p>
      </div>

      {status === "error" && (
        <div role="alert" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <div className="flex gap-2">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Pesanan belum tersimpan.</p>
              <p className="mt-1">Silakan coba lagi. Anda juga bisa lanjut ke WhatsApp agar kebutuhan Anda tetap terkirim.</p>
              {fallbackUrl && <a href={fallbackUrl} className="mt-3 inline-flex font-bold underline underline-offset-4">Lanjut ke WhatsApp</a>}
            </div>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="mb-5 flex gap-2 rounded-xl border border-emerald-600/25 bg-emerald-600/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Pesanan tersimpan. Anda sedang diarahkan ke WhatsApp.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} onFocusCapture={onFormStart} className="space-y-4" noValidate aria-busy={status === "loading"}>
        <input type="hidden" {...register("selectionType")} />
        <input type="hidden" {...register("selectionId")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nama lengkap" error={errors.name?.message}>
            <input id="name" autoComplete="name" placeholder="Contoh: Budi Santoso" className="order-input" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />
          </Field>
          <Field id="phone" label="Nomor WhatsApp" error={errors.phone?.message}>
            <input id="phone" autoComplete="tel" inputMode="tel" placeholder="Contoh: 08123456789" className="order-input" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")} />
          </Field>
        </div>

        <Field id="selection-trigger" label="Menu atau paket" error={errors.selectionId?.message}>
          <div className="relative">
            <button
              id="selection-trigger"
              type="button"
              onClick={() => setSelectionOpen((open) => !open)}
              aria-expanded={selectionOpen}
              aria-controls="catalog-selection-options"
              aria-labelledby="selection-trigger-label"
              aria-describedby={errors.selectionId ? "selection-trigger-error" : undefined}
              data-invalid={errors.selectionId ? "true" : undefined}
              className="order-input flex w-full items-center justify-between gap-3 text-left"
            >
              <span className={selectedId ? "font-semibold text-foreground" : "text-muted-foreground"}>{selectedLabel}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${selectionOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {selectionOpen && (
              <div id="catalog-selection-options" role="listbox" aria-label="Pilihan menu atau paket" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl">
                {menuItems.length > 0 && <p className="px-3 pt-2 text-xs font-bold text-muted-foreground">MENU SATUAN</p>}
                {menuItems.map((item) => (
                  <button key={item.id} type="button" role="option" aria-selected={selectedType === "menu" && selectedId === item.id} onClick={() => chooseSelection("menu", item.id)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                    <span className="font-medium text-foreground">{item.name}</span>
                  </button>
                ))}
                {packages.length > 0 && <p className="px-3 pt-3 text-xs font-bold text-muted-foreground">PAKET ACARA</p>}
                {packages.map((item) => (
                  <button key={item.id} type="button" role="option" aria-selected={selectedType === "package" && selectedId === item.id} onClick={() => chooseSelection("package", item.id)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                    {item.name}
                  </button>
                ))}
                <button type="button" role="option" aria-selected={selectedType === "custom"} onClick={() => chooseSelection("custom", "custom")} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                  Susun menu custom
                </button>
              </div>
            )}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="porsi" label="Jumlah porsi" error={errors.porsi?.message}>
            <Controller
              name="porsi"
              control={control}
              render={({ field }) => <input id="porsi" type="number" inputMode="numeric" min={20} placeholder="Minimal 20 porsi" className="order-input" aria-invalid={Boolean(errors.porsi)} aria-describedby={errors.porsi ? "porsi-error" : undefined} value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)} />}
            />
          </Field>
          <Field id="date" label="Tanggal acara" error={errors.date?.message}>
            <input id="date" type="date" min={new Date().toISOString().slice(0, 10)} className="order-input" aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} {...register("date")} />
          </Field>
        </div>

        <Field id="alamat" label="Alamat acara" error={errors.alamat?.message}>
          <textarea id="alamat" autoComplete="street-address" rows={2} placeholder="Tulis alamat lengkap acara atau pengiriman" className="order-input resize-y" aria-invalid={Boolean(errors.alamat)} aria-describedby={errors.alamat ? "alamat-error" : undefined} {...register("alamat")} />
        </Field>
        {selectedType === "custom" && (
          <Field id="custom-request" label="Kebutuhan menu custom" error={errors.customRequest?.message}>
            <textarea id="custom-request" rows={3} placeholder="Contoh: nasi kotak untuk rapat, pilihan lauk tanpa pedas" className="order-input resize-y" aria-invalid={Boolean(errors.customRequest)} aria-describedby={errors.customRequest ? "custom-request-error" : undefined} {...register("customRequest")} />
          </Field>
        )}
        <Field id="notes" label="Catatan" optional error={errors.notes?.message}>
          <textarea id="notes" rows={3} placeholder="Contoh: pilihan lauk, alergi, atau kebutuhan lain" className="order-input resize-y" aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? "notes-error" : undefined} {...register("notes")} />
        </Field>

        <button type="submit" disabled={status === "loading"} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px">
          {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Menyimpan pesanan</> : <><MessageCircle className="h-4 w-4" aria-hidden="true" /> Simpan lalu lanjut WhatsApp</>}
        </button>
      </form>
    </section>
  );
}

function Field({ id, label, optional = false, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label id={`${id}-label`} htmlFor={id} className="text-sm font-bold text-foreground">{label}{optional && <span className="font-medium text-muted-foreground"> (opsional)</span>}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
    </div>
  );
}
