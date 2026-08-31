# Jalan — Build Plan

Rebuild of the `design_handoff_jalan` prototype as a production app.

## Decisions (locked)
- **Stack:** **Nuxt 4** (scaffolded `nuxt@^4.5.2`; uses `app/` srcDir — components/pages/composables/stores/layouts/middleware/utils/designs all live under `app/`) + TypeScript, Pinia for state. Package manager: **pnpm**.
- **Persistence:** local only — Pinia state persisted to `localStorage` (`pinia-plugin-persistedstate`). No backend, no real auth in v1.
- **Rendering:** **SSR on** (Nuxt default). Server paints chrome/shell; the persisted trip store hydrates **client-side** after mount (localStorage has no server equivalent), so data-driven views are guarded with `import.meta.client` / `<ClientOnly>` to avoid hydration mismatch. Real server-side data fetch (server routes + `useAsyncData`) comes later — SSR now keeps that path open.
- **Routing:** nested tab routes `trip/[id]/[tab]`. Landing SSR under the marketing layout.
- **Icons:** UnoCSS `presetIcons` (`@iconify-json/lucide`) used directly as `<i class="i-lucide-plane" />` — no wrapper component.
- **Responsive:** desktop-first (match handoff at 1280–1600px), **plus** new mobile/tablet design (see Phase 6).
- **Styling:** UnoCSS (`@unocss/nuxt`) — `presetWind` (Tailwind-compatible utilities) + `presetIcons` (Lucide) + `presetTypography`. Design tokens live in the Uno `theme`; repeated patterns become `shortcuts`. Design tokens also mirrored as CSS custom properties for use inside primitives.
- **Components:** `reka-ui` for unstyled, accessible primitives — Dialog (drawers + modal), DropdownMenu/Popover (scope picker, nav menu), Select, Checkbox, Tabs, Toast, Progress — styled with UnoCSS. (Reka UI is the Vue successor to `radix-vue`; Radix Primitives itself is React-only.) Gives focus-trap, escape-to-close, and ARIA for free. Not using `shadcn-vue` — its bundled Tailwind styling would fight our tokens.
- **Language/format:** all copy stays Bahasa Indonesia; money `Rp 1.234.000` (dot thousands, no decimals); times `13.40`.

