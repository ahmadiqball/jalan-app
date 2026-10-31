-- Subscriptions: prepaid plans bought through Midtrans. RLS is enabled deny-all
-- like the other tables; only the service-role server client touches these.

create table if not exists public.subscriptions (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  plan        text not null check (plan in ('lite', 'plus', 'premium')),
  expires_at  timestamptz not null,
  updated_at  timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

create table if not exists public.billing_orders (
  id            text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  plan          text not null check (plan in ('lite', 'plus', 'premium')),
  period        text not null check (period in ('1m', '3m', '12m')),
  amount        int not null,
  status        text not null default 'pending',  -- pending | paid | failed
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
create index if not exists billing_orders_user_idx on public.billing_orders (user_id);
alter table public.billing_orders enable row level security;

-- Guides are paid unless marked public. Existing guides start public so nothing
-- disappears for visitors until an admin chooses.
alter table public.destinations add column if not exists is_public boolean not null default false;
update public.destinations set is_public = true;

-- 30-day grace for accounts that already have trips.
insert into public.subscriptions (user_id, plan, expires_at)
select distinct owner_id, 'plus', now() + interval '30 days' from public.trips
on conflict (user_id) do nothing;
