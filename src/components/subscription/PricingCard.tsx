import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { type PlanConfig } from '@/config/plans';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PlanConfig;
  isCurrentPlan?: boolean;
  onSelect: (plan: PlanConfig) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  plan,
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.highlighted && 'border-primary shadow-lg scale-[1.02]',
        isCurrentPlan && 'ring-2 ring-primary'
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          Mais Popular
        </div>
      )}
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4" variant="secondary">
          Seu Plano
        </Badge>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">
            R$ {plan.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-muted-foreground">/mês</span>
        </div>
        {plan.maxPatients && (
          <p className="text-sm text-primary font-medium mt-2">
            Até {plan.maxPatients} pacientes ativos
          </p>
        )}
        {plan.trialDays && (
          <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium mt-2">
            {plan.trialDays} dias grátis para experimentar
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          onClick={() => onSelect(plan)}
          disabled={disabled || isLoading || isCurrentPlan}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isCurrentPlan ? (
            'Plano Atual'
          ) : plan.trialDays ? (
            `Começar ${plan.trialDays} dias grátis`
          ) : (
            'Assinar Agora'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
