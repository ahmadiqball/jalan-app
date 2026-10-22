-- Starter trip templates, moved out of the single app_content blob into their
-- own table (one row per template) so saving one doesn't rewrite them all and
-- the catalog can grow. Each row's `data` is a full trip document
-- (status: 'template'). Read publicly via Nitro; written only by admins
-- (gated in code). RLS deny-all like the other tables.

create table if not exists public.templates (
  id          text primary key,
  data        jsonb not null,
  published   boolean not null default true,
  sort        int not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.templates enable row level security;
