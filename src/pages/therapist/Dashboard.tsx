import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Heart,
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const TherapistDashboard = () => {
  const { profile, user } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Terapeuta';

  // Fetch active patients count
  const { data: activePatientsCount = 0 } = useQuery({
    queryKey: ['therapist-stats-patients', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patient_therapist_relations')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch today's sessions
  const { data: todaySessions = [], isLoading: loadingToday } = useQuery({
    queryKey: ['therapist-today-sessions', user?.id],
    queryFn: async () => {
      const today = new Date();

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (full_name)
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', startOfDay(today).toISOString())
        .lte('scheduled_at', endOfDay(today).toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['therapist-upcoming-sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (full_name)
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch check-ins received in last 7 days
  const { data: recentCheckInsCount = 0 } = useQuery({
    queryKey: ['therapist-checkins-received', user?.id],
    queryFn: async () => {
      // First get all patient IDs
      const { data: relations } = await supabase
        .from('patient_therapist_relations')
        .select('patient_id')
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (!relations || relations.length === 0) return 0;

      const patientIds = relations.map((r) => r.patient_id);
      const sevenDaysAgo = subDays(new Date(), 7);

      const { count, error } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .in('user_id', patientIds)
        .eq('shared_with_therapist', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch patients needing attention (low engagement or no recent activity)
  const { data: alertPatients = [] } = useQuery({
    queryKey: ['therapist-alert-patients', user?.id],
    queryFn: async () => {
      const { data: relations } = await supabase
        .from('patient_therapist_relations')
        .select(`
          patient_id,
          profiles!patient_therapist_relations_patient_id_fkey (
            full_name
          )
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (!relations) return [];

      const fiveDaysAgo = subDays(new Date(), 5);
      const alerts: { id: string; patient: string; message: string }[] = [];

      for (const relation of relations) {
        const { data: lastCheckIn } = await supabase
          .from('check_ins')
          .select('created_at')
          .eq('user_id', relation.patient_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastCheckIn || new Date(lastCheckIn.created_at) < fiveDaysAgo) {
          alerts.push({
            id: relation.patient_id,
            patient: relation.profiles?.full_name || 'Paciente',
            message: lastCheckIn 
              ? `Não fez check-in há ${Math.floor((Date.now() - new Date(lastCheckIn.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias`
              : 'Nenhum check-in registrado',
          });
        }
      }

      return alerts.slice(0, 5);
    },
    enabled: !!user,
  });

  // Calculate next session time
  const nextSessionTime = todaySessions.length > 0 
    ? format(new Date(todaySessions[0].scheduled_at), 'HH:mm')
    : null;

  if (loadingToday) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Olá, ${firstName}!`}
        description="Aqui está um resumo do seu dia"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          title="Pacientes Ativos"
          value={activePatientsCount.toString()}
          description="Pacientes vinculados"
        />
        <StatCard
          icon={Calendar}
          title="Sessões Hoje"
          value={todaySessions.length.toString()}
          description={nextSessionTime ? `Próxima às ${nextSessionTime}` : 'Nenhuma sessão hoje'}
        />
        <StatCard
          icon={Heart}
          title="Check-ins Recebidos"
          value={recentCheckInsCount.toString()}
          description="Últimos 7 dias"
        />
        <StatCard
          icon={TrendingUp}
          title="Taxa de Engajamento"
          value={activePatientsCount > 0 ? `${Math.min(100, Math.round((recentCheckInsCount / (activePatientsCount * 7)) * 100))}%` : '0%'}
          description="Baseado em check-ins"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Próximas Sessões</CardTitle>
                <CardDescription>Sua agenda para os próximos dias</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/therapist/schedule">
                  Ver Agenda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.profiles?.full_name || 'Paciente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.session_type === 'online' ? 'Online' : 'Presencial'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {format(new Date(session.scheduled_at), 'HH:mm')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.scheduled_at), "d 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sessão agendada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Alertas</CardTitle>
                <CardDescription>Pacientes que precisam de atenção</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/therapist/patients">
                  Ver Todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alertPatients.length > 0 ? (
              <div className="space-y-4">
                {alertPatients.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">{alert.patient}</p>
                      <p className="text-sm text-amber-700">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta no momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/therapist/patients">
                <Users className="mr-2 h-4 w-4" />
                Ver Pacientes
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/therapist/notes">
                <Heart className="mr-2 h-4 w-4" />
                Anotações
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/therapist/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Agenda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistDashboard;
