-- Migration: Immediate Support Button
-- Created: 2026-02-02

-- 1. support_requests table
create table if not exists public.support_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('therapist_notify', 'find_professional', 'external_help')),
  target_therapist_id uuid references public.profiles(id) on delete set null,
  user_ip text,
  created_at timestamptz default now() not null
);

alter table public.support_requests enable row level security;

-- 2. RLS Policies

-- Patient can create their own requests
create policy "Users can insert own support requests"
  on public.support_requests for insert
  with check (auth.uid() = user_id);

-- Patient can view their own requests
create policy "Users can view own support requests"
  on public.support_requests for select
  using (auth.uid() = user_id);

-- Therapist can view requests directed to them or from their patients
create policy "Therapists can view relevant support requests"
  on public.support_requests for select
  using (
    -- Case 1: Directed to them
    (target_therapist_id = auth.uid())
    or
    -- Case 2: From their linked valid patients
    (
      exists (
        select 1 from public.patient_therapist_relations
        where patient_id = public.support_requests.user_id
        and therapist_id = auth.uid()
        and status = 'active'
      )
    )
  );

-- 3. Audit Logging Trigger
-- Assumes 'audit_logs' table exists from previous migrations

create or replace function public.log_support_request()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (actor_id, action, target_resource, metadata, ip_address, created_at)
  values (
    new.user_id,
    'create_support_request',
    new.id::text,
    jsonb_build_object(
      'type', new.type,
      'target_therapist_id', new.target_therapist_id
    ),
    new.user_ip,
    now()
  );
  return new;
end;
$$;

create trigger on_support_request_created
after insert on public.support_requests
for each row execute function public.log_support_request();

-- Index
create index if not exists idx_support_requests_user_id on public.support_requests(user_id);
create index if not exists idx_support_requests_created_at on public.support_requests(created_at desc);
