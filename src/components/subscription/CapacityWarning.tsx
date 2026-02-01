import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCapacity } from '@/hooks/useCapacity';
import { AlertTriangle, Users, ArrowRight } from 'lucide-react';

interface CapacityWarningProps {
  showAlways?: boolean;
}

export function CapacityWarning({ showAlways = false }: CapacityWarningProps) {
  const { currentPatients, maxPatients, usagePercent, isNearLimit, isAtLimit, isLoading } = useCapacity();

  if (isLoading || maxPatients === null) return null;

  // Only show if near/at limit unless showAlways is true
  if (!showAlways && !isNearLimit && !isAtLimit) return null;

  if (isAtLimit) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Limite de pacientes atingido</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Você atingiu o limite de {maxPatients} pacientes ativos do seu plano. 
            Faça upgrade para adicionar mais pacientes.
          </p>
          <Button size="sm" asChild>
            <Link to="/planos">
              Ver planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Pacientes ativos</span>
        </div>
        <span className={`text-sm font-medium ${isNearLimit ? 'text-orange-600 dark:text-orange-400' : ''}`}>
          {currentPatients} / {maxPatients}
        </span>
      </div>
      <Progress 
        value={usagePercent} 
        className={`h-2 ${isNearLimit ? '[&>div]:bg-destructive' : ''}`}
      />
      {isNearLimit && (
        <p className="text-xs text-destructive mt-2">
          Você está próximo do limite do seu plano.{' '}
          <Link to="/planos" className="underline hover:no-underline">
            Fazer upgrade
          </Link>
        </p>
      )}
    </div>
  );
}
