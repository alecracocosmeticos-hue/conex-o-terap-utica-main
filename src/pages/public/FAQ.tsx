import { Header } from '@/components/layout/Header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HelpCircle, CreditCard, Clock, XCircle } from 'lucide-react';

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Central de Ajuda
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre períodos de trial, cobranças e cancelamentos
          </p>
        </div>

        {/* Seção: Período de Trial */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Período de Trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>O que é o período de trial?</AccordionTrigger>
                <AccordionContent>
                  O período de trial é um tempo gratuito para você experimentar 
                  todas as funcionalidades do plano antes de ser cobrado. 
                  Pacientes têm 14 dias de trial e terapeutas têm 7 dias.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Quando começa o trial?</AccordionTrigger>
                <AccordionContent>
                  O trial começa imediatamente após você confirmar a assinatura 
                  no checkout. Você terá acesso completo a todas as funcionalidades 
                  do plano escolhido desde o primeiro momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Preciso cadastrar cartão para o trial?</AccordionTrigger>
                <AccordionContent>
                  Sim, é necessário cadastrar um método de pagamento válido para 
                  iniciar o trial. Isso garante uma transição suave para o plano 
                  pago, mas você não será cobrado durante o período de trial.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Posso usar o trial mais de uma vez?</AccordionTrigger>
                <AccordionContent>
                  O período de trial é oferecido apenas para novas assinaturas. 
                  Se você já utilizou um trial anteriormente, novas assinaturas 
                  serão cobradas imediatamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Seção: Cobrança */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Cobrança e Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-1">
                <AccordionTrigger>Quando começa a cobrança?</AccordionTrigger>
                <AccordionContent>
                  A primeira cobrança ocorre automaticamente após o término do 
                  período de trial. Para pacientes, no 15º dia. Para terapeutas, 
                  no 8º dia. Você receberá um email antes da cobrança.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payment-2">
                <AccordionTrigger>Quais formas de pagamento são aceitas?</AccordionTrigger>
                <AccordionContent>
                  Aceitamos cartões de crédito e débito das principais bandeiras 
                  (Visa, Mastercard, American Express, Elo). Os pagamentos são 
                  processados de forma segura pelo Stripe.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payment-3">
                <AccordionTrigger>Como funciona a renovação?</AccordionTrigger>
                <AccordionContent>
                  Sua assinatura renova automaticamente a cada mês na data de 
                  aniversário da primeira cobrança. Você pode cancelar a qualquer 
                  momento antes da renovação.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payment-4">
                <AccordionTrigger>Posso trocar de plano?</AccordionTrigger>
                <AccordionContent>
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer 
                  momento através do portal de gerenciamento de assinatura. 
                  Ajustes serão aplicados proporcionalmente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Seção: Cancelamento */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-primary" />
              Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cancel-1">
                <AccordionTrigger>Como cancelo durante o trial?</AccordionTrigger>
                <AccordionContent>
                  Você pode cancelar a qualquer momento durante o trial sem ser 
                  cobrado. Basta acessar seu perfil, clicar em "Gerenciar assinatura" 
                  e selecionar a opção de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-2">
                <AccordionTrigger>O que acontece se eu cancelar durante o trial?</AccordionTrigger>
                <AccordionContent>
                  Se você cancelar durante o período de trial, nenhuma cobrança 
                  será realizada. Você manterá acesso até o fim do período de 
                  trial e depois voltará ao plano gratuito.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-3">
                <AccordionTrigger>Posso cancelar após o trial?</AccordionTrigger>
                <AccordionContent>
                  Sim, você pode cancelar sua assinatura a qualquer momento. O 
                  cancelamento será efetivado ao final do período pago atual. 
                  Não há taxas de cancelamento ou fidelidade.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-4">
                <AccordionTrigger>Meus dados são excluídos ao cancelar?</AccordionTrigger>
                <AccordionContent>
                  Não. Ao cancelar, você volta ao plano gratuito e mantém acesso 
                  aos recursos básicos. Seus dados permanecem salvos e você pode 
                  reativar sua assinatura quando quiser.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ainda tem dúvidas? Entre em contato conosco.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild>
              <Link to="/planos">Ver Planos</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:suporte@149psi.com.br">Falar com Suporte</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
