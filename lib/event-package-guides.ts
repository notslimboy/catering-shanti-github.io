export type EventPackageGuide = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
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
    title: "Pernikahan & resepsi",
    description: "Untuk akad, resepsi, dan makan bersama keluarga besar.",
    image: "/images/events/resepsi-pernikahan.webp",
    imagePosition: "center 58%",
    topic: "Pernikahan dan resepsi",
  },
  {
    slug: "catering-kantor-surabaya",
    title: "Kantor & meeting",
    description: "Untuk rapat, pelatihan, seminar, dan coffee break.",
    image: "/images/events/coffee-break.webp",
    imagePosition: "center 58%",
    topic: "Kantor dan meeting",
  },
  {
    slug: "catering-aqiqah-surabaya",
    title: "Aqiqah & khitanan",
    description: "Untuk acara keluarga, berbagi, dan doa bersama.",
    image: "/images/events/aqiqah.jpg",
    imagePosition: "center 58%",
    topic: "Aqiqah dan khitanan",
  },
  {
    slug: "tumpeng-surabaya",
    title: "Tumpeng & syukuran",
    description: "Untuk ulang tahun, syukuran, dan perayaan sederhana.",
    image: "/images/tumpeng-hero.webp",
    topic: "Tumpeng dan syukuran",
  },
  {
    slug: "prasmanan-acara-surabaya",
    title: "Prasmanan acara",
    description: "Untuk makan bersama di acara keluarga atau komunitas.",
    image: "/images/events/prasmanan-traditional.jpg",
    imagePosition: "center 35%",
    topic: "Prasmanan acara",
  },
  {
    slug: "nasi-kotak-surabaya",
    title: "Nasi kotak & snack box",
    description: "Untuk konsumsi tamu, pengajian, dan acara yang praktis.",
    image: "/images/nasi-kotak.jpg",
    topic: "Nasi kotak dan snack box",
  },
];
