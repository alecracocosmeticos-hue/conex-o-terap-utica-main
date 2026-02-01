import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Heart, Stethoscope } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type TherapistType = Database['public']['Enums']['therapist_type'];

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'therapist'] as const),
  therapistType: z.enum(['psychologist', 'psychoanalyst', 'other'] as const).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'therapist' && !data.therapistType) {
    return false;
  }
  return true;
}, {
  message: 'Selecione seu tipo de atuação',
  path: ['therapistType'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      therapistType: undefined,
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    
    // Save role selection to localStorage for after email confirmation
    localStorage.setItem('pendingRole', data.role);
    if (data.therapistType) {
      localStorage.setItem('pendingTherapistType', data.therapistType);
    }
    
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);

    if (error) {
      // Clear pending role on error
      localStorage.removeItem('pendingRole');
      localStorage.removeItem('pendingTherapistType');
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Verifique seu email',
      description: 'Enviamos um link de confirmação para ativar sua conta.',
    });

    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              ψ
            </div>
            <span className="text-2xl font-bold text-foreground">149Psi</span>
          </Link>
          <p className="text-muted-foreground">Acompanhamento terapêutico contínuo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Como você vai usar o 149Psi?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-3"
                        >
                          <div>
                            <RadioGroupItem
                              value="patient"
                              id="patient"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="patient"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                              <Heart className="mb-2 h-6 w-6 text-primary" />
                              <span className="text-sm font-medium">Paciente</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Acompanhar minha jornada
                              </span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="therapist"
                              id="therapist"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="therapist"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                              <Stethoscope className="mb-2 h-6 w-6 text-primary" />
                              <span className="text-sm font-medium">Terapeuta</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Acompanhar meus pacientes
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Therapist Type Selection */}
                {selectedRole === 'therapist' && (
                  <FormField
                    control={form.control}
                    name="therapistType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Qual sua área de atuação?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-3 rounded-lg border border-muted p-3 hover:bg-accent cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <RadioGroupItem value="psychologist" id="psychologist" />
                              <Label htmlFor="psychologist" className="flex-1 cursor-pointer">
                                Psicólogo(a)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 rounded-lg border border-muted p-3 hover:bg-accent cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <RadioGroupItem value="psychoanalyst" id="psychoanalyst" />
                              <Label htmlFor="psychoanalyst" className="flex-1 cursor-pointer">
                                Psicanalista
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 rounded-lg border border-muted p-3 hover:bg-accent cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other" className="flex-1 cursor-pointer">
                                Outro
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
