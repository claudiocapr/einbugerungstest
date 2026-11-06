-- telc B1 Trainer: anonymous first-party analytics, error logs, owner statistics.
--
-- * public.events / public.app_errors: anyone (anon or signed in) may INSERT,
--   within strict size limits, and only into the columns the app sends. Nobody
--   may update or delete through the API; only app admins may read.
-- * public.app_admins: who may read the statistics (the owner).
-- * admin_* functions: aggregates for the in-app "Statistik" screen. They run
--   as the caller (security invoker), so row-level security decides: for
--   anyone who is not in app_admins they return nothing.
-- * purge_old_analytics(): deletes rows older than 180 days. Not callable
--   through the API; run it from the SQL editor or schedule it with pg_cron.
--
-- Idempotent: safe to run more than once.

-- ---------------------------------------------------------------- app_admins

create table if not exists public.app_admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

revoke all on table public.app_admins from anon, authenticated;
grant select on table public.app_admins to authenticated;

drop policy if exists "app_admins_select_own" on public.app_admins;
create policy "app_admins_select_own" on public.app_admins
  for select to authenticated
  using ((select auth.uid()) = user_id);
-- No write policies: the owner adds rows in the SQL editor.

-- Owner (run once by hand in the SQL editor; intentionally not executed here):
-- insert into public.app_admins (user_id) values ('a1053c14-3a76-4982-9d76-50cf9539316a') on conflict do nothing;

-- ---------------------------------------------------------------- events

create table if not exists public.events (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  install_id  text not null,
  name        text not null,
  props       jsonb not null default '{}'::jsonb,
  app_version text,
  path        text,
  constraint events_install_id_len check (char_length(install_id) between 8 and 64),
  constraint events_name_format check (char_length(name) between 1 and 64 and name ~ '^[a-z0-9_.-]+$'),
  constraint events_props_object check (jsonb_typeof(props) = 'object'),
  constraint events_props_size check (pg_column_size(props) <= 2048),
  constraint events_app_version_len check (app_version is null or char_length(app_version) <= 32),
  constraint events_path_len check (path is null or char_length(path) <= 200)
);

create index if not exists events_at_idx on public.events (at);
create index if not exists events_name_at_idx on public.events (name, at);

alter table public.events enable row level security;

-- Column-level grants: the API may only supply these columns, so `id` and
-- `at` always come from the server.
revoke all on table public.events from anon, authenticated;
grant insert (install_id, name, props, app_version, path) on table public.events to anon, authenticated;
grant select on table public.events to authenticated;
grant usage on sequence public.events_id_seq to anon, authenticated;

drop policy if exists "events_insert_anyone" on public.events;
create policy "events_insert_anyone" on public.events
  for insert to anon, authenticated
  with check (
    char_length(install_id) between 8 and 64
    and char_length(name) <= 64
    and name ~ '^[a-z0-9_.-]+$'
    and pg_column_size(props) <= 2048
  );

drop policy if exists "events_select_admin" on public.events;
create policy "events_select_admin" on public.events
  for select to authenticated
  using (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));

-- ---------------------------------------------------------------- app_errors

create table if not exists public.app_errors (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  install_id  text not null,
  message     text not null,
  stack       text,
  context     text,
  path        text,
  user_agent  text,
  app_version text,
  constraint app_errors_install_id_len check (char_length(install_id) between 8 and 64),
  constraint app_errors_message_len check (char_length(message) between 1 and 500),
  constraint app_errors_stack_len check (stack is null or char_length(stack) <= 4000),
  constraint app_errors_context_len check (context is null or char_length(context) <= 100),
  constraint app_errors_path_len check (path is null or char_length(path) <= 200),
  constraint app_errors_user_agent_len check (user_agent is null or char_length(user_agent) <= 300),
  constraint app_errors_app_version_len check (app_version is null or char_length(app_version) <= 32)
);

create index if not exists app_errors_at_idx on public.app_errors (at);

alter table public.app_errors enable row level security;

revoke all on table public.app_errors from anon, authenticated;
grant insert (install_id, message, stack, context, path, user_agent, app_version)
  on table public.app_errors to anon, authenticated;
grant select on table public.app_errors to authenticated;
grant usage on sequence public.app_errors_id_seq to anon, authenticated;

