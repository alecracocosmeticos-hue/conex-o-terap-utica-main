import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { getPlanFeatures, type PlanFeatures } from '@/config/plans';

export function usePlan() {
  const { plan, isSubscribed, isLoading } = useSubscription();

  const features = useMemo((): PlanFeatures => {
    return getPlanFeatures(plan);
  }, [plan]);

  return {
    plan,
    isSubscribed,
    isLoading,
    ...features,
  };
}
