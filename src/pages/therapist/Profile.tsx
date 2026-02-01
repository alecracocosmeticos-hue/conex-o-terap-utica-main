import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { CapacityWarning } from '@/components/subscription/CapacityWarning';
import { useSubscription } from '@/hooks/useSubscription';
import { useCheckout } from '@/hooks/useCheckout';
import { User, Mail, Save, Camera, Briefcase, Palette, CreditCard, ArrowRight } from 'lucide-react';

const TherapistProfile = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { plan, isSubscribed, subscriptionEnd } = useSubscription();
  const { openCustomerPortal, isLoading: isPortalLoading } = useCheckout();
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    specialty: profile?.specialty || '',
    bio: '',
  });

  const getTherapistTypeLabel = () => {
    if (!profile?.therapist_type) return 'Terapeuta';
    const types = {
      psychologist: 'Psicólogo(a)',
      psychoanalyst: 'Psicanalista',
      other: 'Terapeuta',
    };
    return types[profile.therapist_type];
  };

  const handleSave = () => {
    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações profissionais"
      />

      <div className="max-w-2xl">
        {/* Avatar Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(formData.fullName || 'T')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {formData.fullName || 'Terapeuta'}
                </h2>
                <Badge className="mt-1">{getTherapistTypeLabel()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize seus dados de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado por aqui. Entre em contato com o suporte.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações Profissionais</CardTitle>
            <CardDescription>
              Dados sobre sua formação e especialidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Especialidade
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Terapia Cognitivo-Comportamental, Psicanálise..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Escreva uma breve descrição sobre você e sua abordagem terapêutica..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Assinatura
            </CardTitle>
            <CardDescription>
              Gerencie seu plano e capacidade de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plano atual</p>
                <PlanBadge planKey={plan} />
                {isSubscribed && subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Próxima cobrança: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              {isSubscribed ? (
                <Button 
                  variant="outline" 
                  onClick={openCustomerPortal}
                  disabled={isPortalLoading}
                >
                  Gerenciar
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/planos">
                    Fazer upgrade
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            <CapacityWarning showAlways />
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default TherapistProfile;
