import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';

interface UpgradeCTAProps {
  feature: string;
  description?: string;
  requiredPlan?: string;
  compact?: boolean;
}

export function UpgradeCTA({ 
  feature, 
  description, 
  requiredPlan,
  compact = false 
}: UpgradeCTAProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1">
          {feature}
        </span>
        <Button variant="link" size="sm" asChild className="h-auto p-0">
          <Link to="/planos">
            Fazer upgrade
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">
            {requiredPlan ? `Recurso do Plano ${requiredPlan}` : 'Recurso Premium'}
          </CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {feature}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/planos">Ver planos</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/planos">
              Fazer upgrade
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
