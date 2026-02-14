
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Target, Sparkles, Loader2, User, ChevronLeft, Dumbbell, Utensils } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CONSULTANT_DEFAULT } from '../constants';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (!data.consultantName) {
      onChange({ ...data, ...CONSULTANT_DEFAULT });
    }
  }, [data.consultantName]);

  const handleChange = (path: string, value: any) => {
    const newData = { ...data };
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const handleAISuggestion = async () => {
    if (!data.clientName || !data.physicalData.weight) {
      alert("⚠️ DADOS NECESSÁRIOS: Preencha o Nome e o Peso para que a IA possa analisar o metabolismo.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Você é o Master Coach Vinícius Brasil (VBR). Crie um protocolo de elite para:
      Aluno: ${data.clientName} | Peso: ${data.physicalData.weight}kg | Altura: ${data.physicalData.height}m | Idade: ${data.physicalData.age} | Objetivo: ${data.protocolTitle || "Performance"}.

      Retorne APENAS um JSON válido seguindo este formato:
      {
        "nutritionalStrategy": "Explicação técnica detalhada",
        "kcalGoal": "2650",
        "kcalSubtext": "(SUPERÁVIT CONTROLADO)",
        "macros": {
          "protein": { "value": "160", "ratio": "2.2g/kg" },
          "carbs": { "value": "330", "ratio": "Energia" },
          "fats": { "value": "75", "ratio": "Regulação" }
        },
        "meals": [{"time": "08:40", "name": "Café da Manhã", "details": "Detalhes da refeição"}],
        "supplements": [{"name": "CREATINA", "dosage": "5g todos os dias (sem falhar)", "timing": "Junto à Ceia / Pós-Treino"}],
        "tips": ["Organize suas marmitas", "A Creatina tem efeito crônico", "Cardio antes do almoço"],
        "trainingFrequency": "4 a 5x por semana",
        "trainingDays": [{"title": "DIA A: PEITO + OMBRO", "focus": "Superior", "exercises": [{"name": "Supino Reto", "sets": "4x 6-8"}]}]
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("Resposta vazia da IA");
      
      const suggestion = JSON.parse(responseText.trim());
      
      const updatedData = {
        ...data,
        ...suggestion,
        meals: (suggestion.meals || []).map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) })),
        supplements: (suggestion.supplements || []).map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) })),
        trainingDays: (suggestion.trainingDays || []).map((d: any) => ({
          ...d,
          id: Math.random().toString(36).substr(2, 9),
          exercises: (d.exercises || []).map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))
        }))
      };

      onChange(updatedData);
    } catch (error: any) {
      console.error("Erro IA:", error);
      alert("❌ FALHA NA IA: Verifique sua conexão e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const labelClass = "block text-[8px] font-black text-white/30 mb-1 uppercase tracking-widest";
  const inputClass = "w-full p-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-xs transition-all";

  return (
    <div className="space-y-5 no-print">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-[#d4af37] transition-colors">
          <ChevronLeft size={14} /> Voltar ao Painel
        </button>
        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em]">Editor de Protocolo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className={labelClass}>Nome do Aluno</label>
          <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
        </section>
        <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className={labelClass}>Objetivo</label>
          <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} />
        </section>
      </div>

      <section className="bg-white/5 p-4 rounded-2xl border border-white/10 grid grid-cols-4 gap-2">
        {['weight', 'height', 'age', 'bodyFat'].map(field => (
          <div key={field}>
            <label className={labelClass}>{field === 'bodyFat' ? 'BF %' : field}</label>
            <input className={inputClass} value={(data.physicalData as any)[field]} onChange={(e) => handleChange(`physicalData.${field}`, e.target.value)} />
          </div>
        ))}
      </section>

      {/* IA BANNER */}
      <div className="bg-[#d4af37] text-black p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Sparkles className={isGenerating ? 'animate-pulse' : ''} size={20} />
          <div className="leading-tight">
            <h3 className="font-black text-xs uppercase">IA VBR PRO</h3>
            <p className="text-[8px] font-bold opacity-70 italic">Gerar Dieta e Treino igual aos Prints</p>
          </div>
        </div>
        <button 
          onClick={handleAISuggestion}
          disabled={isGenerating}
          className="bg-black text-white px-5 py-2 rounded-lg font-black text-[9px] uppercase hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={14}/> : 'GERAR AGORA'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
             <Utensils size={14} className="text-[#d4af37]" />
             <h2 className="text-[10px] font-black text-white uppercase tracking-tighter">Config. Dieta</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Kcal Diária</label>
              <input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['protein', 'carbs', 'fats'].map(m => (
                <div key={m}>
                  <label className={labelClass}>{m.slice(0, 3)}</label>
                  <input className={inputClass} value={(data.macros as any)[m].value} onChange={(e) => handleChange(`macros.${m}.value`, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
             <Dumbbell size={14} className="text-[#d4af37]" />
             <h2 className="text-[10px] font-black text-white uppercase tracking-tighter">Treino</h2>
          </div>
          <div>
            <label className={labelClass}>Frequência Semanal</label>
            <input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} />
          </div>
        </section>
      </div>
      
      <p className="text-[8px] text-white/20 text-center uppercase tracking-widest">Preencha os dados e a visualização embaixo será atualizada automaticamente.</p>
    </div>
  );
};

export default ProtocolForm;
