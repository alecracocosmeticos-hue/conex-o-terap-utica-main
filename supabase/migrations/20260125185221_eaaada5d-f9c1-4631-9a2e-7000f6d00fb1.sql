-- Tabela de assinaturas (vincula usuario ao plano Stripe)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role app_role NOT NULL,
  plan text NOT NULL DEFAULT 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de planos (lookup estatico de features por plano)
CREATE TABLE public.plans (
  plan text PRIMARY KEY,
  role app_role NOT NULL,
  max_patients integer,
  can_export boolean DEFAULT false,
  can_view_charts boolean DEFAULT false,
  can_use_timeline boolean DEFAULT false,
  can_use_questionnaires boolean DEFAULT false
);

-- Dados iniciais dos planos
INSERT INTO public.plans (plan, role, max_patients, can_export, can_view_charts, can_use_timeline, can_use_questionnaires) VALUES
  ('patient_essential', 'patient', NULL, false, true, true, true),
  ('therapist_starter', 'therapist', 10, false, false, true, false),
  ('therapist_growth', 'therapist', 30, false, true, true, true),
  ('therapist_scale', 'therapist', 100, true, true, true, true);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Plans are readable by all authenticated users
CREATE POLICY "Authenticated users can view plans"
ON public.plans
FOR SELECT
TO authenticated
USING (true);

-- Trigger para criar subscription quando usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Subscription sera criada quando o usuario escolher o role
  RETURN NEW;
END;
$$;

-- Trigger para criar subscription quando role e definido
CREATE OR REPLACE FUNCTION public.handle_role_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, role, plan, status)
  VALUES (NEW.user_id, NEW.role, 'none', 'inactive')
  ON CONFLICT (user_id) DO UPDATE SET role = NEW.role, updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_role_assigned();

-- Trigger para updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();