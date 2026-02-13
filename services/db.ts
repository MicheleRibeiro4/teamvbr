
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProtocolData } from '../types';

// URL do seu projeto Supabase
const SUPABASE_URL = "https://xqwzmvzfemjkvaquxedz.supabase.co";

// CHAVE ATUALIZADA: Usando o JWT (Anon Key) fornecido pelo usuário
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxd3ptdnpmZW1qa3ZhcXV4ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTc1NjQsImV4cCI6MjA4NjU3MzU2NH0.R2MdOlktktHFuBe0JKbUwceqkrYIFsiphEThrYPWsZ8";

const getSupabaseClient = (): SupabaseClient | null => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('sb_publishable')) {
    console.warn('Aguardando Chave Anon JWT válida (começa com eyJ)');
    return null;
  }
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    console.error('Falha crítica na conexão Supabase:', e);
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
        const { data, error } = await supabase
          .from('protocols')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Erro de Banco de Dados (Supabase):', error.message);
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
        // "Load failed" ou "Failed to fetch" geralmente é AdBlock ou rede bloqueada
        if (err.message === 'Load failed' || err.name === 'TypeError') {
          console.warn('Conexão bloqueada pelo navegador (AdBlock?) ou erro de rede.');
        } else {
          console.error('Erro inesperado:', err);
        }
      }
    }
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // 1. Sempre salvar LocalStorage primeiro (Offline-first)
    const all = await this.getAll();
    const index = all.findIndex(p => p.id === protocol.id);
    if (index >= 0) {
      all[index] = updatedProtocol;
    } else {
      all.unshift(updatedProtocol);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));

    // 2. Tentar salvar na Nuvem
    if (supabase) {
      try {
        const { error } = await supabase
          .from('protocols')
          .upsert({
            id: protocol.id,
            client_name: protocol.clientName || 'Sem Nome',
            updated_at: updatedAt,
            data: updatedProtocol
          }, { onConflict: 'id' });

        if (error) {
          if (error.code === '42P01') {
            throw new Error("Tabela não encontrada. Execute o SQL de criação no painel do Supabase.");
          }
          throw new Error(error.message);
        }
      } catch (err: any) {
        if (err.message === 'Load failed' || err.name === 'TypeError') {
          throw new Error("A conexão com o Supabase foi bloqueada pelo seu navegador ou rede. Desative AdBlockers para este site.");
        }
        throw err;
      }
    } else {
      throw new Error("Cliente Supabase não inicializado. Verifique a Anon Key.");
    }
  },

  async deleteProtocol(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    if (supabase) {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};
