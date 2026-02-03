-- Migration: Self-View (Patient Narratives)
-- Created: 2026-02-02

create table if not exists public.patient_narratives (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content jsonb not null default '{}'::jsonb,
  shared_with_therapist boolean not null default false,
  shared_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.patient_narratives enable row level security;

-- 1. Users can view their own narratives
create policy "Users can view their own narratives"
  on public.patient_narratives for select
  using (auth.uid() = user_id);

-- 2. Users can insert their own narratives
create policy "Users can insert their own narratives"
  on public.patient_narratives for insert
  with check (auth.uid() = user_id);

-- 3. Users can update their own narratives (re-used for toggling visibility)
create policy "Users can update their own narratives"
  on public.patient_narratives for update
  using (auth.uid() = user_id);

-- 4. Therapists can view shared narratives of their patients
create policy "Therapists can view shared narratives of their patients"
  on public.patient_narratives for select
  using (
    shared_with_therapist = true 
    and exists (
      select 1 from public.patient_therapist_relations
      where patient_id = public.patient_narratives.user_id
      and therapist_id = auth.uid()
      and status = 'active'
    )
  );

-- Index for performance
create index if not exists idx_patient_narratives_user_id on public.patient_narratives(user_id);
create index if not exists idx_patient_narratives_created_at on public.patient_narratives(created_at desc);
