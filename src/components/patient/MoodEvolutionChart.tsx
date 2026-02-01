import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CheckIn {
  id: string;
  mood: string;
  intensity: number;
  feelings: string[] | null;
  notes: string | null;
  created_at: string;
  shared_with_therapist: boolean;
}

interface MoodEvolutionChartProps {
  checkIns: CheckIn[];
}

const moodToValue: Record<string, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  low: 2,
  bad: 1,
};

const moodLabels: Record<string, string> = {
  great: 'Ótimo',
  good: 'Bom',
  neutral: 'Neutro',
  low: 'Baixo',
  bad: 'Ruim',
};

const chartConfig = {
  mood: {
    label: 'Humor',
    color: 'hsl(var(--primary))',
  },
};

export const MoodEvolutionChart: React.FC<MoodEvolutionChartProps> = ({ checkIns }) => {
  const chartData = [...checkIns]
    .reverse()
    .map((c) => ({
      date: format(new Date(c.created_at), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(c.created_at), "dd 'de' MMMM", { locale: ptBR }),
      mood: moodToValue[c.mood] || 3,
      moodLabel: moodLabels[c.mood] || c.mood,
      intensity: c.intensity,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução do Humor</CardTitle>
          <CardDescription>Seu humor ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          Nenhum dado disponível
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolução do Humor</CardTitle>
        <CardDescription>Seu humor ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                domain={[0, 6]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => {
                  const labels: Record<number, string> = { 1: '😢', 2: '😔', 3: '😐', 4: '🙂', 5: '😄' };
                  return labels[value] || '';
                }}
                tick={{ fontSize: 14 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, props) => {
                      const payload = props.payload;
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{payload.fullDate}</span>
                          <span>Humor: {payload.moodLabel}</span>
                          <span>Intensidade: {payload.intensity}/10</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#moodGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
