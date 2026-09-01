# Handoff: Jalan — trip planning app + marketing landing

## Overview
**Jalan** is a desktop-first trip-planning web app for Indonesian travellers. A group plans a trip
together: a day-by-day itinerary, a budget that can exist in several *versions* (e.g. "Hemat" vs
"Nyaman"), an expense log that mixes derived activity costs with manually logged spending, a packing
checklist, per-day/per-activity outfit sets, and member management with roles. There is also a
public marketing landing page and a read-only public share view of a trip.

All copy is in **Bahasa Indonesia**. Keep it that way — the product voice is casual, second-person,
practical ("Tinggal isi harinya", "sisa uang di hari terakhir"). Money is always Rupiah, formatted
`Rp 1.234.000` (dot thousands separator, no decimals). Times use a dot: `13.40`.

## About the design files
The files in this bundle are **design references authored in HTML** — running prototypes that show
the intended look, copy, and behaviour. They are **not production code to port line by line**.

The task is to **recreate these designs inside the target codebase's existing environment** (React,
Vue, SwiftUI, native, whatever the app is) using that codebase's established component library,
routing, state management, and styling conventions. If no codebase exists yet, pick the framework
that best fits the team and implement the designs there. Treat the HTML as a spec, not a dependency:
its custom template runtime (`support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`) is an authoring tool
for design work and must **not** be shipped.

## Fidelity
**High fidelity.** Colors, typography, spacing, radii, shadows, copy, and interaction behaviour are
final and should be matched closely. Every value used is listed under *Design tokens* below. The
prototype is desktop-first: layouts are designed at 1280–1600px wide with a `max-width: 1400px`
content column. Below ~900px the flex containers wrap but no dedicated mobile design exists yet —
if mobile is in scope, treat it as new design work and ask.

---

## Information architecture

Two documents:

1. **Landing page** (`Jalan Landing.dc.html`) — public marketing page.
2. **App** (`Jalan App.dc.html`) — the product. One single-page app with an internal router.

Every "Masuk" / "Coba gratis" / "Coba versi hidup" CTA on the landing navigates to the app, which
opens on the login screen.

### App routes (state key `route`)
| route | Screen | Notes |
|---|---|---|
| *(unauthenticated)* | Masuk (login) | shown whenever `authed === false`, regardless of route |
| `home` | Beranda | trip list + hero card for the live trip |
| `templates` | Template | starter itineraries to copy |
| `archive` | Arsip | finished trips |
| `trip` | Trip detail | tabbed; the bulk of the app |
| `share` | Tautan publik | read-only public view of a trip |

### Trip detail tabs (state key `tab`)
`overview` (Ringkasan) · `days` (Hari) · `budget` (Anggaran) · `expenses` (Pengeluaran) ·
`packing` (Logistik) · `outfit` (Outfit) · `members` (Anggota)

### Overlays
- **Activity detail sheet** — right-hand drawer, 520px, opens when `activityId` is set.
- **Edit trip sheet** — right-hand drawer, 440px, `editOpen`.
- **New trip modal / form** — `showNewTrip`.
- **New activity inline form** — `showActForm`, appears in the Hari tab timeline.
- **Toast** — bottom-centre, auto-dismisses after 2200ms.

---

## Screens

### 1. Masuk (login)
**Purpose:** get into the app. This is a prototype gate, not real auth.

**Layout:** full-viewport two-panel split, `display:flex; flex-wrap:wrap`, each panel
`flex: 1 1 480px`, `min-height: 420px`.
- **Left panel** — background `#DEEEEC`, padding `44px 48px`,
  `justify-content: space-between`. Holds the wordmark top-left, a large Fraunces headline, and a
  small reassurance line at the bottom. Decorative SVG motifs (teal, low opacity) bleed off the
  edges; they are `position:absolute`, `overflow:hidden` on the panel.
- **Right panel** — background `#FBFAF5`, the form, vertically centred, form column
  `max-width ~360px`.

