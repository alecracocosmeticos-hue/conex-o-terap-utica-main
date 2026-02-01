-- =============================================
-- ETAPA 1: Tabela de relacionamento paciente-terapeuta (PRIMEIRO)
-- =============================================

CREATE TABLE public.patient_therapist_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(patient_id, therapist_id)
);

ALTER TABLE public.patient_therapist_relations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_patient_therapist_relations_updated_at
BEFORE UPDATE ON public.patient_therapist_relations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ETAPA 2: Função auxiliar (AGORA a tabela existe)
-- =============================================

CREATE OR REPLACE FUNCTION public.is_patient_of_therapist(
  _patient_id uuid, 
  _therapist_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM patient_therapist_relations
    WHERE patient_id = _patient_id
      AND therapist_id = _therapist_id
      AND status = 'active'
  )
$$;

-- =============================================
-- ETAPA 3: RLS para patient_therapist_relations
-- =============================================

CREATE POLICY "Patients can view own relations"
ON public.patient_therapist_relations FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can view own relations"
ON public.patient_therapist_relations FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create relations"
ON public.patient_therapist_relations FOR INSERT
WITH CHECK (auth.uid() = therapist_id AND public.has_role(auth.uid(), 'therapist'));

CREATE POLICY "Patients can update own relations"
ON public.patient_therapist_relations FOR UPDATE
USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can update own relations"
ON public.patient_therapist_relations FOR UPDATE
USING (auth.uid() = therapist_id);

-- =============================================
-- ETAPA 4: Tabelas do Paciente
-- =============================================

-- Check-ins diários
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood text NOT NULL CHECK (mood IN ('great', 'good', 'neutral', 'low', 'bad')),
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  feelings text[] DEFAULT '{}',
  notes text,
  shared_with_therapist boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own check_ins"
ON public.check_ins FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view shared check_ins of their patients"
ON public.check_ins FOR SELECT
USING (
  shared_with_therapist = true 
  AND public.has_role(auth.uid(), 'therapist')
  AND public.is_patient_of_therapist(user_id, auth.uid())
);

-- Registros emocionais
CREATE TABLE public.emotional_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  mood text,
  tags text[] DEFAULT '{}',
  shared_with_therapist boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emotional_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own emotional_records"
ON public.emotional_records FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view shared emotional_records of their patients"
ON public.emotional_records FOR SELECT
USING (
  shared_with_therapist = true 
  AND public.has_role(auth.uid(), 'therapist')
  AND public.is_patient_of_therapist(user_id, auth.uid())
);

CREATE TRIGGER update_emotional_records_updated_at
BEFORE UPDATE ON public.emotional_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Entradas do diário
CREATE TABLE public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  shared_with_therapist boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own diary_entries"
ON public.diary_entries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view shared diary_entries of their patients"
ON public.diary_entries FOR SELECT
USING (
  shared_with_therapist = true 
  AND public.has_role(auth.uid(), 'therapist')
  AND public.is_patient_of_therapist(user_id, auth.uid())
);

CREATE TRIGGER update_diary_entries_updated_at
BEFORE UPDATE ON public.diary_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Minha História do Paciente
CREATE TABLE public.patient_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  shared_with_therapist boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own history"
ON public.patient_history FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view shared history of their patients"
ON public.patient_history FOR SELECT
USING (
  shared_with_therapist = true 
  AND public.has_role(auth.uid(), 'therapist')
  AND public.is_patient_of_therapist(user_id, auth.uid())
);

CREATE TRIGGER update_patient_history_updated_at
BEFORE UPDATE ON public.patient_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ETAPA 5: Tabelas de Questionários
-- =============================================

CREATE TABLE public.questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  estimated_time text,
  questions jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active questionnaires"
ON public.questionnaires FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage questionnaires"
ON public.questionnaires FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questionnaire_id uuid NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own questionnaire_responses"
ON public.questionnaire_responses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view responses of their patients"
ON public.questionnaire_responses FOR SELECT
USING (
  public.has_role(auth.uid(), 'therapist')
  AND public.is_patient_of_therapist(user_id, auth.uid())
);

-- =============================================
-- ETAPA 6: Tabelas do Terapeuta
-- =============================================

CREATE TABLE public.therapist_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can CRUD own notes"
ON public.therapist_notes FOR ALL
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

CREATE TRIGGER update_therapist_notes_updated_at
BEFORE UPDATE ON public.therapist_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50,
  session_type text NOT NULL DEFAULT 'online' CHECK (session_type IN ('online', 'presential')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can CRUD own appointments"
ON public.appointments FOR ALL
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Patients can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = patient_id);

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ETAPA 7: Inserir questionários padrão
-- =============================================

INSERT INTO public.questionnaires (title, description, estimated_time, questions, is_active) VALUES
(
  'Check-up Semanal',
  'Avalie como foi sua semana de forma geral',
  '5 min',
  '[
    {"id": "q1", "text": "Como você avalia sua qualidade de sono esta semana?", "type": "scale", "min": 1, "max": 5},
    {"id": "q2", "text": "Você conseguiu realizar suas atividades diárias?", "type": "scale", "min": 1, "max": 5},
    {"id": "q3", "text": "Como está seu nível de energia?", "type": "scale", "min": 1, "max": 5},
    {"id": "q4", "text": "Você teve momentos de ansiedade?", "type": "boolean"},
    {"id": "q5", "text": "Observações adicionais:", "type": "text"}
  ]'::jsonb,
  true
),
(
  'Avaliação de Ansiedade (GAD-7)',
  'Questionário padrão para avaliar níveis de ansiedade',
  '3 min',
  '[
    {"id": "q1", "text": "Sentir-se nervoso, ansioso ou no limite", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q2", "text": "Não ser capaz de parar ou controlar preocupações", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q3", "text": "Preocupar-se demais com diferentes coisas", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q4", "text": "Dificuldade para relaxar", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q5", "text": "Ficar tão inquieto que é difícil ficar parado", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q6", "text": "Ficar facilmente irritado ou aborrecido", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q7", "text": "Sentir medo como se algo terrível pudesse acontecer", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}
  ]'::jsonb,
  true
),
(
  'Avaliação de Humor (PHQ-9)',
  'Questionário para avaliar sintomas de depressão',
  '5 min',
  '[
    {"id": "q1", "text": "Pouco interesse ou prazer em fazer as coisas", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q2", "text": "Sentir-se para baixo, deprimido ou sem esperança", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q3", "text": "Dificuldade para adormecer, permanecer dormindo ou dormir demais", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q4", "text": "Sentir-se cansado ou com pouca energia", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q5", "text": "Falta de apetite ou comer demais", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q6", "text": "Sentir-se mal consigo mesmo", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q7", "text": "Dificuldade de concentração", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q8", "text": "Movimentar-se ou falar muito lentamente ou o oposto", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]},
    {"id": "q9", "text": "Pensamentos de que seria melhor estar morto ou de se machucar", "type": "scale", "min": 0, "max": 3, "labels": ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}
  ]'::jsonb,
  true
);