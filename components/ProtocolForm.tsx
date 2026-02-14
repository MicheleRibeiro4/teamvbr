
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList, ChevronLeft } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
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
      alert("⚠️ DADOS NECESSÁRIOS: Preencha o Nome e o Peso para que a IA possa analisar o metabolismo do aluno.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Atue como o Master Coach Vinícius Brasil do Team VBR. Crie um protocolo profissional de elite baseado nos seguintes dados:
      Nome: ${data.clientName} | Peso: ${data.physicalData.weight}kg | Altura: ${data.physicalData.height}m | Idade: ${data.physicalData.age} | Objetivo: ${data.protocolTitle || "Performance Máxima"}.
      
      Retorne APENAS um objeto JSON puro, sem comentários, com esta estrutura exata:
      {
        "nutritionalStrategy": "Explicação técnica da dieta",
        "kcalGoal": "Valor calórico",
        "kcalSubtext": "(TEXTO EM CAIXA ALTA)",
        "macros": {
          "protein": { "value": "200", "ratio": "2.2g/kg" },
          "carbs": { "value": "300", "ratio": "Energia" },
          "fats": { "value": "70", "ratio": "Hormonal" }
        },
        "meals": [{"time": "08:00", "name": "Nome", "details": "Detalhes"}],
        "supplements": [{"name": "Suplemento", "dosage": "dose", "timing": "horário"}],
        "trainingDays": [{"title": "DIA A", "focus": "FOCO", "exercises": [{"name": "Exercicio", "sets": "4x12"}]}],
        "generalObservations": "Instruções finais"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!response.text) throw new Error("IA retornou resposta vazia");
      
      const suggestion = JSON.parse(response.text.trim());
      
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
      alert("❌ A IA não conseguiu processar agora. Tente novamente em instantes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addMeal = () => {
    const newMeal: Meal = { id: Date.now().toString(), time: '00:00', name: 'Nova Refeição', details: '' };
    handleChange('meals', [...data.meals, newMeal]);
  };

  const addSupplement = () => {
    const newSupplement: Supplement = { id: Date.now().toString(), name: '', dosage: '', timing: '' };
    handleChange('supplements', [...data.supplements, newSupplement]);
  };

  const addTrainingDay = () => {
    const newDay: TrainingDay = { 
      id: Date.now().toString(), title: 'DIA NOVO', focus: 'Foco do Treino', 
      exercises: [{ id: 'ex-' + Date.now(), name: 'Exercício 1', sets: '3x 12' }] 
    };
    handleChange('trainingDays', [...data.trainingDays, newDay]);
  };

  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4";

  return (
    <div className="space-y-8 no-print">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>
      )}

      <section className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={18} />
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Identificação</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome Completo</label>
            <input className={inputClass + " !text-[#d4af37]"} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Título do Protocolo</label>
            <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={18} />
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Físico</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
          <div><label className={labelClass}>BF (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
        </div>
      </section>

      <div className="bg-[#d4af37] text-black p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-black text-[#d4af37] p-3 rounded-2xl">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          </div>
          <div>
            <h3 className="font-black text-lg uppercase leading-none">VBR Intelligence</h3>
            <p className="text-[10px] font-black uppercase opacity-60">Gere dieta e treino em segundos</p>
          </div>
        </div>
        <button 
          onClick={handleAISuggestion}
          disabled={isGenerating}
          className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
        >
          {isGenerating ? 'Trabalhando...' : 'Ativar IA'}
        </button>
      </div>

      <section className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className={sectionHeaderClass}>
          <Target className="text-[#d4af37]" size={18} />
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Dieta</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
           <div><label className={labelClass}>Kcal Diárias</label><input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} /></div>
           <div><label className={labelClass}>Status</label><input className={inputClass} value={data.kcalSubtext} onChange={(e) => handleChange('kcalSubtext', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
           {['protein', 'carbs', 'fats'].map(m => (
             <div key={m} className="bg-white/5 p-3 rounded-2xl">
               <label className={labelClass}>{m === 'protein' ? 'Prot' : m === 'carbs' ? 'Carb' : 'Gord'}</label>
               <input className="w-full bg-transparent border-none p-0 font-black text-xl outline-none" value={(data.macros as any)[m].value} onChange={(e) => handleChange(`macros.${m}.value`, e.target.value)} />
             </div>
           ))}
        </div>
      </section>

      {/* Seções de Refeições e Treinos simplificadas para visualização compacta */}
      <section className="bg-white/5 p-6 rounded-3xl border border-white/10">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">Refeições</h2>
            <button onClick={addMeal} className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">+ Add</button>
         </div>
         <div className="space-y-3">
           {data.meals.map((meal, idx) => (
             <div key={meal.id} className="flex gap-2">
                <input className={inputClass + " w-20 !p-2"} value={meal.time} onChange={(e) => {
                   const m = [...data.meals]; m[idx].time = e.target.value; handleChange('meals', m);
                }} />
                <input className={inputClass + " !p-2"} value={meal.name} onChange={(e) => {
                   const m = [...data.meals]; m[idx].name = e.target.value; handleChange('meals', m);
                }} />
                <button onClick={() => handleChange('meals', data.meals.filter(it => it.id !== meal.id))} className="text-red-500 opacity-30 hover:opacity-100 px-2"><Trash2 size={16}/></button>
             </div>
           ))}
         </div>
      </section>
    </div>
  );
};

export default ProtocolForm;