**Form:** email input (prefilled `rina@jalan.id`), password input
(placeholder "Minimal 4 karakter"), inline error banner, primary submit button, and a secondary
"Masuk sebagai tamu" text button.
- Inputs: `border: 1px solid #E4DECB`, `background: #fff`, `border-radius: 14px`,
  padding `12px 14px`, font-size 14px. Label above, 12.5px, weight 600, color `#33474C`.
- Focus ring (global): `outline: 2px solid #0E6E76; outline-offset: 1px`.
- Primary button: `background: #0E6E76`, white text, `border-radius: 999px`, padding `13px 22px`,
  font-size 14.5px weight 700. Hover `#0A4F55`.
- Error banner: `background: #FCE3D3`, `color: #C85A28`, `border-radius: 12px`,
  padding `10px 14px`, 13px weight 600.

**Validation:** email must be non-empty and contain `@`; password must be ≥ 4 characters.
On failure set `loginErr` with an Indonesian message and keep focus. Enter key submits (keydown
handler on both inputs). "Masuk sebagai tamu" bypasses validation. Success sets `authed = true`
and lands on `home`.

### 2. Beranda (home)
**Purpose:** pick up the trip in progress or start a new one.

**Layout:** `max-width:1400px` centred column, padding `30px 32px 60px`, vertical gap 22px.
- **Header row:** `justify-content: space-between; align-items: flex-end`. Left: Fraunces greeting
  + subline. Right: primary "Trip baru" pill button.
- **Live trip hero card** (rendered only when a trip has `status === "live"`): white card,
  `border: 1px solid #EDE9DA`, `border-radius: 26px`, `overflow: hidden`,
  `box-shadow: 0 18px 40px -28px rgba(16,38,43,.3)`, `display:flex; flex-wrap:wrap`.
  - Left media block: `width: 392px; flex: 1 0 340px; min-height: 300px`, background `#DEEEEC`
    with the trip cover photo, decorative motif layers, and a 104px circular avatar
    (`border: 6px solid #fff`, `transform: translateY(30px)`) overlapping the bottom edge. When the
    trip has no cover, a teal pin glyph is shown instead of the photo.
  - Right content block: trip name (Fraunces, ~28px), place, date range, a member-count row, a
    progress bar for spend vs plan, and two buttons ("Buka trip" primary, "Bagikan" secondary).
- **Trip grid:** filter chips row ("Semua" / "Sedang jalan" / "Rencana" / "Draf") above a
  responsive grid of trip cards. Card: white, 1px `#EDE9DA`, radius 22px, a 132px cover strip,
  then name / place / dates / status pill. Whole card is clickable → opens that trip.
- Status pill colors: **live** teal (`#DEEEEC` bg / `#0A4F55` text), **plan** sand
  (`#F1EEE1` / `#33474C`), **draft** neutral (`#F1EEE1` / `#6C7C7D`).

### 3. Template
Grid of starter itineraries (name, day count, short description, "Pakai template" button). Choosing
one creates a new trip pre-filled with those days and lands on the new trip's Hari tab.

### 4. Arsip
Compact list of past trips, one row each: name, dates, total spent, "Lihat" link. Read-only.

### 5. Trip detail — shared chrome
- **Top bar** (app-wide): `height: 68px; flex: 0 0 68px`, white, `border-bottom: 1px solid #EDE9DA`,
  `position: sticky; top: 0; z-index: 40`, padding `0 32px`, gap 26px. Wordmark (clickable → home),
  nav links (Beranda / Template / Arsip), avatar on the right.
- **Trip header band:** cover image background with a dark scrim, trip name in Fraunces (~34px),
  place + date range, and an action row ("Ubah trip", "Bagikan", lock indicator when
  `status === "live"`).
