create or replace function public.purge_expired_google_review_snapshots(p_now timestamptz default timezone('utc', now()))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.google_review_snapshots as snapshot
  where snapshot.expires_at <= p_now
    and not exists (
      select 1
      from public.google_review_sync_state as state
      where state.id = 1
        and state.current_snapshot_id = snapshot.id
    );
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
