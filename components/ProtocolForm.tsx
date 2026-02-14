
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList, ChevronLeft, Calendar, DollarSign, MapPin, Phone, Mail, UserCheck } from 'lucide-react';
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
      
      const prompt = `Você é o Master Coach Vinícius Brasil do Team VBR. Crie um protocolo profissional de elite para o aluno:
      Nome: ${data.clientName} | Peso: ${data.physicalData.weight}kg | Altura: ${data.physicalData.height}m | Idade: ${data.physicalData.age} | Objetivo: ${data.protocolTitle || "Performance Máxima"}.
      
      Retorne APENAS um objeto JSON com esta estrutura exata:
      {
        "nutritionalStrategy": "Explicação técnica motivacional curta",
        "kcalGoal": "Valor calórico",
        "kcalSubtext": "(EX: SUPERÁVIT CONTROLADO)",
        "macros": {
          "protein": { "value": "160", "ratio": "≈ 2,2g/kg" },
          "carbs": { "value": "330", "ratio": "Energia" },
          "fats": { "value": "75", "ratio": "Regulação" }
        },
        "meals": [{"time": "08:40", "name": "Nome", "details": "Alimentos"}],
        "supplements": [{"name": "CREATINA", "dosage": "5g todos os dias", "timing": "Junto à Ceia"}],
        "tips": ["Dica 1", "Dica 2", "Dica 3"],
        "trainingFrequency": "4 a 5x por semana",
        "trainingDays": [{"title": "DIA A: PEITO + OMBRO", "focus": "Superior", "exercises": [{"name": "Supino", "sets": "4x 8-10"}]}],
        "generalObservations": "Sua frase de impacto"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const suggestion = JSON.parse(response.text || '{}');
      
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
      alert("❌ Falha ao gerar com IA. Tente novamente.");
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
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4 mt-8 first:mt-0";

  return (
    <div className="space-y-10 no-print">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel do Aluno
        </button>
      )}

      {/* IDENTIFICAÇÃO + DADOS JURÍDICOS INTEGRADOS */}
      <section>
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação & Dados do Contrato</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome Completo do Aluno</label>
            <input className={inputClass + " !text-lg !font-black !text-[#d4af37]"} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className={labelClass}>Telefone / WhatsApp</label>
            <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} placeholder="aluno@email.com" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Endereço Residencial</label>
            <input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-[#d4af37]" size={16} />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Vigência</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Data Início</label>
                <input className={inputClass + " !p-3"} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" />
              </div>
              <div>
                <label className={labelClass}>Data Término</label>
                <input className={inputClass + " !p-3"} value={data.contract.endDate} onChange={(e) => handleChange('contract.endDate', e.target.value)} placeholder="DD/MM/AAAA" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-[#d4af37]" size={16} />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Financeiro</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Valor Total (R$)</label>
                <input className={inputClass + " !p-3"} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" />
              </div>
              <div>
                <label className={labelClass}>Pagamento</label>
                <select className={inputClass + " !p-3"} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
                   <option value="Pix">Pix</option>
                   <option value="Cartão">Cartão</option>
                   <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados Físicos & Bioimpedância</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className={labelClass}>Título Protocolo</label><input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} placeholder="Ex: Hipertrofia" /></div>
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
          <div><label className={labelClass}>Gordura (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
          <div><label className={labelClass}>Massa Musc (kg)</label><input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} /></div>
          <div><label className={labelClass}>G. Visceral</label><input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} /></div>
          <div><label className={labelClass}>IMC</label><input className={inputClass} value={data.physicalData.imc} onChange={(e) => handleChange('physicalData.imc', e.target.value)} /></div>
        </div>
      </section>

      {/* IA GENERATOR */}
      <div className="bg-gradient-to-br from-[#d4af37]/20 via-black to-black p-8 rounded-[3rem] border border-[#d4af37]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-[#d4af37] rounded-[1.5rem] flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
            {isGenerating ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
          </div>
          <div>
            <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">Inteligência VBR Pro</h3>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] mt-2">
              {isGenerating ? 'Analisando metabolismo do aluno...' : 'Clique para gerar um protocolo completo com IA'}
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
           <div><label className={labelClass}>Subtexto (Ex: Superávit)</label><input className={inputClass} value={data.kcalSubtext} onChange={(e) => handleChange('kcalSubtext', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
           {['protein', 'carbs', 'fats'].map(m => (
             <div key={m} className="bg-white/5 p-4 rounded-2xl border border-white/10">
               <label className={labelClass}>{m.toUpperCase()} (g)</label>
               <input className={inputClass + " !bg-transparent !border-none !p-0 !text-xl"} value={(data.macros as any)[m].value} onChange={(e) => handleChange(`macros.${m}.value`, e.target.value)} />
             </div>
           ))}
        </div>
        <div className="mt-4">
          <label className={labelClass}>Estratégia do Coach</label>
          <textarea className={inputClass + " h-24"} value={data.nutritionalStrategy} onChange={(e) => handleChange('nutritionalStrategy', e.target.value)} />
        </div>
      </section>

      {/* REFEIÇÕES */}
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

      {/* SUPLEMENTAÇÃO */}
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

      {/* TREINAMENTO */}
      <section>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-2">
             <Dumbbell className="text-[#d4af37]" size={20} />
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">Treinamento</h2>
           </div>
           <button onClick={addTrainingDay} className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Plus size={14}/> Novo Dia
           </button>
        </div>
        <div>
           <label className={labelClass}>Frequência Semanal</label>
           <input className={inputClass + " mb-6"} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} />
        </div>
        <div className="space-y-6">
          {data.trainingDays.map((day, dIdx) => (
            <div key={day.id} className="p-5 bg-white/5 rounded-2xl border border-white/10">
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Título do Dia</label>
                    <input className={inputClass + " !text-[#d4af37] !font-black"} value={day.title} onChange={(e) => {
                      const newDays = [...data.trainingDays];
                      newDays[dIdx].title = e.target.value;
                      handleChange('trainingDays', newDays);
                    }} />
                  </div>
                  <div>
                    <label className={labelClass}>Foco</label>
                    <input className={inputClass} value={day.focus} onChange={(e) => {
                      const newDays = [...data.trainingDays];
                      newDays[dIdx].focus = e.target.value;
                      handleChange('trainingDays', newDays);
                    }} />
                  </div>
               </div>
               <div className="space-y-2">
                 {day.exercises.map((ex, eIdx) => (
                   <div key={ex.id} className="flex gap-2">
                      <input className={inputClass + " flex-1 text-xs p-2"} value={ex.name} onChange={(e) => {
                        const newDays = [...data.trainingDays];
                        newDays[dIdx].exercises[eIdx].name = e.target.value;
                        handleChange('trainingDays', newDays);
                      }} />
                      <input className={inputClass + " w-24 text-center text-xs p-2"} value={ex.sets} onChange={(e) => {
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
    </div>
  );
};

export default ProtocolForm;
