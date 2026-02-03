import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Heart,
  BookOpen,
  FileText,
  ClipboardList,
  History,
  Clock,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  UserPen,
  ClipboardPlus,
  Search,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
  { icon: Search, label: 'Encontrar Terapeuta', path: '/patient/find-therapist' },
  { icon: ClipboardPlus, label: 'Ficha Inicial', path: '/patient/intake' },
  { icon: UserPen, label: 'Sobre Mim', path: '/patient/self-view' },
  { icon: Heart, label: 'Check-in Diário', path: '/patient/checkin' },
  { icon: TrendingUp, label: 'Histórico de Check-ins', path: '/patient/checkin-history' },
  { icon: UserPen, label: 'Sobre Mim', path: '/patient/self-view' },
  { icon: FileText, label: 'Registros Emocionais', path: '/patient/records' },
  { icon: BookOpen, label: 'Diário', path: '/patient/diary' },
  { icon: ClipboardList, label: 'Questionários', path: '/patient/questionnaires' },
  { icon: History, label: 'Minha História', path: '/patient/history' },
  { icon: Clock, label: 'Linha do Tempo', path: '/patient/timeline' },
  { icon: Stethoscope, label: 'Meu Terapeuta', path: '/patient/therapist' },
  { icon: User, label: 'Perfil', path: '/patient/profile' },
];

export const PatientSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut, profile, user } = useAuth();

  // Fetch pending invites count
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pending-invites-count', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return 0;

      const { count, error } = await supabase
        .from('patient_therapist_relations')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_email', profile.email)
        .eq('status', 'pending');

      if (error) return 0;
      return count || 0;
    },
    enabled: !!profile?.email,
  });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'sticky top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              ψ
            </div>
            <span className="font-bold text-sidebar-foreground">149Psi</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User info */}
      {!collapsed && profile && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {profile.full_name || 'Paciente'}
          </p>
          <p className="text-xs text-muted-foreground">Paciente</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      {item.label}
                      {item.path === '/patient/therapist' && pendingCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                          {pendingCount}
                        </Badge>
                      )}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50',
            collapsed && 'justify-center'
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </aside>
  );
};
