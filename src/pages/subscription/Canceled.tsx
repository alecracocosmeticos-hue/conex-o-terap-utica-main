import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { XCircle, ArrowRight, Check, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionCanceled = () => {
  const { role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'therapist') return '/therapist';
    if (role === 'patient') return '/patient';
    return '/';
  };

  const benefits = role === 'therapist' 
    ? [
        'Gestão de múltiplos pacientes',
        'Relatórios detalhados',
        'Convites por email',
        'Notificações de check-ins',
      ]
    : [
        'Linha do tempo completa',
        'Gráficos de evolução emocional',
        'Compartilhamento com terapeuta',
        'Exportação de dados',
      ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container py-20">
        <div className="max-w-lg mx-auto">
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-muted">
                  <XCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Pagamento não concluído</CardTitle>
              <CardDescription className="text-base mt-2">
                Sem problemas! Você pode assinar quando estiver pronto.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Lembrete de benefícios */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-3">
                  O que você teria acesso com a assinatura:
                </p>
                <ul className="space-y-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link to="/planos">
                    Ver planos novamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to={getDashboardLink()}>
                    Voltar ao dashboard
                  </Link>
                </Button>
              </div>

              {/* Suporte */}
              <p className="text-center text-sm text-muted-foreground">
                <HelpCircle className="inline h-4 w-4 mr-1" />
                Teve algum problema?{' '}
                <a href="mailto:suporte@exemplo.com" className="underline hover:text-foreground transition-colors">
                  Fale conosco
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionCanceled;
