-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('provider', 'client');

-- Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de papéis de usuário
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Criar tabela de perfil de prestador (informações do negócio)
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "18:00", "enabled": true}, "tuesday": {"start": "09:00", "end": "18:00", "enabled": true}, "wednesday": {"start": "09:00", "end": "18:00", "enabled": true}, "thursday": {"start": "09:00", "end": "18:00", "enabled": true}, "friday": {"start": "09:00", "end": "18:00", "enabled": true}, "saturday": {"start": "09:00", "end": "18:00", "enabled": false}, "sunday": {"start": "09:00", "end": "18:00", "enabled": false}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Função para verificar papel do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter provider_id do usuário
CREATE OR REPLACE FUNCTION public.get_provider_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.provider_profiles WHERE user_id = _user_id
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver seus próprios papéis" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios papéis" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para provider_profiles
CREATE POLICY "Prestadores podem ver seu perfil de negócio" ON public.provider_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Qualquer pessoa pode ver prestadores" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Prestadores podem inserir seu perfil" ON public.provider_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Prestadores podem atualizar seu perfil" ON public.provider_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para services
CREATE POLICY "Qualquer pessoa pode ver serviços ativos" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Prestadores podem gerenciar seus serviços" ON public.services FOR ALL USING (
  provider_id = public.get_provider_id(auth.uid())
);

-- Políticas RLS para appointments
CREATE POLICY "Prestadores podem ver seus agendamentos" ON public.appointments FOR SELECT USING (
  provider_id = public.get_provider_id(auth.uid())
);
CREATE POLICY "Clientes podem ver seus agendamentos" ON public.appointments FOR SELECT USING (
  client_id = auth.uid()
);
CREATE POLICY "Qualquer pessoa pode criar agendamento" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Prestadores podem atualizar agendamentos" ON public.appointments FOR UPDATE USING (
  provider_id = public.get_provider_id(auth.uid())
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON public.provider_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();