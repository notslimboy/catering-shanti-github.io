import { EVENT_PACKAGE_GUIDES } from "@/lib/event-package-guides";
import { PACKAGE_PAGES } from "@/lib/package-pages";
import type { PublicMenuItem, PublicPackage } from "@/lib/catalog";

export type OrderIntent = {
  selectionType: "menu" | "package" | "custom";
  selectionId: string;
  customRequest?: string;
  label: string;
  description: string;
  browseHref: string;
  source: string;
  hasConflict: boolean;
  customContext?: OrderCustomContext;
};

export type OrderCustomContext = {
  type: "event" | "package";
  id: string;
  title: string;
  topic?: string;
};

type Candidate = OrderIntent & { key: string };

function findMenu(menuItems: PublicMenuItem[], identifier: string | null) {
  return identifier
    ? menuItems.find((item) => item.id === identifier || item.slug === identifier || String(item.legacyId) === identifier)
    : undefined;
}

function findPackage(packages: PublicPackage[], identifier: string | null) {
  return identifier
    ? packages.find((item) => item.id === identifier || item.slug === identifier)
    : undefined;
}

function packageContext(packages: PublicPackage[], identifier: string | null) {
  const activePackage = findPackage(packages, identifier);
  if (activePackage) return { id: activePackage.id, label: activePackage.name, slug: activePackage.slug };
  if (identifier && identifier in PACKAGE_PAGES) {
    const page = PACKAGE_PAGES[identifier as keyof typeof PACKAGE_PAGES];
    return { id: identifier, label: page.title, slug: identifier };
  }
  return null;
}

function customCandidate(customRequest = "", label = "Kebutuhan custom", description = "Ceritakan menu, jumlah porsi, tanggal, dan lokasi acara."): Candidate {
  return {
    key: "custom",
    selectionType: "custom",
    selectionId: "custom",
    customRequest: customRequest || undefined,
    label,
    description,
    browseHref: "/menu#custom",
    source: "custom",
    hasConflict: false,
  };
}

export function resolveOrderIntent(
  params: URLSearchParams,
  menuItems: PublicMenuItem[],
  packages: PublicPackage[],
): OrderIntent {
  const intent = params.get("intent");
  const menuId = params.get("menuId");
  const packageId = params.get("packageId") ?? params.get("package");
  const eventSlug = params.get("event");
  const legacyCustom = params.get("request") === "custom";
  const topic = params.get("topic")?.trim() ?? "";
  const candidates: Candidate[] = [];

  const menu = findMenu(menuItems, menuId);
  const packageData = packageContext(packages, packageId);
  const event = eventSlug ? EVENT_PACKAGE_GUIDES.find((guide) => guide.slug === eventSlug) : undefined;

  const addMenu = () => {
    if (!menu) return;
    candidates.push({
      key: `menu:${menu.id}`,
      selectionType: "menu",
      selectionId: menu.id,
      label: menu.name,
      description: menu.description || "Menu satuan untuk disusun sesuai kebutuhan acara.",
      browseHref: "/menu#menu-satuan",
      source: "menu",
      hasConflict: false,
    });
  };
  const addPackageConsultation = () => {
    if (!packageData) return;
    candidates.push({
      ...customCandidate(undefined, packageData.label, "Paket ini perlu dikonfirmasi lewat WhatsApp sebelum dipesan."),
      key: `package:${packageData.slug}`,
      browseHref: "/menu#paket",
      source: "package_consultation",
      customContext: { type: "package", id: packageData.slug, title: packageData.label },
    });
  };
  const addEvent = () => {
    if (!event) return;
    candidates.push({
      ...customCandidate(undefined, event.title, `${event.description} Ceritakan detail menu dan jumlah porsinya.`),
      key: `event:${event.slug}`,
      browseHref: "/menu#jenis-acara",
      source: "event_guide",
      customContext: { type: "event", id: event.slug, title: event.title, topic: event.topic },
    });
  };
  const addCustom = () => candidates.push(customCandidate(topic));

  if (intent === "menu") addMenu();
  else if (intent === "package") addPackageConsultation();
  else if (intent === "custom") {
    if (event) addEvent();
    else addCustom();
  }

  if (intent === null) {
    if (legacyCustom) addCustom();
    if (menu) addMenu();
    if (packageData) addPackageConsultation();
  } else {
    if (legacyCustom) addCustom();
    if (intent !== "menu" && menu) addMenu();
    if (intent !== "package" && packageData) addPackageConsultation();
    if (intent !== "custom" && event) addEvent();
  }

  const uniqueCandidates = [...new Map(candidates.map((candidate) => [candidate.key, candidate])).values()];
  if (uniqueCandidates.length === 1) return uniqueCandidates[0];
  if (uniqueCandidates.length > 1) {
    return {
      ...customCandidate("", "Pilihan perlu dicek", "Ada beberapa pilihan di tautan ini. Pilih menu atau ceritakan kebutuhan acara supaya detailnya tidak tertukar."),
      hasConflict: true,
      source: "conflict",
    };
  }

  return {
    ...customCandidate("", "Pilih menu atau ceritakan kebutuhan", "Tautan pilihan belum dikenali. Pilih menu atau ceritakan kebutuhan acara di bawah."),
    hasConflict: Boolean(intent || menuId || packageId || eventSlug || legacyCustom),
    source: "unresolved",
  };
}
