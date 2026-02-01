import { Header } from '@/components/layout/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            Última atualização: Janeiro de 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p className="text-muted-foreground mb-4">
              O 149Psi está comprometido com a proteção da sua privacidade. Esta Política 
              de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
              informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Dados que Coletamos</h2>
            <p className="text-muted-foreground mb-4">
              Coletamos os seguintes tipos de informações:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Informações de cadastro (nome, email)</li>
              <li>Dados de uso da plataforma</li>
              <li>Registros emocionais e diário (criados por você)</li>
              <li>Respostas a questionários</li>
              <li>Comunicações entre paciente e terapeuta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Usamos seus Dados</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Permitir o acompanhamento terapêutico</li>
              <li>Enviar comunicações importantes sobre a plataforma</li>
              <li>Garantir a segurança da sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Não vendemos seus dados pessoais.</strong> Seus dados são compartilhados apenas:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Com seu terapeuta, quando você escolhe compartilhar</li>
              <li>Com prestadores de serviço essenciais (hospedagem, segurança)</li>
              <li>Quando exigido por lei ou ordem judicial</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Segurança dos Dados</h2>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Criptografia em trânsito e em repouso</li>
              <li>Controle de acesso rigoroso</li>
              <li>Monitoramento de segurança contínuo</li>
              <li>Backups regulares</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Portabilidade dos dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Retenção de Dados</h2>
            <p className="text-muted-foreground mb-4">
              Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da 
              conta, seus dados são removidos em até 30 dias, exceto quando a retenção 
              for necessária por obrigação legal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies essenciais para o funcionamento da plataforma e 
              cookies analíticos para melhorar sua experiência. Você pode configurar 
              seu navegador para recusar cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
            </p>
            <p className="text-muted-foreground mb-4">
              Email: privacidade@149psi.com.br<br />
              Encarregado de Dados (DPO): dpo@149psi.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
