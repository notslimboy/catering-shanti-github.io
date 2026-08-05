export type EventPackageGuide = {
  slug: string;
  title: string;
  description: string;
  image: string;
  topic: string;
};

/**
 * Visual starting points for common catering occasions. These deliberately do
 * not represent sellable catalogue records: the actual price, minimum order,
 * and included menu still come from active packages in the dashboard.
 */
export const EVENT_PACKAGE_GUIDES: readonly EventPackageGuide[] = [
  {
    slug: "catering-pernikahan-surabaya",
    title: "Pernikahan & Resepsi",
    description: "Untuk akad, resepsi, dan makan bersama keluarga besar.",
    image: "/images/nasi-kotak.jpg",
    topic: "Pernikahan dan resepsi",
  },
  {
    slug: "catering-kantor-surabaya",
    title: "Kantor & Meeting",
    description: "Untuk rapat, pelatihan, seminar, dan coffee break.",
    image: "/images/paket-coffe-break.jpg",
    topic: "Kantor dan meeting",
  },
  {
    slug: "catering-aqiqah-surabaya",
    title: "Aqiqah & Khitanan",
    description: "Untuk acara keluarga, berbagi, dan doa bersama.",
    image: "/images/ayam-canton.jpg",
    topic: "Aqiqah dan khitanan",
  },
  {
    slug: "tumpeng-surabaya",
    title: "Tumpeng & Syukuran",
    description: "Untuk ulang tahun, syukuran, dan perayaan sederhana.",
    image: "/images/tumpeng.jpg",
    topic: "Tumpeng dan syukuran",
  },
  {
    slug: "prasmanan-acara-surabaya",
    title: "Prasmanan Acara",
    description: "Untuk makan bersama di acara keluarga atau komunitas.",
    image: "/images/beef.jpg",
    topic: "Prasmanan acara",
  },
  {
    slug: "nasi-kotak-surabaya",
    title: "Nasi Kotak & Snack Box",
    description: "Untuk konsumsi tamu, pengajian, dan acara yang praktis.",
    image: "/images/jajan-pasar.jpg",
    topic: "Nasi kotak dan snack box",
  },
];
