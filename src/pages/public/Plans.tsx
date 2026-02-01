import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { PricingCard } from '@/components/subscription/PricingCard';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { Check, ArrowRight, MessageCircle, HelpCircle, Gift, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useCheckout } from '@/hooks/useCheckout';
import { PATIENT_PLANS, THERAPIST_PLANS, type PlanConfig } from '@/config/plans';


// Free tier features for comparison
const FREE_PATIENT_FEATURES = [
  'Check-in diário ilimitado',
  'Diário pessoal ilimitado',
  'Registros emocionais ilimitados',
  'Acesso a histórico básico',
];

const FREE_THERAPIST_FEATURES = [
  'Visualização de pacientes',
  'Notas privadas básicas',
  'Sem limite de acesso aos dados',
];

const Plans = () => {
  const { user, role } = useAuth();
  const { plan: currentPlan, isSubscribed, checkSubscription } = useSubscription();
  const { createCheckout, openCustomerPortal, isLoading } = useCheckout();


  // Refresh subscription on mount
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleSelectPlan = (plan: PlanConfig) => {
    if (!user) {
      // Redirect to register if not logged in
      window.location.href = '/register';
      return;
    }
    createCheckout(plan.price_id, plan.plan_key, plan.trialDays);
  };

  const isPatient = role === 'patient';
  const isTherapist = role === 'therapist';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Escolha seu plano
          </h1>
          <p className="text-xl text-muted-foreground">
            {isSubscribed ? (
              <>
                Você está no plano <PlanBadge planKey={currentPlan} />
              </>
            ) : (
              'Comece gratuitamente e evolua conforme suas necessidades'
            )}
          </p>
          {isSubscribed && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={openCustomerPortal}
              disabled={isLoading}
            >
              Gerenciar assinatura
            </Button>
          )}
        </div>

        {/* Trial Banner - Only for non-subscribed users */}
        {!isSubscribed && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-emerald-500/10 border border-primary/20 p-6 md:p-8">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-3">
                    <Sparkles className="h-3 w-3" />
                    OFERTA ESPECIAL
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    {isTherapist 
                      ? 'Experimente grátis por 7 dias!' 
                      : 'Experimente grátis por 14 dias!'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {isTherapist
                      ? 'Teste todas as funcionalidades premium sem compromisso. Cancele a qualquer momento.'
                      : 'Acesse todos os recursos premium sem pagar nada. Sem compromisso, cancele quando quiser.'
                    }
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Sem cobrança durante o trial
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-primary" />
                      Cancele a qualquer momento
                    </span>
                  </div>
                </div>
                
                {/* CTA for visitors */}
                {!user && (
                  <div className="flex-shrink-0">
                    <Button size="lg" asChild>
                      <Link to="/register">
                        Começar Agora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show relevant plans based on user role */}
        {(!user || isPatient) && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              {isPatient ? 'Seu plano' : 'Para Pacientes'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free tier card */}
              <Card className={!isSubscribed && isPatient ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Gratuito</CardTitle>
                  <CardDescription>Para começar sua jornada</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">R$ 0</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {FREE_PATIENT_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {!user ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/register">
                        Começar Grátis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : !isSubscribed && isPatient ? (
                    <Button className="w-full" variant="outline" disabled>
                      Plano Atual
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              {/* Essential plan */}
              {PATIENT_PLANS.map((plan) => (
                <PricingCard
                  key={plan.plan_key}
                  plan={plan}
                  isCurrentPlan={currentPlan === plan.plan_key}
                  onSelect={handleSelectPlan}
                  isLoading={isLoading}
                  disabled={!isPatient && !!user}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Acompanhamento emocional contínuo por menos de R$1 por dia.{' '}
              <Link 
                to="/faq" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                Dúvidas sobre o trial?
              </Link>
            </p>
          </div>
        )}

        {(!user || isTherapist) && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">
              {isTherapist ? 'Seu plano' : 'Para Terapeutas'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Free tier for therapists */}
              <Card className={!isSubscribed && isTherapist ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Gratuito</CardTitle>
                  <CardDescription>Acesso básico</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">R$ 0</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pacientes ilimitados
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {FREE_THERAPIST_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {!user ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/register">
                        Começar Grátis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : !isSubscribed && isTherapist ? (
                    <Button className="w-full" variant="outline" disabled>
                      Plano Atual
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              {THERAPIST_PLANS.map((plan) => (
                <PricingCard
                  key={plan.plan_key}
                  plan={plan}
                  isCurrentPlan={currentPlan === plan.plan_key}
                  onSelect={handleSelectPlan}
                  isLoading={isLoading}
                  disabled={!isTherapist && !!user}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Teste gratuitamente por 7 dias.{' '}
              <Link 
                to="/faq" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                Saiba como funciona
              </Link>
            </p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Enterprise
              </CardTitle>
              <CardDescription>
                Precisa de um plano personalizado para sua clínica?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Pacientes ilimitados, múltiplos terapeutas, relatórios personalizados, 
                integrações e suporte dedicado.
              </p>
              <Button variant="outline" size="lg">
                Fale Conosco
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Plans;
