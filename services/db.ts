
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProtocolData } from '../types';

const SUPABASE_URL = "https://xqwzmvzfemjkvaquxedz.supabase.co";
// Chave Anon JWT fornecida pelo usuário
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxd3ptdnpmZW1qa3ZhcXV4ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTc1NjQsImV4cCI6MjA4NjU3MzU2NH0.R2MdOlktktHFuBe0JKbUwceqkrYIFsiphEThrYPWsZ8";

const getSupabaseClient = (): SupabaseClient | null => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    console.error('Erro ao inicializar Supabase:', e);
    return null;
  }
};

export const supabase = getSupabaseClient();

const LOCAL_STORAGE_KEY = 'vbr_cloud_sync_cache';

export const db = {
  isCloudEnabled(): boolean {
    return !!supabase && SUPABASE_ANON_KEY.startsWith('eyJ');
  },

  async getAll(): Promise<ProtocolData[]> {
    if (supabase) {
      try {
        const { data, error, status } = await supabase
          .from('protocols')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error(`Erro Supabase (${status}):`, error.message, error.details);
          if (status === 400 || status === 404) {
             console.warn("DICA: Execute o script SQL no painel do Supabase para criar a tabela 'protocols'.");
          }
        } else if (data) {
          const cloudProtocols = data.map(item => ({
            ...item.data,
            id: item.id,
            updatedAt: item.updated_at
          }));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudProtocols));
          return cloudProtocols;
        }
      } catch (err: any) {
        if (err.name === 'TypeError' || err.message === 'Load failed') {
          console.warn('Conexão com Supabase bloqueada por AdBlock ou Rede.');
        }
      }
    }
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // Cache Local sempre
    const all = await this.getAll();
    const index = all.findIndex(p => p.id === protocol.id);
    if (index >= 0) {
      all[index] = updatedProtocol;
    } else {
      all.unshift(updatedProtocol);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));

    if (supabase) {
      const { error, status } = await supabase
        .from('protocols')
        .upsert({
          id: protocol.id,
          client_name: protocol.clientName || 'Sem Nome',
          updated_at: updatedAt,
          data: updatedProtocol
        }, { onConflict: 'id' });

      if (error) {
        console.error(`FALHA NO UPSERT (${status}):`, error);
        let msg = `Erro ${status}: ${error.message}`;
        if (status === 400) msg = "Tabela 'protocols' não encontrada ou colunas incorretas. Verifique o SQL Editor.";
        throw new Error(msg);
      }
    }
  },

  async deleteProtocol(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    if (supabase) {
      const { error } = await supabase.from('protocols').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
