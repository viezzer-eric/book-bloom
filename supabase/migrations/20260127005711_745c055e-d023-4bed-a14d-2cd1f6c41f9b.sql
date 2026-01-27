-- Corrigir função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Remover política permissiva de INSERT em appointments
DROP POLICY IF EXISTS "Qualquer pessoa pode criar agendamento" ON public.appointments;

-- Criar política mais restritiva para agendamentos (usuários autenticados ou anônimos com dados válidos)
CREATE POLICY "Usuários podem criar agendamentos" ON public.appointments FOR INSERT WITH CHECK (
  client_name IS NOT NULL AND client_email IS NOT NULL
);