- **Tab bar:** `max-width:1400px`, padding `14px 32px 0`, `display:flex; flex-wrap:wrap; gap:2px`.
  Each tab: padding `11px 16px 13px`, font-size 14px, `border-bottom: 2.5px solid` —
  active `#0E6E76` + weight 700 + color `#10262B`; inactive `transparent` + weight 500 + color
  `#6C7C7D`.
- **Tab body:** `max-width:1400px`, padding `24px 32px 60px`.
- Every screen/tab transition plays `riseIn` (`.3s ease`, fade + 10px translateY).

### 6. Tab — Ringkasan (overview)
Two columns, `display:flex; flex-wrap:wrap; gap:20px`; main column `flex:1; min-width:560px`,
right rail ~340px.
- Main: "Hari ini" card for the current day (day title, up to 3 next activities with times),
  a spend-vs-plan card with progress bar and remaining amount, and a "Perlu diperhatikan" card
  listing warnings (required packing items unchecked, categories over budget, days with no
  activities).
- Rail: member avatars + count, active budget version name with a "Lihat anggaran" link, packing
  progress ("3 dari 8 dicentang"), and the public-link block.

### 7. Tab — Hari (days) — the core screen
Three regions, `display:flex; flex-wrap:wrap; gap:20px`:
- **Day rail** — `width: 212px; flex: 0 0 212px`, vertical list, gap 8px. One button per day:
  weekday+date on top (IBM Plex Mono, 12px), day title below (14px). Selected day is teal-filled
  (`#DEEEEC`, `#0A4F55` text, weight 700); others transparent with hover `#F1EEE1`. Radius 14px,
  padding `11px 13px`. Sets `dayIdx`.
- **Timeline** — `flex: 1; min-width: 0`. Header row with the long date (Fraunces) and a
  "Tambah aktivitas" button that toggles `showActForm`.
  - **New-activity inline form**: white card with a **2px `#0E6E76`** border, radius 18px,
    padding `16px 17px`, gap 14px, `riseIn .2s`. Fields: time (`HH.MM`), title, category select,
    cost, duration in minutes. Save appends to the selected day and closes; Cancel discards.
  - **Activity rows**: white card, 1px `#EDE9DA`, radius 18px, padding `14px 16px`, clickable
    (opens the detail sheet). Left gutter shows start time (IBM Plex Mono, weight 600) and the
    computed time range `13.40–14.40` derived from `time + dur`. Then title (15px weight 700),
    place (13px `#6C7C7D`), a category chip, and the cost right-aligned in mono. Zero-cost
    activities show "Gratis" rather than `Rp 0`.
  - **Empty day state**: dashed border `1px dashed #D8D0BB`, radius 18px, padding 36px, centred —
    52px teal circle with a glyph, a line of copy, and a "Tambah aktivitas" button.
- **Outfit card for the day** — right rail, lists the day's outfit slots as chips; when the day has
  no outfit set, shows "Belum diisi untuk hari ini".

### 8. Tab — Anggaran (budget)
Main column `flex:1; min-width:560px` + right rail.

**Version model.** A trip owns an array of budget versions; `trip.activeBudget` names the current
one. Each version has `{ id, name, note, alloc: { [category]: rupiah } }`. Categories are per
version — adding or deleting a category affects only that version.

- **Version bar:** chips for each version (active = teal fill), "Versi baru" (duplicates the active
  version), and "Bandingkan versi".
- **Locked state.** When `trip.status === "live"` the budget is **locked**: name and allocation
  inputs are replaced by static text, delete buttons disappear, and a sand notice
  (`background:#F1EEE1`, radius 16px, padding `14px 16px`) explains why. All editing affordances
  must be *absent*, not just disabled.
- **Category table.** One row per category, `border-bottom: 1px solid #F1EEE1`:
  `[dot + name (flex:1)] [spent, 120px right-aligned mono] [alloc, 130px right-aligned — mono text
  when locked, a 120px right-aligned input when open] [bar, 96px] [delete, 30px]`.
  - Bar: `height: 8px`, `border-radius: 999px`, track `#F1EEE1`, fill teal, fill turns
    `#C85A28` when spent > alloc. Spent figure also turns `#C85A28` when over.
  - Row click expands the category to show its individual expense lines (indented
    `padding-left: 64px`, 11px vertical).
  - Delete (only when open + the category has no lines): 30px circle, `#FBFAF5` bg,
    1px `#EDE9DA`, trash glyph.
