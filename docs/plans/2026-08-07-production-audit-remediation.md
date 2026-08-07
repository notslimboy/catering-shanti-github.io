# Production Audit Remediation Plan

## Status

Planned. No remediation code has been applied from this plan.

## Source and goals

This plan summarizes the production Vercel Lighthouse audit and Council review.

Observed production audit signals:

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 82 | 99 |
| Accessibility | 97 | 97 |
| LCP | 4.4 s | — |
| FCP | 1.5 s | — |
| Speed Index | 4.2 s | — |
| TBT | 70 ms | — |
| CLS | 0 | — |
| Agentic Browsing | 1/2 | 1/2 |

Reported opportunities include render-blocking requests (450 ms on mobile), image delivery (126 KiB mobile / 131 KiB desktop), legacy JavaScript (14 KiB), unused desktop JavaScript (107 KiB), forced reflow, prohibited ARIA attributes, and a malformed accessibility tree.

Goals:

1. Remove confirmed accessibility-tree and invalid-ARIA failures.
2. Reduce production mobile LCP from 4.4 s toward 2.5 s without harming CLS, conversion flows, or SEO.
3. Make performance changes only when the Lighthouse trace identifies the responsible resource or code path.

Non-goals:

- Chasing a Lighthouse score of 100.
- Broad asset conversion or JavaScript removal without attribution.
- Changing content, design, route structure, WhatsApp/order flow, or metadata as a side effect.

## Phase 0 — Extract the evidence from the existing production audit

Before changing code, open the Lighthouse report and capture these exact details for the audited route and deployment:

1. **LCP element**
   - The exact DOM selector.
   - Whether it is an image, heading, or another element.
   - LCP breakdown: TTFB, load delay, load duration, and render delay.
2. **If LCP is an image**
   - Image request URL and initiator.
   - Response MIME type, transfer size, cache status, selected `srcset` candidate, rendered size, intrinsic size, DPR, and `sizes` value.
   - Whether the preload URL matches the image request URL exactly.
3. **Render-blocking request**
   - Exact URL(s), request duration, and Lighthouse source location.
4. **Accessibility failures**
   - Lighthouse/axe rule ID, selector, outer HTML, and actual accessibility-tree state for each violation.
5. **Forced reflow and JavaScript**
   - Performance trace call stack for the forced reflow.
   - Coverage or bundle attribution for the 107 KiB unused JavaScript and 14 KiB legacy JavaScript findings.

Keep the report JSON/HTML, trace, and HAR with the deployment URL and commit SHA. These are the comparison baseline for every later change.

### Evidence gates

- Do not change the hero image until the LCP element confirms that it is the hero image.
- Do not defer CSS, fonts, analytics, or JavaScript until the report names the blocking resource/chunk.
- Do not remove ARIA attributes just to silence an audit; replace each invalid pattern with correct semantics.

## Phase 1 — Fix confirmed accessibility semantics

This is the first implementation batch once Lighthouse/axe provides the exact failing selectors.

### Likely targets to validate

| Area | Likely file(s) | Intended fix direction |
| --- | --- | --- |
| Package navigation dropdown | `components/SiteHeader.tsx` | Treat it as a navigation disclosure: button with `aria-expanded` and `aria-controls`, followed by a normal link list. Avoid `menu`/`menuitem` roles unless full menu keyboard behavior is implemented. |
| Package filters | `components/PackageCataloguePreview.tsx`, `components/HomePackagePreview.tsx` | Use ordinary filter buttons, or fully implement the ARIA tabs pattern with tabpanels and keyboard behavior. |
| Order selector | `components/OrderForm.tsx` | Prefer native radio/select controls, or implement a complete listbox with valid option/group roles and keyboard state. |
| Duplicate customer-logo track | `components/CustomerLogoWall.tsx`, `components/CustomerLogoTooltip.tsx` | Ensure the `aria-hidden` duplicate has no focusable descendants and no broken described-by relationship. |
| Rating labels | `components/GoogleReviewsSection.tsx` | Provide one valid accessible text label for the rating while decorative stars remain hidden from the tree. |

### Verification

- Lighthouse/axe: zero prohibited-ARIA failures.
- Accessibility Tree: no malformed branch and no focusable descendant inside hidden content.
- Keyboard test: Tab, Enter, Space, Escape, arrows where appropriate, mobile navigation, package filters, gallery dialog, and order selection.
- Screen-reader smoke test: header dropdown, filter controls, ratings, logo wall, dialog, and ordering flow announce names and state correctly.
- Agentic Browsing: target 2/2.

