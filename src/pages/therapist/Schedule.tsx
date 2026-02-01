import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, User, Video, MapPin, Plus, MoreVertical, Check, X, CalendarIcon } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  notes: string | null;
  profiles: {
    full_name: string;
  } | null;
}

interface PatientOption {
  id: string;
  name: string;
}

const Schedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: '50',
    sessionType: 'online',
    notes: '',
  });

  // Fetch patients list
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

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (
            full_name
          )
        `)
        .eq('therapist_id', user!.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: {
      patientId: string;
      scheduledAt: string;
      durationMinutes: number;
      sessionType: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from('appointments').insert({
        therapist_id: user!.id,
        patient_id: data.patientId,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        session_type: data.sessionType,
        notes: data.notes || null,
        status: 'scheduled',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDialogOpen(false);
      setNewAppointment({
        patientId: '',
        date: '',
        time: '',
        duration: '50',
        sessionType: 'online',
        notes: '',
      });
      toast({
        title: 'Sessão agendada!',
        description: 'O agendamento foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao agendar',
        description: error.message,
      });
    },
  });

  // Update appointment status mutation
  const updateStatus = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: data.status })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: variables.status === 'completed' ? 'Sessão concluída!' : 'Sessão cancelada',
        description: variables.status === 'completed' 
          ? 'A sessão foi marcada como concluída.' 
          : 'O agendamento foi cancelado.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    },
  });

  const handleCreateAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
        description: 'Selecione o paciente, data e horário.',
      });
      return;
    }

    const scheduledAt = new Date(`${newAppointment.date}T${newAppointment.time}`);

    createAppointment.mutate({
      patientId: newAppointment.patientId,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: parseInt(newAppointment.duration),
      sessionType: newAppointment.sessionType,
      notes: newAppointment.notes,
    });
  };

  const sessionsForSelectedDate = selectedDate
    ? appointments.filter((apt) => isSameDay(new Date(apt.scheduled_at), selectedDate))
    : [];

  const datesWithSessions = appointments.map((apt) => new Date(apt.scheduled_at));

  const upcomingAppointments = appointments
    .filter((apt) => apt.status === 'scheduled' && new Date(apt.scheduled_at) >= new Date())
    .slice(0, 4);

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
        title="Agenda"
        description="Visualize e gerencie suas sessões agendadas"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={patientsList.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo agendamento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Paciente *</label>
                <Select
                  value={newAppointment.patientId}
                  onValueChange={(v) => setNewAppointment({ ...newAppointment, patientId: v })}
                >
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Data *</label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Horário *</label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Duração (min)</label>
                  <Select
                    value={newAppointment.duration}
                    onValueChange={(v) => setNewAppointment({ ...newAppointment, duration: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select
                    value={newAppointment.sessionType}
                    onValueChange={(v) => setNewAppointment({ ...newAppointment, sessionType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presential">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Observações</label>
                <Textarea
                  placeholder="Notas sobre a sessão..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment} disabled={createAppointment.isPending}>
                {createAppointment.isPending ? 'Agendando...' : 'Agendar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid lg:grid-cols-[350px,1fr] gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md pointer-events-auto"
              modifiers={{
                hasSession: datesWithSessions,
              }}
              modifiersStyles={{
                hasSession: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Sessions for selected date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate
                  ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                  : 'Selecione uma data'
                }
              </CardTitle>
              <CardDescription>
                {sessionsForSelectedDate.length > 0
                  ? `${sessionsForSelectedDate.length} sessão(ões) agendada(s)`
                  : 'Nenhuma sessão agendada'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {sessionsForSelectedDate.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {session.profiles?.full_name || 'Paciente'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{session.notes || 'Sessão regular'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.session_type === 'online' ? 'default' : 'outline'}>
                            {session.session_type === 'online' ? (
                              <>
                                <Video className="h-3 w-3 mr-1" />
                                Online
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                Presencial
                              </>
                            )}
                          </Badge>
                          {session.status === 'scheduled' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => updateStatus.mutate({ id: session.id, status: 'completed' })}
                                >
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  Marcar como concluída
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateStatus.mutate({ id: session.id, status: 'cancelled' })}
                                  className="text-destructive"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar sessão
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {session.status === 'completed' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Concluída
                            </Badge>
                          )}
                          {session.status === 'cancelled' && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Cancelada
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(session.scheduled_at), 'HH:mm')}
                        </span>
                        <span>{session.duration_minutes} minutos</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sessão agendada para este dia.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming sessions summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {session.profiles?.full_name || 'Paciente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.scheduled_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {session.session_type === 'online' ? 'Online' : 'Presencial'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarIcon}
                  title="Nenhuma sessão agendada"
                  description="Agende uma sessão para começar."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
