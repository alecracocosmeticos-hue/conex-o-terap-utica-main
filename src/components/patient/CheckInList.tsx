import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Smile, Meh, Frown, Sun, Cloud, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckIn {
  id: string;
  mood: string;
  intensity: number;
  feelings: string[] | null;
  notes: string | null;
  created_at: string;
  shared_with_therapist: boolean;
}

interface CheckInListProps {
  checkIns: CheckIn[];
  onToggleShare: (id: string, shared: boolean) => void;
  isUpdating?: boolean;
}

const moodConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  great: { icon: Sun, label: 'Ótimo', className: 'text-yellow-500 bg-yellow-50' },
  good: { icon: Smile, label: 'Bom', className: 'text-green-500 bg-green-50' },
  neutral: { icon: Meh, label: 'Neutro', className: 'text-blue-500 bg-blue-50' },
  low: { icon: Cloud, label: 'Baixo', className: 'text-gray-500 bg-gray-50' },
  bad: { icon: Frown, label: 'Ruim', className: 'text-red-500 bg-red-50' },
};

export const CheckInList: React.FC<CheckInListProps> = ({ 
  checkIns, 
  onToggleShare,
  isUpdating 
}) => {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Check-ins</CardTitle>
          <CardDescription>Seus registros anteriores</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>Nenhum check-in registrado ainda.</p>
          <Button variant="link" className="mt-2" asChild>
            <a href="/patient/checkin">Fazer seu primeiro check-in</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Check-ins</CardTitle>
        <CardDescription>Seus registros anteriores ({checkIns.length} total)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkIns.map((checkIn) => {
          const config = moodConfig[checkIn.mood] || moodConfig.neutral;
          const Icon = config.icon;

          return (
            <div 
              key={checkIn.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              {/* Mood Icon */}
              <div className={cn('p-3 rounded-full flex-shrink-0', config.className)}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{config.label}</span>
                    <span className="text-sm text-muted-foreground">
                      • Intensidade {checkIn.intensity}/10
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(checkIn.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </span>
                </div>

                {/* Feelings */}
                {checkIn.feelings && checkIn.feelings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {checkIn.feelings.map((feeling, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feeling}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {checkIn.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {checkIn.notes}
                  </p>
                )}

                {/* Share Toggle */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <Label 
                    htmlFor={`share-${checkIn.id}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Compartilhar com terapeuta
                  </Label>
                  <Switch
                    id={`share-${checkIn.id}`}
                    checked={checkIn.shared_with_therapist}
                    onCheckedChange={(checked) => onToggleShare(checkIn.id, checked)}
                    disabled={isUpdating}
                    className="ml-auto"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
