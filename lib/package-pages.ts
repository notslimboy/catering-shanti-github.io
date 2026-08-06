export const PACKAGE_PAGES = {
  "catering-pernikahan-surabaya": {
    title: "Paket Catering Pernikahan Surabaya",
    summary: "Susun hidangan resepsi sesuai jumlah tamu, tanggal, dan konsep acara.",
    image: "/images/tumpeng.jpg",
    highlights: ["Pilihan prasmanan", "Menu pendamping", "Bantu pilih jumlah porsi"],
  },
  "catering-kantor-surabaya": {
    title: "Paket Catering Kantor Surabaya",
    summary: "Nasi kotak dan sajian meeting untuk kebutuhan kantor, rapat, dan acara tim.",
    image: "/images/nasi-kotak.jpg",
    highlights: ["Nasi kotak", "Coffee break", "Atur jadwal pengiriman"],
  },
  "catering-aqiqah-surabaya": {
    title: "Paket Aqiqah Surabaya",
    summary: "Pilihan menu untuk acara aqiqah yang dapat disesuaikan dengan kebutuhan keluarga.",
    image: "/images/ayam-canton.jpg",
    highlights: ["Paket keluarga", "Pilihan nasi box", "Bantu pilih jumlah porsi"],
  },
  "nasi-kotak-surabaya": {
    title: "Nasi Kotak Surabaya",
    summary: "Pilih isi nasi kotak untuk rapat, pengajian, syukuran, atau acara keluarga.",
    image: "/images/nasi-kotak.jpg",
    highlights: ["Pilihan lauk", "Porsi sesuai acara", "Pesan sesuai jadwal"],
  },
  "tumpeng-surabaya": {
    title: "Paket Tumpeng Surabaya",
    summary: "Tumpeng untuk syukuran dan perayaan dengan pilihan pendamping sesuai acara.",
    image: "/images/tumpeng.jpg",
    highlights: ["Tumpeng untuk perayaan", "Menu pendamping", "Bantu pilih jumlah porsi"],
  },
} as const;

export type PackagePageSlug = keyof typeof PACKAGE_PAGES;

export function isPackagePageSlug(slug: string): slug is PackagePageSlug {
  return slug in PACKAGE_PAGES;
}
