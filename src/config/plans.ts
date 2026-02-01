import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface PlanConfig {
  price_id: string;
  product_id: string;
  plan_key: string;
  name: string;
  price: number;
  role: AppRole;
  maxPatients?: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  trialDays?: number; // Trial period in days (14 or 30)
}

// Patient Plans
export const PATIENT_PLANS: PlanConfig[] = [
  {
    price_id: 'price_1StYFaENOmAXvvJcsEYuA0r0',
    product_id: 'prod_TrGnGXJjteXpy6',
    plan_key: 'patient_essential',
    name: 'Essencial',
    price: 24.90,
    role: 'patient',
    description: 'Acompanhamento emocional completo',
    features: [
      'Check-ins e diário ilimitados',
      'Gráficos de evolução emocional',
      'Linha do tempo interativa',
      'Questionários de auto-observação',
      'Compartilhamento com terapeuta',
      'Suporte prioritário',
    ],
    highlighted: true,
    trialDays: 14,
  },
];

// Therapist Plans
export const THERAPIST_PLANS: PlanConfig[] = [
  {
    price_id: 'price_1StYGZENOmAXvvJcXESZg3do',
    product_id: 'prod_TrGoJXZ6Fgac8G',
    plan_key: 'therapist_starter',
    name: 'Starter',
    price: 59.90,
    role: 'therapist',
    maxPatients: 10,
    description: 'Para quem está começando',
    features: [
      'Até 10 pacientes ativos',
      'Visualização de dados compartilhados',
      'Notas privadas por paciente',
      'Linha do tempo dos pacientes',
      'Agenda básica',
    ],
    trialDays: 7,
  },
  {
    price_id: 'price_1StYKvENOmAXvvJciFFZ4R8O',
    product_id: 'prod_TrGst1UgwisJ68',
    plan_key: 'therapist_growth',
    name: 'Growth',
    price: 89.90,
    role: 'therapist',
    maxPatients: 30,
    description: 'Para práticas em crescimento',
    features: [
      'Até 30 pacientes ativos',
      'Tudo do plano Starter',
      'Gráficos de evolução por paciente',
      'Questionários personalizados',
      'Notificações inteligentes',
      'Suporte prioritário',
    ],
    highlighted: true,
    trialDays: 7,
  },
  {
    price_id: 'price_1StYOSENOmAXvvJcgSYwcda6',
    product_id: 'prod_TrGwCV4yfk3XYE',
    plan_key: 'therapist_scale',
    name: 'Scale',
    price: 159.90,
    role: 'therapist',
    maxPatients: 100,
    description: 'Para clínicas e grandes práticas',
    features: [
      'Até 100 pacientes ativos',
      'Tudo do plano Growth',
      'Exportação de dados e relatórios',
      'Relatórios por paciente',
      'API de integração',
      'Suporte dedicado',
    ],
    trialDays: 7,
  },
];

// All plans combined
export const ALL_PLANS = [...PATIENT_PLANS, ...THERAPIST_PLANS];

// Get plan by key
export const getPlanByKey = (planKey: string): PlanConfig | undefined => {
  return ALL_PLANS.find(p => p.plan_key === planKey);
};

// Get plan by product ID
export const getPlanByProductId = (productId: string): PlanConfig | undefined => {
  return ALL_PLANS.find(p => p.product_id === productId);
};

// Get plans by role
export const getPlansByRole = (role: AppRole): PlanConfig[] => {
  if (role === 'patient') return PATIENT_PLANS;
  if (role === 'therapist') return THERAPIST_PLANS;
  return [];
};

// Plan features lookup (matches database plans table)
export interface PlanFeatures {
  maxPatients: number | null;
  canExport: boolean;
  canViewCharts: boolean;
  canUseTimeline: boolean;
  canUseQuestionnaires: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  none: {
    maxPatients: null,
    canExport: false,
    canViewCharts: false,
    canUseTimeline: false,
    canUseQuestionnaires: false,
  },
  patient_essential: {
    maxPatients: null,
    canExport: false,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
  therapist_starter: {
    maxPatients: 10,
    canExport: false,
    canViewCharts: false,
    canUseTimeline: true,
    canUseQuestionnaires: false,
  },
  therapist_growth: {
    maxPatients: 30,
    canExport: false,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
  therapist_scale: {
    maxPatients: 100,
    canExport: true,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
};

export const getPlanFeatures = (planKey: string): PlanFeatures => {
  return PLAN_FEATURES[planKey] || PLAN_FEATURES.none;
};
