-- Admin-managed app content (starter templates + packing recommendations).
-- Single row keyed 'global'. Written only via Nitro with the service-role key
-- (admin-gated in code); RLS deny-all like the trips table.

create table if not exists public.app_content (
  id          text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.app_content enable row level security;
