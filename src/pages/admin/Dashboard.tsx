import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, UserCheck, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, startOfDay, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfMonthDate = startOfMonth(today).toISOString();
      const todayStart = startOfDay(today).toISOString();
      const weekAgo = subDays(today, 7).toISOString();

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Novos usuários este mês
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonthDate);

      // Assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Check-ins hoje
      const { count: checkinsToday } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      // Check-ins últimos 7 dias (para média)
      const { count: checkinsWeek } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Contagem por role
      const { data: roleCounts } = await supabase
        .from('user_roles')
        .select('role');

      const therapists = roleCounts?.filter(r => r.role === 'therapist').length || 0;
      const patients = roleCounts?.filter(r => r.role === 'patient').length || 0;

      return {
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        activeSubscriptions: activeSubscriptions || 0,
        checkinsToday: checkinsToday || 0,
        avgCheckinsPerDay: Math.round((checkinsWeek || 0) / 7),
        therapists,
        patients,
      };
    },
  });

  const subscriptionPercentage = stats?.totalUsers 
    ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) 
    : 0;

  return (
    <div>
      <PageHeader title="Dashboard Admin" description="Visão geral do sistema" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Users} 
          title="Usuários Totais" 
          value={isLoading ? '...' : stats?.totalUsers.toLocaleString('pt-BR') || '0'} 
          description={`${stats?.newUsersThisMonth || 0} novos este mês`} 
        />
        <StatCard 
          icon={CreditCard} 
          title="Assinaturas Ativas" 
          value={isLoading ? '...' : stats?.activeSubscriptions || 0} 
          description={`${subscriptionPercentage}% do total`} 
        />
        <StatCard 
          icon={UserCheck} 
          title="Terapeutas" 
          value={isLoading ? '...' : stats?.therapists || 0} 
          description={`${stats?.patients || 0} pacientes cadastrados`} 
        />
        <StatCard 
          icon={Activity} 
          title="Check-ins Hoje" 
          value={isLoading ? '...' : stats?.checkinsToday || 0} 
          description={`Média: ${stats?.avgCheckinsPerDay || 0}/dia`} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-muted-foreground">
              Sistema com {stats?.totalUsers || 0} usuários cadastrados, 
              sendo {stats?.therapists || 0} terapeutas e {stats?.patients || 0} pacientes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
