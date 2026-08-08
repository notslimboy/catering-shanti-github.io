export type PackageCollectionGroup = "regional" | "event";

export type PackageCollection = {
  id: string;
  slug: string;
  name: string;
  group: PackageCollectionGroup;
  description: string;
  sortOrder: number;
};

export type PackageCatalogueItem = {
  id: string;
  slug: string;
  collectionId: string;
  name: string;
  summary: string;
  includedItems: readonly string[];
  signatureItems: readonly string[];
  sortOrder: number;
  photoStatus: "pending";
};

export const PACKAGE_COLLECTIONS: readonly PackageCollection[] = [
  { id: "chinese-food", slug: "chinese-food", name: "Chinese Food", group: "regional", description: "Kumpulan paket Chinese Food.", sortOrder: 2 },
  { id: "sambelan", slug: "sambelan", name: "Sambelan", group: "regional", description: "Kumpulan paket Sambelan.", sortOrder: 5 },
  { id: "jawa-tengah", slug: "jawa-tengah", name: "Jawa Tengah", group: "regional", description: "Kumpulan paket Jawa Tengah.", sortOrder: 7 },
  { id: "jawa-timur", slug: "jawa-timur", name: "Jawa Timur", group: "regional", description: "Kumpulan paket Jawa Timur.", sortOrder: 6 },
  { id: "jakarta", slug: "jakarta", name: "Jakarta", group: "regional", description: "Kumpulan paket Jakarta.", sortOrder: 8 },
  { id: "wedding-package", slug: "wedding-package", name: "Wedding Package", group: "event", description: "Kumpulan paket Wedding Package.", sortOrder: 1 },
  { id: "traditional-package", slug: "traditional-package", name: "Traditional Package", group: "event", description: "Kumpulan paket Traditional Package.", sortOrder: 4 },
  { id: "menu-ndeso", slug: "menu-ndeso", name: "Menu Ndeso", group: "event", description: "Kumpulan paket Menu Ndeso.", sortOrder: 3 },
] as const;

