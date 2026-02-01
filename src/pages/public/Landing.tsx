import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import {
  Heart,
  Brain,
  Shield,
  Users,
  BarChart3,
  Calendar,
  BookOpen,
  ClipboardList,
  Lock,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

const testimonials = [
  {
    name: 'Maria S.',
    role: 'Paciente',
    initials: 'MS',
    rating: 5,
    quote: 'O 149Psi me ajudou a entender melhor minhas emoções. Agora minhas sessões são muito mais produtivas.',
  },
  {
    name: 'Dr. Carlos M.',
    role: 'Terapeuta',
    initials: 'CM',
    rating: 5,
    quote: 'Ter acesso aos registros dos meus pacientes entre as sessões revolucionou minha prática clínica.',
  },
  {
    name: 'Ana P.',
    role: 'Paciente',
    initials: 'AP',
    rating: 5,
    quote: 'O diário e os check-ins diários se tornaram parte essencial da minha rotina de autocuidado.',
  },
  {
    name: 'Dra. Juliana R.',
    role: 'Terapeuta',
    initials: 'JR',
    rating: 5,
    quote: 'A plataforma facilita muito o acompanhamento. Recomendo a todos os colegas psicólogos.',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5 mb-2">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-muted text-muted'
        }`}
      />
    ))}
  </div>
);

const Landing = () => {
  const isMobile = useIsMobile();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            Plataforma de Acompanhamento Terapêutico
          </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Acompanhamento terapêutico contínuo{' '}
          <span className="text-primary">entre sessões</span>
        </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            O 149Psi é a ponte entre pacientes e psicólogos. Registre suas emoções, 
            acompanhe seu progresso e fortaleça a relação terapêutica.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* O que é o 149Psi */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que é o 149Psi?
            </h2>
            <p className="text-lg text-muted-foreground">
              Uma plataforma desenvolvida para facilitar o acompanhamento terapêutico 
              contínuo, promovendo uma conexão mais profunda entre paciente e terapeuta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Autoconhecimento</CardTitle>
                <CardDescription>
                  Ferramentas para registrar e entender suas emoções ao longo do tempo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Conexão</CardTitle>
                <CardDescription>
                  Compartilhe insights importantes com seu terapeuta de forma segura
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Progresso</CardTitle>
                <CardDescription>
                  Visualize sua evolução e celebre cada conquista no seu caminho
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Pacientes */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Heart className="h-4 w-4" />
                Para Pacientes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Cuide de você, todos os dias
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolva o hábito de observar suas emoções e construa um registro 
                valioso para suas sessões de terapia.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Check-in diário</p>
                    <p className="text-sm text-muted-foreground">
                      Registre como você está se sentindo em poucos segundos
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Diário pessoal</p>
                    <p className="text-sm text-muted-foreground">
                      Escreva livremente sobre seu dia e pensamentos
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Linha do tempo</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize sua jornada emocional ao longo do tempo
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6">
                <Heart className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Emoções</h3>
                <p className="text-sm text-muted-foreground">Registre e categorize</p>
              </Card>
              <Card className="p-6">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Diário</h3>
                <p className="text-sm text-muted-foreground">Escreva livremente</p>
              </Card>
              <Card className="p-6">
                <ClipboardList className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Questionários</h3>
                <p className="text-sm text-muted-foreground">Auto-observação guiada</p>
              </Card>
              <Card className="p-6">
                <BarChart3 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Progresso</h3>
                <p className="text-sm text-muted-foreground">Acompanhe sua evolução</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Para Terapeutas */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <Card className="p-6">
                <Users className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Pacientes</h3>
                <p className="text-sm text-muted-foreground">Gestão centralizada</p>
              </Card>
              <Card className="p-6">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Anotações</h3>
                <p className="text-sm text-muted-foreground">Observações privadas</p>
              </Card>
              <Card className="p-6">
                <Calendar className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Agenda</h3>
                <p className="text-sm text-muted-foreground">Organize sessões</p>
              </Card>
              <Card className="p-6">
                <BarChart3 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Insights</h3>
                <p className="text-sm text-muted-foreground">Dados compartilhados</p>
              </Card>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Brain className="h-4 w-4" />
                Para Psicólogos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Acompanhe seus pacientes entre as sessões
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Tenha acesso a informações valiosas compartilhadas pelos seus pacientes 
                e mantenha suas anotações organizadas.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Visão geral dos pacientes</p>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe o estado emocional de cada paciente
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Anotações privadas</p>
                    <p className="text-sm text-muted-foreground">
                      Registre observações clínicas de forma segura
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Agenda integrada</p>
                    <p className="text-sm text-muted-foreground">
                      Organize suas sessões em um só lugar
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Começar a usar o 149Psi é simples e rápido
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Crie sua conta</h3>
              <p className="text-sm text-muted-foreground">
                Cadastre-se em menos de 1 minuto
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">Escolha seu perfil</h3>
              <p className="text-sm text-muted-foreground">
                Paciente ou Terapeuta
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Configure seu espaço</h3>
              <p className="text-sm text-muted-foreground">
                Personalize sua experiência
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-foreground mb-2">Comece a usar</h3>
              <p className="text-sm text-muted-foreground">
                Explore todas as funcionalidades
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              O que dizem nossos usuários
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Depoimentos
            </h2>
            <p className="text-lg text-muted-foreground">
              Histórias de quem já transformou sua jornada terapêutica
            </p>
          </div>

          {isMobile ? (
            <>
              <Carousel
                setApi={setApi}
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="pl-2 basis-[85%]">
                      <Card className="hover:shadow-lg transition-all duration-300 h-full">
                        <CardHeader className="pb-4">
                          <Quote className="h-8 w-8 text-primary/20 mb-2" />
                          <StarRating rating={testimonial.rating} />
                          <p className="text-muted-foreground italic text-sm">
                            "{testimonial.quote}"
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {testimonial.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className="w-2 h-2 rounded-full bg-primary/30 data-[active=true]:bg-primary transition-colors"
                    data-active={current === index}
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="opacity-0 animate-fade-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <Quote className="h-8 w-8 text-primary/20 mb-2" />
                    <StarRating rating={testimonial.rating} />
                    <p className="text-muted-foreground italic text-sm">
                      "{testimonial.quote}"
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ética e Privacidade */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Compromisso com você
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ética e Privacidade
              </h2>
              <p className="text-lg text-muted-foreground">
                Sua segurança e privacidade são nossa prioridade absoluta
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Lock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Dados Criptografados</CardTitle>
                  <CardDescription>
                    Todas as suas informações são protegidas com criptografia de ponta
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Privacidade Total</CardTitle>
                  <CardDescription>
                    Você controla o que compartilha com seu terapeuta
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Sigilo Profissional</CardTitle>
                  <CardDescription>
                    Respeitamos integralmente o código de ética profissional
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>LGPD Compliant</CardTitle>
                  <CardDescription>
                    Em conformidade com a Lei Geral de Proteção de Dados
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se a pacientes e terapeutas que já estão usando o 149Psi 
              para fortalecer a relação terapêutica.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/planos">Ver Planos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                ψ
              </div>
              <span className="font-bold text-foreground">149Psi</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link to="/planos" className="hover:text-foreground transition-colors">
                Planos
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 149Psi. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
