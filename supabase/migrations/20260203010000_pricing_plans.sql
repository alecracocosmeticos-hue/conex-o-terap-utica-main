-- Migration: Pricing Plans (Therapist Tiers)
-- Created: 2026-02-03

-- Insert Therapist Plans
insert into public.plans (plan_key, role, name, price_brl, limits, features)
values
  (
    'therapist_starter',
    'therapist',
    'Starter',
    29.90,
    '{"patients": 5}'::jsonb,
    '{
      "Perfil Narrativo Básico",
      "Listagem no Marketplace",
      "Até 5 pacientes ativos"
    }'::text[]
  ),
  (
    'therapist_growth',
    'therapist',
    'Growth',
    59.90,
    '{"patients": 20}'::jsonb,
    '{
      "Perfil Profissional Completo",
      "Destaque na Busca",
      "Até 20 pacientes ativos",
      "Acesso a ferramentas clínicas"
    }'::text[]
  ),
  (
    'therapist_pro',
    'therapist',
    'Pro',
    79.90,
    '{"patients": 35}'::jsonb,
    '{
      "Prioridade no Match",
      "Gestão de Agenda Completa",
      "Até 35 pacientes ativos",
      "Suporte Prioritário"
    }'::text[]
  ),
  (
    'therapist_scale',
    'therapist',
    'Scale',
    129.90,
    '{"patients": 999}'::jsonb,
    '{
      "Pacientes Ilimitados",
      "Personalização de Marca",
      "API de Integração",
      "Consultoria de Crescimento"
    }'::text[]
  )
on conflict (plan_key) do update
set 
  price_brl = excluded.price_brl,
  limits = excluded.limits,
  features = excluded.features;
