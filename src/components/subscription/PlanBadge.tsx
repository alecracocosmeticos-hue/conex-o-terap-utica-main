import { Badge } from '@/components/ui/badge';
import { getPlanByKey } from '@/config/plans';
import { Crown, Sparkles, Zap } from 'lucide-react';

interface PlanBadgeProps {
  planKey: string;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function PlanBadge({ planKey, showIcon = true, size = 'default' }: PlanBadgeProps) {
  const plan = getPlanByKey(planKey);

  if (!plan || planKey === 'none') {
    return (
      <Badge variant="secondary" className={size === 'sm' ? 'text-xs' : ''}>
        Gratuito
      </Badge>
    );
  }

  const getIcon = () => {
    if (planKey.includes('scale')) return <Crown className="h-3 w-3" />;
    if (planKey.includes('growth')) return <Sparkles className="h-3 w-3" />;
    return <Zap className="h-3 w-3" />;
  };

  const getVariant = (): 'default' | 'secondary' | 'outline' => {
    if (planKey.includes('scale')) return 'default';
    if (planKey.includes('growth') || planKey.includes('essential')) return 'default';
    return 'secondary';
  };

  return (
    <Badge variant={getVariant()} className={size === 'sm' ? 'text-xs' : ''}>
      {showIcon && getIcon()}
      {showIcon && <span className="ml-1">{plan.name}</span>}
      {!showIcon && plan.name}
    </Badge>
  );
}
