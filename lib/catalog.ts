import "server-only";

import { MENU_ITEMS } from "@/constants/menu";

export type CatalogSelectionType = "menu" | "package" | "custom";
export type MenuType = "makanan" | "minuman" | "jajanan";

export type CatalogSelection = {
    type: CatalogSelectionType;
    id: string | null;
    slug: string | null;
    name: string;
    priceIdr: number | null;
    priceUnit: string | null;
    minimumServings: number | null;
};

export type PublicMenuItem = {
    id: string;
    legacyId: number | null;
    slug: string;
    name: string;
    category: string;
    menuType: MenuType;
    priceIdr: number | null;
    tag: string | null;
    description: string | null;
    imagePath: string | null;
    featured: boolean;
    sortOrder: number;
};

// Kept for the static package landing pages. Packages are not stored in
// Supabase for this project.
export type PublicPackage = {
    id: string;
    slug: string;
    name: string;
    summary: string | null;
    includedItems: string[];
    priceFromIdr: number | null;
    priceUnit: string | null;
    minimumServings: number | null;
    imagePath: string | null;
    featured: boolean;
    sortOrder: number;
    category: {
        id: string;
        slug: string;
        name: string;
    } | null;
};

function priceToIdr(price: string) {
    const digits = price.replace(/[^0-9]/g, "");
    return digits ? Number(digits) : null;
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

const localMenuItems: PublicMenuItem[] = MENU_ITEMS.map((item, index) => ({
    id: String(item.id),
    legacyId: item.id,
    slug: slugify(item.name),
    name: item.name,
    category: item.category,
    menuType: item.filterCategory,
    priceIdr: priceToIdr(item.price),
    tag: item.tag || null,
    description: item.description,
    imagePath: item.image,
    featured: index < 4,
    sortOrder: index + 1,
}));

function matchesMenu(item: PublicMenuItem, identifier: string) {
    return item.id === identifier || item.slug === identifier || String(item.legacyId) === identifier;
}

function asSelection(item: PublicMenuItem): CatalogSelection {
    return {
        type: "menu",
        id: item.id,
        slug: item.slug,
        name: item.name,
        priceIdr: item.priceIdr,
        priceUnit: "per porsi",
        minimumServings: 20,
    };
}

/** The public menu always comes from the source code and is deployed with the site. */
export async function getActiveMenuItems(): Promise<PublicMenuItem[]> {
    return localMenuItems;
}

/** Package service pages are static; Supabase does not store their catalogue. */
export async function getActivePackages(): Promise<PublicPackage[]> {
    return [];
}

/**
 * Looks up the chosen local menu on the server so prices from the browser are
 * never trusted. Supabase is deliberately used only by the order persistence
 * layer.
 */
export async function resolveCatalogSelection(
    type: CatalogSelectionType,
    identifier?: string
): Promise<CatalogSelection | null> {
    if (type === "custom") {
        return {
            type,
            id: null,
            slug: null,
            name: "Kebutuhan custom",
            priceIdr: null,
            priceUnit: null,
            minimumServings: 20,
        };
    }

    if (!identifier || type !== "menu") return null;

    const localItem = localMenuItems.find((item) => matchesMenu(item, identifier));
    return localItem ? asSelection(localItem) : null;
}
