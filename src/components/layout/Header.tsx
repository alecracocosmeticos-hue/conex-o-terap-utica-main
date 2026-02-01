import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!role) return '/';
    const paths = {
      patient: '/patient',
      therapist: '/therapist',
      admin: '/admin',
    };
    return paths[role];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            ψ
          </div>
          <span className="text-xl font-bold text-foreground">149Psi</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link to="/planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Planos
              </Link>
              <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Criar Conta</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to={getDashboardPath()}>Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'md:hidden absolute top-16 left-0 right-0 bg-background border-b transition-all duration-200',
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}>
        <div className="container py-4 flex flex-col gap-4">
          {!user ? (
            <>
              <Link to="/planos" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Planos
              </Link>
              <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Termos
              </Link>
              <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Privacidade
              </Link>
              <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Criar Conta</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="justify-start">
                <Link to={getDashboardPath()}>Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
