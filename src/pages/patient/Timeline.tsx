import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  BookOpen,
  ClipboardList,
  Calendar,
  MessageSquare,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock timeline data
const timelineEvents = [
  {
    id: '1',
    type: 'checkin',
    date: new Date(2024, 0, 20, 9, 30),
    title: 'Check-in matinal',
    description: 'Humor: Bom | Intensidade: 7/10',
    mood: 'good',
  },
  {
    id: '2',
    type: 'diary',
    date: new Date(2024, 0, 19, 22, 15),
    title: 'Entrada no diário',
    description: 'Reflexões sobre a semana',
    mood: null,
  },
  {
    id: '3',
    type: 'session',
    date: new Date(2024, 0, 18, 15, 0),
    title: 'Sessão de terapia',
    description: 'Sessão com Dr. Carlos - 50 min',
    mood: null,
  },
  {
    id: '4',
    type: 'checkin',
    date: new Date(2024, 0, 18, 8, 45),
    title: 'Check-in matinal',
    description: 'Humor: Neutro | Intensidade: 5/10',
    mood: 'neutral',
  },
  {
    id: '5',
    type: 'questionnaire',
    date: new Date(2024, 0, 17, 20, 0),
    title: 'Questionário completado',
    description: 'Check-up Semanal',
    mood: null,
  },
  {
    id: '6',
    type: 'record',
    date: new Date(2024, 0, 16, 14, 30),
    title: 'Registro emocional',
    description: 'Momento de reflexão',
    mood: null,
  },
  {
    id: '7',
    type: 'checkin',
    date: new Date(2024, 0, 15, 9, 0),
    title: 'Check-in matinal',
    description: 'Humor: Baixo | Intensidade: 4/10',
    mood: 'bad',
  },
];

const eventIcons = {
  checkin: Heart,
  diary: BookOpen,
  questionnaire: ClipboardList,
  session: Calendar,
  record: MessageSquare,
};

const moodIcons = {
  good: Smile,
  neutral: Meh,
  bad: Frown,
};

const moodColors = {
  good: 'text-green-500',
  neutral: 'text-yellow-500',
  bad: 'text-red-500',
};

const eventColors = {
  checkin: 'bg-pink-100 text-pink-600',
  diary: 'bg-blue-100 text-blue-600',
  questionnaire: 'bg-purple-100 text-purple-600',
  session: 'bg-green-100 text-green-600',
  record: 'bg-orange-100 text-orange-600',
};

const Timeline = () => {
  return (
    <div>
      <PageHeader
        title="Linha do Tempo"
        description="Visualize sua jornada terapêutica ao longo do tempo"
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const Icon = eventIcons[event.type as keyof typeof eventIcons];
            const MoodIcon = event.mood ? moodIcons[event.mood as keyof typeof moodIcons] : null;

            return (
              <div key={event.id} className="relative pl-16">
                {/* Icon circle */}
                <div className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center ${eventColors[event.type as keyof typeof eventColors]}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {format(event.date, "d 'de' MMMM, HH:mm", { locale: ptBR })}
                        </p>
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                      {MoodIcon && (
                        <div className={`p-2 rounded-full bg-muted ${moodColors[event.mood as keyof typeof moodColors]}`}>
                          <MoodIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
