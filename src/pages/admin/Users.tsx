import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithDetails {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string | null;
  role: AppRole | null;
  subscription_status: string | null;
  subscription_plan: string | null;
}

const getRoleBadge = (role: AppRole | null) => {
  switch (role) {
    case 'patient':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">Paciente</Badge>;
    case 'therapist':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">Terapeuta</Badge>;
    case 'admin':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">Admin</Badge>;
    default:
      return <Badge variant="secondary">Sem papel</Badge>;
  }
};

const getSubscriptionBadge = (status: string | null, plan: string | null) => {
  if (!status || status === 'inactive' || plan === 'none') {
    return <span className="text-muted-foreground text-sm">-</span>;
  }
  
  const planLabels: Record<string, string> = {
    'patient_essential': 'Essencial',
    'therapist_starter': 'Starter',
    'therapist_growth': 'Growth',
    'therapist_scale': 'Scale',
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm">{planLabels[plan || ''] || plan}</span>
      <span className={`text-xs ${status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
        {status === 'active' ? 'Ativo' : status}
      </span>
    </div>
  );
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const ITEMS_PER_PAGE = 10;

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'patients' | 'therapists' | 'admins'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Buscar subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan');

      if (subsError) throw subsError;

      // Combinar dados
      return profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        role: roles?.find(r => r.user_id === profile.id)?.role || null,
        subscription_status: subscriptions?.find(s => s.user_id === profile.id)?.status || null,
        subscription_plan: subscriptions?.find(s => s.user_id === profile.id)?.plan || null,
      })) as UserWithDetails[];
    },
  });

  const filteredUsers = users.filter(user => {
    // Filtro de busca
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de tab
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'patients' && user.role === 'patient') ||
      (activeTab === 'therapists' && user.role === 'therapist') ||
      (activeTab === 'admins' && user.role === 'admin');

    return matchesSearch && matchesTab;
  });

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    
    return pages;
  };

  // Contadores para badges nas tabs
  const counts = {
    all: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    therapists: users.filter(u => u.role === 'therapist').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div>
      <PageHeader title="Usuários" description="Gerenciar usuários do sistema" />
      
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">
                  Todos <Badge variant="secondary" className="ml-2">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="patients">
                  Pacientes <Badge variant="secondary" className="ml-2">{counts.patients}</Badge>
                </TabsTrigger>
                <TabsTrigger value="therapists">
                  Terapeutas <Badge variant="secondary" className="ml-2">{counts.therapists}</Badge>
                </TabsTrigger>
                <TabsTrigger value="admins">
                  Admins <Badge variant="secondary" className="ml-2">{counts.admins}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  icon={UsersIcon}
                  title="Nenhum usuário encontrado"
                  description={searchTerm ? "Tente ajustar sua busca" : "Não há usuários cadastrados ainda"}
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Assinatura</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.full_name || 'Sem nome'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getSubscriptionBadge(user.subscription_status, user.subscription_plan)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at 
                              ? format(new Date(user.created_at), "dd MMM yyyy", { locale: ptBR })
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuários
                      </p>
                      
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="inline-flex items-center justify-center gap-1 pl-2.5 pr-3 h-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span>Anterior</span>
                            </button>
                          </PaginationItem>
                          
                          {getPageNumbers().map((page, idx) => (
                            <PaginationItem key={idx}>
                              {page === '...' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => setCurrentPage(page as number)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="inline-flex items-center justify-center gap-1 pl-3 pr-2.5 h-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                            >
                              <span>Próximo</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
