import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Heart,
  BookOpen,
  ClipboardList,
  Mail,
  Smile,
  Meh,
  Frown,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const moodIcons = {
  'Muito feliz': Smile,
  'Feliz': Smile,
  'Neutro': Meh,
  'Triste': Frown,
  'Muito triste': Frown,
  'Ansioso': AlertCircle,
  good: Smile,
  neutral: Meh,
  bad: Frown,
};

const moodColors = {
  'Muito feliz': 'text-green-500',
  'Feliz': 'text-green-500',
  'Neutro': 'text-yellow-500',
  'Triste': 'text-red-500',
  'Muito triste': 'text-red-500',
  'Ansioso': 'text-orange-500',
  good: 'text-green-500',
  neutral: 'text-yellow-500',
  bad: 'text-red-500',
};

const PatientDetail = () => {
  const { id: patientId } = useParams();
  const { user } = useAuth();

  // Fetch patient profile
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch relation info (start date)
  const { data: relation } = useQuery({
    queryKey: ['patient-relation', patientId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_therapist_relations')
        .select('*')
        .eq('therapist_id', user!.id)
        .eq('patient_id', patientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId && !!user,
  });

  // Count completed sessions
  const { data: sessionsCount = 0 } = useQuery({
    queryKey: ['patient-sessions-count', patientId, user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user!.id)
        .eq('patient_id', patientId)
        .eq('status', 'completed');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!patientId && !!user,
  });

  // Fetch shared check-ins
  const { data: sharedCheckIns = [] } = useQuery({
    queryKey: ['patient-checkins', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', patientId)
        .eq('shared_with_therapist', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch shared emotional records
  const { data: sharedRecords = [] } = useQuery({
    queryKey: ['patient-records', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emotional_records')
        .select('*')
        .eq('user_id', patientId)
        .eq('shared_with_therapist', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch shared patient history
  const { data: patientHistory } = useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_history')
        .select('*')
        .eq('user_id', patientId)
        .eq('shared_with_therapist', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch questionnaire responses
  const { data: questionnaireResponses = [] } = useQuery({
    queryKey: ['patient-questionnaires', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select(`
          *,
          questionnaires (
            title,
            description
          )
        `)
        .eq('user_id', patientId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Combine check-ins and emotional records for the records tab
  const allRecords = [
    ...sharedCheckIns.map((ci) => ({
      id: ci.id,
      type: 'checkin' as const,
      title: `Check-in: ${ci.mood}`,
      date: new Date(ci.created_at),
      mood: ci.mood,
      content: `Intensidade: ${ci.intensity}/10${ci.notes ? ` - ${ci.notes}` : ''}`,
    })),
    ...sharedRecords.map((er) => ({
      id: er.id,
      type: 'record' as const,
      title: er.title,
      date: new Date(er.created_at),
      mood: er.mood,
      content: er.content || '',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div>
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/therapist/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <EmptyState
          icon={AlertCircle}
          title="Paciente não encontrado"
          description="O paciente solicitado não foi encontrado ou você não tem acesso."
        />
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/therapist/patients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </Button>

      {/* Patient Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(patient.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{patient.full_name}</h1>
                <Badge className="bg-green-100 text-green-800">
                  {relation?.status === 'active' ? 'Ativo' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {patient.email}
                </span>
                {relation && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Paciente desde {format(new Date(relation.created_at), "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-primary">{sessionsCount}</p>
              <p className="text-sm text-muted-foreground">Sessões realizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="records">
        <TabsList className="mb-4">
          <TabsTrigger value="records">
            <Heart className="mr-2 h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="questionnaires">
            <ClipboardList className="mr-2 h-4 w-4" />
            Questionários
          </TabsTrigger>
          <TabsTrigger value="history">
            <BookOpen className="mr-2 h-4 w-4" />
            História
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros Compartilhados</CardTitle>
              <CardDescription>Check-ins e registros emocionais compartilhados pelo paciente</CardDescription>
            </CardHeader>
            <CardContent>
              {allRecords.length > 0 ? (
                <div className="space-y-4">
                  {allRecords.map((record) => {
                    const MoodIcon = record.mood ? moodIcons[record.mood as keyof typeof moodIcons] : null;
                    const moodColor = record.mood ? moodColors[record.mood as keyof typeof moodColors] : '';
                    return (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {record.type === 'checkin' ? 'Check-in' : 'Registro'}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {format(record.date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <h3 className="font-medium text-foreground">{record.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{record.content}</p>
                          </div>
                          {MoodIcon && (
                            <div className={`p-2 rounded-full bg-muted ${moodColor}`}>
                              <MoodIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="Nenhum registro compartilhado"
                  description="O paciente ainda não compartilhou registros emocionais ou check-ins."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaires">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resultados de Questionários</CardTitle>
              <CardDescription>Questionários respondidos pelo paciente</CardDescription>
            </CardHeader>
            <CardContent>
              {questionnaireResponses.length > 0 ? (
                <div className="space-y-4">
                  {questionnaireResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">
                          {response.questionnaires?.title || 'Questionário'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {response.completed_at
                            ? format(new Date(response.completed_at), "d 'de' MMMM, yyyy", { locale: ptBR })
                            : 'Data não disponível'
                          }
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        Respondido
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="Nenhum questionário respondido"
                  description="O paciente ainda não respondeu questionários."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">História do Paciente</CardTitle>
              <CardDescription>Conteúdo compartilhado pelo paciente sobre sua história</CardDescription>
            </CardHeader>
            <CardContent>
              {patientHistory ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {patientHistory.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Atualizado em {format(new Date(patientHistory.updated_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="História não compartilhada"
                  description="O paciente ainda não compartilhou sua história pessoal."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetail;
