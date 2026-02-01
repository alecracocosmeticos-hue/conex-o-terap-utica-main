-- Permitir que admins vejam todos os check_ins para métricas do dashboard
CREATE POLICY "Admins can view all check_ins"
ON public.check_ins
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));