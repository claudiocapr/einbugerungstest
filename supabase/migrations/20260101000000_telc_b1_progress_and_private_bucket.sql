-- telc B1 Trainer: progress sync table, telc allow-list, private bucket.
--
-- DOCUMENTATION OF THE EXISTING SCHEMA. This was applied to the project
-- (ref armhdiedsojtpcqknpjt) on 6 Nov 2026 as migration
-- `telc_b1_progress_and_private_bucket`. It is written to be idempotent so it
-- can rebuild a fresh project, but policy names in the live project may
-- differ from the ones below: re-running it there could leave two equivalent
-- policies side by side. Compare in the dashboard first (Database -> Policies).

-- ---------------------------------------------------------------- progress
-- One row per user: the whole app store as JSON (see src/lib/storage.ts).

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own" on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Server-side timestamp, so devices with wrong clocks cannot confuse sync.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_updated_at on public.progress;
create trigger touch_updated_at
  before insert or update on public.progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- telc_access
-- Accounts allowed to read the private telc material. Managed by the owner in
-- the SQL editor; the app can only check whether its own row exists.

create table if not exists public.telc_access (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.telc_access enable row level security;

drop policy if exists "telc_access_select_own" on public.telc_access;
create policy "telc_access_select_own" on public.telc_access
  for select to authenticated
  using ((select auth.uid()) = user_id);
-- No insert/update/delete policies: only the owner (SQL editor) writes here.

-- ---------------------------------------------------------------- bucket
-- Private bucket for telc's files. Uploaded by the GitHub workflow
-- "Upload telc material" with the service-role key (bypasses RLS).

insert into storage.buckets (id, name, public)
values ('telc', 'telc', false)
on conflict (id) do nothing;

drop policy if exists "telc_read_allowlisted" on storage.objects;
create policy "telc_read_allowlisted" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'telc'
    and exists (
      select 1 from public.telc_access t
      where t.user_id = (select auth.uid())
    )
  );

-- Owner allow-listing (run once in the SQL editor, not part of the migration):
-- insert into public.telc_access (user_id) values ('a1053c14-3a76-4982-9d76-50cf9539316a') on conflict do nothing;
