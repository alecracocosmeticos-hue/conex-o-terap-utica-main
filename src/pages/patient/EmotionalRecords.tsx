import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Heart, Calendar, Tag, Share2, Lock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Tables } from '@/integrations/supabase/types';

type EmotionalRecord = Tables<'emotional_records'>;

const moodColors: Record<string, string> = {
  'Feliz': 'bg-green-100 text-green-800',
  'Ansioso': 'bg-yellow-100 text-yellow-800',
  'Pensativo': 'bg-blue-100 text-blue-800',
  'Triste': 'bg-purple-100 text-purple-800',
  'Irritado': 'bg-red-100 text-red-800',
  'Grato': 'bg-teal-100 text-teal-800',
  'Animado': 'bg-orange-100 text-orange-800',
  'Calmo': 'bg-cyan-100 text-cyan-800',
};

const EmotionalRecords = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    shared: false,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['emotional_records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('emotional_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmotionalRecord[];
    },
    enabled: !!user,
  });

  const createRecord = useMutation({
    mutationFn: async (record: {
      title: string;
      content: string;
      mood: string;
      tags: string[];
      shared: boolean;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase.from('emotional_records').insert({
        user_id: user.id,
        title: record.title,
        content: record.content,
        mood: record.mood || null,
        tags: record.tags,
        shared_with_therapist: record.shared,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emotional_records'] });
      setDialogOpen(false);
      setNewRecord({ title: '', content: '', mood: '', tags: '', shared: false });
      toast({
        title: 'Registro salvo!',
        description: 'Seu registro emocional foi salvo com sucesso.',
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
    if (!newRecord.title || !newRecord.content) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos',
        description: 'Título e conteúdo são obrigatórios.',
      });
      return;
    }

    createRecord.mutate({
      title: newRecord.title,
      content: newRecord.content,
      mood: newRecord.mood,
      tags: newRecord.tags.split(',').map(t => t.trim()).filter(Boolean),
      shared: newRecord.shared,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Registros Emocionais"
        description="Documente seus momentos e sentimentos importantes"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Registro Emocional</DialogTitle>
              <DialogDescription>
                Documente um momento ou sentimento importante
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Dê um título ao momento..."
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">O que aconteceu?</label>
                <Textarea
                  placeholder="Descreva o momento e como você se sentiu..."
                  value={newRecord.content}
                  onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Como você se sentiu?</label>
                <Input
                  placeholder="Ex: Feliz, Ansioso, Grato..."
                  value={newRecord.mood}
                  onChange={(e) => setNewRecord({ ...newRecord, mood: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input
                  placeholder="Ex: trabalho, família, saúde..."
                  value={newRecord.tags}
                  onChange={(e) => setNewRecord({ ...newRecord, tags: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newRecord.shared}
                    onChange={(e) => setNewRecord({ ...newRecord, shared: e.target.checked })}
                    className="rounded"
                  />
                  Compartilhar com terapeuta
                </label>
                <Button onClick={handleSave} disabled={createRecord.isPending}>
                  {createRecord.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {createRecord.isPending ? 'Salvando...' : 'Salvar Registro'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {records.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum registro ainda"
          description="Documente seus momentos e sentimentos importantes"
        />
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{record.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(record.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.shared_with_therapist ? (
                      <Badge variant="outline" className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Compartilhado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{record.content}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {record.mood && (
                    <Badge className={moodColors[record.mood] || 'bg-gray-100 text-gray-800'}>
                      <Heart className="h-3 w-3 mr-1" />
                      {record.mood}
                    </Badge>
                  )}
                  {record.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionalRecords;
