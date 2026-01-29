-- Add missing columns to provider_profiles table
ALTER TABLE public.provider_profiles 
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS "addressNumber" text;