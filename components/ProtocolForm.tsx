
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, Pill, ClipboardList, ChevronLeft, ShieldCheck, DollarSign, Calendar, Clock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CONSULTANT_DEFAULT } from '../constants';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [periodType, setPeriodType] = useState<'custom' | 'trimestral' | 'semestral'>('custom');
  
  useEffect(() => {
    if (!data.consultantName) {
      onChange({ ...data, ...CONSULTANT_DEFAULT });
    }
  }, [data.consultantName]);

  // Máscara para Data (DD/MM/AAAA) rigorosa
  const formatDateInput = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 2) return v;
    if (v.length <= 4) return v.replace(/(\d{2})(\d)/, '$1/$2');
    return v.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3').substring(0, 10);
  };

  // Cálculo automático do IMC
  useEffect(() => {
    const weight = parseFloat(data.physicalData.weight.replace(',', '.'));
    const height = parseFloat(data.physicalData.height.replace(',', '.'));
    if (weight > 0 && height > 0) {
      const hMeters = height > 3 ? height / 100 : height;
      const imcValue = (weight / (hMeters * hMeters)).toFixed(1);
      if (data.physicalData.imc !== imcValue) {
        handleChange('physicalData.imc', imcValue);
      }
    }
  }, [data.physicalData.weight, data.physicalData.height]);

  // Lógica de Extenso Financeiro (Reais e Centavos)
  const converterParaExtenso = (num: number): string => {
    if (num === 0) return "Zero reais";
    
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    const conv = (n: number): string => {
      if (n === 0) return "";
      if (n === 100) return "cem";
      let s = "";
      if (n >= 100) {
        s += centenas[Math.floor(n / 100)];
        n %= 100;
        if (n > 0) s += " e ";
      }
      if (n >= 20) {
        s += dezenas[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) s += " e ";
      } else if (n >= 10) {
        s += dezenas10[n - 10];
        n = 0;
      }
      if (n > 0) s += unidades[n];
      return s;
    };

    let n = Math.floor(num);
    let c = Math.round((num - n) * 100);
    let res = "";

    if (n >= 1000) {
      const mil = Math.floor(n / 1000);
      res += (mil === 1 ? "" : conv(mil)) + " mil";
      n %= 1000;
      if (n > 0) res += (n < 100 || n % 100 === 0 ? " e " : ", ");
    }
    
    if (n > 0 || res === "") res += conv(n);
    res += (n === 1 && res.trim() === "um") ? " real" : " reais";
    
    if (c > 0) {
      res += " e " + conv(c) + (c === 1 ? " centavo" : " centavos");
    }

    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  useEffect(() => {
    if (data.contract.planValue) {
      const val = parseFloat(data.contract.planValue.replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (!isNaN(val)) {
        const text = converterParaExtenso(val);
        if (data.contract.planValueWords !== text) {
          handleChange('contract.planValueWords', text);
        }
      }
    }
  }, [data.contract.planValue]);

  // Cálculo de Data de Término por Período
  const calculateEndDate = (startDate: string, type: 'trimestral' | 'semestral') => {
    const parts = startDate.split('/');
    if (parts.length !== 3) return;
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (isNaN(date.getTime())) return;

    if (type === 'trimestral') date.setMonth(date.getMonth() + 3);
    else if (type === 'semestral') date.setMonth(date.getMonth() + 6);

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    handleChange('contract.endDate', `${d}/${m}/${y}`);
  };

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
      alert("⚠️ DADOS NECESSÁRIOS: Preencha o Nome e o Peso para que a IA possa analisar.");
      return;
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("Erro: Chave de API não encontrada.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é o Master Coach Vinícius Brasil do Team VBR. Crie um protocolo de elite para: ${data.clientName}, Peso: ${data.physicalData.weight}kg, Objetivo: ${data.protocolTitle}. Retorne APENAS um JSON estruturado.`,
        config: { responseMimeType: "application/json" }
      });
      const suggestion = JSON.parse(response.text || '{}');
      
      const prepareId = (list: any[]) => (list || []).map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) }));
      
      onChange({ 
        ...data, 
        ...suggestion,
        meals: prepareId(suggestion.meals),
        supplements: prepareId(suggestion.supplements),
        trainingDays: (suggestion.trainingDays || []).map((d: any) => ({
          ...d,
          id: Math.random().toString(36).substr(2, 9),
          exercises: prepareId(d.exercises)
        }))
      });
    } catch (error) {
      console.error("Erro IA:", error);
      alert("Erro ao conectar com IA.");
    } finally { setIsGenerating(false); }
  };

  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4 mt-8 first:mt-0";

  return (
    <div className="space-y-10 no-print">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors">
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

      {/* VIGÊNCIA E FINANCEIRO */}
      <section>
        <div className={sectionHeaderClass}>
          <ShieldCheck className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Vigência & Financeiro</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Data de Início</label>
            <input 
              className={inputClass} 
              value={data.contract.startDate} 
              onChange={(e) => {
                const val = formatDateInput(e.target.value);
                handleChange('contract.startDate', val);
                if (periodType !== 'custom') calculateEndDate(val, periodType as any);
              }} 
              placeholder="00/00/0000" 
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Escolha o Período</label>
            <select 
              className={inputClass} 
              value={periodType} 
              onChange={(e) => {
                const type = e.target.value as any;
                setPeriodType(type);
                if (type !== 'custom') calculateEndDate(data.contract.startDate, type);
              }}
            >
              <option value="custom">Personalizado</option>
              <option value="trimestral">Trimestral (3 Meses)</option>
              <option value="semestral">Semestral (6 Meses)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Data de Término</label>
            <input 
              className={inputClass + (periodType !== 'custom' ? " bg-white/10 opacity-60" : "")} 
              value={data.contract.endDate} 
              readOnly={periodType !== 'custom'}
              onChange={(e) => handleChange('contract.endDate', formatDateInput(e.target.value))} 
              placeholder="00/00/0000" 
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Valor do Plano (R$)</label>
            <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" />
          </div>
          <div className="col-span-4">
            <label className={labelClass}>Valor por Extenso</label>
            <input className={inputClass + " bg-white/10 opacity-80 italic"} value={data.contract.planValueWords} readOnly />
          </div>
          
          {/* Ajuste no layout do pagamento para diminuir quando for Pix */}
          <div className={data.contract.paymentMethod === 'Cartão de Crédito' ? "col-span-2" : "col-span-2"}>
            <label className={labelClass}>Método de Pagamento</label>
            <select className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
            </select>
          </div>

          {data.contract.paymentMethod === 'Cartão de Crédito' && (
            <div className="col-span-2">
              <label className={labelClass}>Quantidade de Parcelas</label>
              <select 
                className={inputClass} 
                value={data.contract.installments} 
                onChange={(e) => handleChange('contract.installments', e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={`${i+1}x`}>{i+1}x</option>
                ))}
              </select>
            </div>
          )}
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
            <input type="text" className={inputClass} value={data.physicalData.date} onChange={(e) => handleChange('physicalData.date', formatDateInput(e.target.value))} placeholder="00/00/0000" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Título Protocolo</label>
            <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} placeholder="Ex: Hipertrofia" />
          </div>
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
          <div>
            <label className={labelClass}>IMC (Calculado)</label>
            <input className={inputClass + " bg-[#d4af37]/10 text-[#d4af37]"} value={data.physicalData.imc} readOnly />
          </div>
          <div><label className={labelClass}>Gordura (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
          <div><label className={labelClass}>Massa Musc. (kg)</label><input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} /></div>
          <div><label className={labelClass}>G. Visceral</label><input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} /></div>
        </div>
      </section>

      {/* IA GENERATOR */}
      <div className="bg-gradient-to-br from-[#d4af37]/20 via-black to-black p-8 rounded-[3rem] border border-[#d4af37]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-[#d4af37] rounded-[1.5rem] flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            {isGenerating ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
          </div>
          <div>
            <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">Inteligência VBR Pro</h3>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] mt-2">Gere o protocolo completo com IA</p>
          </div>
        </div>
        <button onClick={handleAISuggestion} disabled={isGenerating} className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-50">
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
              <button onClick={() => {
                const meals = data.meals.filter(m => m.id !== meal.id);
                handleChange('meals', meals);
              }} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
          <button onClick={() => {
            const newItem = { id: Math.random().toString(36).substr(2, 9), time: '00:00', name: '', details: '' };
            handleChange('meals', [...data.meals, newItem]);
          }} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-[#d4af37] transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={16} /> Adicionar Refeição
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
                <button onClick={() => {
                  const days = data.trainingDays.filter(d => d.id !== day.id);
                  handleChange('trainingDays', days);
                }} className="ml-4 p-4 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
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
          <button onClick={() => {
            const newDay = { id: Math.random().toString(36).substr(2, 9), title: '', focus: '', exercises: [] };
            handleChange('trainingDays', [...data.trainingDays, newDay]);
          }} className="w-full p-6 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center gap-2 text-white/40 hover:text-[#d4af37] transition-all font-black text-[10px] uppercase tracking-widest">
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
