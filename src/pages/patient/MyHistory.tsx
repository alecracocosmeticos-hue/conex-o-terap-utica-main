import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { History, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Tables } from '@/integrations/supabase/types';

type PatientHistory = Tables<'patient_history'>;

const MyHistory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [history, setHistory] = useState('');
  const [sharedWithTherapist, setSharedWithTherapist] = useState(false);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['patient_history', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('patient_history')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as PatientHistory | null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (historyData) {
      setHistory(historyData.content);
      setSharedWithTherapist(historyData.shared_with_therapist);
    }
  }, [historyData]);

  const saveHistory = useMutation({
    mutationFn: async (data: { content: string; shared: boolean }) => {
      if (!user) throw new Error('Usuário não autenticado');

      if (historyData?.id) {
        // Update existing
        const { error } = await supabase
          .from('patient_history')
          .update({
            content: data.content,
            shared_with_therapist: data.shared,
          })
          .eq('id', historyData.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from('patient_history').insert({
          user_id: user.id,
          content: data.content,
          shared_with_therapist: data.shared,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient_history'] });
      toast({
        title: 'História salva!',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    saveHistory.mutate({
      content: history,
      shared: sharedWithTherapist,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Minha História"
        description="Escreva sobre sua trajetória de vida e experiências importantes"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Sua História Pessoal
              </CardTitle>
              <CardDescription className="mt-1">
                Este espaço é seu. Escreva sobre sua vida, família, experiências marcantes...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            className="min-h-[400px] text-base leading-relaxed"
            placeholder="Comece a escrever sua história..."
          />

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {sharedWithTherapist ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="share-toggle" className="font-medium">
                  {sharedWithTherapist ? 'Compartilhado com terapeuta' : 'Privado'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {sharedWithTherapist
                    ? 'Seu terapeuta pode ver este conteúdo'
                    : 'Apenas você pode ver este conteúdo'
                  }
                </p>
              </div>
            </div>
            <Switch
              id="share-toggle"
              checked={sharedWithTherapist}
              onCheckedChange={setSharedWithTherapist}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveHistory.isPending}>
              {saveHistory.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saveHistory.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyHistory;
