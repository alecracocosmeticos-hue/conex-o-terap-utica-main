import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { CheckCircle, ArrowRight, Loader2, AlertCircle, Users, Calendar, ClipboardList, Heart, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { useAuth } from '@/contexts/AuthContext';
import { getPlanByKey } from '@/config/plans';
import { cn } from '@/lib/utils';

type PageState = 'loading' | 'success' | 'error';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription, plan, isSubscribed, isLoading } = useSubscription();
  const { role } = useAuth();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const planConfig = getPlanByKey(plan);

  // Verify subscription when page loads
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setPageState('error');
      return;
    }

    const verifySubscription = async () => {
      try {
        await checkSubscription();
        // Give it a moment for state to update
        setTimeout(() => {
          setPageState('success');
        }, 500);
      } catch (error) {
        console.error('Error verifying subscription:', error);
        if (retryCount < 3) {
          // Retry up to 3 times with increasing delays
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1));
        } else {
          setPageState('error');
        }
      }
    };

    // Initial delay to allow Stripe webhook to process
    const timer = setTimeout(verifySubscription, 2000);
    return () => clearTimeout(timer);
  }, [searchParams, checkSubscription, retryCount]);

  // Update state when subscription data arrives
  useEffect(() => {
    if (!isLoading && isSubscribed && pageState === 'loading') {
      setPageState('success');
    }
  }, [isLoading, isSubscribed, pageState]);

  const getDashboardLink = () => {
    if (role === 'therapist') return '/therapist';
    if (role === 'patient') return '/patient';
    return '/';
  };

  const getNextSteps = () => {
    if (role === 'patient') {
      return [
        { label: 'Fazer check-in', href: '/patient/checkin', icon: Heart, primary: true },
        { label: 'Explorar linha do tempo', href: '/patient/timeline', icon: Calendar },
      ];
    }
    if (role === 'therapist') {
      return [
        { label: 'Convidar pacientes', href: '/therapist/patients', icon: Users, primary: true },
        { label: 'Ver agenda', href: '/therapist/schedule', icon: Calendar },
      ];
    }
    return [];
  };

  const nextSteps = getNextSteps();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Confetti Animation */}
      {pageState === 'success' && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'][i % 4],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <section className="container py-20">
        <div className="max-w-lg mx-auto">
          <Card className={cn(
            "transition-all duration-500",
            pageState === 'success' && "animate-scale-in"
          )}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {pageState === 'loading' && (
                  <div className="p-3 rounded-full bg-muted">
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  </div>
                )}
                {pageState === 'success' && (
                  <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                    <CheckCircle className="h-12 w-12 text-primary" />
                  </div>
                )}
                {pageState === 'error' && (
                  <div className="p-3 rounded-full bg-destructive/10">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                )}
              </div>

              {pageState === 'loading' && (
                <>
                  <CardTitle className="text-2xl">Verificando assinatura...</CardTitle>
                  <CardDescription>
                    Aguarde enquanto confirmamos seu pagamento
                  </CardDescription>
                </>
              )}

              {pageState === 'success' && (
                <>
                  <CardTitle className="text-2xl">Assinatura confirmada! 🎉</CardTitle>
                  <CardDescription>
                    Seu pagamento foi processado com sucesso
                  </CardDescription>
                </>
              )}

              {pageState === 'error' && (
                <>
                  <CardTitle className="text-2xl">Algo deu errado</CardTitle>
                  <CardDescription>
                    Não conseguimos verificar sua assinatura
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Loading State */}
              {pageState === 'loading' && (
                <div className="space-y-4">
                  <div className="h-20 bg-muted rounded-lg animate-pulse" />
                  <div className="h-10 bg-muted rounded-lg animate-pulse" />
                </div>
              )}

              {/* Success State */}
              {pageState === 'success' && (
                <>
                  {/* Plan Details */}
                  {planConfig && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Seu plano</span>
                        <PlanBadge planKey={plan} size="default" />
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">R$ {planConfig.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>

                      {planConfig.maxPatients && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Até {planConfig.maxPatients} pacientes ativos</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border">
                        <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
                        <ul className="space-y-1.5">
                          {planConfig.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-muted-foreground">
                    Você agora tem acesso a todos os recursos do seu plano. 
                    Aproveite sua jornada de autoconhecimento!
                  </p>

                  {/* Next Steps */}
                  {nextSteps.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-center">Próximos passos</p>
                      <div className="flex flex-col gap-2">
                        {nextSteps.map((step, index) => (
                          <Button 
                            key={index} 
                            variant={step.primary ? 'default' : 'outline'} 
                            asChild
                            className="w-full"
                          >
                            <Link to={step.href}>
                              <step.icon className="mr-2 h-4 w-4" />
                              {step.label}
                              {step.primary && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border flex flex-col gap-2">
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link to={getDashboardLink()}>
                        Ir para o Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link to="/planos">
                        Gerenciar assinatura
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {/* Error State */}
              {pageState === 'error' && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Isso pode acontecer se o pagamento ainda está sendo processado. 
                    Tente novamente em alguns minutos.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => {
                      setRetryCount(0);
                      setPageState('loading');
                    }}>
                      Tentar novamente
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/planos">Voltar para planos</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* FAQ Section - Only on success */}
          {pageState === 'success' && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Dúvidas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="manage">
                    <AccordionTrigger className="text-sm">
                      Como gerencio minha assinatura?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Acesse seu perfil e clique em "Gerenciar assinatura" para 
                      alterar método de pagamento, fazer upgrade/downgrade ou 
                      cancelar pelo portal seguro do Stripe.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="billing">
                    <AccordionTrigger className="text-sm">
                      Quando serei cobrado?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {planConfig?.trialDays 
                        ? `Você tem ${planConfig.trialDays} dias de trial gratuito. A primeira cobrança ocorrerá após esse período.`
                        : 'Sua assinatura renova automaticamente todo mês na mesma data.'
                      }
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cancel">
                    <AccordionTrigger className="text-sm">
                      Posso cancelar a qualquer momento?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Sim! Não há fidelidade. Você pode cancelar a qualquer momento 
                      e continuará com acesso até o fim do período pago.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data">
                    <AccordionTrigger className="text-sm">
                      Meus dados ficam salvos se eu cancelar?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Sim, seus dados permanecem salvos. Ao cancelar, você volta 
                      ao plano gratuito com acesso aos recursos básicos.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4 pt-3 border-t border-border">
                  <Link 
                    to="/faq" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Ver todas as perguntas frequentes
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default SubscriptionSuccess;