- **Add-category row** (open versions only): `background: #FBFAF5`, a name input + amount input +
  "Tambah" button.
- **Loose-lines warning** (`background:#F1EEE1`, `color:#8A6314`, 12.5px): appears when expenses
  reference a category that this version doesn't define, e.g. after a category was deleted. Copy
  names the orphan categories and suggests re-adding them or reassigning the lines in Pengeluaran.
- **Bandingkan versi** — a matrix: rows = categories (union across versions), columns = each
  version's allocation, plus an "Aktual" column with real spending. Cells over actual spend are
  tinted. This replaced an earlier right-rail card design; keep it as a matrix.
- **Rail:** totals card (total allocation, total spent, remaining, per-person share) and the version
  note.

### 9. Tab — Pengeluaran (expenses)
Main column + rail. The expense list is the union of two sources, computed, never stored merged:
- **derived** lines — every activity with `cost > 0`, tagged `derived: true` (category `Santai`
  maps to `Lain`). Editing an activity's cost updates the budget immediately.
- **manual** lines — entries in `trip.manual`, logged from this screen.

Row: day label + time (mono, small), title (14px weight 600), category chip, amount right-aligned
mono. Derived rows carry a small "dari aktivitas" tag and are **not** deletable here (edit the
activity instead); manual rows have a delete affordance. Log form: amount, category select, day
select, optional note, "Catat" button. Confirmation via toast.

### 10. Tab — Logistik (packing)
- **Summary bar:** `background:#F1EEE1`, radius 18px, padding `16px 18px`, gap 14px — checked count
  ("3 dari 8 dicentang") and a warning when required items are still unchecked.
