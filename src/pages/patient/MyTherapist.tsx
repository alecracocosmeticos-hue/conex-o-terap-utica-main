import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
import {
  UserPlus,
  UserMinus,
  Check,
  X,
  Link2,
  Mail,
  Calendar,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const therapistTypeLabels: Record<string, string> = {
  psychologist: 'Psicólogo(a)',
  psychoanalyst: 'Psicanalista',
  other: 'Outro',
};

const MyTherapist = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');

  // Fetch active therapist relation
  const { data: activeRelation, isLoading: loadingActive } = useQuery({
    queryKey: ['my-therapist', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_therapist_relations')
        .select(`
          *,
          therapist:profiles!patient_therapist_relations_therapist_id_fkey (
            id,
            full_name,
            email,
            therapist_type,
            specialty,
            avatar_url
          )
        `)
        .eq('patient_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch pending invitations by email
  const { data: pendingInvites = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pending-invites-patient', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];

      const { data, error } = await supabase
        .from('patient_therapist_relations')
        .select(`
          *,
          therapist:profiles!patient_therapist_relations_therapist_id_fkey (
            id,
            full_name,
            therapist_type,
            specialty,
            avatar_url
          )
        `)
        .eq('invitation_email', profile.email)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.email,
  });

  // Accept invitation mutation
  const acceptInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('patient_therapist_relations')
        .update({
          patient_id: user!.id,
          status: 'active',
          responded_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-therapist'] });
      queryClient.invalidateQueries({ queryKey: ['pending-invites-patient'] });
      toast({
        title: 'Vínculo estabelecido!',
        description: 'Você agora está vinculado ao terapeuta.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao aceitar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Decline invitation mutation
  const declineInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('patient_therapist_relations')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites-patient'] });
      toast({
        title: 'Convite recusado',
        description: 'O convite foi recusado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao recusar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unlink from therapist mutation
  const unlinkTherapist = useMutation({
    mutationFn: async (relationId: string) => {
      const { error } = await supabase
        .from('patient_therapist_relations')
        .update({
          status: 'inactive',
          responded_at: new Date().toISOString(),
        })
        .eq('id', relationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-therapist'] });
      toast({
        title: 'Vínculo removido',
        description: 'Você não está mais vinculado a este terapeuta.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao desvincular',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept by code mutation
  const acceptByCode = useMutation({
    mutationFn: async (code: string) => {
      // Find pending invite with this code
      const { data: invite, error: findError } = await supabase
        .from('patient_therapist_relations')
        .select('id')
        .eq('invitation_code', code.toUpperCase().trim())
        .eq('status', 'pending')
        .maybeSingle();

      if (findError) throw findError;
      if (!invite) throw new Error('Código inválido ou já utilizado');

      // Accept the invite
      const { error } = await supabase
        .from('patient_therapist_relations')
        .update({
          patient_id: user!.id,
          status: 'active',
          responded_at: new Date().toISOString(),
        })
        .eq('id', invite.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-therapist'] });
      setInviteCode('');
      toast({
        title: 'Vínculo estabelecido!',
        description: 'Você agora está vinculado ao terapeuta.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao vincular',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isLoading = loadingActive || loadingPending;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Meu Terapeuta"
        description="Gerencie seu vínculo terapêutico"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Therapist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Terapeuta Atual
            </CardTitle>
            <CardDescription>
              Seu terapeuta vinculado atualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRelation?.therapist ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={activeRelation.therapist.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {activeRelation.therapist.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {activeRelation.therapist.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeRelation.therapist.therapist_type
                        ? therapistTypeLabels[activeRelation.therapist.therapist_type]
                        : 'Terapeuta'}
                    </p>
                    {activeRelation.therapist.specialty && (
                      <Badge variant="secondary" className="mt-1">
                        {activeRelation.therapist.specialty}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{activeRelation.therapist.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Vinculado desde{' '}
                      {format(new Date(activeRelation.created_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      <UserMinus className="mr-2 h-4 w-4" />
                      Desvincular
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desvincular terapeuta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao desvincular, o terapeuta não terá mais acesso aos seus registros
                        compartilhados. Esta ação pode ser revertida com um novo convite.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => unlinkTherapist.mutate(activeRelation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Desvincular
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <EmptyState
                icon={UserPlus}
                title="Sem terapeuta vinculado"
                description="Você ainda não está vinculado a nenhum terapeuta. Aceite um convite ou insira um código."
              />
            )}
          </CardContent>
        </Card>

        {/* Link by Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Inserir Código
            </CardTitle>
            <CardDescription>
              Tem um código de convite? Insira aqui para vincular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de convite</Label>
                <Input
                  id="code"
                  placeholder="Ex: ABC12XYZ"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="font-mono text-center text-lg tracking-widest"
                />
              </div>
              <Button
                onClick={() => acceptByCode.mutate(inviteCode)}
                disabled={inviteCode.length < 8 || acceptByCode.isPending}
                className="w-full"
              >
                {acceptByCode.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Vincular
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Convites Pendentes
                <Badge>{pendingInvites.length}</Badge>
              </CardTitle>
              <CardDescription>
                Convites de terapeutas aguardando sua resposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={invite.therapist?.avatar_url || undefined} />
                        <AvatarFallback>
                          {invite.therapist?.full_name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{invite.therapist?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {invite.therapist?.therapist_type
                            ? therapistTypeLabels[invite.therapist.therapist_type]
                            : 'Terapeuta'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recebido em{' '}
                          {format(new Date(invite.invited_at || invite.created_at), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptInvite.mutate(invite.id)}
                        disabled={acceptInvite.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvite.mutate(invite.id)}
                        disabled={declineInvite.isPending}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyTherapist;
