
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList, ChevronLeft } from 'lucide-react';
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

      Retorne APENAS um JSON válido seguindo estritamente este formato:
      {
        "nutritionalStrategy": "Resumo técnico",
        "kcalGoal": "Valor total",
        "kcalSubtext": "META EM CAIXA ALTA",
        "macros": {
          "protein": { "value": "180", "ratio": "2.2g/kg" },
          "carbs": { "value": "250", "ratio": "Energia" },
          "fats": { "value": "60", "ratio": "Hormonal" }
        },
        "meals": [{"time": "08:00", "name": "Refeição 1", "details": "Alimentos e quantidades"}],
        "supplements": [{"name": "Creatina", "dosage": "5g", "timing": "Pós treino"}],
        "trainingDays": [{"title": "DIA A", "focus": "PEITO", "exercises": [{"name": "Supino", "sets": "4x10"}]}],
        "generalObservations": "Nota final"
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
      alert("❌ FALHA NA IA: Verifique sua conexão. O serviço pode estar instável no momento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addMeal = () => {
    const newMeal: Meal = { id: Date.now().toString(), time: '00:00', name: 'Nova Refeição', details: '' };
    handleChange('meals', [...data.meals, newMeal]);
  };

  const labelClass = "block text-[8px] font-black text-white/30 mb-1 uppercase tracking-widest";
  const inputClass = "w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-xs transition-all";

  return (
    <div className="space-y-6 no-print max-w-4xl mx-auto">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={14} /> Voltar ao Painel
        </button>
      )}

      {/* Identificação compacta */}
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
        <div><label className={labelClass}>Peso</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
        <div><label className={labelClass}>Altura</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
        <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
        <div><label className={labelClass}>BF%</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
      </section>

      {/* IA BANNER COMPACTO */}
      <div className="bg-[#d4af37] text-black p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Sparkles className={isGenerating ? 'animate-pulse' : ''} size={20} />
          <div className="leading-tight">
            <h3 className="font-black text-xs uppercase">Inteligência VBR Pro</h3>
            <p className="text-[8px] font-bold opacity-60">Gere dieta e treino instantâneos</p>
          </div>
        </div>
        <button 
          onClick={handleAISuggestion}
          disabled={isGenerating}
          className="bg-black text-white px-5 py-2 rounded-lg font-black text-[9px] uppercase hover:scale-105 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={14}/> : 'Gerar com IA'}
        </button>
      </div>

      <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black text-white uppercase tracking-tighter">Dieta</h2>
          <div className="flex gap-2">
             <input className="w-16 bg-white/5 border-none p-1 text-xs font-black outline-none" placeholder="Kcal" value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
           {['protein', 'carbs', 'fats'].map(m => (
             <div key={m} className="bg-white/5 p-2 rounded-xl text-center">
               <label className={labelClass}>{m === 'protein' ? 'Prot' : m === 'carbs' ? 'Carb' : 'Gord'}</label>
               <input className="w-full bg-transparent border-none text-center font-black text-sm outline-none" value={(data.macros as any)[m].value} onChange={(e) => handleChange(`macros.${m}.value`, e.target.value)} />
             </div>
           ))}
        </div>
      </section>

      <section className="bg-white/5 p-4 rounded-2xl border border-white/10">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-white uppercase tracking-tighter">Refeições</h2>
            <button onClick={addMeal} className="text-[#d4af37] text-[8px] font-black uppercase">+ Add</button>
         </div>
         <div className="space-y-2">
           {data.meals.map((meal, idx) => (
             <div key={meal.id} className="flex gap-2 items-center">
                <input className={inputClass + " w-16 !p-1.5"} value={meal.time} onChange={(e) => {
                   const m = [...data.meals]; m[idx].time = e.target.value; handleChange('meals', m);
                }} />
                <input className={inputClass + " !p-1.5"} placeholder="Descrição" value={meal.details} onChange={(e) => {
                   const m = [...data.meals]; m[idx].details = e.target.value; handleChange('meals', m);
                }} />
                <button onClick={() => handleChange('meals', data.meals.filter(it => it.id !== meal.id))} className="text-red-500/30 hover:text-red-500"><Trash2 size={12}/></button>
             </div>
           ))}
         </div>
      </section>
    </div>
  );
};

export default ProtocolForm;
