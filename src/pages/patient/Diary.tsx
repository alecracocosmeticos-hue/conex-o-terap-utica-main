import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Calendar, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Tables } from '@/integrations/supabase/types';

type DiaryEntry = Tables<'diary_entries'>;

const Diary = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['diary_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DiaryEntry[];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase.from('diary_entries').insert({
        user_id: user.id,
        content,
        shared_with_therapist: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary_entries'] });
      setNewEntry('');
      setIsWriting(false);
      toast({
        title: 'Entrada salva!',
        description: 'Sua entrada no diário foi salva com sucesso.',
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

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary_entries'] });
      setSelectedEntry(null);
      toast({
        title: 'Entrada excluída',
        description: 'A entrada foi removida do seu diário.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!newEntry.trim()) {
      toast({
        variant: 'destructive',
        title: 'Escreva algo',
        description: 'Adicione algum conteúdo ao seu diário.',
      });
      return;
    }
    createEntry.mutate(newEntry);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      deleteEntry.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (selectedEntry) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedEntry(null)}
          >
            ← Voltar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(selectedEntry.id)}
            disabled={deleteEntry.isPending}
          >
            {deleteEntry.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(selectedEntry.created_at), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedEntry.content}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWriting) {
    return (
      <div>
        <PageHeader
          title="Nova Entrada"
          description={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        >
          <Button variant="outline" onClick={() => setIsWriting(false)}>
            Cancelar
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="pt-6">
            <Textarea
              placeholder="O que você gostaria de registrar hoje? Escreva livremente sobre seus pensamentos, sentimentos ou qualquer coisa que queira documentar..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[400px] resize-none text-base leading-relaxed"
            />
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} disabled={createEntry.isPending}>
                {createEntry.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="mr-2 h-4 w-4" />
                )}
                {createEntry.isPending ? 'Salvando...' : 'Salvar Entrada'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Meu Diário"
        description="Escreva livremente sobre seu dia e pensamentos"
      >
        <Button onClick={() => setIsWriting(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma entrada ainda"
          description="Comece a escrever seu primeiro registro no diário"
        />
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(entry.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </CardDescription>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
