import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ClosingCta } from "@/components/ClosingCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCatalogImageUrl } from "@/lib/catalog-image";
import { getActivePackages, type PublicPackage } from "@/lib/catalog";
import { PACKAGE_PAGES, isPackagePageSlug } from "@/lib/package-pages";
import { getWhatsAppUrl } from "@/lib/site";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

type PackagePageContent = {
  title: string;
  summary: string;
  image: string;
  highlights: readonly string[];
  categoryName?: string;
  priceFromIdr?: number | null;
  priceUnit?: string | null;
  minimumServings?: number | null;
  packageSlug?: string;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(PACKAGE_PAGES).map((slug) => ({ slug }));
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function fromCatalogPackage(item: PublicPackage): PackagePageContent {
  return {
    title: item.name,
    summary: item.summary || "Paket catering untuk kebutuhan acara.",
    image: getCatalogImageUrl(item.imagePath, "/images/nasi-kotak.jpg"),
    highlights: item.includedItems,
    categoryName: item.category?.name,
    priceFromIdr: item.priceFromIdr,
    priceUnit: item.priceUnit,
    minimumServings: item.minimumServings,
    packageSlug: item.slug,
  };
}

async function getPackagePageContent(slug: string): Promise<PackagePageContent | null> {
  try {
    const catalogPackage = (await getActivePackages()).find((item) => item.slug === slug);
    if (catalogPackage) return fromCatalogPackage(catalogPackage);
  } catch {
    // Fall through to a static service page. A temporary catalogue outage
    // should not make an established local-service URL disappear.
  }

  if (!isPackagePageSlug(slug)) return null;
  return PACKAGE_PAGES[slug];
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPackagePageContent(slug);

  if (!item) {
    return {};
  }

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/paket/${slug}` },
    openGraph: {
      title: item.title,
      description: item.summary,
      images: [{ url: item.image, alt: item.title }],
    },
  };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = await params;
  const item = await getPackagePageContent(slug);

  if (!item) {
    notFound();
  }

  const consultationUrl = getWhatsAppUrl(
    `Halo Shanti Catering, saya ingin tanya ${item.title.toLowerCase()}.`,
  );
  const orderUrl = item.packageSlug
    ? `/pesan?intent=package&packageId=${encodeURIComponent(item.packageSlug)}`
    : `/pesan?intent=custom&topic=${encodeURIComponent(item.title)}`;
  const priceLabel = item.priceFromIdr === null || item.priceFromIdr === undefined
    ? "Hubungi untuk harga"
    : `Mulai ${formatRupiah(item.priceFromIdr)}${item.priceUnit ? ` / ${item.priceUnit}` : ""}`;
  const minimumLabel = item.minimumServings
    ? `Minimal ${item.minimumServings} porsi`
    : "Minimum porsi sesuai kebutuhan acara";

  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />
      <div className="px-4 pb-20 pt-10 sm:pt-14">
        <article className="mx-auto max-w-6xl">
          <Link
            href="/menu"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali ke paket dan menu
          </Link>

          <div className="mt-6 grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-72 lg:min-h-[520px]">
              <Image src={item.image} alt={item.title} fill preload sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{item.categoryName || "Paket acara"}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{item.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{item.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-foreground">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">{priceLabel}</span>
                <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{minimumLabel}</span>
              </div>
              {item.highlights.length > 0 && (
                <ul className="mt-7 space-y-3 text-sm leading-6 text-foreground">
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={orderUrl}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  Pilih paket
                </Link>
                <a
                  href={consultationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <MessageCircle className="size-4" />
                  Tanya lewat WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
      <ClosingCta
        image={item.image}
        imageAlt={item.title}
        title={`Ingin menyesuaikan ${item.title}?`}
        description="Ceritakan jumlah porsi, tanggal, lokasi, dan kebutuhan acara. Kami bantu menyiapkan pilihan yang sesuai."
        primaryAction={{ kind: "link", href: orderUrl, label: "Pilih paket" }}
        secondaryAction={{ kind: "whatsapp", href: consultationUrl, placement: "service_package_closing_cta", label: "Tanya paket" }}
      />
      <SiteFooter />
    </main>
  );
}
