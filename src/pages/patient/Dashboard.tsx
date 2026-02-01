import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowRight,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';

// Mock data for UI demonstration
const recentMoods = [
  { day: 'Seg', mood: 'good', icon: Smile },
  { day: 'Ter', mood: 'neutral', icon: Meh },
  { day: 'Qua', mood: 'good', icon: Smile },
  { day: 'Qui', mood: 'bad', icon: Frown },
  { day: 'Sex', mood: 'good', icon: Smile },
  { day: 'Sáb', mood: 'neutral', icon: Meh },
  { day: 'Dom', mood: 'good', icon: Smile },
];

const moodColors = {
  good: 'text-green-500 bg-green-50',
  neutral: 'text-yellow-500 bg-yellow-50',
  bad: 'text-red-500 bg-red-50',
};

const PatientDashboard = () => {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Paciente';

  return (
    <div>
      <PageHeader
        title={`Olá, ${firstName}!`}
        description="Como você está se sentindo hoje?"
      >
        <Button asChild>
          <Link to="/patient/checkin">
            <Heart className="mr-2 h-4 w-4" />
            Fazer Check-in
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Heart}
          title="Último Check-in"
          value="Hoje"
          description="Você está em uma boa sequência!"
        />
        <StatCard
          icon={Calendar}
          title="Próxima Sessão"
          value="Quinta, 15h"
          description="Em 2 dias"
        />
        <StatCard
          icon={TrendingUp}
          title="Sequência Atual"
          value="7 dias"
          description="Continue assim!"
          trend={{ value: 40, isPositive: true }}
        />
        <StatCard
          icon={BookOpen}
          title="Registros do Mês"
          value="23"
          description="4 registros compartilhados"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Mood Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Resumo da Semana</CardTitle>
            <CardDescription>Seu humor nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end gap-2">
              {recentMoods.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${moodColors[item.mood as keyof typeof moodColors]}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            <CardDescription>O que você gostaria de fazer?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/patient/diary">
                <span className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Escrever no Diário
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/patient/records">
                <span className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Novo Registro
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/patient/questionnaires">
                <span className="flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Questionários
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/patient/timeline">
                <span className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Linha do Tempo
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="mt-6 bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                "Cada passo conta na sua jornada de autoconhecimento."
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue registrando suas emoções - isso ajuda muito no seu processo terapêutico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
