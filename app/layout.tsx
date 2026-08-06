import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BUSINESS, getSiteUrl } from "@/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Shanti Catering Surabaya | Nasi Kotak & Prasmanan",
    template: "%s | Shanti Catering",
  },
  description: BUSINESS.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Shanti Catering Surabaya | Nasi Kotak & Prasmanan",
    description: BUSINESS.description,
    type: "website",
    locale: "id_ID",
    images: [{ url: BUSINESS.image, width: 1200, height: 630, alt: "Sajian Shanti Catering" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shanti Catering Surabaya | Nasi Kotak & Prasmanan",
    description: BUSINESS.description,
    images: [BUSINESS.image],
  },
};

export default function RootLayout({
  children,
  order,
}: Readonly<{
  children: React.ReactNode;
  order: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl();
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Caterer",
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: siteUrl.toString(),
    image: new URL(BUSINESS.image, siteUrl).toString(),
    telephone: BUSINESS.telephone,
    address: {
      "@type": "PostalAddress",
      ...BUSINESS.address,
    },
    openingHours: BUSINESS.openingHours,
    servesCuisine: ["Indonesia", "Catering"],
  };

  return (
    <html lang="id" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className="font-sans min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          {order}
          <Analytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
