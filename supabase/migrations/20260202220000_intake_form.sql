-- Migration: Intake Form (Patient Context)
-- Created: 2026-02-02

create table if not exists public.patient_intake_forms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  preferred_name text,
  age integer not null,
  gender_identity text,
  main_complaint text,
  has_therapy_history boolean default false,
  therapy_history_details text,
  medications text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz default now() not null
);

alter table public.patient_intake_forms enable row level security;

-- 1. Users can select their own forms
create policy "Users can select their own forms"
  on public.patient_intake_forms for select
  using (auth.uid() = user_id);

-- 2. Users can insert their own forms (Append-only versioning)
create policy "Users can insert their own forms"
  on public.patient_intake_forms for insert
  with check (auth.uid() = user_id);

-- 3. Therapists can view forms of their linked patients
create policy "Therapists can view forms of their linked patients"
  on public.patient_intake_forms for select
  using (
    exists (
      select 1 from public.patient_therapist_relations
      where patient_id = public.patient_intake_forms.user_id
      and therapist_id = auth.uid()
      and status = 'active'
    )
  );

-- Indexes for performance
create index if not exists idx_intake_forms_user_id on public.patient_intake_forms(user_id);
create index if not exists idx_intake_forms_created_at on public.patient_intake_forms(created_at desc);
