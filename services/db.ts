
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProtocolData } from '../types';

// Credenciais oficiais do projeto fornecidas
const SUPABASE_URL = "https://xqwzmvzfemjkvaquxedz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_C3BBDC86gpANb_LYU0rwGg_kwQPLeVQ";

// Inicialização do Cliente
const getSupabaseClient = (): SupabaseClient | null => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('sb_publishable')) {
     // Aviso: Chaves que começam com sb_publishable costumam ser de outros serviços.
     // Supabase Anon Keys geralmente começam com 'eyJ'. 
     // Mas usaremos conforme fornecido.
  }
  
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error('Erro ao conectar com Supabase:', e);
    return null;
  }
};

export const supabase = getSupabaseClient();

const LOCAL_STORAGE_KEY = 'vbr_cloud_sync_cache';

export const db = {
  isCloudEnabled(): boolean {
    return !!supabase;
  },

  async getAll(): Promise<ProtocolData[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('protocols')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const cloudProtocols = data.map(item => ({
            ...item.data,
            id: item.id,
            updatedAt: item.updated_at
          }));
          // Atualiza cache local para modo offline
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudProtocols));
          return cloudProtocols;
        }
      } catch (err) {
        console.warn('Erro Cloud, carregando local:', err);
      }
    }

    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // 1. Salva no cache local imediatamente (Offline-First)
    const all = await this.getAll();
    const index = all.findIndex(p => p.id === protocol.id);
    if (index >= 0) {
      all[index] = updatedProtocol;
    } else {
      all.unshift(updatedProtocol);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));

    // 2. Tenta sincronizar com Supabase
    if (supabase) {
      const { error } = await supabase
        .from('protocols')
        .upsert({
          id: protocol.id,
          client_name: protocol.clientName,
          updated_at: updatedAt,
          data: updatedProtocol
        });

      if (error) {
        console.error('Erro de Sincronização:', error);
        throw new Error('Erro ao salvar na nuvem. Verifique sua conexão.');
      }
    }
  },

  async deleteProtocol(id: string): Promise<void> {
    // Remove local
    const all = await this.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    // Remove Nuvem
    if (supabase) {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  exportBackup(protocols: ProtocolData[]) {
    const dataStr = JSON.stringify(protocols, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `vbr_backup_full_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  async importBackup(file: File): Promise<ProtocolData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(JSON.parse(content));
        } catch (err) {
          reject('Erro ao ler arquivo');
        }
      };
      reader.readAsText(file);
    });
  }
};
