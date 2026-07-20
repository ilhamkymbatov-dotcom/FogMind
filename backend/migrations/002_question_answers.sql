-- FogMind migration 002: per question answer history
--
-- Stores the outcome of each answered question so node completion, mastery and
-- the review round survive reloads. One row per user per question, upserted on
-- (user_id, question_id).
--
-- Paste this into the Supabase SQL Editor and run it. It is re runnable: the
-- table uses "if not exists" and every policy is dropped first.


-- 1. Table -------------------------------------------------------------------

create table if not exists public.question_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (user_id, question_id)
);


-- 2. Index -------------------------------------------------------------------
--
-- Every policy filters on user_id, and the game loads answers by user; the
-- unique constraint already indexes (user_id, question_id), and this covers
-- lookups keyed on question_id when filtering a document's questions.

create index if not exists question_answers_question_id_idx
  on public.question_answers (question_id);


-- 3. Row level security ------------------------------------------------------
--
-- Owner scoped, matching the 001 style. auth.uid() is wrapped in a scalar
-- subquery so it is evaluated once per statement.

alter table public.question_answers enable row level security;

drop policy if exists question_answers_select_own on public.question_answers;
create policy question_answers_select_own on public.question_answers
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists question_answers_insert_own on public.question_answers;
create policy question_answers_insert_own on public.question_answers
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists question_answers_update_own on public.question_answers;
create policy question_answers_update_own on public.question_answers
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists question_answers_delete_own on public.question_answers;
create policy question_answers_delete_own on public.question_answers
  for delete to authenticated
  using ((select auth.uid()) = user_id);
