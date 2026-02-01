import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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

interface IntensityChartProps {
  checkIns: CheckIn[];
}

const chartConfig = {
  intensity: {
    label: 'Intensidade',
    color: 'hsl(var(--chart-2))',
  },
};

const getIntensityColor = (intensity: number): string => {
  if (intensity <= 3) return 'hsl(var(--chart-1))';
  if (intensity <= 6) return 'hsl(var(--chart-3))';
  return 'hsl(var(--chart-2))';
};

export const IntensityChart: React.FC<IntensityChartProps> = ({ checkIns }) => {
  const chartData = [...checkIns]
    .reverse()
    .map((c) => ({
      date: format(new Date(c.created_at), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(c.created_at), "dd 'de' MMMM", { locale: ptBR }),
      intensity: c.intensity,
      fill: getIntensityColor(c.intensity),
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intensidade Emocional</CardTitle>
          <CardDescription>Nível de intensidade ao longo do tempo</CardDescription>
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
        <CardTitle className="text-lg">Intensidade Emocional</CardTitle>
        <CardDescription>Nível de intensidade ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                domain={[0, 10]} 
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={30}
                className="fill-muted-foreground"
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, props) => {
                      const payload = props.payload;
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{payload.fullDate}</span>
                          <span>Intensidade: {payload.intensity}/10</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar 
                dataKey="intensity" 
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--chart-2))"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
