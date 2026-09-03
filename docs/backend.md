# Jalan backend

Jalan runs in one of two modes, chosen automatically from env — no code change:

| | **Local mode** (default) | **Cloud mode** |
|---|---|---|
| Trigger | no Supabase env set | `NUXT_SUPABASE_URL` + `NUXT_SUPABASE_SERVICE_KEY` set |
| Server store | in-memory (`MemoryTripRepository`) | Supabase Postgres (`SupabaseTripRepository`) |
| Auth | stub (single local user) | Supabase Auth (email/password) |
| Persistence | browser `localStorage` only | `localStorage` cache + server sync |

The single swap point is `server/utils/repositories.ts`; routes only depend on
the `TripRepository` interface.

## Architecture
- A trip is stored as an **opaque JSON document** — `trips(id, owner_id, data
  jsonb, share_id, version, updated_at)`. This matches the client's
  whole-document `patchTrip` updates; no server-side knowledge of the trip shape.
- All trip data flows through **Nitro server routes** using the **service-role**
  key. RLS is enabled deny-all as defence in depth; per-owner access is enforced
  in code (`server/utils/auth.ts`). The browser's anon key is used for Supabase
  **Auth only**.
- Auth on the server: routes read `Authorization: Bearer <supabase access token>`
  and verify it with `supabase.auth.getUser(token)`.

### API
- `GET /api/trips` — trips you own or are a member of (each tagged `_role`)
- `GET /api/trips/:id` · `PUT /api/trips/:id` · `DELETE /api/trips/:id`
- `POST /api/trips/:id/share` → `{shareId}` · `DELETE /api/trips/:id/share`
- `GET /api/share/:id` — public read by share slug (no auth)
- `GET /api/me` → `{authed, email, isAdmin}`
- `GET /api/content` (public) · `PUT /api/content` (admin) — starter templates +
  packing recommendations, managed at `/admin`

### Admin
Admins manage templates + packing recommendations at **/admin**. Who's admin:
`NUXT_ADMIN_EMAILS` (comma-separated) in cloud mode; in local mode the dev user
is always admin. Content is stored in `app_content` (see migration `0002`).

### Auth
Email/password + **Google** (Supabase OAuth) in cloud mode; a local stub +
guest in local mode. Enable Google under Supabase → Auth → Providers and add the
app origin to the redirect allowlist.

## Cloud setup
1. Create a Supabase project (or reuse the one behind pete-pete — the tables
   don't collide, which is what lets the two apps share identity later).
2. **SQL Editor** → run [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
3. **Settings → API**: copy the Project URL and both keys into `.env`
   (see [`.env.example`](../.env.example)):
   - `NUXT_SUPABASE_URL` + `NUXT_SUPABASE_SERVICE_KEY` (service_role — secret)
   - `NUXT_PUBLIC_SUPABASE_URL` + `NUXT_PUBLIC_SUPABASE_ANON_KEY` (anon)
4. **Auth → Providers**: enable Email (and Google if wanted). Add the app URL to
   the redirect allowlist.
5. Restart `pnpm dev`. The app now uses Supabase; sign-in creates real sessions
   and trips sync to Postgres.
