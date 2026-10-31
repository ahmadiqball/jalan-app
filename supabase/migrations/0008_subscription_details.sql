-- Payment method on orders, and cancellation on subscriptions. Plans are prepaid,
-- so cancelling keeps access until expires_at and nothing is refunded.
alter table public.billing_orders add column if not exists payment_type text;
alter table public.subscriptions add column if not exists cancelled_at timestamptz;
