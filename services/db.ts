
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';

// Tenta pegar das variáveis de ambiente (Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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

const LOCAL_STORAGE_KEY = 'vbr_db_cache_v9';

export const db = {
  isCloudEnabled(): boolean {
    return !!supabase;
  },

  async getAll(): Promise<{ data: ProtocolData[], source: 'cloud' | 'cache' }> {
    if (!supabase) return { data: [], source: 'cache' };
    
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Supabase Query Error:", error);
        if (error.code === '42501') {
           throw new Error("Permissão negada (Erro 42501). Vá ao painel do Supabase > SQL Editor e execute o script 'database.sql' para corrigir as permissões.");
        }
        if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('client_name') || error.message.includes('column') || error.message.includes('relation "public.protocols" does not exist')) {
           throw new Error("Erro de Esquema: Tabelas não encontradas. Execute o Script de Instalação.");
        }
        throw error;
      }

      if (data) {
        const protocols = data.map(item => {
          const itemData = (item.data && typeof item.data === 'object') ? item.data : {};
          // Prefer name from JSON, fallback to column client_name, then empty string
          const nameFromData = itemData.clientName;
          const finalName = (typeof nameFromData === 'string' && nameFromData) 
            ? nameFromData 
            : (item.client_name || "");

          return {
            ...EMPTY_DATA,
            ...itemData,
            clientName: finalName,
            contract: { ...EMPTY_DATA.contract, ...(itemData.contract || {}) },
            id: item.id,
            updatedAt: item.updated_at
          };
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(protocols));
        return { data: protocols, source: 'cloud' };
      }
      return { data: [], source: 'cloud' };
    } catch (err: any) {
      console.warn("Status de Sincronização:", err.message);
      const cache = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (err.message.includes('Esquema') || err.message.includes('client_name') || err.message.includes('Tabelas não encontradas')) throw err;
      
      if (cache) {
        try {
            const parsed = JSON.parse(cache);
            if (Array.isArray(parsed)) {
                return { 
                    data: parsed.filter(p => p && typeof p === 'object'),
                    source: 'cache'
                };
            }
        } catch (e) {
            console.error("Cache inválido", e);
        }
      }
      return { data: [], source: 'cache' };
    }
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    if (!supabase) throw new Error("Banco de dados não configurado.");

    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // Prepara o objeto para salvar.
    // NOTA: O esquema do banco fornecido pelo usuário possui apenas: id, client_name, updated_at, data.
    // Campos como student_id, version, is_original devem ficar apenas dentro do JSONB 'data'.
    const payload: any = {
      id: protocol.id,
      client_name: protocol.clientName || 'Sem Nome',
      updated_at: updatedAt,
      data: updatedProtocol
    };

    const { error } = await supabase
      .from('protocols')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Save Error:", error);
      if (error.code === '42501') {
         throw new Error("Permissão negada (Erro 42501). Vá ao painel do Supabase > SQL Editor e execute o script 'database.sql' para corrigir as permissões.");
      }
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('client_name') || error.message.includes('relation "public.protocols" does not exist')) {
        throw new Error("Mismatch de Esquema: Tabelas não encontradas. Rode o SQL de Instalação.");
      }
      throw new Error(error.message);
    }
  },

  async importProtocol(protocol: ProtocolData): Promise<void> {
    if (!supabase) throw new Error("Banco de dados não configurado.");

    // Usa a data original se existir, senão usa a atual
    const updatedAt = protocol.updatedAt || new Date().toISOString();
    
    // Mantém o objeto original (não sobrescreve updatedAt se já existir)
    const protocolData = { ...protocol };
    if (!protocolData.updatedAt) protocolData.updatedAt = updatedAt;

    const payload: any = {
      id: protocol.id,
      client_name: protocol.clientName || 'Sem Nome',
      updated_at: updatedAt,
      data: protocolData
    };

    const { error } = await supabase
      .from('protocols')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Import Error:", error);
      if (error.code === '42501') {
         throw new Error("Permissão negada (Erro 42501). Vá ao painel do Supabase > SQL Editor e execute o script 'database.sql' para corrigir as permissões.");
      }
      throw new Error(error.message);
    }
  },

  // --- NOVOS MÉTODOS PARA ACOMPANHAMENTO ---

  async getStudent(studentId: string): Promise<any> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single();
    if (error) console.error("Erro ao buscar aluno:", error);
    return data;
  },

  async createStudent(name: string): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('students').insert({ name }).select('id').single();
    if (error) {
        console.error("Erro ao criar aluno:", error);
        return null;
    }
    return data.id;
  },

  async getFeedbacks(studentId: string): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('student_id', studentId)
        .order('feedback_date', { ascending: false });
    
    if (error) {
        console.error("Erro ao buscar feedbacks:", error);
        return [];
    }
    return data || [];
  },

  async saveFeedback(feedback: any): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('feedbacks').upsert({
        id: feedback.id,
        student_id: feedback.studentId,
        feedback_date: feedback.date,
        diet_adherence: feedback.dietAdherence,
        training_adherence: feedback.trainingAdherence,
        sleep_quality: feedback.sleepQuality,
        energy_level: feedback.energyLevel,
        notes: feedback.notes,
        created_at: feedback.createdAt || new Date().toISOString()
    });
    if (error) throw error;
  },

  async getMeasurements(studentId: string): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error("Erro ao buscar medidas:", error);
        return [];
    }
    return data || [];
  },

  async saveMeasurement(measurement: any): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('body_measurements').insert({
        student_id: measurement.studentId,
        weight: measurement.weight,
        chest: measurement.chest,
        waist: measurement.waist,
        abdomen: measurement.abdomen,
        hip: measurement.hip,
        arm_right: measurement.armRight,
        arm_left: measurement.armLeft,
        thigh_right: measurement.thighRight,
        thigh_left: measurement.thighLeft,
        calf: measurement.calf,
        body_fat: measurement.bodyFat,
        created_at: measurement.date || new Date().toISOString()
    });
    if (error) throw error;
  },

  async getProtocolVersions(studentId: string): Promise<ProtocolData[]> {
    if (!supabase) return [];
    
    // Ajuste para consultar dentro do JSONB 'data' já que as colunas não existem no esquema simplificado
    const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('data->>studentId', studentId)
        .order('data->>version', { ascending: false });

    if (error) {
        console.error("Erro ao buscar versões:", error);
        return [];
    }

    return (data || []).map(item => {
        const itemData = (item.data && typeof item.data === 'object') ? item.data : {};
        const nameFromData = itemData.clientName;
        const finalName = (typeof nameFromData === 'string' && nameFromData) 
            ? nameFromData 
            : (item.client_name || "");

        return {
            ...EMPTY_DATA,
            ...itemData,
            clientName: finalName,
            contract: { ...EMPTY_DATA.contract, ...(itemData.contract || {}) },
            id: item.id,
            // studentId, version, isOriginal vêm de itemData (JSONB)
            studentId: itemData.studentId,
            version: itemData.version,
            isOriginal: itemData.isOriginal,
            updatedAt: item.updated_at
        };
    });
  },

  async deleteProtocol(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    if (error) throw error;
  }
};
