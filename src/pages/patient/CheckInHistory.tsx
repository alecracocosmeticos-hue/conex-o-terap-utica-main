import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { MoodEvolutionChart } from '@/components/patient/MoodEvolutionChart';
import { IntensityChart } from '@/components/patient/IntensityChart';
import { MoodDistributionChart } from '@/components/patient/MoodDistributionChart';
import { CheckInList } from '@/components/patient/CheckInList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, TrendingUp, Calendar, BarChart2, Plus } from 'lucide-react';

type Period = '7' | '30' | '90' | 'all';

const moodLabels: Record<string, string> = {
  great: 'Ótimo',
  good: 'Bom',
  neutral: 'Neutro',
  low: 'Baixo',
  bad: 'Ruim',
};

const CheckInHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>('30');

  // Fetch check-ins
  const { data: checkIns = [], isLoading, error } = useQuery({
    queryKey: ['patient-checkins-history', user?.id, period],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (period !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Toggle share mutation
  const toggleShareMutation = useMutation({
    mutationFn: async ({ id, shared }: { id: string; shared: boolean }) => {
      const { error } = await supabase
        .from('check_ins')
        .update({ shared_with_therapist: shared })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-checkins-history'] });
      toast.success(
        variables.shared 
          ? 'Check-in compartilhado com seu terapeuta' 
          : 'Compartilhamento removido'
      );
    },
    onError: () => {
      toast.error('Erro ao atualizar compartilhamento');
    },
  });

  // Calculate stats
  const stats = {
    total: checkIns.length,
    avgIntensity: checkIns.length > 0 
      ? (checkIns.reduce((sum, c) => sum + c.intensity, 0) / checkIns.length).toFixed(1)
      : '0',
    predominantMood: (() => {
      if (checkIns.length === 0) return 'Nenhum';
      const moodCounts = checkIns.reduce<Record<string, number>>((acc, c) => {
        acc[c.mood] = (acc[c.mood] || 0) + 1;
        return acc;
      }, {});
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
      return topMood ? moodLabels[topMood[0]] || topMood[0] : 'Nenhum';
    })(),
    sharedCount: checkIns.filter(c => c.shared_with_therapist).length,
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Erro ao carregar histórico</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['patient-checkins-history'] })}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Histórico de Check-ins"
        description="Acompanhe sua evolução emocional ao longo do tempo"
      >
        <Button asChild>
          <Link to="/patient/checkin">
            <Plus className="mr-2 h-4 w-4" />
            Novo Check-in
          </Link>
        </Button>
      </PageHeader>

      {/* Period Filter */}
      <div className="mb-6">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="7">7 dias</TabsTrigger>
            <TabsTrigger value="30">30 dias</TabsTrigger>
            <TabsTrigger value="90">90 dias</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            title="Total de Check-ins"
            value={stats.total}
            description={`No período selecionado`}
          />
          <StatCard
            icon={Heart}
            title="Humor Predominante"
            value={stats.predominantMood}
            description="Mais frequente"
          />
          <StatCard
            icon={BarChart2}
            title="Intensidade Média"
            value={`${stats.avgIntensity}/10`}
            description="Média do período"
          />
          <StatCard
            icon={TrendingUp}
            title="Compartilhados"
            value={stats.sharedCount}
            description="Com seu terapeuta"
          />
        </div>
      )}

      {/* Charts Grid */}
      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className={i === 2 ? 'lg:col-span-2' : ''}>
              <CardContent className="p-6">
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <MoodEvolutionChart checkIns={checkIns} />
          <IntensityChart checkIns={checkIns} />
          <div className="lg:col-span-2">
            <MoodDistributionChart checkIns={checkIns} />
          </div>
        </div>
      )}

      {/* Check-in List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full mb-4" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <CheckInList 
          checkIns={checkIns}
          onToggleShare={(id, shared) => toggleShareMutation.mutate({ id, shared })}
          isUpdating={toggleShareMutation.isPending}
        />
      )}
    </div>
  );
};

export default CheckInHistory;
