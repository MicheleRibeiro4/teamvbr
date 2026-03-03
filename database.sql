
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este código no SQL Editor do seu projeto Supabase e clique em RUN.

-- 1. Limpa tabelas existentes para garantir uma instalação limpa (CUIDADO: ISSO APAGA TODOS OS DADOS)
DROP TABLE IF EXISTS public.body_measurements CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.protocols CASCADE;

-- 2. Cria a tabela 'protocols'
CREATE TABLE public.protocols (
  id text NOT NULL PRIMARY KEY,              -- ID único do protocolo (gerado pelo app)
  client_name text NOT NULL,                 -- Nome do aluno
  updated_at timestamp with time zone DEFAULT now(),
  data jsonb NOT NULL,                       -- JSON completo do protocolo
  student_id text,                           -- Relacionamento com aluno (opcional por enquanto)
  version integer DEFAULT 1,                 -- Versão do protocolo
  is_original boolean DEFAULT false          -- Se é a versão original
);

-- 3. Cria a tabela 'students'
CREATE TABLE public.students (
  id text NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Cria a tabela 'feedbacks'
CREATE TABLE public.feedbacks (
  id text NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id text NOT NULL,
  feedback_date date NOT NULL,
  diet_adherence text,
  training_adherence text,
  sleep_quality text,
  energy_level text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Cria a tabela 'body_measurements'
CREATE TABLE public.body_measurements (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  weight numeric,
  chest numeric,
  waist numeric,
  abdomen numeric,
  hip numeric,
  arm_right numeric,
  arm_left numeric,
  thigh_right numeric,
  thigh_left numeric,
  calf numeric,
  body_fat numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Desabilita RLS (Row Level Security) para acesso simplificado via API Key pública
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements DISABLE ROW LEVEL SECURITY;

-- 7. Concede permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_protocols_client_name ON public.protocols(client_name);
CREATE INDEX IF NOT EXISTS idx_protocols_student_id ON public.protocols(student_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_student_id ON public.feedbacks(student_id);
CREATE INDEX IF NOT EXISTS idx_measurements_student_id ON public.body_measurements(student_id);
