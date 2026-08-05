-- Google Business Profile review snapshots are written only by the server role.
create table if not exists public.google_review_snapshots (
  id uuid primary key default gen_random_uuid(),
  average_rating numeric(3,2),
  total_review_count integer not null check (total_review_count >= 0),
  fetched_at timestamptz not null,
  expires_at timestamptz not null,
  profile_url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint google_review_snapshot_average_valid check (average_rating is null or (average_rating >= 1 and average_rating <= 5)),
  constraint google_review_snapshot_expiry_after_fetch check (expires_at > fetched_at),
  constraint google_review_snapshot_expiry_max_30_days check (expires_at <= fetched_at + interval '30 days'),
  constraint google_review_snapshot_profile_url_valid check (
    profile_url ~* '^https://((maps\.app\.goo\.gl|g\.page|([a-z0-9-]+\.)?google\.com)(/|\?|$))'
  )
);

create table if not exists public.google_review_snapshot_items (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.google_review_snapshots(id) on delete cascade,
  google_review_id text not null,
  reviewer_display_name text,
  reviewer_is_anonymous boolean not null default false,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  google_created_at timestamptz,
  google_updated_at timestamptz,
  owner_reply text,
  owner_reply_updated_at timestamptz,
  source_order integer not null check (source_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (snapshot_id, google_review_id),
  unique (snapshot_id, source_order)
);

create index if not exists google_review_snapshot_items_display_idx
on public.google_review_snapshot_items (snapshot_id, source_order)
where comment is not null and char_length(comment) > 0;

create table if not exists public.google_review_sync_state (
  id smallint primary key default 1 check (id = 1),
  current_snapshot_id uuid references public.google_review_snapshots(id) on delete set null,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  next_due_at timestamptz not null default timezone('utc', now()),
  status text not null default 'idle' check (status in ('idle', 'running', 'success', 'error', 'reauthorization_required')),
  lease_token uuid,
  lease_until timestamptz,
  error_summary text,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.prevent_google_review_snapshot_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Google review snapshots are immutable';
end;
$$;

drop trigger if exists google_review_snapshots_immutable on public.google_review_snapshots;
create trigger google_review_snapshots_immutable
before update on public.google_review_snapshots
for each row execute function public.prevent_google_review_snapshot_mutation();

drop trigger if exists google_review_snapshot_items_immutable on public.google_review_snapshot_items;
create trigger google_review_snapshot_items_immutable
before update on public.google_review_snapshot_items
for each row execute function public.prevent_google_review_snapshot_mutation();

create or replace function public.purge_expired_google_review_snapshots(p_now timestamptz default timezone('utc', now()))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.google_review_snapshots
  where expires_at <= p_now;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

create or replace function public.claim_google_review_sync(p_now timestamptz, p_lease_until timestamptz)
returns table(claimed boolean, state_status text, next_due_at timestamptz, lease_token uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.google_review_sync_state as state
  set status = 'running',
      lease_token = gen_random_uuid(),
      lease_until = p_lease_until,
      last_attempt_at = p_now,
      error_summary = null,
      updated_at = p_now
  where state.id = 1
    and state.next_due_at <= p_now
    and (state.lease_until is null or state.lease_until <= p_now);

  if found then
    return query select true, s.status, s.next_due_at, s.lease_token
    from public.google_review_sync_state s where s.id = 1;
  else
    return query select false,
      case when s.lease_until > p_now then 'running' else 'not_due' end,
      s.next_due_at,
      s.lease_token
    from public.google_review_sync_state s where s.id = 1;
  end if;
end;
$$;

create or replace function public.publish_google_review_snapshot(
  p_average_rating numeric,
  p_total_review_count integer,
  p_fetched_at timestamptz,
  p_expires_at timestamptz,
  p_profile_url text,
  p_items jsonb,
  p_next_due_at timestamptz,
  p_lease_token uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_snapshot_id uuid;
begin
  insert into public.google_review_snapshots (average_rating, total_review_count, fetched_at, expires_at, profile_url)
  values (p_average_rating, p_total_review_count, p_fetched_at, p_expires_at, p_profile_url)
  returning id into new_snapshot_id;

  insert into public.google_review_snapshot_items (
    snapshot_id, google_review_id, reviewer_display_name, reviewer_is_anonymous, rating,
    comment, google_created_at, google_updated_at, owner_reply, owner_reply_updated_at, source_order
  )
  select new_snapshot_id, item.google_review_id, item.reviewer_display_name, item.reviewer_is_anonymous, item.rating,
    item.comment, item.google_created_at, item.google_updated_at, item.owner_reply, item.owner_reply_updated_at, item.source_order
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as item(
    google_review_id text,
    reviewer_display_name text,
    reviewer_is_anonymous boolean,
    rating smallint,
    comment text,
    google_created_at timestamptz,
    google_updated_at timestamptz,
    owner_reply text,
    owner_reply_updated_at timestamptz,
    source_order integer
  );

  update public.google_review_sync_state
  set current_snapshot_id = new_snapshot_id,
      last_success_at = p_fetched_at,
      next_due_at = p_next_due_at,
      status = 'success',
      lease_token = null,
      lease_until = null,
      error_summary = null,
      updated_at = p_fetched_at
  where id = 1 and status = 'running' and lease_token = p_lease_token;
  if not found then raise exception 'Google review sync lease is no longer valid'; end if;
  return new_snapshot_id;
end;
$$;

create or replace function public.release_google_review_sync(
  p_lease_token uuid,
  p_status text,
  p_next_due_at timestamptz,
  p_error_summary text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.google_review_sync_state
  set status = p_status,
      next_due_at = p_next_due_at,
      lease_token = null,
      lease_until = null,
      error_summary = left(p_error_summary, 200),
      updated_at = timezone('utc', now())
  where id = 1 and status = 'running' and lease_token = p_lease_token;
  return found;
end;
$$;

alter table public.google_review_snapshots enable row level security;
alter table public.google_review_snapshot_items enable row level security;
alter table public.google_review_sync_state enable row level security;

revoke all on table public.google_review_snapshots from public, anon, authenticated;
revoke all on table public.google_review_snapshot_items from public, anon, authenticated;
revoke all on table public.google_review_sync_state from public, anon, authenticated;
grant all privileges on table public.google_review_snapshots to service_role;
grant all privileges on table public.google_review_snapshot_items to service_role;
grant all privileges on table public.google_review_sync_state to service_role;

revoke all on function public.purge_expired_google_review_snapshots(timestamptz) from public, anon, authenticated;
revoke all on function public.claim_google_review_sync(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.publish_google_review_snapshot(numeric, integer, timestamptz, timestamptz, text, jsonb, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.release_google_review_sync(uuid, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.purge_expired_google_review_snapshots(timestamptz) to service_role;
grant execute on function public.claim_google_review_sync(timestamptz, timestamptz) to service_role;
grant execute on function public.publish_google_review_snapshot(numeric, integer, timestamptz, timestamptz, text, jsonb, timestamptz, uuid) to service_role;
grant execute on function public.release_google_review_sync(uuid, text, timestamptz, text) to service_role;

insert into public.google_review_sync_state (id)
values (1)
on conflict (id) do nothing;
