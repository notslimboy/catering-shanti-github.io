import { WA_NUMBER } from "@/constants/config";

export const BUSINESS = {
  name: "Shanti Catering",
  description:
    "Catering Surabaya untuk nasi kotak, prasmanan, dan paket acara keluarga maupun kantor.",
  address: {
    streetAddress: "Jl. Bhaskara III No.38, Kalisari",
    addressLocality: "Surabaya",
    addressRegion: "Jawa Timur",
    postalCode: "60112",
    addressCountry: "ID",
  },
  telephone: `+${WA_NUMBER}`,
  openingHours: ["Mo-Su 08:00-21:00"],
  image: "/images/nasi-kotak.jpg",
} as const;

export const SEO_PACKAGE_SLUGS = [
  "catering-pernikahan-surabaya",
  "catering-kantor-surabaya",
  "catering-aqiqah-surabaya",
  "nasi-kotak-surabaya",
  "tumpeng-surabaya",
] as const;

export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return new URL(configuredUrl || "http://localhost:3000");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
