
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay } from '../types';
import { Plus, Trash2, Activity, Utensils, Dumbbell, Target, Sparkles, Loader2, User, ShieldCheck, ClipboardList, ChevronLeft, MapPin, Mail, Fingerprint, Droplets, Gauge } from 'lucide-react';
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

  const formatDateInput = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 2) return v;
    if (v.length <= 4) return v.replace(/(\d{2})(\d)/, '$1/$2');
    return v.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3').substring(0, 10);
  };

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
      if (n >= 100) { s += centenas[Math.floor(n / 100)]; n %= 100; if (n > 0) s += " e "; }
      if (n >= 20) { s += dezenas[Math.floor(n / 10)]; n %= 10; if (n > 0) s += " e "; } 
      else if (n >= 10) { s += dezenas10[n - 10]; n = 0; }
      if (n > 0) s += unidades[n];
      return s;
    };
    let n = Math.floor(num);
    let c = Math.round((num - n) * 100);
    let res = "";
    if (n >= 1000) { const mil = Math.floor(n / 1000); res += (mil === 1 ? "" : conv(mil)) + " mil"; n %= 1000; if (n > 0) res += (n < 100 || n % 100 === 0 ? " e " : ", "); }
    if (n > 0 || res === "") res += conv(n);
    res += (n === 1 && res.trim() === "um") ? " real" : " reais";
    if (c > 0) res += " e " + conv(c) + (c === 1 ? " centavo" : " centavos");
    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  useEffect(() => {
    if (data.contract.planValue) {
      const val = parseFloat(data.contract.planValue.replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (!isNaN(val)) {
        const text = converterParaExtenso(val);
        if (data.contract.planValueWords !== text) handleChange('contract.planValueWords', text);
      }
    }
  }, [data.contract.planValue]);

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
      alert("⚠️ Preencha Nome e Peso para análise.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como Master Coach do Team VBR Rhino, gere um protocolo JSON completo (dieta e treino) para: Aluno ${data.clientName}, Peso ${data.physicalData.weight}kg, Objetivo ${data.protocolTitle}. Retorne APENAS o JSON estruturado com nutritionalStrategy, kcalGoal, kcalSubtext, macros, meals (com id, time, name, details), trainingFrequency, trainingDays (com id, title, focus, exercises).`,
        config: { responseMimeType: "application/json" }
      });
      
      const jsonStr = response.text.trim();
      const suggestion = JSON.parse(jsonStr);
      const prepareId = (list: any[]) => (list || []).map(i => ({ ...i, id: i.id || Math.random().toString(36).substr(2, 9) }));
      
      onChange({ 
        ...data, 
        ...suggestion,
        meals: prepareId(suggestion.meals),
        trainingDays: (suggestion.trainingDays || []).map((d: any) => ({
          ...d, id: d.id || Math.random().toString(36).substr(2, 9),
          exercises: prepareId(d.exercises)
        }))
      });
    } catch (error) {
      console.error("Erro IA:", error);
      alert("A Inteligência VBR Rhino encontrou um problema.");
    } finally { setIsGenerating(false); }
  };

  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4 mt-8 first:mt-0";

  return (
    <div className="space-y-10 no-print">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors">
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>
      )}

      {/* IDENTIFICAÇÃO COMPLETA */}
      <section>
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação do Aluno</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome Completo</label>
            <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Mail className="inline mr-1" size={10}/> E-mail</label>
            <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp / Celular</label>
            <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelClass}><Fingerprint className="inline mr-1" size={10}/> CPF</label>
            <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className={labelClass}>RG</label>
            <input className={inputClass} value={data.contract.rg} onChange={(e) => handleChange('contract.rg', e.target.value)} placeholder="00.000.000-0" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}><MapPin className="inline mr-1" size={10}/> Endereço Residencial</label>
            <input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>
        </div>
      </section>

      {/* CONTRATO E VIGÊNCIA */}
      <section>
        <div className={sectionHeaderClass}>
          <ShieldCheck className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Contrato & Vigência</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Data de Início</label>
            <input className={inputClass} value={data.contract.startDate} onChange={(e) => { const v = formatDateInput(e.target.value); handleChange('contract.startDate', v); if(periodType !== 'custom') calculateEndDate(v, periodType as any); }} placeholder="00/00/0000" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Tipo de Plano</label>
            <select className={inputClass} value={periodType} onChange={(e) => { const t = e.target.value as any; setPeriodType(t); if(t !== 'custom') calculateEndDate(data.contract.startDate, t); }}>
              <option value="custom">Personalizado</option>
              <option value="trimestral">Trimestral (90 dias)</option>
              <option value="semestral">Semestral (180 dias)</option>
            </select>
          </div>
          <div className="col-span-2"><label className={labelClass}>Data de Término</label><input className={inputClass + (periodType !== 'custom' ? " opacity-60" : "")} value={data.contract.endDate} readOnly={periodType !== 'custom'} onChange={(e) => handleChange('contract.endDate', formatDateInput(e.target.value))} /></div>
          <div className="col-span-2"><label className={labelClass}>Valor do Plano (R$)</label><input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="000,00" /></div>
          <div className="col-span-4"><label className={labelClass}>Valor por Extenso</label><input className={inputClass + " italic opacity-80"} value={data.contract.planValueWords} readOnly /></div>
        </div>
      </section>

      {/* BIOIMPEDÂNCIA E DADOS FÍSICOS */}
      <section>
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Bioimpedância & Composição</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2"><label className={labelClass}>Objetivo do Protocolo</label><input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} placeholder="Ex: Hipertrofia, Definição..." /></div>
          <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
          <div><label className={labelClass}>Gênero</label><select className={inputClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}><option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option></select></div>
          
          <div><label className={labelClass}>Peso Atual (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} /></div>
          <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} placeholder="1.80" /></div>
          <div><label className={labelClass}>IMC</label><input className={inputClass + " bg-[#d4af37]/10"} value={data.physicalData.imc} readOnly /></div>
          <div><label className={labelClass}>Gordura Corporal (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} /></div>
          
          <div><label className={labelClass}><Gauge className="inline mr-1" size={10}/> Massa Muscular (kg)</label><input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} /></div>
          <div><label className={labelClass}>Gordura Visceral</label><input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} /></div>
          <div><label className={labelClass}><Droplets className="inline mr-1" size={10}/> Água Corporal (%)</label><input className={inputClass} value={data.physicalData.waterPercentage} onChange={(e) => handleChange('physicalData.waterPercentage', e.target.value)} /></div>
          <div className="col-span-1"><label className={labelClass}>Data da Avaliação</label><input className={inputClass} value={data.physicalData.date} onChange={(e) => handleChange('physicalData.date', formatDateInput(e.target.value))} /></div>
        </div>
      </section>

      {/* IA GENERATOR */}
      <div className="bg-gradient-to-br from-[#d4af37]/20 via-black to-black p-8 rounded-[2.5rem] border border-[#d4af37]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-[#d4af37] rounded-xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            {isGenerating ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
          </div>
          <div>
            <h3 className="font-black text-xl text-white uppercase tracking-tighter leading-none">Inteligência VBR Rhino Pro</h3>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] mt-1">Gere dieta e treino via IA</p>
          </div>
        </div>
        <button onClick={handleAISuggestion} disabled={isGenerating} className="bg-white text-black px-10 py-5 rounded-xl font-black text-xs uppercase hover:scale-105 transition-all disabled:opacity-50 shadow-lg">
          {isGenerating ? 'Trabalhando...' : 'GERAR PROTOCOLO COM IA'}
        </button>
      </div>

      {/* RESTANTE DO FORMULÁRIO (DIETA, REFEIÇÕES, TREINO) */}
      <section>
        <div className={sectionHeaderClass}>
          <Utensils className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estratégia Nutricional</h2>
        </div>
        <textarea className={inputClass + " h-32"} value={data.nutritionalStrategy} onChange={(e) => handleChange('nutritionalStrategy', e.target.value)} placeholder="Descreva a linha de raciocínio da dieta..." />
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <Target className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Distribuição de Refeições</h2>
        </div>
        <div className="space-y-4">
          {data.meals.map((meal, idx) => (
            <div key={meal.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 relative group">
              <button onClick={() => handleChange('meals', data.meals.filter(m => m.id !== meal.id))} className="absolute top-4 right-4 text-white/10 hover:text-red-500"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2"><label className={labelClass}>Hora</label><input className={inputClass} value={meal.time} onChange={(e) => { const nm = [...data.meals]; nm[idx].time = e.target.value; handleChange('meals', nm); }} /></div>
                <div className="md:col-span-10"><label className={labelClass}>Refeição</label><input className={inputClass} value={meal.name} onChange={(e) => { const nm = [...data.meals]; nm[idx].name = e.target.value; handleChange('meals', nm); }} /></div>
                <div className="md:col-span-12"><label className={labelClass}>Itens / Gramagens</label><textarea className={inputClass + " h-24"} value={meal.details} onChange={(e) => { const nm = [...data.meals]; nm[idx].details = e.target.value; handleChange('meals', nm); }} /></div>
              </div>
            </div>
          ))}
          <button onClick={() => handleChange('meals', [...data.meals, { id: Math.random().toString(36).substr(2, 9), time: '00:00', name: '', details: '' }])} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl text-white/40 hover:text-[#d4af37] font-black uppercase text-[10px]">
            + Adicionar Refeição
          </button>
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <Dumbbell className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Divisão de Treinos</h2>
        </div>
        <div className="space-y-6">
          {data.trainingDays.map((day, dIdx) => (
            <div key={day.id} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-4">
              <div className="flex justify-between gap-4">
                <input className={inputClass} value={day.title} onChange={(e) => { const nd = [...data.trainingDays]; nd[dIdx].title = e.target.value; handleChange('trainingDays', nd); }} placeholder="Treino A - Dorsais" />
                <button onClick={() => handleChange('trainingDays', data.trainingDays.filter(d => d.id !== day.id))} className="p-4 text-white/10 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
              <div className="space-y-2">
                {day.exercises.map((ex, eIdx) => (
                  <div key={ex.id} className="flex gap-2">
                    <input className={inputClass} value={ex.name} onChange={(e) => { const nd = [...data.trainingDays]; nd[dIdx].exercises[eIdx].name = e.target.value; handleChange('trainingDays', nd); }} placeholder="Exercício" />
                    <input className={inputClass + " w-24"} value={ex.sets} onChange={(e) => { const nd = [...data.trainingDays]; nd[dIdx].exercises[eIdx].sets = e.target.value; handleChange('trainingDays', nd); }} placeholder="Séries" />
                  </div>
                ))}
                <button onClick={() => { const nd = [...data.trainingDays]; nd[dIdx].exercises.push({ id: Math.random().toString(36).substr(2, 9), name: '', sets: '' }); handleChange('trainingDays', nd); }} className="text-[#d4af37]/60 hover:text-[#d4af37] text-[9px] font-black uppercase">+ Exercício</button>
              </div>
            </div>
          ))}
          <button onClick={() => handleChange('trainingDays', [...data.trainingDays, { id: Math.random().toString(36).substr(2, 9), title: '', focus: '', exercises: [] }])} className="w-full p-6 border-2 border-dashed border-white/10 rounded-[2rem] text-white/40 hover:text-[#d4af37] font-black uppercase text-[10px]">
            + Novo Bloco de Treino
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProtocolForm;
