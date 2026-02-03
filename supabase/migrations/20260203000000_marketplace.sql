-- Migration: Light Marketplace (Profiles & Requests)
-- Created: 2026-02-03

-- 1. Therapist Public Profiles
create table if not exists public.therapist_public_profiles (
  id uuid default gen_random_uuid() primary key,
  therapist_id uuid references public.profiles(id) on delete cascade not null unique,
  crp_number text not null,
  display_name text not null,
  bio text,
  specialties text[] default '{}',
  is_accepting_new boolean default true,
  is_visible boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.therapist_public_profiles enable row level security;

-- Public can view visible profiles
create policy "Anyone can view visible therapist profiles"
  on public.therapist_public_profiles for select
  using (is_visible = true);

-- Therapists can manage their own profile
create policy "Therapists can insert own public profile"
  on public.therapist_public_profiles for insert
  with check (auth.uid() = therapist_id);

create policy "Therapists can update own public profile"
  on public.therapist_public_profiles for update
  using (auth.uid() = therapist_id);

-- 2. Connection Requests
create table if not exists public.connection_requests (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  therapist_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  message text,
  response_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.connection_requests enable row level security;

-- Patient can create requests
create policy "Patients can insert connection requests"
  on public.connection_requests for insert
  with check (auth.uid() = patient_id);

-- Patient can view their own requests
create policy "Patients can view own connection requests"
  on public.connection_requests for select
  using (auth.uid() = patient_id);

-- Therapist can view requests sent to them
create policy "Therapists can view received connection requests"
  on public.connection_requests for select
  using (auth.uid() = therapist_id);

-- Therapist can update requests sent to them (accept/reject)
create policy "Therapists can update received connection requests"
  on public.connection_requests for update
  using (auth.uid() = therapist_id);

-- Indexes
create index if not exists idx_public_profiles_visible on public.therapist_public_profiles(is_visible);
create index if not exists idx_connection_requests_patient on public.connection_requests(patient_id);
create index if not exists idx_connection_requests_therapist on public.connection_requests(therapist_id);
create index if not exists idx_connection_requests_status on public.connection_requests(status);
