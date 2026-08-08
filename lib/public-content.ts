export type GalleryStatus = "placeholder" | "ready";

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  alt: string;
  status: GalleryStatus;
  imageSrc: string | null;
  gridClassName: string;
  teaserGridClassName?: string;
  teaserSizes?: string;
  sizes?: string;
};

export type CustomerOrganization = {
  id: string;
  name: string;
  wordmark: string;
  logoSrc: string | null;
  darkSurface?: boolean;
  markOnly?: boolean;
  logoScale?: "large" | "medium" | "largeMark" | "prominentEmblem" | "prominentShield" | "prominentUniversityMark" | "portraitCrest" | "wideWordmark";
};

export type GoogleReview = {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewAge: string;
  quote: string;
};

export type GoogleReviewSummary = {
  rating: string;
  reviewCount: number;
  observedAt: string;
  profileUrl: string;
  ratingValue?: number | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Foto di bawah ini adalah contoh sajian, bukan dokumentasi acara atau foto pelanggan.
// `gridClassName` menjaga komposisi mosaik tetap seimbang pada layar kecil dan besar.
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "resepsi-keluarga",
    title: "Contoh sajian tumpeng",
    description: "Contoh sajian tumpeng Shanti Catering, bukan dokumentasi resepsi.",
    alt: "Contoh sajian tumpeng dari Shanti Catering, bukan dokumentasi resepsi keluarga",
    status: "ready",
    imageSrc: "/images/tumpeng-hero.webp",
    gridClassName: "col-span-2 row-span-2 md:col-span-3 md:row-span-3 md:col-start-1 md:row-start-1 lg:col-span-6 lg:row-span-4 lg:col-start-1 lg:row-start-1",
    teaserGridClassName: "col-span-2 row-span-2 md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-1",
    teaserSizes: "(max-width: 767px) 100vw, 50vw",
    sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw",
  },
  {
    id: "kebutuhan-kantor",
    title: "Contoh coffee break",
    description: "Contoh coffee break Shanti Catering, bukan dokumentasi acara kantor.",
    alt: "Contoh coffee break dari Shanti Catering, bukan dokumentasi acara kantor",
    status: "ready",
    imageSrc: "/images/events/coffee-break.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-1 lg:col-span-3 lg:row-span-2 lg:col-start-7 lg:row-start-1",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-1 md:col-start-4 md:row-start-1",
    teaserSizes: "(max-width: 767px) 50vw, 50vw",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 50vw",
  },
  {
    id: "nasi-kotak",
    title: "Contoh nasi kotak",
    description: "Contoh nasi kotak Shanti Catering, bukan dokumentasi pengantaran acara.",
    alt: "Contoh nasi kotak dari Shanti Catering, bukan dokumentasi pengantaran acara",
    status: "ready",
    imageSrc: "/images/nasi-kotak.jpg",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-3 lg:col-span-3 lg:row-span-2 lg:col-start-10 lg:row-start-1",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-1 md:col-start-4 md:row-start-2",
    teaserSizes: "(max-width: 767px) 50vw, 50vw",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 50vw",
  },
  {
    id: "aqiqah-khitanan",
    title: "Contoh nasi liwet",
    description: "Contoh nasi liwet Shanti Catering, bukan dokumentasi acara keluarga.",
    alt: "Contoh nasi liwet dari Shanti Catering, bukan dokumentasi aqiqah atau khitanan",
    status: "ready",
    imageSrc: "/images/nasi-liwet-solo.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-4 lg:col-span-3 lg:row-span-2 lg:col-start-7 lg:row-start-3",
    teaserGridClassName: "col-span-2 row-span-1 md:col-span-6 md:row-span-1 md:col-start-1 md:row-start-3",
    teaserSizes: "100vw",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 34vw, 25vw",
  },
  {
    id: "prasmanan-acara",
    title: "Contoh sajian prasmanan",
    description: "Contoh sajian rawon Shanti Catering, bukan dokumentasi penataan prasmanan.",
    alt: "Contoh sajian rawon dari Shanti Catering, bukan dokumentasi prasmanan acara",
    status: "ready",
    imageSrc: "/images/rawon.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-4 lg:col-span-3 lg:row-span-2 lg:col-start-10 lg:row-start-3",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-4",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 34vw, 25vw",
  },
  {
    id: "tumpeng-syukuran",
    title: "Contoh menu perayaan",
    description: "Contoh lontong cap go meh Shanti Catering, bukan dokumentasi syukuran.",
    alt: "Contoh lontong cap go meh dari Shanti Catering, bukan dokumentasi tumpeng dan syukuran",
    status: "ready",
    imageSrc: "/images/lontong-cap-go-meh.jpg",
    gridClassName: "col-span-2 row-span-2 md:col-span-2 md:row-span-2 md:col-start-5 md:row-start-4 lg:col-span-4 lg:row-span-3 lg:col-start-1 lg:row-start-5",
    teaserGridClassName: "col-span-2 row-span-2 md:col-span-2 md:row-span-2 md:col-start-5 md:row-start-4",
    sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 34vw, 34vw",
  },
  {
    id: "coffee-break",
    title: "Contoh kue coffee break",
    description: "Contoh banana cake Shanti Catering, bukan dokumentasi coffee break.",
    alt: "Contoh banana cake dari Shanti Catering, bukan dokumentasi coffee break acara",
    status: "ready",
    imageSrc: "/images/banana-cake.jpg",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-6 lg:col-span-4 lg:row-span-3 lg:col-start-5 lg:row-start-5",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-6",
    sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 34vw",
  },
  {
    id: "catering-harian",
    title: "Contoh menu harian",
    description: "Contoh nasi jagung Shanti Catering, bukan dokumentasi catering harian.",
    alt: "Contoh nasi jagung dari Shanti Catering, bukan dokumentasi catering harian",
    status: "ready",
    imageSrc: "/images/nasi-jagung.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-6 lg:col-span-4 lg:row-span-3 lg:col-start-9 lg:row-start-5",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-6",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 34vw",
  },
  {
    id: "makan-bersama",
    title: "Contoh gado-gado",
    description: "Contoh gado-gado Shanti Catering, bukan dokumentasi makan bersama.",
    alt: "Contoh gado-gado dari Shanti Catering, bukan dokumentasi acara makan bersama",
    status: "ready",
    imageSrc: "/images/gado-gado.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-8 lg:col-span-6 lg:row-span-3 lg:col-start-1 lg:row-start-8",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-8",
    sizes: "(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 50vw",
  },
  {
    id: "menu-custom",
    title: "Contoh menu Arab",
    description: "Contoh menu Arab Shanti Catering, bukan dokumentasi menu custom acara.",
    alt: "Contoh menu Arab dari Shanti Catering, bukan dokumentasi menu custom acara",
    status: "ready",
    imageSrc: "/images/menu-arab.webp",
    gridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-8 lg:col-span-6 lg:row-span-3 lg:col-start-7 lg:row-start-8",
    teaserGridClassName: "col-span-1 row-span-1 md:col-span-3 md:row-span-2 md:col-start-4 md:row-start-8",
    sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw",
  },
];

