import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Smile, Meh, Frown, Heart, Zap, Cloud, Sun, Moon, Coffee, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';

const moods = [
  { id: 'great', label: 'Ótimo', icon: Sun, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
  { id: 'good', label: 'Bem', icon: Smile, color: 'text-green-500 bg-green-50 border-green-200' },
  { id: 'neutral', label: 'Neutro', icon: Meh, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'low', label: 'Baixo', icon: Cloud, color: 'text-gray-500 bg-gray-50 border-gray-200' },
  { id: 'bad', label: 'Mal', icon: Frown, color: 'text-red-500 bg-red-50 border-red-200' },
];

const feelings = [
  { id: 'calm', label: 'Calmo', icon: Moon },
  { id: 'energized', label: 'Energizado', icon: Zap },
  { id: 'anxious', label: 'Ansioso', icon: Coffee },
  { id: 'grateful', label: 'Grato', icon: Heart },
  { id: 'motivated', label: 'Motivado', icon: Sun },
  { id: 'tired', label: 'Cansado', icon: Cloud },
];

const CheckIn = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [intensity, setIntensity] = useState([5]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const saveCheckIn = useMutation({
    mutationFn: async (data: {
      mood: string;
      intensity: number;
      feelings: string[];
      notes: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        mood: data.mood,
        intensity: data.intensity,
        feelings: data.feelings,
        notes: data.notes || null,
        shared_with_therapist: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSaved(true);
      toast({
        title: 'Check-in salvo!',
        description: 'Seu registro foi salvo com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      });
    },
  });

  const toggleFeeling = (feelingId: string) => {
    setSelectedFeelings(prev =>
      prev.includes(feelingId)
        ? prev.filter(f => f !== feelingId)
        : [...prev, feelingId]
    );
  };

  const handleSave = () => {
    if (!selectedMood) {
      toast({
        variant: 'destructive',
        title: 'Selecione seu humor',
        description: 'Por favor, escolha como você está se sentindo.',
      });
      return;
    }

    saveCheckIn.mutate({
      mood: selectedMood,
      intensity: intensity[0],
      feelings: selectedFeelings,
      notes,
    });
  };

  const handleNewCheckIn = () => {
    setSaved(false);
    setSelectedMood(null);
    setSelectedFeelings([]);
    setIntensity([5]);
    setNotes('');
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check-in Completo!</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Obrigado por registrar como você está se sentindo hoje. 
          Continue assim para acompanhar sua jornada emocional.
        </p>
        <Button onClick={handleNewCheckIn}>
          Fazer Novo Check-in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Check-in Diário"
        description="Como você está se sentindo agora?"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Mood Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione seu humor</CardTitle>
            <CardDescription>Como está seu humor geral neste momento?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[80px]',
                    selectedMood === mood.id
                      ? `${mood.color} border-current ring-2 ring-offset-2 ring-current`
                      : 'bg-background border-border hover:border-primary/50'
                  )}
                >
                  <mood.icon className={cn(
                    'h-8 w-8',
                    selectedMood === mood.id ? '' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    selectedMood === mood.id ? '' : 'text-muted-foreground'
                  )}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intensity Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intensidade</CardTitle>
            <CardDescription>
              Qual a intensidade do que você está sentindo? (1-10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Leve</span>
                <span className="text-lg font-bold text-foreground">{intensity[0]}</span>
                <span>Intenso</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feelings Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">O que mais você está sentindo?</CardTitle>
            <CardDescription>Selecione os sentimentos que te descrevem agora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {feelings.map((feeling) => (
                <button
                  key={feeling.id}
                  onClick={() => toggleFeeling(feeling.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full border transition-all',
                    selectedFeelings.includes(feeling.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50 text-muted-foreground'
                  )}
                >
                  <feeling.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{feeling.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
            <CardDescription>
              Quer adicionar alguma nota sobre como você está? (Opcional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Escreva aqui o que quiser..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          size="lg" 
          className="w-full" 
          onClick={handleSave}
          disabled={saveCheckIn.isPending}
        >
          <Heart className="mr-2 h-5 w-5" />
          {saveCheckIn.isPending ? 'Salvando...' : 'Salvar Check-in'}
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
