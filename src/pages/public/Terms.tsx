import { Header } from '@/components/layout/Header';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            Última atualização: Janeiro de 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground mb-4">
              Ao acessar e usar o 149Psi, você concorda em cumprir e estar vinculado a estes 
              Termos de Uso. Se você não concordar com qualquer parte destes termos, não 
              deverá usar nosso serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground mb-4">
              O 149Psi é uma plataforma de acompanhamento terapêutico que permite a 
              pacientes registrarem suas emoções e compartilharem informações com seus 
              terapeutas, e a terapeutas acompanharem seus pacientes entre as sessões.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Uso Apropriado</h2>
            <p className="text-muted-foreground mb-4">
              O 149Psi é uma ferramenta de apoio ao acompanhamento terapêutico e 
              <strong> NÃO substitui o tratamento profissional de saúde mental</strong>. 
              Não oferecemos diagnósticos, tratamentos ou aconselhamento médico/psicológico.
            </p>
            <p className="text-muted-foreground mb-4">
              Em caso de emergência ou crise de saúde mental, procure imediatamente 
              ajuda profissional ou ligue para o CVV (188).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Conta de Usuário</h2>
            <p className="text-muted-foreground mb-4">
              Você é responsável por manter a confidencialidade de sua conta e senha. 
              Você concorda em notificar imediatamente o 149Psi sobre qualquer uso não 
              autorizado de sua conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Responsabilidades do Terapeuta</h2>
            <p className="text-muted-foreground mb-4">
              Terapeutas que utilizam o 149Psi são profissionais independentes e são 
              exclusivamente responsáveis pelos serviços que prestam a seus pacientes. 
              O 149Psi não se responsabiliza pela qualidade ou adequação do atendimento 
              prestado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Todo o conteúdo e tecnologia do 149Psi são protegidos por leis de 
              propriedade intelectual. Você não pode copiar, modificar, distribuir ou 
              usar qualquer parte da plataforma sem autorização expressa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modificações</h2>
            <p className="text-muted-foreground mb-4">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
              Alterações significativas serão comunicadas aos usuários por email ou 
              notificação na plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para questões sobre estes Termos de Uso, entre em contato através do 
              email: suporte@149psi.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
