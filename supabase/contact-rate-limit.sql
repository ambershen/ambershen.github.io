-- Only the server-side service role can read or change these counters.
create table if not exists public.contact_send_limits (
  bucket text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
alter table public.contact_send_limits enable row level security;
revoke all on public.contact_send_limits from public, anon, authenticated;
grant select, insert, update, delete on public.contact_send_limits to service_role;
create or replace function public.claim_contact_send(p_keys text[])
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  current_hour text := to_char(now() at time zone 'UTC','YYYY-MM-DD-HH24');
  current_day text := to_char(now() at time zone 'UTC','YYYY-MM-DD');
  keys text[];
  k text;
begin
  if cardinality(p_keys) <> 2 or p_keys[1] !~ '^[0-9a-f]{64}$' or p_keys[2] !~ '^[0-9a-f]{64}$' then return false; end if;
  perform pg_advisory_xact_lock(726035891);
  delete from public.contact_send_limits where expires_at < now();
  keys := array['day:'||current_day, 'hour:'||current_hour||':'||p_keys[1], 'hour:'||current_hour||':'||p_keys[2]];
  if exists(select 1 from public.contact_send_limits where bucket=keys[1] and hits>=50)
    or exists(select 1 from public.contact_send_limits where bucket=any(keys[2:3]) and hits>=3) then return false; end if;
  foreach k in array keys loop
    insert into public.contact_send_limits(bucket,hits,expires_at) values(k,1,now()+interval '25 hours')
    on conflict(bucket) do update set hits=public.contact_send_limits.hits+1;
  end loop;
  return true;
end;
$$;
revoke all on function public.claim_contact_send(text[]) from public, anon, authenticated;
grant execute on function public.claim_contact_send(text[]) to service_role;
