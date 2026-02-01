import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileEdit,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NotificationCenter } from '@/components/therapist/NotificationCenter';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/therapist' },
  { icon: Users, label: 'Pacientes', path: '/therapist/patients' },
  { icon: FileEdit, label: 'Observações', path: '/therapist/notes' },
  { icon: Calendar, label: 'Agenda', path: '/therapist/schedule' },
  { icon: User, label: 'Perfil', path: '/therapist/profile' },
];

export const TherapistSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getTherapistTypeLabel = () => {
    if (!profile?.therapist_type) return 'Terapeuta';
    const types = {
      psychologist: 'Psicólogo(a)',
      psychoanalyst: 'Psicanalista',
      other: 'Terapeuta',
    };
    return types[profile.therapist_type];
  };

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
            {profile.full_name || 'Terapeuta'}
          </p>
          <p className="text-xs text-muted-foreground">{getTherapistTypeLabel()}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/therapist/patients' && location.pathname.startsWith('/therapist/patients/'));
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
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Notifications */}
        <div className="mt-4 px-2">
          <NotificationCenter collapsed={collapsed} />
        </div>
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
