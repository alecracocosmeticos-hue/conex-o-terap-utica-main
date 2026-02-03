import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Search, ChevronRight, Circle, Users, UserPlus, X, Mail, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { InvitePatientDialog } from '@/components/therapist/InvitePatientDialog';
import { useToast } from '@/hooks/use-toast';

interface PatientWithRelation {
  id: string;
  patient_id: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  nextSession?: Date | null;
  lastActivity?: Date | null;
  engagementLevel?: 'high' | 'medium' | 'low';
}

const statusColors = {
  active: 'bg-green-500',
  pending: 'bg-amber-500',
  inactive: 'bg-gray-400',
};

const statusLabels = {
  active: 'Ativo',
  pending: 'Pendente',
  inactive: 'Inativo',
};

const engagementColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

const engagementLabels = {
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

import { usePlan } from '@/hooks/use-plan';
import { useNavigate } from 'react-router-dom';

const PatientList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { canAddPatient, isLoading: isLoadingPlan } = usePlan();
  const navigate = useNavigate();

  // Fetch patients linked to therapist
  const { data: patientsData = [], isLoading } = useQuery({
    queryKey: ['therapist-patients', user?.id],
    queryFn: async () => {
      const { data: relations, error } = await supabase
        .from('patient_therapist_relations')
        .select(`
          id,
          patient_id,
          status,
          created_at,
          profiles!patient_therapist_relations_patient_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('therapist_id', user!.id);

      if (error) throw error;

      // Get additional data for each patient
      const patientsWithData = await Promise.all(
        (relations || []).map(async (relation) => {
          // Get next appointment
          const { data: nextAppt } = await supabase
            .from('appointments')
            .select('scheduled_at')
            .eq('therapist_id', user!.id)
            .eq('patient_id', relation.patient_id)
            .eq('status', 'scheduled')
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          // Get last check-in (shared)
          const { data: lastCheckIn } = await supabase
            .from('check_ins')
            .select('created_at')
            .eq('user_id', relation.patient_id)
            .eq('shared_with_therapist', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count check-ins in last 7 days for engagement
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { count: checkInCount } = await supabase
            .from('check_ins')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', relation.patient_id)
            .gte('created_at', sevenDaysAgo.toISOString());

          let engagementLevel: 'high' | 'medium' | 'low' = 'low';
          if (checkInCount && checkInCount >= 5) engagementLevel = 'high';
          else if (checkInCount && checkInCount >= 2) engagementLevel = 'medium';

          return {
            ...relation,
            nextSession: nextAppt?.scheduled_at ? new Date(nextAppt.scheduled_at) : null,
            lastActivity: lastCheckIn?.created_at ? new Date(lastCheckIn.created_at) : null,
            engagementLevel,
          } as PatientWithRelation;
        })
      );

      return patientsWithData;
    },
    enabled: !!user,
  });

  // Fetch pending invites
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pending-invites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_therapist_relations')
        .select('*')
        .eq('therapist_id', user!.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Cancel invite mutation
  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('patient_therapist_relations')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      toast({
        title: 'Convite cancelado',
        description: 'O convite foi removido.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activePatients = patientsData.filter((p) => p.status === 'active');
  const filteredPatients = activePatients.filter((patient) =>
    patient.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInviteClick = () => {
    // Check limits before opening dialog
    if (!canAddPatient(activePatients.length)) {
      toast({
        title: "Limite do plano atingido",
        description: "Você atingiu o limite de pacientes ativos no seu plano atual.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>
            Upgrade
          </Button>
        ),
      });
      return;
    }
    setInviteDialogOpen(true);
  };

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
        title="Pacientes"
        description="Gerencie seus pacientes e acompanhe seu progresso"
      >
        <Button onClick={handleInviteClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar Paciente
        </Button>
      </PageHeader>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Ativos
            {activePatients.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activePatients.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Convites Pendentes
            {pendingInvites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingInvites.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              {/* Search */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum paciente encontrado"
                  description="Você ainda não possui pacientes vinculados ou nenhum resultado para a busca."
                />
              ) : (
                /* Table */
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Engajamento</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Próxima Sessão</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(patient.profiles?.full_name || 'P')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">
                                  {patient.profiles?.full_name || 'Paciente'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.profiles?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Circle
                                className={`h-2 w-2 fill-current ${statusColors[patient.status as keyof typeof statusColors] || 'bg-gray-400'}`}
                              />
                              <span className="text-sm">
                                {statusLabels[patient.status as keyof typeof statusLabels] || patient.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.engagementLevel && (
                              <Badge className={engagementColors[patient.engagementLevel]}>
                                {engagementLabels[patient.engagementLevel]}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {patient.lastActivity
                              ? format(patient.lastActivity, "d 'de' MMM", { locale: ptBR })
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-sm">
                            {patient.nextSession
                              ? format(patient.nextSession, "d/MM 'às' HH:mm", { locale: ptBR })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/therapist/patients/${patient.patient_id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingInvites.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="Nenhum convite pendente"
                  description="Convide novos pacientes usando o botão acima."
                />
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Enviado em</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{invite.invitation_email || 'Código apenas'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {invite.invitation_code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyCode(invite.invitation_code!)}
                              >
                                {copiedCode === invite.invitation_code ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invite.invited_at
                              ? format(new Date(invite.invited_at), 'dd/MM/yyyy HH:mm')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    O código de convite será invalidado e o paciente não poderá mais usá-lo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelInvite.mutate(invite.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancelar Convite
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InvitePatientDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
};

export default PatientList;

// Subcomponent for Connection Requests (Marketplace)
const ConnectionRequestsList = ({ activeCount }: { activeCount: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { canAddPatient } = usePlan();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: requests = [] } = useQuery({
    queryKey: ['connection-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('connection_requests')
        .select(`
                    id,
                    patient_id,
                    message,
                    created_at,
                    profiles!connection_requests_patient_id_fkey (
                        full_name,
                        email,
                        avatar_url
                    )
                `)
        .eq('therapist_id', user!.id)
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const handleAction = async (requestId: string, action: 'accepted' | 'rejected', patientId: string) => {
    if (action === 'accepted' && !canAddPatient(activeCount)) {
      toast({
        title: "Limite do plano atingido",
        description: "Você precisa fazer upgrade para aceitar mais pacientes.",
        variant: 'destructive',
        action: <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>Upgrade</Button>
      });
      return;
    }

    try {
      // Update request status
      const { error: updateError } = await (supabase as any)
        .from('connection_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'accepted') {
        const { error: relationError } = await supabase
          .from('patient_therapist_relations')
          .insert({
            therapist_id: user!.id,
            patient_id: patientId,
            status: 'active'
          });
        if (relationError) throw relationError;
      }

      toast({ title: action === 'accepted' ? "Paciente aceito!" : "Solicitação recusada." });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-patients'] });

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao processar", variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {requests.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhuma solicitação"
            description="Você não tem novas solicitações de atendimento."
          />
        ) : (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>{req.profiles?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{req.profiles?.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{req.message || "Sem mensagem inicial."}</p>
                    <span className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 md:flex-none" onClick={() => handleAction(req.id, 'rejected', req.patient_id)}>
                    Recusar
                  </Button>
                  <Button className="flex-1 md:flex-none" onClick={() => handleAction(req.id, 'accepted', req.patient_id)}>
                    Aceitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
