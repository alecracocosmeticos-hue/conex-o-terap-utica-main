import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, Stethoscope } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type TherapistType = Database['public']['Enums']['therapist_type'];

const RoleSelection = () => {
  const { user, role, setUserRole, loading: authLoading, isRoleLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [therapistType, setTherapistType] = useState<TherapistType>('psychologist');
  const [autoApplying, setAutoApplying] = useState(false);

  // If user already has a role, redirect immediately
  useEffect(() => {
    if (!isRoleLoading && role) {
      const paths = { patient: '/patient', therapist: '/therapist', admin: '/admin' };
      navigate(paths[role], { replace: true });
    }
  }, [role, isRoleLoading, navigate]);

  // Check for pending role from registration
  useEffect(() => {
    const applyPendingRole = async () => {
      const pendingRole = localStorage.getItem('pendingRole') as AppRole | null;
      const pendingTherapistType = localStorage.getItem('pendingTherapistType') as TherapistType | null;

      if (pendingRole && user) {
        setAutoApplying(true);
        
        const { error } = await setUserRole(
          pendingRole,
          pendingRole === 'therapist' ? pendingTherapistType || 'psychologist' : undefined
        );

        // Clear localStorage
        localStorage.removeItem('pendingRole');
        localStorage.removeItem('pendingTherapistType');

        if (error) {
          setAutoApplying(false);
          toast({
            variant: 'destructive',
            title: 'Erro ao configurar perfil',
            description: error.message,
          });
          return;
        }

        toast({
          title: 'Perfil configurado!',
          description: 'Bem-vindo(a) ao 149Psi.',
        });

        navigate(pendingRole === 'patient' ? '/patient' : '/therapist');
      }
    };

    applyPendingRole();
  }, [user, setUserRole, navigate, toast]);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Selecione um perfil',
        description: 'Por favor, escolha se você é paciente ou terapeuta.',
      });
      return;
    }

    setLoading(true);
    const { error } = await setUserRole(
      selectedRole,
      selectedRole === 'therapist' ? therapistType : undefined
    );
    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao configurar perfil',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Perfil configurado!',
      description: 'Bem-vindo(a) ao 149Psi.',
    });

    // Redirect to appropriate dashboard
    navigate(selectedRole === 'patient' ? '/patient' : '/therapist');
  };

  // Show loading while checking auth/role or auto-applying pending role
  if (authLoading || isRoleLoading || autoApplying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {autoApplying ? 'Configurando seu perfil...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              ψ
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo(a) ao 149Psi</h1>
          <p className="text-muted-foreground text-lg">
            Para começar, nos conte: como você vai usar a plataforma?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Patient Option */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === 'patient' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('patient')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Sou Paciente</CardTitle>
              <CardDescription>
                Quero acompanhar minha jornada terapêutica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Registrar emoções diárias
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Manter um diário pessoal
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Visualizar seu progresso
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Compartilhar insights com seu terapeuta
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Therapist Option */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === 'therapist' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('therapist')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Sou Terapeuta</CardTitle>
              <CardDescription>
                Quero acompanhar meus pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Gerenciar pacientes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Visualizar registros compartilhados
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Fazer anotações privadas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Organizar agenda de sessões
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Therapist Type Selection */}
        {selectedRole === 'therapist' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Qual é a sua formação?</CardTitle>
              <CardDescription>
                Isso nos ajuda a personalizar sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={therapistType}
                onValueChange={(value) => setTherapistType(value as TherapistType)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="psychologist" id="psychologist" />
                  <Label htmlFor="psychologist" className="cursor-pointer">
                    Psicólogo(a)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="psychoanalyst" id="psychoanalyst" />
                  <Label htmlFor="psychoanalyst" className="cursor-pointer">
                    Psicanalista
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">
                    Outro
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
            className="min-w-[200px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
