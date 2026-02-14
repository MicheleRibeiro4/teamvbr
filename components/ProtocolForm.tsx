
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList, ChevronLeft, ShieldCheck, DollarSign, Calendar } from 'lucide-react';
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

  const addItem = (list: 'meals' | 'supplements' | 'trainingDays', item: any) => {
    handleChange(list, [...(data[list] as any[]), { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeItem = (list: 'meals' | 'supplements' | 'trainingDays', id: string) => {
    handleChange(list, (data[list] as any[]).filter(i => i.id !== id));
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

      {/* IDENTIFICAÇÃO DO ALUNO */}
      <section>
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação do Aluno</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome Completo</label>
            <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Nome do Aluno" />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp / Telefone</label>
            <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} placeholder="exemplo@email.com" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Endereço Residencial</label>
            <input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>
        </div>
      </section>

      {/* DADOS DO CONTRATO */}
      <section>
        <div className={sectionHeaderClass}>
          <ShieldCheck className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Vigência & Financeiro</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Data de Início</label>
            <input className={inputClass} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Data de Término</label>
            <input className={inputClass} value={data.contract.endDate} onChange={(e) => handleChange('contract.endDate', e.target.value)} placeholder="DD/MM/AAAA" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Valor do Plano (R$)</label>
            <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Método de Pagamento</label>
            <select className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
            </select>
          </div>
        </div>
      </section>

      {/* DADOS FÍSICOS */}
      <section>
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados Físicos & Bioimpedância</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Data da Avaliação</label>
            <input type="text" className={inputClass} value={data.physicalData.date} onChange={(e) => handleChange('physicalData.date', e.target.value)} placeholder="DD/MM/AAAA" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Título Protocolo</label>
            <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} placeholder="Ex: Hipertrofia" />
          </div>
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
          <div><label className={labelClass}>Gordura (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
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

      {/* NUTRIÇÃO */}
      <section>
        <div className={sectionHeaderClass}>
          <Utensils className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Nutrição & Macros</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estratégia</label>
              <textarea className={inputClass + " h-32"} value={data.nutritionalStrategy} onChange={(e) => handleChange('nutritionalStrategy', e.target.value)} />
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Calórica</label>
                <input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} placeholder="3.200 kcal" />
              </div>
              <div>
                <label className={labelClass}>Subtítulo Meta</label>
                <input className={inputClass} value={data.kcalSubtext} onChange={(e) => handleChange('kcalSubtext', e.target.value)} placeholder="(Foco Ganhos Limpos)" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {['protein', 'carbs', 'fats'].map((macro) => (
              <div key={macro} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className={labelClass}>{macro === 'protein' ? 'Proteína' : macro === 'carbs' ? 'Carbo' : 'Gordura'}</label>
                <input className={inputClass + " mb-2"} value={data.macros[macro as keyof typeof data.macros].value} onChange={(e) => handleChange(`macros.${macro}.value`, e.target.value)} placeholder="g" />
                <input className={inputClass + " p-2 text-[10px]"} value={data.macros[macro as keyof typeof data.macros].ratio} onChange={(e) => handleChange(`macros.${macro}.ratio`, e.target.value)} placeholder="ratio" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFEIÇÕES */}
      <section>
        <div className={sectionHeaderClass}>
          <Target className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Plano Alimentar</h2>
        </div>
        <div className="space-y-4">
          {data.meals.map((meal, idx) => (
            <div key={meal.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 relative group">
              <button onClick={() => removeItem('meals', meal.id)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Hora</label>
                  <input className={inputClass} value={meal.time} onChange={(e) => {
                    const meals = [...data.meals];
                    meals[idx].time = e.target.value;
                    handleChange('meals', meals);
                  }} />
                </div>
                <div className="md:col-span-10">
                  <label className={labelClass}>Nome da Refeição</label>
                  <input className={inputClass} value={meal.name} onChange={(e) => {
                    const meals = [...data.meals];
                    meals[idx].name = e.target.value;
                    handleChange('meals', meals);
                  }} />
                </div>
                <div className="md:col-span-12">
                  <label className={labelClass}>Detalhes / Alimentos</label>
                  <textarea className={inputClass + " h-24"} value={meal.details} onChange={(e) => {
                    const meals = [...data.meals];
                    meals[idx].details = e.target.value;
                    handleChange('meals', meals);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addItem('meals', { time: '00:00', name: '', details: '' })} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={16} /> Adicionar Refeição
          </button>
        </div>
      </section>

      {/* SUPLEMENTOS */}
      <section>
        <div className={sectionHeaderClass}>
          <Pill className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Suplementação</h2>
        </div>
        <div className="space-y-4">
          {data.supplements.map((supp, idx) => (
            <div key={supp.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 relative">
              <button onClick={() => removeItem('supplements', supp.id)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Suplemento</label>
                  <input className={inputClass} value={supp.name} onChange={(e) => {
                    const supps = [...data.supplements];
                    supps[idx].name = e.target.value;
                    handleChange('supplements', supps);
                  }} />
                </div>
                <div>
                  <label className={labelClass}>Dosagem</label>
                  <input className={inputClass} value={supp.dosage} onChange={(e) => {
                    const supps = [...data.supplements];
                    supps[idx].dosage = e.target.value;
                    handleChange('supplements', supps);
                  }} />
                </div>
                <div>
                  <label className={labelClass}>Horário/Momento</label>
                  <input className={inputClass} value={supp.timing} onChange={(e) => {
                    const supps = [...data.supplements];
                    supps[idx].timing = e.target.value;
                    handleChange('supplements', supps);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addItem('supplements', { name: '', dosage: '', timing: '' })} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={16} /> Adicionar Suplemento
          </button>
        </div>
      </section>

      {/* TREINOS */}
      <section>
        <div className={sectionHeaderClass}>
          <Dumbbell className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Divisão de Treino</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <label className={labelClass}>Frequência Semanal</label>
            <input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5 dias por semana" />
          </div>

          {data.trainingDays.map((day, dIdx) => (
            <div key={day.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Título do Treino</label>
                    <input className={inputClass} value={day.title} onChange={(e) => {
                      const days = [...data.trainingDays];
                      days[dIdx].title = e.target.value;
                      handleChange('trainingDays', days);
                    }} />
                  </div>
                  <div>
                    <label className={labelClass}>Foco Muscular</label>
                    <input className={inputClass} value={day.focus} onChange={(e) => {
                      const days = [...data.trainingDays];
                      days[dIdx].focus = e.target.value;
                      handleChange('trainingDays', days);
                    }} />
                  </div>
                </div>
                <button onClick={() => removeItem('trainingDays', day.id)} className="ml-4 p-4 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Exercícios</label>
                {day.exercises.map((ex, eIdx) => (
                  <div key={ex.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-8">
                      <input className={inputClass + " p-3"} value={ex.name} onChange={(e) => {
                        const days = [...data.trainingDays];
                        days[dIdx].exercises[eIdx].name = e.target.value;
                        handleChange('trainingDays', days);
                      }} placeholder="Nome do Exercício" />
                    </div>
                    <div className="md:col-span-3">
                      <input className={inputClass + " p-3"} value={ex.sets} onChange={(e) => {
                        const days = [...data.trainingDays];
                        days[dIdx].exercises[eIdx].sets = e.target.value;
                        handleChange('trainingDays', days);
                      }} placeholder="Séries x Reps" />
                    </div>
                    <div className="md:col-span-1">
                      <button onClick={() => {
                        const days = [...data.trainingDays];
                        days[dIdx].exercises = days[dIdx].exercises.filter(i => i.id !== ex.id);
                        handleChange('trainingDays', days);
                      }} className="text-white/10 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const days = [...data.trainingDays];
                  days[dIdx].exercises.push({ id: Math.random().toString(36).substr(2, 9), name: '', sets: '' });
                  handleChange('trainingDays', days);
                }} className="flex items-center gap-2 text-[9px] font-black uppercase text-[#d4af37]/60 hover:text-[#d4af37] transition-colors">
                  <Plus size={14} /> Adicionar Exercício
                </button>
              </div>
            </div>
          ))}

          <button onClick={() => addItem('trainingDays', { title: '', focus: '', exercises: [] })} className="w-full p-6 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center gap-2 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={20} /> Adicionar Novo Dia de Treino
          </button>
        </div>
      </section>

      {/* OBSERVAÇÕES */}
      <section>
        <div className={sectionHeaderClass}>
          <ClipboardList className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Observação</h2>
        </div>
        <textarea className={inputClass + " h-40"} value={data.generalObservations} onChange={(e) => handleChange('generalObservations', e.target.value)} placeholder="Frase final ou avisos importantes..." />
      </section>
    </div>
  );
};

export default ProtocolForm;
