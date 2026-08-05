-- Supabase is used exclusively to persist orders submitted through the web form.
-- The menu, package pages, and their images are deployed from the source code.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- This supports the website's private order CMS. It contains only the owner
-- account used to view and update orders; no catalogue data is stored here.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_one_admin_idx
on public.profiles (role)
where role = 'admin';

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^SC-[0-9]{8}-[A-Z0-9]{6}$'),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 9 and 16),
  selection_type text not null check (selection_type in ('menu', 'package', 'custom')),
  selection_name text not null,
  selection_price_idr integer check (selection_price_idr is null or selection_price_idr >= 0),
  selection_price_unit text,
  servings integer not null check (servings >= 20 and servings <= 10000),
  event_date date not null,
  delivery_address text not null check (char_length(delivery_address) between 5 and 500),
  notes text,
  custom_request text,
  status text not null default 'baru' check (status in ('baru', 'dikonfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'skipped')),
  email_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint valid_order_selection check (
    (selection_type in ('menu', 'package') and custom_request is null)
    or (selection_type = 'custom' and custom_request is not null)
  )
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

create policy "profiles: owner reads own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "orders: admin reads orders"
on public.orders for select to authenticated
using (public.is_admin());

create policy "orders: admin updates orders"
on public.orders for update to authenticated
using (public.is_admin()) with check (public.is_admin());
