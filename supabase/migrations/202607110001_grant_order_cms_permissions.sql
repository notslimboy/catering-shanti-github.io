-- The API runs with Supabase's service_role via a server-only secret key.
-- Explicit grants are required for tables created by a migration.
grant all privileges on table public.orders to service_role;
grant all privileges on table public.profiles to service_role;
