
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProtocolData } from '../types';

const SUPABASE_URL = "https://xqwzmvzfemjkvaquxedz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxd3ptdnpmZW1qa3ZhcXV4ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTc1NjQsImV4cCI6MjA4NjU3MzU2NH0.R2MdOlktktHFuBe0JKbUwceqkrYIFsiphEThrYPWsZ8";

const getSupabaseClient = (): SupabaseClient | null => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    console.error('Erro de inicialização Supabase:', e);
    return null;
  }
};

export const supabase = getSupabaseClient();

const LOCAL_STORAGE_KEY = 'vbr_db_cache_v4';

export const db = {
  isCloudEnabled(): boolean {
    return !!supabase;
  },

  async getAll(): Promise<ProtocolData[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Supabase Query Error:", error.message);
        // Detectar se o erro é por colunas faltantes (comum ao mudar esquema)
        if (error.message.includes('client_name') || error.message.includes('column') || error.message.includes('relation')) {
           throw new Error("Mismatch de Esquema: A tabela no Supabase não corresponde ao que o código espera.");
        }
        throw error;
      }

      if (data) {
        const protocols = data.map(item => ({
          ...item.data,
          id: item.id,
          updatedAt: item.updated_at
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(protocols));
        return protocols;
      }
      return [];
    } catch (err: any) {
      console.warn("Recuperação offline ativada devido a erro no servidor:", err.message);
      const cache = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (err.message.includes('Mismatch')) throw err; // Repassa erro de esquema para a UI
      return cache ? JSON.parse(cache) : [];
    }
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    if (!supabase) throw new Error("Banco de dados não configurado.");

    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // Verificação de segurança obrigatória
    const { error } = await supabase
      .from('protocols')
      .upsert({
        id: protocol.id,
        client_name: protocol.clientName || 'Sem Nome',
        updated_at: updatedAt,
        data: updatedProtocol
      }, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Save Error:", error);
      if (error.message.includes('client_name')) {
        throw new Error("Estrutura da tabela incorreta. Rode o script de reparo no app.");
      }
      throw new Error(error.message);
    }
  },

  async deleteProtocol(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    if (error) throw error;
  }
};
