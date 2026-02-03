import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";

export const LandingAuth = () => {
    const { signInWithGoogle, signIn, signUp, user, role, loading: authLoading, isRoleLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<"patient" | "therapist" | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (authLoading || isRoleLoading) return;

        if (user) {
            if (role) {
                const paths = { patient: '/patient', therapist: '/therapist', admin: '/admin' };
                navigate(paths[role], { replace: true });
            } else {
                // If user has no role, redirect to onboarding regardless of how they signed up
                navigate('/onboarding/role', { replace: true });
            }
        }
    }, [user, role, authLoading, isRoleLoading, navigate]);

    const savePendingRole = () => {
        if (selectedRole) {
            localStorage.setItem('pendingRole', selectedRole);
        } else {
            localStorage.removeItem('pendingRole');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            if (isRegister && !selectedRole) {
                toast({ variant: "destructive", title: "Selecione se você é paciente ou terapeuta" });
                return;
            }
            // Save role preference if selected (even for login context if they switched toggles, though less critical)
            if (isRegister) savePendingRole();

            setLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao autenticar com Google",
                description: error.message,
            });
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegister) {
            // Registration Logic
            if (!email || !password || !fullName || !confirmPassword) {
                toast({ variant: "destructive", title: "Preencha todos os campos" });
                return;
            }
            if (!selectedRole) {
                toast({ variant: "destructive", title: "Selecione se você é paciente ou terapeuta" });
                return;
            }
            if (password !== confirmPassword) {
                toast({ variant: "destructive", title: "As senhas não conferem" });
                return;
            }
            if (password.length < 8) {
                toast({ variant: "destructive", title: "A senha deve ter pelo menos 8 caracteres" });
                return;
            }
            if (!/[A-Z]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos uma letra maiúscula" });
                return;
            }
            if (!/[a-z]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos uma letra minúscula" });
                return;
            }
            if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos um número ou símbolo" });
                return;
            }

            try {
                setLoading(true);
                savePendingRole(); // Save role for the onboarding page to pick up

                const { error } = await signUp(email, password, fullName);
                if (error) throw error;

                toast({
                    title: "Conta criada com sucesso!",
                    description: "Verifique seu email para confirmar o cadastro.",
                });
                // Optionally reset form or switch to login mode, but usually standard is to wait for email usage
                setIsRegister(false);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Erro ao criar conta",
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }

        } else {
            // Login Logic
            if (!email || !password) return;

            try {
                setLoading(true);
                const { error } = await signIn(email, password);
                if (error) throw error;

                toast({
                    title: "Bem-vindo(a) de volta!",
                    description: "Login realizado com sucesso.",
                });
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Erro ao entrar",
                    description: error.message === 'Invalid login credentials'
                        ? 'Email ou senha incorretos'
                        : error.message,
                });
                setLoading(false);
            }
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        // Reset sensitive fields/errors if any, keep email optionally
        setPassword("");
        setConfirmPassword("");
        setSelectedRole(null);
    };

    return (
        <div className="flex flex-col justify-center min-h-[50vh] lg:min-h-screen p-8 lg:p-12">
            <div className="w-full max-w-sm mx-auto space-y-8">
                <div className="space-y-2 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                            ψ
                        </div>
                        <span className="text-2xl font-bold">149PSI</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isRegister ? "Crie sua conta" : "Entre na sua conta"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRegister
                            ? "Comece sua jornada de cuidado terapêutico."
                            : "Acesse seu espaço de cuidado terapêutico."}
                    </p>
                </div>

                <div className="space-y-4">
                    {isRegister && (
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('patient')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${selectedRole === 'patient'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold">Paciente</span>
                                <span className="text-xs mt-1">Busco terapia</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('therapist')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${selectedRole === 'therapist'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold">Terapeuta</span>
                                <span className="text-xs mt-1">Sou profissional</span>
                            </button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full h-11 relative bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        Continuar com Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                ou continue com email
                            </span>
                        </div>
                    </div>

                    {!showEmailForm ? (
                        <div className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full h-11"
                                onClick={() => { setShowEmailForm(true); setIsRegister(false); }}
                                disabled={loading}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Entrar com Email
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-11"
                                onClick={() => { setShowEmailForm(true); setIsRegister(true); }}
                                disabled={loading}
                            >
                                Não tem conta? Cadastre-se
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            {isRegister && (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Nome Completo"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {isRegister && password.length > 0 && (
                                    <div className="space-y-2 py-2">
                                        <div className="flex gap-1 h-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-full w-full rounded-full transition-all ${i < (
                                                        (password.length >= 8 ? 1 : 0) +
                                                        (/[A-Z]/.test(password) ? 1 : 0) +
                                                        (/[a-z]/.test(password) ? 1 : 0) +
                                                        (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                    )
                                                        ? (
                                                            (
                                                                (password.length >= 8 ? 1 : 0) +
                                                                (/[A-Z]/.test(password) ? 1 : 0) +
                                                                (/[a-z]/.test(password) ? 1 : 0) +
                                                                (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                            ) <= 2 ? 'bg-red-500' :
                                                                (
                                                                    (password.length >= 8 ? 1 : 0) +
                                                                    (/[A-Z]/.test(password) ? 1 : 0) +
                                                                    (/[a-z]/.test(password) ? 1 : 0) +
                                                                    (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                                ) === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                                        )
                                                        : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <ul className="text-xs space-y-1 text-muted-foreground">
                                            <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                                                Mínimo de 8 caracteres
                                            </li>
                                            <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                                                Letra maiúscula
                                            </li>
                                            <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                                                Letra minúscula
                                            </li>
                                            <li className={`flex items-center gap-2 ${/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                                                Número ou símbolo
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {isRegister && (
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirmar Senha"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isRegister ? "Criar Conta" : "Entrar"}
                            </Button>

                            <div className="flex flex-col gap-4 text-center text-sm">
                                {!isRegister && (
                                    <Link to="/forgot-password" className="text-primary hover:underline">
                                        Esqueceu sua senha?
                                    </Link>
                                )}

                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-muted-foreground">
                                        {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto font-medium text-primary hover:underline"
                                        onClick={toggleMode}
                                    >
                                        {isRegister ? "Entrar" : "Cadastre-se"}
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto p-0 font-normal text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowEmailForm(false)}
                                >
                                    Voltar para opções
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-xs text-center text-muted-foreground lg:text-left px-4 lg:px-0">
                        Ao continuar, você concorda com os <Link to="/terms" className="underline hover:text-primary">Termos de Uso</Link> e a <Link to="/privacy" className="underline hover:text-primary">Política de Privacidade</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};
