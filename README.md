# Kelana

Desktop-first + responsive group **trip-planning** web app for Indonesian travellers —
day-by-day itinerary, versioned budgets, expense log, packing checklist, per-day/activity
outfits, member roles, a public read-only share view, and a marketing landing page.
All copy is Bahasa Indonesia; money is Rupiah (`Rp 1.234.000`).

Rebuilt from the design handoff in `../jalan-design-handoff/`. See [PLAN.md](PLAN.md) for the
full build plan and phase log.

## Stack
- **Nuxt 4** (`app/` srcDir) + TypeScript, SSR on
- **Pinia** + `pinia-plugin-persistedstate` (state persists to `localStorage`; no backend yet)
- **UnoCSS** (`presetWind3` + `presetIcons`/Lucide) — design tokens in `uno.config.ts`
- **Reka UI** for accessible primitives (dialogs, selects, checkboxes)
- **@nuxt/fonts** (Plus Jakarta Sans / Fraunces / IBM Plex Mono)

## Develop
```bash
pnpm install
pnpm dev        # http://localhost:3000
```
`pnpm build` for a production build, `pnpm preview` to run it.

> Note: font files download from Google at dev/build time and need network access.
> pnpm build-script approval + the `verifyDepsBeforeRun: false` pre-run skip live in
> `pnpm-workspace.yaml`.

## Structure
- `app/pages` — routes: `/` (landing), `/masuk` (login), `/beranda` (home), `/template`,
  `/arsip`, `/trip/[id]/[tab]`, `/share/[id]`
- `app/components/core` — reusable primitives; domain folders (`dashboard`, `days`, `budget`,
  `expenses`, `packing`, `outfit`, `members`, `overview`, `layout`, `overlay`)
- `app/stores` — `trips` (domain, persisted), `ui` (overlays/toast), `session` (auth stub)
- `app/utils` — `format`, `categories`, `derive` (derived data, never stored), `seed`, `motifs`
- `app/designs` — token CSS-var mirror, base styles, keyframes

## Known follow-ups
- Placeholder trip photos are unlicensed stand-ins — replace before shipping.
- Auth is a client-side stub; sharing is a static read-only view (no permissions/expiry).
- Currency/locale hardcoded to IDR / Bahasa Indonesia.
- In-browser visual QA pass still pending (validated so far via typecheck + production build).
