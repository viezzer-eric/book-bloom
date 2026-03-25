
-- Criar tabela provider_reviews
CREATE TABLE public.provider_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (client_id, appointment_id)
);

-- Habilitar RLS
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

-- Clientes podem inserir avaliações
CREATE POLICY "Clientes podem criar avaliações"
ON public.provider_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- Qualquer pessoa pode ver avaliações
CREATE POLICY "Qualquer pessoa pode ver avaliações"
ON public.provider_reviews
FOR SELECT
TO public
USING (true);

-- Clientes podem ver suas próprias avaliações
CREATE POLICY "Clientes podem ver suas avaliações"
ON public.provider_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Adicionar colunas de rating em provider_profiles
ALTER TABLE public.provider_profiles
ADD COLUMN IF NOT EXISTS rating_average NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Função para atualizar a média de avaliações
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.provider_profiles
  SET
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.provider_reviews
      WHERE provider_id = NEW.provider_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.provider_reviews
      WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$;

-- Trigger para atualizar rating ao inserir avaliação
CREATE TRIGGER trigger_update_provider_rating
AFTER INSERT ON public.provider_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_provider_rating();