export const CUSTOMER_ORGANIZATIONS: CustomerOrganization[] = [
  {
    id: "its",
    name: "Institut Teknologi Sepuluh Nopember",
    wordmark: "ITS",
    logoSrc: "/images/customers/its-emblem.png",
    logoScale: "prominentEmblem",
  },
  {
    id: "pens",
    name: "Politeknik Elektronika Negeri Surabaya",
    wordmark: "PENS",
    logoSrc: "/images/customers/pens.png",
    logoScale: "large",
  },
  {
    id: "unair",
    name: "Universitas Airlangga",
    wordmark: "UNAIR",
    logoSrc: "/images/customers/unair.png",
    logoScale: "portraitCrest",
  },
  {
    id: "bkkbn",
    name: "Badan Kependudukan dan Keluarga Berencana Nasional",
    wordmark: "BKKBN",
    logoSrc: "/images/customers/bkkbn-logo.png",
    logoScale: "medium",
  },
  {
    id: "askrindo",
    name: "Askrindo",
    wordmark: "ASKRINDO Insurance / A member of IFG",
    logoSrc: "/images/customers/askrindo.png",
  },
  {
    id: "pemkot-surabaya",
    name: "Pemerintah Kota Surabaya",
    wordmark: "Surabaya City of Heroes",
    logoSrc: "/images/customers/surabaya-city-of-heroes.png",
    logoScale: "large",
  },
  {
    id: "al-azhar-surabaya",
    name: "Al Azhar Surabaya",
    wordmark: "Al Azhar Surabaya",
    logoSrc: "/images/customers/al-azhar.png",
    logoScale: "portraitCrest",
  },
  {
    id: "sman-3-surabaya",
    name: "SMAN 3 Surabaya",
    wordmark: "SMAN 3 Surabaya",
    logoSrc: "/images/customers/sman-3-surabaya-emblem.png",
    markOnly: true,
    logoScale: "prominentShield",
  },
  {
    id: "smpn-18-surabaya",
    name: "SMPN 18 Surabaya",
    wordmark: "SMPN 18 Surabaya",
    logoSrc: "/images/customers/smpn-18-surabaya.png",
    logoScale: "prominentShield",
  },
  {
    id: "solomon-indo-global",
    name: "PT Solomon Indo Global",
    wordmark: "Solomon Indo Global",
    logoSrc: "/images/customers/solomon.webp",
    logoScale: "large",
  },
  {
    id: "dkpp-surabaya",
    name: "Dinas Ketahanan Pangan dan Pertanian Kota Surabaya",
    wordmark: "DKPP Kota Surabaya",
    logoSrc: "/images/customers/dkpp-surabaya.png",
    logoScale: "wideWordmark",
  },
  {
    id: "perhutani-jatim",
    name: "Perum Perhutani Divisi Regional Jawa Timur",
    wordmark: "Perhutani",
    logoSrc: "/images/customers/perhutani-jatim.png",
    logoScale: "wideWordmark",
  },
  {
    id: "ubaya",
    name: "Universitas Surabaya",
    wordmark: "UBAYA",
    logoSrc: "/images/customers/ubaya.png",
    logoScale: "portraitCrest",
  },
  {
    id: "uwika",
    name: "Universitas Widya Kartika",
    wordmark: "UWIKA",
    logoSrc: "/images/customers/uwika.png",
    logoScale: "prominentUniversityMark",
  },
  {
    id: "ubhara",
    name: "Universitas Bhayangkara Surabaya",
    wordmark: "UBHARA",
    logoSrc: "/images/customers/ubhara.png",
    logoScale: "prominentShield",
  },
];