function packageItem(
  collectionId: string,
  name: string,
  signatureItems: readonly string[],
  includedItems: readonly string[],
  sortOrder: number,
): PackageCatalogueItem {
  const slug = `${collectionId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  return {
    id: `${collectionId}--${slug}`,
    slug,
    collectionId,
    name,
    summary: `Paket dengan ${signatureItems.join(", ")}.`,
    includedItems,
    signatureItems,
    sortOrder,
    photoStatus: "pending",
  };
}

export const PACKAGE_CATALOGUE: readonly PackageCatalogueItem[] = [
  packageItem("chinese-food", "Paket Ekonomis A", ["Cah sayur", "Ayam", "Fuyung hai"], ["Nasi putih", "Cah sayur", "Ayam", "Fuyung hai", "Mie", "Es buah", "Air mineral"], 1),
  packageItem("chinese-food", "Paket Ekonomis B", ["Sup", "Ayam", "Kakap"], ["Nasi putih", "Sup", "Ayam", "Kakap", "Mie", "Es Manado", "Air mineral"], 2),
  packageItem("chinese-food", "Paket Ekonomis C", ["Sup", "Ayam", "Rolade", "Fuyung hai"], ["Nasi putih", "Sup", "Ayam", "Rolade", "Fuyung hai", "Mie", "Es kuwut", "Air mineral"], 3),

  packageItem("sambelan", "Paket Sambelan A", ["Cah kangkung", "Gurami asam manis", "Ayam bakar", "Sambal"], ["Nasi putih", "Cah kangkung", "Gurami asam manis", "Tempe dan tahu goreng", "Ayam bakar", "Sambal", "Lalapan", "Es degan", "Kerupuk", "Air mineral"], 1),
  packageItem("sambelan", "Paket Sambelan B", ["Tumis sawi putih toge", "Gurami bakar", "Lele goreng", "Sambal terong"], ["Nasi putih", "Tumis sawi putih toge", "Gurami bakar", "Lele goreng", "Sambal terong", "Tahu tempe goreng", "Oseng-oseng pedho", "Es buah", "Kerupuk", "Air mineral"], 2),
  packageItem("sambelan", "Paket Sambelan C", ["Cumi lombok ijo", "Udang tepung", "Serundeng", "Sambal pencit"], ["Nasi putih", "Cumi lombok ijo", "Udang tepung", "Serundeng", "Sambal pencit", "Mie goreng", "Peyek", "Es buah", "Air mineral"], 3),

  packageItem("jawa-tengah", "Paket Jawa Tengah A", ["Ayam bumbu opor", "Sambal goreng krecek", "Gudeg", "Telur bacem"], ["Nasi putih", "Ayam bumbu opor", "Sambal goreng krecek", "Gudeg", "Telur bacem", "Tahu bacem", "Kerupuk", "Es cao", "Air mineral"], 1),
  packageItem("jawa-tengah", "Paket Jawa Tengah B", ["Soto Boyolali", "Tempe mendoan", "Sate paru", "Sate telur puyuh"], ["Nasi putih", "Soto Boyolali", "Tempe mendoan", "Sate paru", "Sate telur puyuh", "Sambal", "Kerupuk", "Es degan", "Air mineral"], 2),
  packageItem("jawa-tengah", "Paket Jawa Tengah C", ["Nasi liwet", "Tahu tempe bacem", "Ayam goreng", "Telur opor"], ["Nasi liwet", "Tahu tempe bacem", "Ayam goreng", "Telur opor", "Sambal goreng teri kacang", "Kerupuk puli", "Sambal", "Es dawet", "Air mineral"], 3),

  packageItem("jawa-timur", "Paket Jawa Timur A", ["Sayur bening", "Pepes tongkol", "Botok tahu tempe", "Ayam bumbu Bali"], ["Nasi putih", "Sayur bening", "Pepes tongkol", "Botok tahu tempe", "Dadar jagung", "Ayam bumbu Bali", "Es degan jeruk", "Sambal", "Kerupuk", "Air mineral"], 1),
  packageItem("jawa-timur", "Paket Jawa Timur B", ["Asem-asem buncis daging", "Pepes udang", "Tahu tempe bacem", "Ayam goreng"], ["Nasi putih", "Asem-asem buncis daging", "Pepes udang", "Tahu tempe bacem", "Dadar jagung", "Ayam goreng", "Es buah", "Sambal", "Kerupuk", "Air mineral"], 2),
  packageItem("jawa-timur", "Paket Jawa Timur C", ["Sayur asem Jakarta", "Pepes tongkol", "Tahu tempe bacem dan botok telur asin", "Ayam goreng"], ["Nasi putih", "Sayur asem Jakarta", "Pepes tongkol", "Tahu tempe bacem dan botok telur asin", "Dadar jagung", "Ayam goreng", "Es buah", "Sambal", "Kerupuk", "Air mineral"], 3),
  packageItem("jawa-timur", "Paket Jawa Timur D", ["Nasi atau lontong", "Sayur manisa", "Opor ayam", "Sambal goreng kentang"], ["Nasi atau lontong", "Sayur manisa", "Opor ayam", "Sambal goreng kentang", "Sambal goreng cecek", "Telur petis", "Es degan", "Kerupuk", "Air mineral"], 4),
  packageItem("jawa-timur", "Paket Jawa Timur E", ["Pecel Madiun", "Empal goreng", "Serundeng", "Dadar jagung"], ["Nasi putih", "Pecel Madiun", "Empal goreng", "Serundeng", "Dadar jagung", "Oseng tahu tempe", "Lalapan", "Peyek", "Es dawet", "Air mineral"], 5),
  packageItem("jawa-timur", "Paket Jawa Timur F", ["Ayam bakar", "Sayur lodeh", "Urap-urap", "Trancam"], ["Nasi putih", "Ayam bakar", "Sayur lodeh", "Tahu tempe terik", "Urap-urap", "Trancam", "Telur pindang", "Ikan asin", "Peyek", "Es cao", "Air mineral"], 6),

  packageItem("jakarta", "Paket Jakarta A", ["Nasi uduk", "Ayam goreng", "Sambal goreng kentang", "Perkedel"], ["Nasi uduk", "Ayam goreng", "Sambal goreng kentang", "Sambal goreng tempe kacang", "Perkedel", "Telur dadar", "Kerupuk", "Es campur", "Air mineral"], 1),
  packageItem("jakarta", "Paket Jakarta B", ["Nasi putih", "Sup", "Ayam goreng", "Rolade daging"], ["Nasi putih", "Sup", "Ayam goreng", "Perkedel", "Rolade daging", "Sambal kecap", "Kerupuk", "Es buah", "Air mineral"], 2),

  packageItem("wedding-package", "Melati", ["Aneka sup", "Nasi putih", "Aneka olahan ayam", "Aneka olahan seafood"], ["Aneka sup", "Nasi putih", "Aneka olahan nasi", "Aneka olahan ayam", "Aneka olahan seafood", "Aneka olahan sayur", "Air mineral", "Aneka olahan es"], 1),
  packageItem("wedding-package", "Mawar", ["Aneka sup", "Nasi putih", "Aneka olahan ayam", "Olahan seafood"], ["Aneka sup", "Nasi putih", "Aneka olahan nasi", "Aneka olahan ayam", "Olahan seafood", "Aneka olahan sayur", "Aneka olahan mie", "Air mineral", "Aneka olahan es", "Buah potong"], 2),
  packageItem("wedding-package", "Anggrek", ["Aneka sup", "Nasi putih", "Olahan seafood", "Olahan daging"], ["Aneka sup", "Nasi putih", "Aneka olahan nasi", "Aneka olahan ayam", "Olahan seafood", "Olahan daging", "Aneka olahan sayur", "Aneka olahan mie", "Air mineral", "Aneka olahan es", "Pudding"], 3),
  packageItem("wedding-package", "Aster", ["Aneka sup", "Nasi putih", "Olahan seafood", "Olahan daging"], ["Aneka sup", "Nasi putih", "Aneka olahan nasi", "Aneka olahan ayam", "Olahan seafood", "Olahan daging", "Aneka olahan sayur", "Aneka olahan mie", "Air mineral", "Aneka olahan es", "Pudding", "Es puter", "Salad buah"], 4),
  packageItem("wedding-package", "Kenanga", ["Aneka sup", "Nasi putih", "Olahan seafood", "Olahan daging"], ["Aneka sup", "Nasi putih", "Aneka olahan nasi", "Aneka olahan ayam", "Olahan seafood", "Olahan daging", "Aneka olahan sayur", "Aneka olahan mie", "Air mineral", "Aneka olahan es", "Pudding", "Es puter", "Salad buah"], 5),

  packageItem("traditional-package", "Jawa Timur A", ["Sayur lodeh", "Urap-urap", "Kotokan tahu tempe", "Aneka olahan ayam"], ["Nasi putih", "Sayur lodeh", "Urap-urap", "Kotokan tahu tempe", "Telur pindang", "Trancam", "Aneka olahan ayam", "Aneka olahan es", "Air mineral", "Peyek"], 1),
  packageItem("traditional-package", "Jawa Timur B", ["Asem-asem daging", "Pepes udang", "Tahu tempe bacem", "Bakwan jagung"], ["Nasi putih", "Asem-asem daging", "Pepes udang", "Tahu tempe bacem", "Bakwan jagung", "Aneka olahan ayam", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 2),
  packageItem("traditional-package", "Jawa Tengah A", ["Opor ayam", "Sambal goreng krecek", "Gudeg", "Telur pindang"], ["Nasi putih", "Opor ayam", "Sambal goreng krecek", "Gudeg", "Telur pindang", "Tahu tempe bacem", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 3),
  packageItem("traditional-package", "Jawa Tengah B", ["Soto Boyolali", "Tempe mendoan", "Sate paru", "Sate telur puyuh"], ["Nasi putih", "Soto Boyolali", "Tempe mendoan", "Sate paru", "Sate telur puyuh", "Perkedel", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 4),
  packageItem("traditional-package", "Jawa Timur C", ["Sayur asem", "Pepes tongkol", "Tahu tempe bacem", "Aneka botok"], ["Nasi putih", "Sayur asem", "Pepes tongkol", "Tahu tempe bacem", "Aneka botok", "Bakwan jagung", "Aneka olahan ayam", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 5),
  packageItem("traditional-package", "Jawa Timur D", ["Nasi putih atau lontong", "Sayur lodeh manisa", "Opor ayam", "Telur petis"], ["Nasi putih atau lontong", "Sayur lodeh manisa", "Opor ayam", "Sambal goreng kentang", "Sambal goreng cecek", "Telur petis", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 6),
  packageItem("traditional-package", "Jakarta A", ["Nasi uduk", "Sambal goreng kentang", "Sambal goreng tempe kacang", "Perkedel"], ["Nasi uduk", "Sambal goreng kentang", "Sambal goreng tempe kacang", "Perkedel", "Telur dadar", "Aneka olahan ayam", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 7),
  packageItem("traditional-package", "Jakarta B", ["Nasi putih", "Sup", "Aneka olahan ayam", "Perkedel"], ["Nasi putih", "Sup", "Aneka olahan ayam", "Perkedel", "Rolade daging", "Aneka olahan es", "Air mineral", "Kerupuk", "Sambal"], 8),

  packageItem("menu-ndeso", "Ndeso 1", ["Sayur lodeh ontong", "Paru goreng", "Pepes tongkol", "Tempe mendol"], ["Nasi putih", "Sayur lodeh ontong", "Paru goreng", "Pepes tongkol", "Tempe mendol", "Ikan asin", "Aneka olahan es", "Air mineral", "Kerupuk"], 1),
  packageItem("menu-ndeso", "Ndeso 2", ["Oseng pare", "Orek tempe", "Gimbal udang", "Ayam goreng Laos"], ["Nasi putih", "Oseng pare", "Orek tempe", "Gimbal udang", "Ayam goreng Laos", "Bakwan jagung", "Aneka olahan es", "Air mineral", "Kerupuk"], 2),
  packageItem("menu-ndeso", "Ndeso 3", ["Sayur lombok ijo", "Telur dadar Padang", "Bakwan jagung", "Pindang tepung"], ["Nasi putih", "Sayur lombok ijo", "Telur dadar Padang", "Bakwan jagung", "Pindang tepung", "Oseng kikil", "Aneka olahan es", "Air mineral", "Kerupuk"], 3),
  packageItem("menu-ndeso", "Ndeso 4", ["Jangan bobor", "Tempe mendol", "Bandeng presto", "Bali telur"], ["Nasi putih", "Jangan bobor", "Tempe mendol", "Bandeng presto", "Bali telur", "Aneka olahan es", "Air mineral", "Kerupuk"], 4),
] as const;

const packageByCollectionAndSlug = new Map(
  PACKAGE_CATALOGUE.map((item) => [`${item.collectionId}/${item.slug}`, item]),
);

export function getAllPackageCollections() {
  return [...PACKAGE_COLLECTIONS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAllPackages() {
  return PACKAGE_CATALOGUE;
}

export function getPackagesByCollection(collectionIdOrSlug: string) {
  const collection = PACKAGE_COLLECTIONS.find((item) => item.id === collectionIdOrSlug || item.slug === collectionIdOrSlug);
  return collection ? PACKAGE_CATALOGUE.filter((item) => item.collectionId === collection.id) : [];
}

export function getPackageByCollectionAndSlug(collectionIdOrSlug: string, packageSlug: string) {
  const collection = PACKAGE_COLLECTIONS.find((item) => item.id === collectionIdOrSlug || item.slug === collectionIdOrSlug);
  return collection ? packageByCollectionAndSlug.get(`${collection.id}/${packageSlug}`) ?? null : null;
}
