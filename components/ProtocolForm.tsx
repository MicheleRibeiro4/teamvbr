
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { CONSULTANT_DEFAULT } from '../constants';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange }) => {
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
    // A chave de API deve vir exclusivamente de process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      alert("❌ ERRO: Chave de API Gemini não encontrada. Verifique se a variável API_KEY está configurada.");
      return;
    }

    if (!data.clientName || !data.physicalData.weight) {
      alert("⚠️ INFORMAÇÕES INSUFICIENTES: Preencha o Nome e o Peso para que a IA possa analisar.");
      return;
    }

    setIsGenerating(true);
    try {
      // Inicialização oficial do Google GenAI SDK
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Você é o Master Coach do Team VBR. Com base nos dados abaixo, gere um protocolo completo e de elite.
      Nome: ${data.clientName} | Peso: ${data.physicalData.weight}kg | Altura: ${data.physicalData.height}m | BF: ${data.physicalData.bodyFat}%
      Objetivo solicitado: ${data.protocolTitle || "Hipertrofia/Recomposição"}
      
      Retorne um JSON rigoroso:
      {
        "nutritionalStrategy": "Explicação técnica da dieta",
        "kcalGoal": "Valor numérico (ex: 2800)",
        "kcalSubtext": "(TEXTO CURTO)",
        "macros": {
          "protein": { "value": "180" },
          "carbs": { "value": "350" },
          "fats": { "value": "70" }
        },
        "meals": [{"time": "08:00", "name": "Café", "details": "Detalhes"}],
        "supplements": [{"name": "Creatina", "dosage": "5g", "timing": "Pós"}],
        "trainingDays": [{"title": "DIA A", "focus": "Peito", "exercises": [{"name": "Supino", "sets": "4x10"}]}],
        "generalObservations": "Finalização técnica"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nutritionalStrategy: { type: Type.STRING },
              kcalGoal: { type: Type.STRING },
              kcalSubtext: { type: Type.STRING },
              macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
                  carbs: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
                  fats: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
                }
              },
              meals: { 
                type: Type.ARRAY, 
                items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, name: { type: Type.STRING }, details: { type: Type.STRING } } } 
              },
              supplements: { 
                type: Type.ARRAY, 
                items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, dosage: { type: Type.STRING }, timing: { type: Type.STRING } } } 
              },
              trainingDays: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    title: { type: Type.STRING }, 
                    focus: { type: Type.STRING }, 
                    exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sets: { type: Type.STRING } } } } 
                  } 
                } 
              },
              generalObservations: { type: Type.STRING }
            }
          }
        }
      });

      const suggestion = JSON.parse(response.text || "{}");
      
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
      console.error("Erro Gemini:", error);
      alert(`❌ FALHA NA GERAÇÃO: ${error.message}`);
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
    <div className="space-y-10 no-print">
      
      <section>
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação do Aluno</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome Completo</label>
            <input className={inputClass + " !text-lg !font-black !text-[#d4af37]"} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Título do Protocolo</label>
            <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} />
          </div>
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados Físicos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Sexo</label>
            <select className={inputClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
          <div><label className={labelClass}>Gordura (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
          <div><label className={labelClass}>Massa Muscular (kg)</label><input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} /></div>
          <div><label className={labelClass}>G. Visceral</label><input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} /></div>
          <div className="bg-[#d4af37]/10 rounded-2xl flex flex-col items-center justify-center border border-[#d4af37]/30">
             <label className={labelClass + " !mb-0"}>IMC</label>
             <span className="text-xl font-black text-[#d4af37]">{data.physicalData.imc}</span>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-br from-[#d4af37]/20 via-black to-black p-8 rounded-[3rem] border border-[#d4af37]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-[#d4af37] rounded-[1.5rem] flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
            {isGenerating ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
          </div>
          <div>
            <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">Inteligência VBR Pro</h3>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] mt-2">
              {isGenerating ? 'Analisando metabolismo do aluno...' : 'Clique para gerar um protocolo profissional'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleAISuggestion}
          disabled={isGenerating}
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50 shadow-2xl relative z-10"
        >
          {isGenerating ? 'Trabalhando...' : 'Gerar com IA'}
        </button>
      </div>

      <section>
        <div className={sectionHeaderClass}>
          <Target className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Plano Nutricional</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div><label className={labelClass}>Meta Calórica</label><input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} /></div>
           <div><label className={labelClass}>Subtexto</label><input className={inputClass} value={data.kcalSubtext} onChange={(e) => handleChange('kcalSubtext', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
             <label className={labelClass}>Prot (g)</label>
             <input className={inputClass + " !bg-transparent !border-red-500/10"} value={data.macros.protein.value} onChange={(e) => handleChange('macros.protein.value', e.target.value)} />
           </div>
           <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
             <label className={labelClass}>Carb (g)</label>
             <input className={inputClass + " !bg-transparent !border-blue-500/10"} value={data.macros.carbs.value} onChange={(e) => handleChange('macros.carbs.value', e.target.value)} />
           </div>
           <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
             <label className={labelClass}>Gord (g)</label>
             <input className={inputClass + " !bg-transparent !border-yellow-500/10"} value={data.macros.fats.value} onChange={(e) => handleChange('macros.fats.value', e.target.value)} />
           </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Estratégia Nutricional</label>
          <textarea className={inputClass + " h-24"} value={data.nutritionalStrategy} onChange={(e) => handleChange('nutritionalStrategy', e.target.value)} />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-2">
             <Utensils className="text-[#d4af37]" size={20} />
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">Refeições</h2>
           </div>
           <button onClick={addMeal} className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Plus size={14}/> Add Refeição
           </button>
        </div>
        <div className="space-y-4">
          {data.meals.map((meal, idx) => (
            <div key={meal.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex gap-3 mb-3">
                  <input className={inputClass + " w-20 p-2"} value={meal.time} onChange={(e) => {
                    const newMeals = [...data.meals];
                    newMeals[idx].time = e.target.value;
                    handleChange('meals', newMeals);
                  }} />
                  <input className={inputClass + " flex-1 p-2"} value={meal.name} onChange={(e) => {
                    const newMeals = [...data.meals];
                    newMeals[idx].name = e.target.value;
                    handleChange('meals', newMeals);
                  }} />
                  <button onClick={() => handleChange('meals', data.meals.filter(m => m.id !== meal.id))} className="text-white/20 hover:text-red-500">
                    <Trash2 size={16}/>
                  </button>
               </div>
               <textarea className={inputClass + " h-20 text-xs"} value={meal.details} onChange={(e) => {
                  const newMeals = [...data.meals];
                  newMeals[idx].details = e.target.value;
                  handleChange('meals', newMeals);
               }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-2">
             <Pill className="text-[#d4af37]" size={20} />
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">Suplementação</h2>
           </div>
           <button onClick={addSupplement} className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Plus size={14}/> Add Suplemento
           </button>
        </div>
        <div className="space-y-4">
          {data.supplements.map((supp, idx) => (
            <div key={supp.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
               <div className="md:col-span-4">
                  <label className={labelClass}>Suplemento</label>
                  <input className={inputClass + " p-2 text-xs"} value={supp.name} onChange={(e) => {
                    const newSupps = [...data.supplements];
                    newSupps[idx].name = e.target.value;
                    handleChange('supplements', newSupps);
                  }} />
               </div>
               <div className="md:col-span-3">
                  <label className={labelClass}>Dose</label>
                  <input className={inputClass + " p-2 text-xs"} value={supp.dosage} onChange={(e) => {
                    const newSupps = [...data.supplements];
                    newSupps[idx].dosage = e.target.value;
                    handleChange('supplements', newSupps);
                  }} />
               </div>
               <div className="md:col-span-4">
                  <label className={labelClass}>Timing</label>
                  <input className={inputClass + " p-2 text-xs"} value={supp.timing} onChange={(e) => {
                    const newSupps = [...data.supplements];
                    newSupps[idx].timing = e.target.value;
                    handleChange('supplements', newSupps);
                  }} />
               </div>
               <div className="md:col-span-1 flex justify-end">
                  <button onClick={() => handleChange('supplements', data.supplements.filter(s => s.id !== supp.id))} className="text-white/20 hover:text-red-500">
                    <Trash2 size={16}/>
                  </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-2">
             <Dumbbell className="text-[#d4af37]" size={20} />
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">Treino</h2>
           </div>
           <button onClick={addTrainingDay} className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Plus size={14}/> Novo Dia
           </button>
        </div>
        <div className="space-y-6">
          {data.trainingDays.map((day, dIdx) => (
            <div key={day.id} className="p-5 bg-white/5 rounded-2xl border border-white/10">
               <div className="flex gap-3 mb-4">
                  <input className={inputClass + " !text-[#d4af37] !font-black"} value={day.title} onChange={(e) => {
                    const newDays = [...data.trainingDays];
                    newDays[dIdx].title = e.target.value;
                    handleChange('trainingDays', newDays);
                  }} />
                  <button onClick={() => handleChange('trainingDays', data.trainingDays.filter(d => d.id !== day.id))} className="text-white/20 hover:text-red-500">
                    <Trash2 size={16}/>
                  </button>
               </div>
               <div className="space-y-2">
                 {day.exercises.map((ex, eIdx) => (
                   <div key={ex.id} className="flex gap-2">
                      <input className={inputClass + " flex-1 text-xs p-2"} value={ex.name} onChange={(e) => {
                        const newDays = [...data.trainingDays];
                        newDays[dIdx].exercises[eIdx].name = e.target.value;
                        handleChange('trainingDays', newDays);
                      }} />
                      <input className={inputClass + " w-20 text-center text-xs p-2"} value={ex.sets} onChange={(e) => {
                        const newDays = [...data.trainingDays];
                        newDays[dIdx].exercises[eIdx].sets = e.target.value;
                        handleChange('trainingDays', newDays);
                      }} />
                      <button onClick={() => {
                        const newDays = [...data.trainingDays];
                        newDays[dIdx].exercises = newDays[dIdx].exercises.filter(x => x.id !== ex.id);
                        handleChange('trainingDays', newDays);
                      }} className="text-white/10 hover:text-red-500">
                        <Trash2 size={14}/>
                      </button>
                   </div>
                 ))}
                 <button onClick={() => {
                   const newDays = [...data.trainingDays];
                   newDays[dIdx].exercises.push({ id: Date.now().toString(), name: '', sets: '' });
                   handleChange('trainingDays', newDays);
                 }} className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2">
                    + Add Exercício
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <ClipboardList className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Observações</h2>
        </div>
        <textarea 
          className={inputClass + " h-32"} 
          value={data.generalObservations} 
          onChange={(e) => handleChange('generalObservations', e.target.value)} 
          placeholder="Recomendações finais do coach..."
        />
      </section>
    </div>
  );
};

export default ProtocolForm;
