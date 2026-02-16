
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este código no SQL Editor do seu projeto Supabase e clique em RUN.

-- 1. Limpa a tabela existente para garantir uma instalação limpa (CUIDADO: ISSO APAGA TODOS OS DADOS EXISTENTES)
-- Se você já tem dados que quer manter, remova a linha abaixo (DROP TABLE).
DROP TABLE IF EXISTS public.protocols CASCADE;

-- 2. Cria a tabela 'protocols' com a estrutura correta
CREATE TABLE public.protocols (
  id text NOT NULL PRIMARY KEY,              -- ID único do protocolo (gerado pelo app)
  client_name text NOT NULL,                 -- Nome do aluno (para busca rápida e ordenação)
  updated_at timestamp with time zone DEFAULT now(), -- Data da última atualização
  data jsonb NOT NULL                        -- Todo o conteúdo do protocolo (JSON completo)
);

-- 3. Desabilita RLS (Row Level Security)
-- Importante: Como o app usa a chave "anon" pública sem login de usuário do Supabase Auth,
-- precisamos desabilitar o RLS para permitir leitura e escrita direta.
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;

-- 4. Concede permissões explícitas para a API
GRANT ALL ON TABLE public.protocols TO anon;
GRANT ALL ON TABLE public.protocols TO authenticated;
GRANT ALL ON TABLE public.protocols TO service_role;

-- 5. (Opcional) Cria um índice para deixar a busca por nome mais rápida
CREATE INDEX IF NOT EXISTS idx_protocols_client_name ON public.protocols(client_name);
