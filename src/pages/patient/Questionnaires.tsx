import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, AlertTriangle, Check, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

// Mock questionnaires
const mockQuestionnaires = [
  {
    id: '1',
    title: 'Check-up Semanal',
    description: 'Avaliação rápida do seu bem-estar na semana',
    estimatedTime: '3 min',
    completed: false,
    questions: [
      {
        id: 'q1',
        text: 'Como você avalia sua qualidade de sono esta semana?',
        options: ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Muito boa'],
      },
      {
        id: 'q2',
        text: 'Com que frequência você se sentiu ansioso(a)?',
        options: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
      },
      {
        id: 'q3',
        text: 'Você conseguiu realizar atividades que te dão prazer?',
        options: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
      },
    ],
  },
  {
    id: '2',
    title: 'Escala de Humor',
    description: 'Avalie variações do seu humor recentemente',
    estimatedTime: '5 min',
    completed: true,
    questions: [],
  },
  {
    id: '3',
    title: 'Reflexão Mensal',
    description: 'Olhe para o mês que passou e reflita',
    estimatedTime: '10 min',
    completed: false,
    questions: [],
  },
];

const Questionnaires = () => {
  const { toast } = useToast();
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<typeof mockQuestionnaires[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (activeQuestionnaire && currentQuestion < activeQuestionnaire.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: 'Questionário concluído!',
      description: 'Suas respostas foram salvas com sucesso.',
    });
    setCompleted(true);
  };

  const resetQuestionnaire = () => {
    setActiveQuestionnaire(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Questionário Concluído!</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Suas respostas foram salvas. Você pode revisar seus resultados com seu terapeuta.
        </p>
        <Button onClick={resetQuestionnaire}>
          Voltar aos Questionários
        </Button>
      </div>
    );
  }

  if (activeQuestionnaire) {
    const question = activeQuestionnaire.questions[currentQuestion];
    const totalQuestions = activeQuestionnaire.questions.length;

    return (
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={resetQuestionnaire}
        >
          ← Voltar
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                Pergunta {currentQuestion + 1} de {totalQuestions}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-foreground mb-6">
              {question.text}
            </h3>

            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              {currentQuestion === totalQuestions - 1 ? (
                <Button onClick={handleSubmit} disabled={!answers[question.id]}>
                  Finalizar
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!answers[question.id]}>
                  Próxima
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Questionários"
        description="Ferramentas de auto-observação para seu processo terapêutico"
      />

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Importante</AlertTitle>
        <AlertDescription className="text-amber-700">
          Estes questionários são ferramentas de auto-observação e <strong>não constituem diagnóstico</strong>. 
          Os resultados devem ser discutidos com seu terapeuta.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {mockQuestionnaires.map((questionnaire) => (
          <Card key={questionnaire.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {questionnaire.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {questionnaire.description}
                  </CardDescription>
                </div>
                {questionnaire.completed ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {questionnaire.estimatedTime}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant={questionnaire.completed ? 'outline' : 'default'}
                onClick={() => setActiveQuestionnaire(questionnaire)}
                disabled={questionnaire.questions.length === 0}
              >
                {questionnaire.completed ? 'Refazer' : 'Iniciar'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Questionnaires;
