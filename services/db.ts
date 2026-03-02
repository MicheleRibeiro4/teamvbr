
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

const LOCAL_STORAGE_KEY = 'vbr_db_cache_v9';

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
        console.error("Supabase Query Error:", error);
        if (error.code === 'PGRST204' || error.message.includes('client_name') || error.message.includes('column')) {
           throw new Error("Erro de Esquema: O Supabase ainda possui as tabelas antigas. Execute o Script de Reparo.");
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
      console.warn("Status de Sincronização:", err.message);
      const cache = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (err.message.includes('Esquema') || err.message.includes('client_name')) throw err;
      return cache ? JSON.parse(cache) : [];
    }
  },

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    if (!supabase) throw new Error("Banco de dados não configurado.");

    const updatedAt = new Date().toISOString();
    const updatedProtocol = { ...protocol, updatedAt };

    // Prepara o objeto para salvar, incluindo os novos campos relacionais se existirem
    const payload: any = {
      id: protocol.id,
      client_name: protocol.clientName || 'Sem Nome',
      updated_at: updatedAt,
      data: updatedProtocol
    };

    if (protocol.studentId) payload.student_id = protocol.studentId;
    if (protocol.version) payload.version = protocol.version;
    if (protocol.isOriginal !== undefined) payload.is_original = protocol.isOriginal;

    const { error } = await supabase
      .from('protocols')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Save Error:", error);
      if (error.code === 'PGRST204' || error.message.includes('client_name')) {
        throw new Error("Mismatch de Esquema: A coluna 'client_name' não foi encontrada. Rode o SQL de reparo.");
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
    const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('student_id', studentId)
        .order('version', { ascending: false });

    if (error) {
        console.error("Erro ao buscar versões:", error);
        return [];
    }

    return (data || []).map(item => ({
        ...item.data,
        id: item.id,
        studentId: item.student_id,
        version: item.version,
        isOriginal: item.is_original,
        updatedAt: item.updated_at
    }));
  },

  async deleteProtocol(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    if (error) throw error;
  }
};
