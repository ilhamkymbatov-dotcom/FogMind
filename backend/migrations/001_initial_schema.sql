-- FogMind initial schema
--
-- Paste this into the Supabase SQL Editor and run it as a single script.
-- It is written to be re runnable: every object is created with "if not exists"
-- or dropped first, so running it twice is harmless.
--
-- Contents:
--   1. Tables
--   2. Indexes
--   3. Row level security
--   4. New user trigger


-- ============================================================================
-- 1. Tables
-- ============================================================================

-- Extends auth.users with application profile data.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  source_type text not null
    check (source_type in ('pdf', 'docx', 'markdown', 'text')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

-- Knowledge graph nodes.
create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  created_at timestamptz not null default now()
);

-- Connections between nodes.
create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_node_id uuid not null references public.nodes (id) on delete cascade,
  target_node_id uuid not null references public.nodes (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  correct_answer text not null,
  -- Answer choices for multiple choice questions. Null for open answer.
  options jsonb
    check (options is null or jsonb_typeof(options) = 'array'),
  -- 1 easy, 2 medium, 3 hard.
  difficulty int not null default 1
    check (difficulty in (1, 2, 3)),
  created_at timestamptz not null default now()
);

-- Per user, per node learning state.
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id uuid not null references public.nodes (id) on delete cascade,
  state text not null default 'fogged'
    check (state in ('fogged', 'revealed', 'mastered')),
  correct_count int not null default 0 check (correct_count >= 0),
  attempt_count int not null default 0 check (attempt_count >= 0),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, node_id)
);


-- ============================================================================
-- 2. Indexes
-- ============================================================================
--
-- Postgres does not index foreign key columns automatically. Every policy below
-- filters on user_id, and the app reads nodes and edges by document_id, so these
-- indexes keep those paths off sequential scans.

create index if not exists documents_user_id_idx on public.documents (user_id);

create index if not exists nodes_user_id_idx on public.nodes (user_id);
create index if not exists nodes_document_id_idx on public.nodes (document_id);

create index if not exists edges_user_id_idx on public.edges (user_id);
create index if not exists edges_document_id_idx on public.edges (document_id);
create index if not exists edges_source_node_id_idx on public.edges (source_node_id);
create index if not exists edges_target_node_id_idx on public.edges (target_node_id);

create index if not exists questions_user_id_idx on public.questions (user_id);
create index if not exists questions_node_id_idx on public.questions (node_id);

-- progress.user_id is already covered by the leading column of the
-- unique (user_id, node_id) index, so only node_id needs its own.
create index if not exists progress_node_id_idx on public.progress (node_id);


-- ============================================================================
-- 3. Row level security
-- ============================================================================
--
-- Every table is owner scoped. A user may only touch rows whose user_id matches
-- their auth.uid(), or whose id matches it in the case of profiles.
--
-- auth.uid() is wrapped in a scalar subquery so Postgres evaluates it once per
-- statement instead of once per row.
--
-- Update policies carry both "using" and "with check" so a user cannot reassign
-- one of their rows to a different owner.

alter table public.profiles  enable row level security;
alter table public.documents enable row level security;
alter table public.nodes     enable row level security;
alter table public.edges     enable row level security;
alter table public.questions enable row level security;
alter table public.progress  enable row level security;


-- profiles ------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);


-- documents -----------------------------------------------------------------

drop policy if exists documents_select_own on public.documents;
create policy documents_select_own on public.documents
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists documents_insert_own on public.documents;
create policy documents_insert_own on public.documents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists documents_update_own on public.documents;
create policy documents_update_own on public.documents
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists documents_delete_own on public.documents;
create policy documents_delete_own on public.documents
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- nodes ---------------------------------------------------------------------

drop policy if exists nodes_select_own on public.nodes;
create policy nodes_select_own on public.nodes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists nodes_insert_own on public.nodes;
create policy nodes_insert_own on public.nodes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists nodes_update_own on public.nodes;
create policy nodes_update_own on public.nodes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists nodes_delete_own on public.nodes;
create policy nodes_delete_own on public.nodes
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- edges ---------------------------------------------------------------------

drop policy if exists edges_select_own on public.edges;
create policy edges_select_own on public.edges
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists edges_insert_own on public.edges;
create policy edges_insert_own on public.edges
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists edges_update_own on public.edges;
create policy edges_update_own on public.edges
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists edges_delete_own on public.edges;
create policy edges_delete_own on public.edges
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- questions -----------------------------------------------------------------

drop policy if exists questions_select_own on public.questions;
create policy questions_select_own on public.questions
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists questions_insert_own on public.questions;
create policy questions_insert_own on public.questions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists questions_update_own on public.questions;
create policy questions_update_own on public.questions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists questions_delete_own on public.questions;
create policy questions_delete_own on public.questions
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- progress ------------------------------------------------------------------

drop policy if exists progress_select_own on public.progress;
create policy progress_select_own on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists progress_insert_own on public.progress;
create policy progress_insert_own on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists progress_update_own on public.progress;
create policy progress_update_own on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists progress_delete_own on public.progress;
create policy progress_delete_own on public.progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ============================================================================
-- 4. New user trigger
-- ============================================================================
--
-- Creates the matching profiles row whenever Supabase Auth registers a user.
--
-- security definer lets the function write to public.profiles even though the
-- signing up user has no session yet. search_path is pinned to empty so the
-- elevated function cannot be redirected by a caller controlled search_path,
-- which is why every reference below is schema qualified.
--
-- on conflict do nothing keeps signup from failing if the row already exists.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
