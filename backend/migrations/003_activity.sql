-- FogMind migration 003: active study days
--
-- Records the calendar days on which a user answered at least one question, so
-- the learning streak survives reloads and devices. One row per user per day,
-- upserted on (user_id, activity_date).
--
-- The date is stored as a plain date rather than a timestamp on purpose. The
-- client decides which calendar day an answer belongs to using the reader's own
-- local clock, so a session just before midnight counts for the day it felt
-- like rather than for whatever UTC happened to be.
--
-- No streak counters are stored. Current and longest streaks are derived from
-- this set of dates every time they are shown, so they cannot drift out of step
-- with the underlying activity or be corrupted by a missed write.
--
-- Paste this into the Supabase SQL Editor and run it. It is re runnable: the
-- table uses "if not exists" and every policy is dropped first.


-- 1. Table -------------------------------------------------------------------

create table if not exists public.activity_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, activity_date)
);


-- 2. Index -------------------------------------------------------------------
--
-- Every policy filters on user_id and the streak loads a user's whole history,
-- so the lookup is always by user. The unique constraint already provides a
-- (user_id, activity_date) index which serves that read, but Postgres does not
-- index a foreign key column on its own, and the cascade from auth.users needs
-- one to avoid a sequential scan on account deletion.

create index if not exists activity_days_user_id_idx
  on public.activity_days (user_id);


-- 3. Row level security ------------------------------------------------------
--
-- Owner scoped, matching the 001 and 002 style. auth.uid() is wrapped in a
-- scalar subquery so it is evaluated once per statement.

alter table public.activity_days enable row level security;

drop policy if exists activity_days_select_own on public.activity_days;
create policy activity_days_select_own on public.activity_days
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists activity_days_insert_own on public.activity_days;
create policy activity_days_insert_own on public.activity_days
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists activity_days_update_own on public.activity_days;
create policy activity_days_update_own on public.activity_days
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists activity_days_delete_own on public.activity_days;
create policy activity_days_delete_own on public.activity_days
  for delete to authenticated
  using ((select auth.uid()) = user_id);
