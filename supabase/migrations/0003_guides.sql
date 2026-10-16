-- Kelana Guides: curated destinations + places catalog.
-- Read publicly via Nitro (service-role key; the repository filters to
-- published rows) and written only by admins (gated in code). RLS is enabled
-- deny-all like the other tables — the service-role server client bypasses it,
-- and no client ever queries these tables directly.

create table if not exists public.destinations (
  id                     text primary key,
  slug                   text unique not null,
  name                   text not null,
  region                 text not null default '',
  hero_image             text,
  summary                text,
  best_time              text,
  ideal_duration         text,
  good_for               text[] not null default '{}',
  trip_types             text[] not null default '{}',
  tips                   text[] not null default '{}',
  aliases                text[] not null default '{}',
  itinerary_template_id  text,
  featured               boolean not null default false,
  published              boolean not null default false,
  sort                   int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.places (
  id                text primary key,
  destination_id    text not null references public.destinations(id) on delete cascade,
  name              text not null,
  type              text not null default 'aktivitas',  -- hotel | makan | aktivitas | hidden_gem
  area              text,
  price_text        text,
  price_level       int,
  rating            numeric(2,1),
  rating_count      int,
  tags              text[] not null default '{}',
  short_desc        text,
  long_desc         text,
  gallery           text[] not null default '{}',       -- self-hosted image URLs; [0] = cover
  good_to_know      text[] not null default '{}',
  tips              text[] not null default '{}',
  gmaps_place_id    text,                               -- Google Maps reference (location only)
  lat               double precision,
  lng               double precision,
  open_hours        text,
  url               text,
  badge             text,
  featured          boolean not null default false,
  sort              int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists places_destination_idx on public.places (destination_id);
create index if not exists destinations_region_idx on public.destinations (region);

alter table public.destinations enable row level security;
alter table public.places enable row level security;
