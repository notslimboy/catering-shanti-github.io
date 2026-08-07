# Package Catalogue MVP

## Goal

Add a trustworthy package catalogue beneath the existing **Jenis acara** section so customers can browse catering styles, inspect a package, and start a WhatsApp consultation with the chosen package prefilled.

## Scope

- Source package content from the curated `menu-paket.md` inventory, but normalize it into typed static data. The application must not parse Markdown at runtime.
- Keep the existing event-guide cards, single-menu catalogue, route-backed `/pesan` flow, and broad `/paket/[slug]` SEO pages intact.
- Do not publish prices, minimum orders, availability promises, or package-specific photography until confirmed.

## Information architecture

### `/menu`

Immediately after **Jenis acara**, add **Pilih paket berdasarkan selera**:

1. A brief explanation that customers can browse package compositions before asking for availability.
2. Lightweight filters: **Semua**, **Hidangan daerah**, and **Paket acara**.
3. Collection previews for Chinese Food, Sambelan, Jawa Tengah, Jawa Timur, Jakarta, Wedding Package, Traditional Package, and Menu Ndeso.
4. At most three package cards per collection and a link to view the complete collection.

### Collection page

Use `/paket-menu/[collectionSlug]` for the complete, grouped package list. This keeps the landing page concise and avoids a grid of every variant.

### Package detail page

Use `/paket-menu/[collectionSlug]/[packageSlug]` for the complete inclusion list, photo/gallery when available, and CTAs. This route family is intentionally separate from existing `/paket/[slug]` service pages.

## Card design

Each package card has:

- A 4:3 image area.
- Collection label and package name.
- Two or three signature inclusions.
- An item-count cue such as `+6 hidangan lainnya`.
- A single primary action: **Lihat detail**.

Photo rules:

- Exact package photo: display normally.
- Representative food photo: visibly label **Contoh sajian**.
- No suitable photo: use a calm placeholder labelled **Foto menu menyusul**.

Cards do not show full 7–13 item package lists, prices, or competing primary CTAs.

## Interaction and CTA flow

Use dedicated detail pages rather than a package-detail overlay. Package menus are long, will later need a gallery, should be shareable, and must not stack on the existing `/pesan` overlay.

MVP flow:

1. Customer opens a collection.
2. Customer opens a package detail page.
3. Primary CTA is **Tanyakan paket via WhatsApp**, prefilled with the collection and package identity.

Once packages are resolved server-side as first-class selections:

- Primary CTA becomes **Pilih paket** and opens `/pesan?intent=package&packageId=<stable-id>`.
- WhatsApp remains a secondary action.

## Data requirements

Create typed static records with stable IDs and category-qualified slugs. Each record needs:

- `id`, `slug`, `collectionId`, `name`, `summary`
- `includedItems`, `signatureItems`, `sortOrder`
- `image`/`gallery` and `photoStatus`
- publication state

Names such as `Jawa Timur A` and `Jakarta B` occur in multiple collections, so labels must not become global IDs or unqualified URLs.

## Delivery phases

1. Normalize catalogue data and add the catalogue/collection/detail UI with honest no-photo states and WhatsApp consultation CTA.
2. Add verified package photos and galleries incrementally.
3. Add server-side package resolution, order snapshots, and the `/pesan` selection CTA.

## Explicitly out of scope

- A 34-card equal-weight landing-page grid.
- Package detail in a modal, drawer, or overlay.
- Unlabelled generic food images presented as exact package photos.
- Runtime Markdown parsing.
- Order-promising CTA before package selection is supported by the server.
- A dedicated SEO page for every package before each page has verified, differentiated content.
