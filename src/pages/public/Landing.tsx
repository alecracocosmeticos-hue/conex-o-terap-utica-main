import { LandingAuth } from '@/components/landing/LandingAuth';
import { LandingContent } from '@/components/landing/LandingContent';

const Landing = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Coluna Esquerda - Autenticação */}
      <div className="order-1 lg:order-1 bg-background relative z-10">
        <LandingAuth />
      </div>

      {/* Coluna Direita - Contexto/Confiança */}
      <div className="order-2 lg:order-2">
        <LandingContent />
      </div>
    </div>
  );
};

export default Landing;