export const GOOGLE_REVIEW_SUMMARY: GoogleReviewSummary = {
  rating: "4,5",
  reviewCount: 21,
  observedAt: "11 Juli 2026",
  profileUrl: "https://maps.app.goo.gl/4g9QEZd4LVM5yNvM7",
  ratingValue: 4.5,
} as const;

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "umda-maulida",
    name: "umda maulida",
    rating: 5,
    reviewAge: "setahun lalu",
    quote: "Enak masakannya",
  },
  {
    id: "welhelmus-agustinus",
    name: "Welhelmus Agustinus",
    rating: 5,
    reviewAge: "3 tahun lalu",
    quote: "Rekomen banget yang nyaari Catering Nasi Box",
  },
  {
    id: "aprilia-hidayat",
    name: "APRILIA HIDAYAT",
    rating: 4,
    reviewAge: "8 tahun lalu",
    quote: "catering buka lebaran .. luar biasa",
  },
  {
    id: "ahmad-maulana",
    name: "Ahmad Maulana",
    rating: 5,
    reviewAge: "8 tahun lalu",
    quote: "Makanannya enak",
  },
  {
    id: "yen-lam",
    name: "Yên lâm",
    rating: 5,
    reviewAge: "3 tahun lalu",
    quote: "Lumayaaaannn. Murah, enak lagi. Tapi porsinya Lumayan Banyak",
  },
  {
    id: "yani-san",
    name: "Yani San",
    rating: 5,
    reviewAge: "6 tahun lalu",
    quote: "Makanan enak, harga bersaing, cukup higienis, pelayanan tdk mengecewakan.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "cara-pesan",
    question: "Bagaimana cara memesan?",
    answer: "Pilih paket atau menu, isi kebutuhan acara, lalu lanjutkan konfirmasi melalui WhatsApp.",
  },
  {
    id: "menu-custom",
    question: "Apakah menu bisa disesuaikan?",
    answer: "Bisa. Sampaikan kebutuhan acara, pilihan hidangan, dan catatan khusus melalui WhatsApp agar kami bantu susun pilihannya.",
  },
  {
    id: "jumlah-porsi",
    question: "Berapa jumlah porsi yang bisa dipesan?",
    answer: "Jumlah porsi menyesuaikan jenis kebutuhan. Kirim perkiraan jumlah tamu melalui WhatsApp untuk konfirmasi langsung.",
  },
  {
    id: "harga",
    question: "Bagaimana informasi harga?",
    answer: "Harga dapat menyesuaikan pilihan menu dan kebutuhan acara. Hubungi kami melalui WhatsApp untuk informasi terbaru.",
  },
  {
    id: "catering-harian",
    question: "Apakah ada catering harian?",
    answer: "Ada untuk rumah dan kantor. Menu berganti setiap hari dan pengantaran menggunakan kurir. Tanyakan menu hari ini melalui WhatsApp.",
  },
  {
    id: "pesanan-mendadak",
    question: "Bisa untuk kebutuhan yang mendadak?",
    answer: "Ketersediaan menyesuaikan jadwal dan kebutuhan pesanan. Hubungi kami secepatnya melalui WhatsApp agar dapat kami cek.",
  },
];
