import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileEdit, Calendar, Lock, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TherapistNote {
  id: string;
  patient_id: string;
  therapist_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface PatientOption {
  id: string;
  name: string;
}

const PrivateNotes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [newNote, setNewNote] = useState('');
  const [filterPatient, setFilterPatient] = useState<string>('all');

  // Fetch patients linked to therapist
  const { data: patientsList = [] } = useQuery<PatientOption[]>({
    queryKey: ['therapist-patients-list', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_therapist_relations')
        .select(`
          patient_id,
          profiles!patient_therapist_relations_patient_id_fkey (
            id,
            full_name
          )
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;
      return (data || []).map((r) => ({
        id: r.patient_id,
        name: r.profiles?.full_name || 'Paciente',
      }));
    },
    enabled: !!user,
  });

  // Fetch therapist notes
  const { data: notes = [], isLoading } = useQuery<TherapistNote[]>({
    queryKey: ['therapist-notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapist_notes')
        .select(`
          *,
          profiles!therapist_notes_patient_id_fkey (
            full_name
          )
        `)
        .eq('therapist_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TherapistNote[];
    },
    enabled: !!user,
  });

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (data: { patientId: string; content: string }) => {
      const { error } = await supabase.from('therapist_notes').insert({
        therapist_id: user!.id,
        patient_id: data.patientId,
        content: data.content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-notes'] });
      setIsAdding(false);
      setSelectedPatient('');
      setNewNote('');
      toast({
        title: 'Observação salva!',
        description: 'Sua anotação foi salva com sucesso.',
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

  // Delete note mutation
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('therapist_notes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-notes'] });
      toast({
        title: 'Observação excluída',
        description: 'A anotação foi removida.',
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
    if (!selectedPatient || !newNote.trim()) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos',
        description: 'Selecione um paciente e escreva a observação.',
      });
      return;
    }

    createNote.mutate({
      patientId: selectedPatient,
      content: newNote.trim(),
    });
  };

  const filteredNotes = filterPatient === 'all'
    ? notes
    : notes.filter((note) => note.patient_id === filterPatient);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Observações Privadas"
        description="Anotações clínicas sobre seus pacientes (visíveis apenas para você)"
      >
        <Button onClick={() => setIsAdding(true)} disabled={patientsList.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Observação
        </Button>
      </PageHeader>

      {/* Privacy Notice */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Suas anotações são privadas.</strong>{' '}
              Apenas você pode ver estas observações. Elas não são compartilhadas com os pacientes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Note Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Nova Observação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Paciente</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patientsList.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Observação</label>
              <Textarea
                placeholder="Escreva suas observações clínicas..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={createNote.isPending}>
                <FileEdit className="mr-2 h-4 w-4" />
                {createNote.isPending ? 'Salvando...' : 'Salvar Observação'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      {notes.length > 0 && (
        <div className="mb-4">
          <Select value={filterPatient} onValueChange={setFilterPatient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pacientes</SelectItem>
              {patientsList.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma observação"
          description={patientsList.length === 0 
            ? "Você precisa ter pacientes vinculados para criar observações." 
            : "Comece criando sua primeira observação clínica."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {note.profiles?.full_name || 'Paciente'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(note.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                    </CardDescription>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir observação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A observação será permanentemente removida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteNote.mutate(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrivateNotes;