- **Groups** (Dokumen / Pakaian / Elektronik …): group heading + item rows.
- **Item row:** clickable, radius 14px, padding `11px 13px`, gap 12px. Custom checkbox
  `20×20`, radius 6px, `border: 2px solid` — unchecked `#D8D0BB` on `#fff`; checked teal fill with
  a white 13px tick. Checked labels get `text-decoration: line-through` and muted color.
  Optional shop link renders as a small teal pill with an external-link glyph
  (`stopPropagation` so it doesn't toggle the row). Required items show a
  `Wajib` tag in `#C85A28`, 11.5px weight 700.
- Add-item row: label input, category select, "Wajib" toggle, optional URL, "Tambah".

### 11. Tab — Outfit
- **Header strip:** `background:#DEEEEC`, radius 18px, padding `16px 18px` — explains that an
  outfit can be attached to a whole day or to a single activity.
- **Outfit cards:** each set has four slots — `top`, `bottom`, `shoes`, `other` — as inline
  editable text fields, plus a **scope picker**: a custom dropdown (`position:absolute`, white,
  1px `#E4DECB`, radius 14px, padding 6px, `box-shadow: 0 22px 40px -22px rgba(...)`, `z-index: 20`)
  listing every day and every activity of the trip. Assigning a scope of `day:N` or `act:<id>`
  is what links the outfit into the Hari tab and the activity sheet.
- **Resolution rule** used by the activity sheet: an activity shows its **own** outfit set if one
  targets `act:<id>`; otherwise it falls back to the outfit for its day; otherwise
  "Outfit hari ini belum diisi."

### 12. Tab — Anggota (members)
Main column `flex:1; min-width:520px` + rail.
- Member row: 40px circular avatar, name (14px weight 700), email (12.5px `#6C7C7D`), then either
  a role `<select>` (Bisa ubah / Bisa lihat / Admin) — styled `background:#FBFAF5`,
  1px `#E4DECB`, radius 11px, padding `8px 11px` — or, for the trip owner, a static
  "Pemilik" pill (`#DEEEEC` / `#0A4F55`, radius 999px, padding `7px 13px`).
- Pending invitees additionally show "Kirim ulang" and a remove action.
- Invite form: email input + role select + "Undang" button. Adds a pending member and toasts.
- Rail: how cost-splitting works and the per-person amount.

### 13. Tautan publik (share)
Read-only public rendering: a 236px cover band
(`background-size: cover; background-position: center 56%`), trip name, dates, then the itinerary
day by day with times and titles. **No** costs, no member emails, no edit affordances. A copy-link
button with a toast confirmation.

### 14. Activity detail sheet
Right drawer over a scrim: overlay `position: fixed; inset: 0;
background: rgba(16,38,43,.34); z-index: 60`, panel `width: 520px; height: 100%;
background: #FBFAF5; box-shadow: -20px 0 60px -20px rgba(16,38,43,.4)`, animation
`sheetIn .22s ease` (fade + 26px translateX). Click the scrim to close; clicks inside must
`stopPropagation`.

Contents, all **inline-editable, saving on change** (no Save button):
title, time (`HH.MM`), duration in minutes (rendered back as "3 jam" / "45 menit" / "Tanpa durasi"),
category, place, cost, and a free-text note. Below that, the resolved outfit (own set → day set →
empty message). Delete activity sits at the bottom, destructive styling.

### 15. Edit trip sheet
Right drawer, `width: 440px`, `z-index: 75`, `border-left: 1px solid #EDE9DA`. Fields: cover
image (132px preview, radius 18px, "Belum ada gambar" placeholder when empty), name, place, motif
picker, **start date**, and **day count**. Start date and day count are linked: changing either
recomputes the date range label live. Reducing the day count below the number of days that already
contain activities raises an inline warning (`background:#FCE3D3`, `color:#C85A28`, radius 12px)
and must be confirmed before days are dropped.

### 16. New trip flow
Fields: name, place, start date, length in days, motif, cover. Creates a trip with
`status: "draft"`, generated days from the start date, one default budget version
("Rencana awal") and empty manual/packing arrays, then navigates to its Hari tab.

---

## Interactions & behaviour

- **Toast:** `flash(msg)` sets `toast`, clears any pending timer, auto-dismisses at **2200ms**.
  Bottom-centre, dark pill, animation `toastIn`. Used for: expense logged, invite sent, link
  copied, version created, trip saved.
- **Animations** (all defined once, globally):
  - `riseIn` — `opacity 0→1`, `translateY(10px)→0`; screens/tabs use `.3s ease both`,
    inline forms `.2s`.
  - `sheetIn` — `opacity 0→1`, `translateX(26px)→0`, `.22s ease both`.
  - `toastIn` — `opacity 0→1`, `translateY(14px)→0`.
  - `slideOverIn` — `translateX(34px)→0`, `opacity .4→1`.
- **Hover:** cards lift subtly (deeper shadow); list rows tint to `#F1EEE1`; teal buttons darken
  to `#0A4F55`; secondary buttons gain a `#D8D0BB` border.
- **Overlay dismissal:** scrim click closes; inner container stops propagation. (Escape-to-close is
  *not* in the prototype — adding it is recommended.)
- **Derived data must stay derived.** Activity costs are the source of truth for their budget lines.
  Do not copy them into the expense store.
- **No network, no loading or error states** exist in the prototype. Design them with the codebase's
  existing patterns; keep skeletons in the sand palette rather than grey.
- **Responsive:** desktop-first. Containers already wrap via `flex-wrap`, but the `min-width` values
  (560px, 520px) mean two-column tabs collapse rather than reflow. Mobile is unspecified.

## State

Single top-level store in the prototype; split it along these lines in production.

**Session/UI:** `authed`, `email`, `pw`, `loginErr`, `route`, `tab`, `tripId`, `dayIdx`,
`activityId`, `homeFilter`, `toast`, `seq` (id counter).

**Transient form state:** `showNewTrip`, `showActForm`, `nt` (new trip draft),
`na` (new activity draft: `{ time, title, cost, cat, dur }`), `amount`/`cat`/`note` (expense
draft), `newItem`/`newItemCat`/`newItemReq`/`newItemUrl` (packing draft), `newCat`
(`{ name, amount }`), `mv` (`{ email, role }` invite draft), `et` (edit-trip draft, `null` when
closed), `openCat`, `openScope`, `outfitMode`.

**Domain — `trips[]`:**
```
Trip {
  id, name, place, mat,            // mat = motif key: pantai | sawah | gunung | kota
  cover,                           // image path, may be ""
  dates,                           // display string, e.g. "12–15 Sep"
  status,                          // "live" | "plan" | "draft"   ("live" ⇒ budget locked
  people, plan,                    //  and edit controls hidden)
  days: Day[],
  activeBudget,                    // Budget.id
  budgets: Budget[],
  outfitSets: OutfitSet[],
  manual: ManualExpense[],
  packing: PackGroup[]
}
Day        { date, long, title, outfit, acts: Activity[] }
Activity   { id, time, dur, title, cat, place, cost, note }
Budget     { id, name, note, alloc: { [category]: number } }
OutfitSet  { id, scope, top, bottom, shoes, other }   // scope: "day:<index>" | "act:<id>"
ManualExpense { id, title, cat, dayIdx, amount, note }
PackGroup  { name, items: [{ id, label, req, done, url? }] }
```

**Derived (compute, never store):** the expense list (activity costs + manual entries), category
totals, allocation total, spent total, over-budget flags, percentage bars, packing progress,
required-but-unchecked count, per-person share, orphaned ("loose") categories, and each activity's
resolved outfit.

**Mutation pattern:** every trip edit goes through a single `patchTrip(id, fn)` that deep-clones the
trip, applies `fn`, and replaces it in the array — i.e. immutable updates. Map cleanly onto a
reducer, store, or server mutation.

**Categories** (default set): Makan & minum · Transport · Tiket & atraksi · Penginapan · Lain.
Activity category `Santai` has no budget line and maps to `Lain`.

## Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Ink | `#10262B` | primary text, dark surfaces |
| Ink 2 | `#33474C` | secondary text, labels |
| Muted | `#6C7C7D` | tertiary text, inactive tabs |
| Teal 700 | `#0A4F55` | text/icons on teal, button hover |
| Teal 600 | `#0E6E76` | primary action, active tab, focus ring, links |
| Teal 100 | `#DEEEEC` | teal surfaces, active chips, panels |
| Teal deep | `#CFE3E1` | text on ink surfaces |
| Paper | `#FBFAF5` | app background, sheet background |
| Sand 100 | `#F1EEE1` | secondary surface, bar track, hover tint |
| Sand line | `#EDE9DA` | card border, divider |
| Sand line 2 | `#E4DECB` | input border |
| Sand line 3 | `#D8D0BB` | dashed border, checkbox border |
| Warn bg | `#FCE3D3` | error / warning banner |
| Warn fg | `#C85A28` | error text, over-budget, "Wajib" |
| Warn fg 2 | `#8A6314` | loose-lines advisory text |
| Accent orange | `#F0713A` | brand mark accent |
| Accent green | `#2F6B54` | brand mark accent |
| Peach | `#F6E2CE` / `#9C4718` | landing note tile |
| Scrim | `rgba(16,38,43,.34)` | overlay backdrop |

### Typography
Google Fonts: `Plus Jakarta Sans` (400/500/600/700), `Fraunces` (opsz 9..144, 400/500/600),
`IBM Plex Mono` (400/500/600).
- **Fraunces (serif)** — display only: page greetings, trip names, section headlines, budget version
  names. ~19px in cards, 28px on the home hero, 34px+ in the trip header.
- **Plus Jakarta Sans** — all UI. 11.5px chips/tags · 12.5px labels & meta · 13px body small ·
  14px rows/inputs · 14.5–15.5px emphasis. Weights 400/500/600/700.
- **IBM Plex Mono** — numbers only: money, times, dates, stat figures, and the small uppercase
  eyebrow labels (letter-spacing ~.06em). 11–22px.
- Body: `-webkit-font-smoothing: antialiased`; long copy uses `line-height: 1.35–1.55` and
  `text-wrap: pretty`.

### Spacing
Base 4px. Common: 2 · 5 · 6 · 8 · 9 · 10 · 11 · 12 · 14 · 16 · 18 · 20 · 22 · 26 · 30 · 32 · 44 · 48.
Page padding `30px 32px 60px` (`24px 32px 60px` in tab bodies); card padding `14–18px`;
content max-width `1400px`; top bar 68px.

### Radii
6 (checkbox) · 11 (select/small input) · 12 (banner) · 14 (input, list row) · 16 · 18 (card) ·
20 · 22 · 26 (hero card) · 999 (pill) · 50% (avatar).

### Shadows
- Card: `0 18px 40px -28px rgba(16,38,43,.3)`
- Collage/lifted card: `0 24px 44px -32px rgba(16,38,43,.55)`
- Dropdown: `0 22px 40px -22px rgba(16,38,43,.28)`
- Right drawer: `-20px 0 60px -20px rgba(16,38,43,.4)` (edit sheet: `-30px 0 70px -30px …,.5`)
- Avatar: `0 12px 24px -14px rgba(16,38,43,.35)`

### Bars & progress
Height 8px, `border-radius: 999px`, track `#F1EEE1`, fill `#0E6E76`, over-budget fill `#C85A28`.

## Assets
In `assets/`, all bundled here:
- **Photos** (`photo-sumba.jpg`, `photo-ubud.jpg`, `photo-bromo.jpg`, `photo-kota.jpg`) and
  matching `cover-*.png` — stand-in trip covers. **Replace with licensed imagery before shipping.**
- **Screenshots** (`screen-beranda.png`, `screen-hari.png`, `screen-anggaran.png`,
  `screen-outfit.png`, `screen-ringkasan.png`, `screen-anggota.png`) — captures of the prototype,
  used in the landing page collage. Regenerate from the real app once built.
- **Motif SVGs** (`teal-cloud`, `teal-plane`, `teal-hills`, `teal-shore`, `teal-palms`) plus the
  in-file `MOTIFS` path set (keys `pantai`, `sawah`, `gunung`, `kota`, `compass`) — decorative
  only, always low-opacity, never load-bearing. Rebuild as a small icon set in the target codebase.
- Icons are inline SVG, 24×24 viewBox, `fill: none`, `stroke-width` 1.6–3.4,
  `stroke-linecap/linejoin: round` — swap for the codebase's icon library (Lucide matches closely).

## Files in this bundle
| File | What it is |
|---|---|
| `Jalan App.dc.html` | the full app prototype — every screen, tab, and overlay |
| `Jalan Landing.dc.html` | the marketing landing page |
| `Jalan Reference Boards.dc.html` | static reference boards: asset sheet, palette, early screens |
| `support.js` | the prototype's authoring runtime — **design tooling, do not ship** |
| `assets/` | photos, screenshots, motif SVGs |

Open any `.dc.html` directly in a browser. Keep `support.js` and `assets/` beside them.

## Open questions for the team
1. Mobile/tablet layouts are undesigned — is mobile in scope for v1?
2. Auth is a stub. Real provider, session model, and error copy still needed.
3. Sharing is a static read-only view — no permissions, expiry, or revocation designed.
4. Currency and locale are hardcoded to IDR / Bahasa Indonesia. Multi-currency changes budget maths.
5. Multi-user editing is single-player in the prototype; conflict handling is undesigned.
