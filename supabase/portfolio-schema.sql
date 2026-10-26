-- Apply only to the dedicated portfolio project.
create table public.portfolio_entries (
  collection text not null check (collection in ('projects','sketches','films','case_studies')),
  id text not null,
  position integer not null default 0,
  published boolean not null default false,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  primary key (collection,id)
);
alter table public.portfolio_entries enable row level security;
revoke all on public.portfolio_entries from anon, authenticated;
grant select on public.portfolio_entries to anon, authenticated;
grant all on public.portfolio_entries to service_role;
create policy "Read published portfolio entries" on public.portfolio_entries
  for select to anon, authenticated using (published);
create index portfolio_entries_published_order on public.portfolio_entries(collection,position) where published;
