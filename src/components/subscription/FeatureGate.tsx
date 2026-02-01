import { ReactNode } from 'react';
import { usePlan } from '@/hooks/usePlan';
import { UpgradeCTA } from './UpgradeCTA';
import { Skeleton } from '@/components/ui/skeleton';

type FeatureKey = 'canExport' | 'canViewCharts' | 'canUseTimeline' | 'canUseQuestionnaires';

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  featureLabel?: string;
  requiredPlan?: string;
}

const FEATURE_LABELS: Record<FeatureKey, string> = {
  canExport: 'Exportação de dados',
  canViewCharts: 'Gráficos de evolução',
  canUseTimeline: 'Linha do tempo',
  canUseQuestionnaires: 'Questionários',
};

export function FeatureGate({
  feature,
  children,
  fallback,
  featureLabel,
  requiredPlan,
}: FeatureGateProps) {
  const plan = usePlan();

  if (plan.isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const hasAccess = plan[feature];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradeCTA
      feature={featureLabel || FEATURE_LABELS[feature]}
      requiredPlan={requiredPlan}
    />
  );
}
