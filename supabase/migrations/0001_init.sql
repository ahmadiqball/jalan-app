-- Jalan schema: one row per trip, the whole trip stored as a JSONB document
-- (matches the client's whole-document patchTrip updates). Reached only from
-- Nitro with the service-role key; RLS is enabled deny-all as defence in depth.

create table if not exists public.trips (
  id          text primary key,                                   -- client-generated trip id
  owner_id    uuid not null references auth.users (id) on delete cascade,
  data        jsonb not null,                                     -- the whole trip document
  share_id    text unique,                                        -- public read slug (null = private)
  version     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists trips_owner_idx on public.trips (owner_id);
create index if not exists trips_share_idx on public.trips (share_id);
-- speeds up "trips shared with me" (data->'members' @> [{"email": ...}])
create index if not exists trips_data_gin on public.trips using gin (data jsonb_path_ops);

-- Only the service-role key (server routes) may read/write. The anon/auth keys
-- used by the browser are for Supabase Auth only; all trip data flows through
-- Nitro, which enforces per-owner access in code.
alter table public.trips enable row level security;
