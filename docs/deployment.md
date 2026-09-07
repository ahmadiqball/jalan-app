# Deploying Jalan

Jalan is a Nuxt 4 (SSR) app with a Nitro server. It runs in **local mode** with
zero credentials, and flips to **cloud mode** when Supabase env is present (see
[backend.md](./backend.md)). For a real deployment you almost always want cloud
mode so trips persist and multiple people can collaborate.

---

## 0. TL;DR

```bash
pnpm install
pnpm build                 # outputs .output/ (Nitro node-server by default)
node .output/server/index.mjs   # serves on PORT (default 3000)
```

Set the env vars from the tables below on your host, run the two SQL migrations
in Supabase, point your Maps + OAuth keys at your production domain, and you're
live.

---

## 1. Prerequisites

- **Node 20+** (built/tested on Node 24). Pin it on your host if it offers a
  choice.
- **pnpm** (`corepack enable` gives you it).
- A **Supabase** project (for cloud mode).
- Optional: a **Google Maps** key (maps + place autocomplete) and **Google
  OAuth** (sign-in).

---

## 2. Environment variables

Copy [`.env.example`](../.env.example) → `.env` for local, or set these in your
host's dashboard for production. Nitro reads them at runtime, so they must be
present in the running environment (not just at build time).

### Server-only (secret — never exposed to the browser)
| Var | Purpose | Notes |
|---|---|---|
| `NUXT_SUPABASE_URL` | Supabase project URL | enables cloud mode (with the key below) |
| `NUXT_SUPABASE_SERVICE_KEY` | service_role key | **secret.** Server-only, full DB access; never commit or ship to client |
| `NUXT_ADMIN_EMAILS` | comma-separated admin emails | who can edit templates/recs at `/admin` |

### Public (safe to expose — they ship to the browser)
| Var | Purpose | Notes |
|---|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | same project URL | used by the browser for Auth only |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | Auth only; RLS is deny-all so it can't read data directly |
| `NUXT_PUBLIC_GOOGLE_MAPS_KEY` | Maps Embed + Places key | empty ⇒ maps fall back to free deep links, no autocomplete |
| `NUXT_PUBLIC_PETE_PETE_URL` | bill-split handoff base | defaults to `https://www.petepete.in` |

**Cloud mode requires all four Supabase vars** (server URL+key *and* public
URL+anon key). Set only some and auth/data won't line up.

> Your own email (`ahmadiqbalshinichi@gmail.com`) is only used to identify you
> as owner/admin — put it in `NUXT_ADMIN_EMAILS` to reach `/admin` in cloud mode.

---

## 3. Supabase setup (cloud mode)

1. Create a project (or reuse the pete-pete one — tables don't collide).
2. **SQL Editor** → run, in order:
   - [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) — `trips` table, RLS deny-all, JSONB GIN index.
   - [`supabase/migrations/0002_content.sql`](../supabase/migrations/0002_content.sql) — `app_content` (templates + packing recs).
3. **Settings → API** → copy Project URL + both keys into the env vars above.
4. **Auth → Providers** → enable **Email**; enable **Google** if you want
   Google sign-in.
5. **Auth → URL Configuration** → set **Site URL** to your production domain and
   add it (plus `http://localhost:3000` for dev) to the **Redirect allowlist**
   — a `<origin>/**` wildcard is easiest. The app returns OAuth to
   `<origin>/beranda`; if the session is still resolving it lands on `/masuk`
   briefly and forwards to `/beranda` automatically.

Emails: Supabase's built-in SMTP is test-grade. For real signup/confirmation
email at volume, configure a custom SMTP under **Auth → Emails**. (Jalan sends
no email itself — invitations are share links; see the Anggota tab.)

---

## 4. Google Maps (optional but recommended)

Needed for inline map previews and destination/place autocomplete. Without a key
everything still works via free "Buka di Maps" deep links.

1. Google Cloud Console → enable **Maps JavaScript API**, **Places API (New)**,
   **Maps Embed API**. Enable billing (usage stays in free tiers).
2. Create an **API key** → set `NUXT_PUBLIC_GOOGLE_MAPS_KEY`.
3. **Restrict the key** (it ships to the browser): Application restriction →
   HTTP referrers → add `https://yourdomain.com/*` (and `http://localhost:3000/*`
   for dev). API restriction → the three APIs above. Set a daily quota cap as a
   guardrail.

---

## 5. Build & host

The default Nitro preset is **node-server**. `pnpm build` produces `.output/`;
run it with `node .output/server/index.mjs` (honors `PORT`, `HOST`). This works
on any Node host, a container, a VPS behind nginx, PM2, etc.

### Generic Node host / VPS / container
```bash
pnpm install --frozen-lockfile
pnpm build
PORT=3000 node .output/server/index.mjs
```
Put it behind a reverse proxy (nginx/Caddy) terminating TLS, and keep it running
with your process manager of choice (systemd, PM2, Docker restart policy).

Minimal Dockerfile sketch:
```dockerfile
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```
Pass the env vars at `docker run`/compose time.

### Platform presets (Vercel / Netlify / Cloudflare)
Nitro can target these instead of node-server. Set `NITRO_PRESET` at build time
(or `nitro.preset` in `nuxt.config.ts`):
- **Vercel**: `NITRO_PRESET=vercel` (usually auto-detected). Add all env vars in
  the project settings.
- **Netlify**: `NITRO_PRESET=netlify`.
- **Cloudflare Pages/Workers**: `NITRO_PRESET=cloudflare_pages`. Note the fetch
  environment differs slightly; test the Supabase server calls after deploy.

Whichever you pick, the **env vars must be set in that platform's dashboard** —
they are read at runtime.

---

## 6. Post-deploy checklist

- [ ] Both migrations ran; `trips` and `app_content` exist.
- [ ] All four Supabase env vars set → app is in cloud mode (sign-in creates a
      real session, not the local stub).
- [ ] Your email is in `NUXT_ADMIN_EMAILS` → `/admin` loads for you, 403/redirect
      for others.
- [ ] Google OAuth redirect allowlist includes the production origin (if using
      Google sign-in).
- [ ] Maps key restricted to the production domain; a trip's Ringkasan/Hari map
      renders and the destination field autocompletes.
- [ ] Create a trip, sign out, sign back in → the trip is still there (server
      persistence working).
- [ ] Invite link (Anggota tab) → open it in another account → that account gains
      access with the chosen role.
- [ ] `/template` → "Pakai template" clones a starter trip.

---

## 7. Notes & gotchas

- **service_role key is server-only.** It's in `runtimeConfig` (not
  `runtimeConfig.public`), so it never reaches the browser — keep it that way.
- **Templates live in `app_content`**, edited at `/admin`. They are not user
  trips and never sync as such; "Pakai template" deep-copies one into a new trip.
- **Local mode has no server persistence** — trips live only in the browser's
  `localStorage`. Guest mode ("Coba tanpa akun") is intentionally ephemeral
  (not persisted at all).
- **First deploy shows the seed content** (2 starter templates + packing recs)
  until an admin saves changes at `/admin`, which writes to `app_content`.