## Phase 2 — Fix the measured mobile LCP bottleneck

Apply exactly one branch below, based on Phase 0 attribution.

### Branch A: LCP is a hero image

Likely routes/components to inspect:

- Home hero: `app/page.tsx`
- Menu hero: `app/menu/page.tsx`
- Daily catering hero: `app/catering-harian/page.tsx`
- Dynamic package hero: `app/paket/[slug]/page.tsx`
- Image configuration: `next.config.ts`

Implementation checklist:

1. Keep exactly one preload for the confirmed LCP image on each route.
2. Ensure the preload request and the final `next/image` request select the same candidate.
3. Correct `sizes` and source dimensions only when the selected candidate is larger than the rendered/DPR requirement.
4. Confirm production Vercel responses actually use the intended modern format (AVIF/WebP) before changing sources.
5. Re-encode or replace only the image named by the audit when its transfer size is materially oversized.
6. Preserve the current image container dimensions/aspect ratio so CLS remains 0.

### Branch B: LCP is text, font, TTFB, or data wait

- **High TTFB:** inspect Vercel cache headers, route rendering, and noncritical server dependencies. The homepage optional review snapshot is a candidate to keep static, cache independently, or defer.
- **High load delay:** inspect discovery/preload and the named dependency chain before changing images.
- **High render delay:** inspect the named font, stylesheet, hydration, or main-thread work. Do not asynchronously load core CSS without proving that it avoids FOUC and CLS.

### LCP verification

After deploying one isolated LCP change, run three comparable cold mobile Lighthouse audits.

Success criteria:

- Median LCP improves by at least 20% from 4.4 s or reaches 2.5 s or lower.
- CLS remains 0.
- TBT remains 100 ms or lower.
- FCP does not regress by more than 0.2 s from 1.5 s.
- No duplicate/unused preload is reported.
- The image-delivery opportunity for the confirmed LCP asset is removed or reduced below 25 KiB.

Stop and revert the change if the score improves but actual LCP/transfer does not, or if visual quality, CLS, CTA visibility, or SEO regresses.

## Phase 3 — Trace-backed follow-up work

These are not first-batch tasks.

### Render-blocking requests

Only act after the report names the URL:

- Check global CSS and animation CSS usage in `app/globals.css`.
- Check actual font weights and generated font requests in `app/layout.tsx`.
- Verify analytics, theme initialization, map iframe, and review requests are not competing with the LCP path.
- Avoid deferring page-critical CSS or changing font loading blindly.

### Forced reflow

Only fix if the trace attributes meaningful time to a call stack:

- `components/CustomerLogoTooltip.tsx` geometry reads.
- `components/DailyMenuGallery.tsx` zoom/pan geometry reads.

Batch layout reads, avoid read-after-write sequences, and use `ResizeObserver` or cached dimensions where the trace supports it. Preserve tooltip placement and gallery interaction.

### Unused and legacy JavaScript

Prioritize only after bundle attribution. Candidate areas:

- `components/FaqSection.tsx` and Framer Motion.
- `components/GalleryMasonry.tsx` dialog/zoom viewer below the fold.
- `components/OrderForm.tsx` and its client-side form dependencies on the home route.
- Client-only cards that exist mainly for click tracking.
- Customer-logo interactions.

Prefer server-rendered display components and lazy-load only interaction-heavy, below-fold code. Do not defer the header, LCP image, essential navigation, or conversion-critical order/WhatsApp entry points. Legacy JavaScript is low priority unless the exact transform is application-controlled and browser support policy permits removal.

## Regression checklist after every batch

1. `npm run build`
2. `npm run lint`
3. Production Lighthouse comparison using the same route/profile.
4. Manual smoke test: `/`, `/menu`, `/catering-harian`, `/galeri`, `/pesan`, package collection pages, and package detail pages.
5. Verify WhatsApp links, order flow, package dropdown, gallery modal, FAQ, map, analytics, and dark/light theme behavior.
6. Confirm no metadata, structured-data, responsive-layout, or accessibility regression.

## Execution order

1. Capture Phase 0 evidence from the current Vercel audit.
2. Fix confirmed accessibility nodes in one isolated PR/commit.
3. Verify accessibility and Agentic Browsing.
4. Apply the correct Phase 2 LCP branch in a separate PR/commit.
5. Re-run production Lighthouse and compare metrics.
6. Profile Phase 3 items only if LCP remains above target or the trace identifies a meaningful bottleneck.