## Source-of-truth notes (HTML overrides README prose)
- **Primary CTA color is terracotta `#C85A28`**, not teal. Teal `#0E6E76` = active tabs, links, focus ring, active chips. (README's per-screen prose says teal buttons; the actual HTML + screenshots use `#C85A28`.)
- Top bar has a search field (`Cari trip atau tempat`) and an orange `+ Trip baru` button.
- `.Zone.Identifier` files in the handoff are Windows download metadata — ignore. `support.js` / `<x-dc>` runtime must **not** ship.
- Placeholder photos/covers are unlicensed stand-ins — flag for replacement before any public ship.

## Conventions
- **No `<style>` blocks, no bespoke class names.** Everything is UnoCSS utilities. Recurring patterns are promoted to Uno **`shortcuts`** (`card`, `pill`, `money`, `field`, `chip-active`…). Design tokens live in `uno.config.ts` `theme` (mirrored as CSS vars in `designs/tokens.css` for use inside primitives).
- **Class composition:** Vue's native `:class` array/object binding for conditionals; `utils/cn.ts` = thin `clsx` wrapper for composing utility strings passed into Reka UI. No `tailwind-merge` (Tailwind-specific, useless on Uno).
- **Component naming:** every file is `<folder>-<name>.vue`. Nuxt prefix-dedup then yields clean auto-imported names — `core/core-button.vue` → `<CoreButton>`, `budget/budget-add-item.vue` → `<BudgetAddItem>`, `dashboard/dashboard-hero.vue` → `<DashboardHero>`. No manual imports anywhere.
- **`core/`** = reusable primitives (Reka UI wrappers + presentational). Everything else is domain-scoped by folder.

## Project structure
```
nuxt.config.ts
app.vue
uno.config.ts                # presets (presetWind + presetIcons/lucide + presetTypography), theme (tokens), shortcuts
designs/
  reset.css                  # @unocss/reset (tailwind) + minimal base
  tokens.css                 # tokens mirrored as CSS custom properties
  base.css                   # body, focus-ring, font wiring, keyframes (riseIn/sheetIn/toastIn/slideOverIn)
public/img/                  # covers, photos, screenshots (placeholders → replace)
types/domain.ts              # Trip, Day, Activity, Budget, OutfitSet, ManualExpense, PackGroup
stores/
  trips.ts                   # trips[], patchTrip() immutable helper — PERSISTED
  session.ts                 # authed, current user — PERSISTED (authed only)
  ui.ts                      # overlays, drafts, toast — NOT persisted
composables/
  use-money.ts               # formatRupiah, formatTime, duration→"3 jam"/"45 menit"
  use-derived.ts             # expense list, category totals, over-budget, packing %, outfit resolution
  use-toast.ts               # flash(msg), 2200ms auto-dismiss
utils/
  cn.ts                      # clsx wrapper
  seed.ts                    # demo trips ported from prototype
layouts/
  marketing.vue              # landing chrome
  default.vue                # app chrome
components/
  core/       core-button, core-dialog (drawer + modal variants), core-input, core-select,
              core-checkbox, core-tabs, core-toast, core-popover, core-progress,
              core-pill, core-chip, core-card, core-avatar, core-status-pill, core-bar
  layout/     layout-top-bar, layout-trip-header, layout-tab-bar
  dashboard/  dashboard-hero, dashboard-trip-card, dashboard-filter-chips        # Beranda
  overview/   overview-today, overview-spend, overview-warnings, overview-rail   # Ringkasan
  days/       days-rail, days-timeline, days-activity-row, days-inline-form, days-empty, days-outfit-card
  budget/     budget-version-bar, budget-category-row, budget-add-item, budget-compare-matrix, budget-locked-notice, budget-rail
  expenses/   expenses-row, expenses-log-form, expenses-rail
  packing/    packing-summary, packing-group, packing-item, packing-add
  outfit/     outfit-card, outfit-scope-picker, outfit-header
  members/    members-row, members-invite, members-rail
  overlay/    overlay-activity-sheet, overlay-edit-trip, overlay-new-trip
  motif/      motif-* (rebuilt decorative SVGs)
pages/
  index.vue          # landing (marketing layout)
  masuk.vue          # login
  beranda.vue        # home
  template.vue
  arsip.vue
  trip/[id]/[tab].vue  # trip detail, nested tab route  (decision pending)
  share/[id].vue       # public read-only
middleware/auth.ts   # redirect to /masuk when !authed
```

## Domain model (from README §State)
`Trip { id, name, place, mat, cover, dates, status: live|plan|draft, people, plan, days[], activeBudget, budgets[], outfitSets[], manual[], packing[] }`
`Day { date, long, title, outfit, acts[] }` · `Activity { id, time, dur, title, cat, place, cost, note }`
`Budget { id, name, note, alloc:{[cat]:number} }` · `OutfitSet { id, scope:"day:N"|"act:<id>", top, bottom, shoes, other }`
`ManualExpense { id, title, cat, dayIdx, amount, note }` · `PackGroup { name, items:[{id,label,req,done,url?}] }`

**Derived, never stored:** expense list (activity costs + manual), category totals, allocation/spent totals, over-budget flags, bar %, packing progress, required-but-unchecked count, per-person share, orphaned categories, resolved outfit.
**Mutation pattern:** single `patchTrip(id, fn)` — deep-clone, apply `fn`, replace. Maps to a Pinia action.
**Rules:** activity `cost>0` are derived budget/expense lines (not deletable in Pengeluaran, edit the activity); category `Santai` → `Lain`; `status==="live"` ⇒ budget **locked** (edit affordances absent, not disabled).

## Phases

### Phase 0 — Scaffold & tokens  ✅ DONE
- ✅ Moved `design_handoff_jalan/` out to sibling `../jalan-design-handoff/`; stripped `.Zone.Identifier` files.
- ✅ Scaffolded Nuxt 4 + TS in repo root; SSR on.
- ✅ Deps installed: `@pinia/nuxt`, `pinia`, `pinia-plugin-persistedstate`, `@nuxt/fonts`, `@unocss/nuxt`, `reka-ui`, `clsx`, `@iconify-json/lucide`. Modules registered: `@unocss/nuxt`, `@nuxt/fonts`, `@pinia/nuxt`, `pinia-plugin-persistedstate/nuxt`, `reka-ui/nuxt`.
- ✅ `uno.config.ts` (presetWind3 + presetIcons + presetTypography; tokens in `theme`; shortcuts: card/field/btn-*/chip-*/status-*/money/eyebrow). `app/designs/{tokens.css,base.css}` (CSS-var mirror + body/focus-ring/keyframes). Reset via `@unocss/reset/tailwind.css`.
- ✅ Smoke-verified: `pnpm dev` → SSR 200, tokens/shortcuts/Lucide/Reka-Dialog/Pinia-persist all render.

**Environment / tooling notes (WSL2, pnpm 11, node 24):**
- pnpm 11 no longer reads the `pnpm` field in `package.json`; build-script approval lives in `pnpm-workspace.yaml` → `onlyBuiltDependencies: [esbuild, vue-demi, @parcel/watcher, better-sqlite3]`.
- pnpm 11's pre-run deps check (`verifyDepsBeforeRun`) *fails* on ignored build scripts and blocked `pnpm dev`. Fixed by `verifyDepsBeforeRun: false` in `pnpm-workspace.yaml` (also mirrored in `.npmrc`). `pnpm dev` works now; `node_modules/.bin/nuxt dev` also bypasses the wrapper.
- A local settings hook re-appends an `allowBuilds:` placeholder block to `pnpm-workspace.yaml` on edits — harmless (unknown key, ignored by pnpm); leave it.
- `@nuxt/fonts` needs network at dev/build to fetch Google fonts; this sandbox blocks the provider APIs so fonts fall back to system here. Works on a networked machine.

### Phase 1 — Domain & state  ✅ DONE
- ✅ `app/types/domain.ts` (Trip/Day/Activity/Budget/OutfitSet/ManualExpense/PackGroup/Member/ExpenseLine + CATEGORIES).
- ✅ `app/utils/{format,categories,seed,derive}.ts` — money/date/time formatters, tone/icon maps, full seed trips (Sumba live, Ubud, Bromo, Bali), and pure derive fns (expenseLines, budgetSummary, categoryRows, donutStops, looseCategories, packingProgress, outfit resolution, scopeOptions, tripWarnings, buildDays).
- ✅ `app/stores/{trips,ui,session}.ts` — trips (patchTrip immutable + mutation helpers, persisted), ui (selection/overlays/toast, not persisted), session (auth stub, persisted authed/user).
- ✅ `app/composables/{use-money,use-toast,use-derived}.ts`.
- ✅ Typechecks clean (vue-tsc); SSR 200 with derived data wired. Note: pinned `typescript@5` (vue-tsc incompatible with the TS 7 native port).

### Phase 2 — Chrome, auth stub, home  ✅ DONE
- ✅ Core primitives: core-button, core-input, core-status-pill, core-avatar, core-bar, core-logo, core-motif, core-cover, core-toast (+ utils/motifs.ts).
- ✅ layout-top-bar, layouts/{default,blank}, app.vue → NuxtLayout.
- ✅ middleware/auth.global.ts (client-side guard; public: /, /masuk, /share/*). Login screen (validation + guest bypass), persisted sign-in.
- ✅ Beranda: greeting, dashboard-filter-chips, dashboard-hero (stats/progress/next-activity), dashboard-trip-card grid + new-trip card.
- ✅ Landing/template/arsip placeholders (fleshed out in Phase 5).
- ✅ Typechecks clean; /, /masuk, /beranda, /template, /arsip all SSR 200, no runtime errors.

### Phase 3 — Trip detail + 7 tabs (bulk of the work)
- Trip header band + tab bar (active = teal underline + weight 700).
- **Ringkasan** · **Hari** (day rail, timeline, inline add form, empty-day state, outfit card) · **Anggaran** (version chips, locked state, category table with bars/expand, add-category, loose-lines warning, compare matrix) · **Pengeluaran** (derived+manual union) · **Logistik** (groups, custom checkbox, Wajib tag, shop link) · **Outfit** (4 slots, scope picker dropdown, resolution rule) · **Anggota** (roles, owner pill, invite form).

### Phase 4 — Overlays & flows
- Activity sheet (520px drawer, inline-edit save-on-change, resolved outfit, delete).
- Edit-trip sheet (440px; linked start-date/day-count; reduce-days confirm warning).
- New-trip flow (creates draft + generated days + default budget → Hari tab).
- Toast (bottom-center, 2200ms). **Add Escape-to-close** (recommended in handoff).

### Phase 5 — Secondary screens
- Template (copy starter → new trip → Hari), Arsip (read-only list), Share (`/share/[id]`, cover band + itinerary, **no** costs/emails/edit), Landing page.

### Phase 6 — Responsive (new design)
Per-screen mobile/tablet transforms:
- **Top bar:** hide search, collapse nav to a menu; keep wordmark + primary action.
- **Two-column tabs** (Ringkasan/Anggaran/Pengeluaran/Anggota): stack; right rail moves below main.
- **Hari day rail** (212px): becomes a horizontal chip scroller (or day `<select>`) above the timeline.
- **Hero / trip cards:** media block stacks above content (flex-wrap already helps).
- **Drawers** (520/440px) → full-width bottom/side sheets.
- **Tab bar / version bar / compare matrix:** horizontal scroll containers.
- Breakpoints: ~640 / ~900 / ~1200.

### Phase 7 — Polish
- Hover lifts, row tints (`#F1EEE1`), button darken (`#0A4F55`), all animations.
- Empty/skeleton states in **sand** palette (not grey).
- A11y: focus order, escape-to-close, checkbox/select semantics.
- Replace placeholder imagery; regenerate landing screenshots from real app.

## Open questions carried from handoff (defer / decide later)
1. Real auth provider + session model (stub for now).
2. Share permissions/expiry/revocation (static read-only for now).
3. Multi-currency (IDR hardcoded).
4. Multi-user editing / conflict handling (single-player for now).
