-- Per-user bookmarks ("Simpan") for guides and places. Scoped to the signed-in
-- actor in the routes; written via Nitro with the service-role key. RLS deny-all
-- like the other tables.

create table if not exists public.saved_items (
  user_id     text not null,
  kind        text not null,          -- 'guide' | 'place'
  ref_id      text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, kind, ref_id)
);

alter table public.saved_items enable row level security;