drop policy if exists "app_errors_insert_anyone" on public.app_errors;
create policy "app_errors_insert_anyone" on public.app_errors
  for insert to anon, authenticated
  with check (
    char_length(install_id) between 8 and 64
    and char_length(message) <= 500
    and coalesce(char_length(stack), 0) <= 4000
  );

drop policy if exists "app_errors_select_admin" on public.app_errors;
create policy "app_errors_select_admin" on public.app_errors
  for select to authenticated
  using (exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())));

-- ---------------------------------------------------------------- statistics (admin only via RLS)

-- Days are counted in German time. p_days is clamped to 1..365.

create or replace function public.admin_daily_installs(p_days integer default 30)
returns table (day date, installs bigint, events bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select (e.at at time zone 'Europe/Berlin')::date,
         count(distinct e.install_id),
         count(*)
  from public.events e
  where e.at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by 1
  order by 1;
$$;

create or replace function public.admin_events_by_day(p_days integer default 30)
returns table (day date, name text, n bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select (e.at at time zone 'Europe/Berlin')::date, e.name, count(*)
  from public.events e
  where e.at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by 1, 2
  order by 1, 3 desc;
$$;

create or replace function public.admin_top_events(p_days integer default 30)
returns table (name text, n bigint, installs bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.name, count(*), count(distinct e.install_id)
  from public.events e
  where e.at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by e.name
  order by 2 desc
  limit 50;
$$;

-- Screens opened, from the shell's "screen.view" events ({ section: "<id>" }).
create or replace function public.admin_section_usage(p_days integer default 30)
returns table (section text, views bigint, installs bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(e.props ->> 'section', '?'), count(*), count(distinct e.install_id)
  from public.events e
  where e.name = 'screen.view'
    and e.at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by 1
  order by 2 desc;
$$;

-- Pass rate of every event that carries a boolean "passed" prop
-- (e.g. "modelltest.finished", "telc.sheet_scored").
create or replace function public.admin_pass_rate(p_days integer default 90)
returns table (name text, attempts bigint, passed bigint, avg_points numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.name,
         count(*),
         count(*) filter (where e.props ->> 'passed' = 'true'),
         round(avg((e.props ->> 'points')::numeric) filter (where jsonb_typeof(e.props -> 'points') = 'number'), 1)
  from public.events e
  where e.props ->> 'passed' in ('true', 'false')
    and e.at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by e.name
  order by 2 desc;
$$;

create or replace function public.admin_recent_errors(p_limit integer default 50)
returns table (at timestamptz, message text, context text, path text, app_version text, user_agent text, stack text)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.at, r.message, r.context, r.path, r.app_version, r.user_agent, r.stack
  from public.app_errors r
  order by r.at desc
  limit greatest(1, least(p_limit, 200));
$$;

revoke all on function public.admin_daily_installs(integer) from public, anon;
revoke all on function public.admin_events_by_day(integer) from public, anon;
revoke all on function public.admin_top_events(integer) from public, anon;
revoke all on function public.admin_section_usage(integer) from public, anon;
revoke all on function public.admin_pass_rate(integer) from public, anon;
revoke all on function public.admin_recent_errors(integer) from public, anon;
grant execute on function public.admin_daily_installs(integer) to authenticated;
grant execute on function public.admin_events_by_day(integer) to authenticated;
grant execute on function public.admin_top_events(integer) to authenticated;
grant execute on function public.admin_section_usage(integer) to authenticated;
grant execute on function public.admin_pass_rate(integer) to authenticated;
grant execute on function public.admin_recent_errors(integer) to authenticated;

-- ---------------------------------------------------------------- retention

-- Deletes analytics and error rows older than p_days (default 180). Runs as
-- the caller; only the database owner (SQL editor, pg_cron) may execute it.
create or replace function public.purge_old_analytics(p_days integer default 180)
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.events where at < now() - make_interval(days => greatest(30, p_days));
  delete from public.app_errors where at < now() - make_interval(days => greatest(30, p_days));
$$;

revoke all on function public.purge_old_analytics(integer) from public, anon, authenticated;

-- Optional, if the pg_cron extension is enabled (Database -> Extensions):
--   select cron.schedule('purge-old-analytics', '17 3 * * *', $$select public.purge_old_analytics(180)$$);
-- Without pg_cron, run this now and then in the SQL editor:
--   select public.purge_old_analytics(180);
