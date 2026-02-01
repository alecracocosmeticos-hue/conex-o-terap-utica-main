import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CheckIn {
  id: string;
  mood: string;
  intensity: number;
  feelings: string[] | null;
  notes: string | null;
  created_at: string;
  shared_with_therapist: boolean;
}

interface MoodDistributionChartProps {
  checkIns: CheckIn[];
}

const moodLabels: Record<string, string> = {
  great: 'Ótimo',
  good: 'Bom',
  neutral: 'Neutro',
  low: 'Baixo',
  bad: 'Ruim',
};

const MOOD_COLORS: Record<string, string> = {
  great: 'hsl(48, 96%, 53%)',   // yellow
  good: 'hsl(142, 71%, 45%)',   // green
  neutral: 'hsl(217, 91%, 60%)', // blue
  low: 'hsl(220, 9%, 46%)',     // gray
  bad: 'hsl(0, 84%, 60%)',      // red
};

const chartConfig = {
  great: { label: 'Ótimo', color: MOOD_COLORS.great },
  good: { label: 'Bom', color: MOOD_COLORS.good },
  neutral: { label: 'Neutro', color: MOOD_COLORS.neutral },
  low: { label: 'Baixo', color: MOOD_COLORS.low },
  bad: { label: 'Ruim', color: MOOD_COLORS.bad },
};

export const MoodDistributionChart: React.FC<MoodDistributionChartProps> = ({ checkIns }) => {
  // Count moods
  const moodCounts = checkIns.reduce<Record<string, number>>((acc, c) => {
    acc[c.mood] = (acc[c.mood] || 0) + 1;
    return acc;
  }, {});

  const total = checkIns.length;
  
  const distributionData = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      name: moodLabels[mood] || mood,
      value: count,
      percentage: ((count / total) * 100).toFixed(1),
      color: MOOD_COLORS[mood] || 'hsl(var(--muted))',
      mood,
    }))
    .sort((a, b) => b.value - a.value);

  if (distributionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Humor</CardTitle>
          <CardDescription>Proporção de cada tipo de humor</CardDescription>
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
        <CardTitle className="text-lg">Distribuição de Humor</CardTitle>
        <CardDescription>Proporção de cada tipo de humor</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percentage }) => `${name} ${percentage}%`}
                labelLine={false}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const payload = props.payload;
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{payload.name}</span>
                          <span>{payload.value} check-ins ({payload.percentage}%)</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
