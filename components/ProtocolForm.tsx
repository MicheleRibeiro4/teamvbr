
import React, { useEffect, useState, useRef } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay, Exercise } from '../types';
import { Activity, User, ShieldCheck, ChevronLeft, MapPin, Dumbbell, Utensils, Pill, Plus, Trash2, FileText, AlertCircle, Sparkles, Loader2, Ruler, DollarSign, Droplets, BookOpen, Eraser, FileDown, Lightbulb, Copy } from 'lucide-react';
import { EMPTY_DATA, PROTOCOL_TEMPLATES, MEASUREMENT_LABELS } from '../constants';
import ContractPreview, { ContractPreviewHandle } from './ContractPreview';
import AnamnesisPreview, { AnamnesisPreviewHandle } from './AnamnesisPreview';
import ProtocolPreview, { ProtocolPreviewHandle } from './ProtocolPreview';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
  activeTab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino';
  onTabChange: (tab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino') => void;
  hideTabs?: boolean;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack, activeTab, onTabChange, hideTabs }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contractRef = useRef<ContractPreviewHandle>(null);
  const anamnesisRef = useRef<AnamnesisPreviewHandle>(null);
  const protocolRef = useRef<ProtocolPreviewHandle>(null);

  const handleChange = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const handleApplyTemplate = (type: keyof typeof PROTOCOL_TEMPLATES) => {
    const template = PROTOCOL_TEMPLATES[type];
    const newData = JSON.parse(JSON.stringify(data));
    newData.protocolTitle = template.title;
    newData.tips = [...template.tips];
    newData.nutritionalStrategy = template.strategy;
    onChange(newData);
  };

  const handleDateInput = (path: string, value: string) => {
    let v = value.replace(/\D/g, ''); 
    if (v.length > 8) v = v.substr(0, 8); 

    if (v.length > 4) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    
    handleChange(path, v);
  };

  const formatTime = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 4) v = v.substr(0, 4);
    if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d)/, '$1:$2');
    }
    return v;
  };

  const handleCPFMask = (path: string, value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    handleChange(path, v);
  };

  const handlePhoneMask = (path: string, value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);

    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');

    handleChange(path, v);
  };

  const handleHeightMask = (path: string, value: string) => {
    let v = value.replace(/\./g, ',');
    v = v.replace(/[^0-9,]/g, '');
    const parts = v.split(',');
    if (parts.length > 2) {
       v = parts[0] + ',' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
       v = parts[0] + ',' + parts[1].substring(0, 2);
    }
    if (v.length > 4) v = v.substring(0, 4);
    handleChange(path, v);
  };

  const handleWeightMask = (path: string, value: string) => {
    let v = value.replace(/\./g, ',');
    v = v.replace(/[^0-9,]/g, '');
    const parts = v.split(',');
    if (parts.length > 2) {
       v = parts[0] + ',' + parts.slice(1).join('');
    }
    if (v.length > 6) v = v.substring(0, 6);
    handleChange(path, v);
  };

  const updateMealTime = (index: number, val: string) => {
    const formatted = formatTime(val);
    updateMeal(index, 'time', formatted);
  };

  const handleClearNutrition = () => {
    if(confirm("Tem certeza? Isso apagará as Metas, Macros, Refeições, Suplementos e Dicas, mas manterá sua Estratégia.")) {
        const newData = JSON.parse(JSON.stringify(data));
        newData.kcalGoal = "";
        newData.kcalSubtext = "";
        newData.macros = JSON.parse(JSON.stringify(EMPTY_DATA.macros));
        newData.meals = [];
        newData.supplements = [];
        newData.tips = [];
        onChange(newData);
    }
  };

  const handleClearTraining = () => {
    if(confirm("Tem certeza? Isso apagará todos os dias de treino cadastrados.")) {
        const newData = JSON.parse(JSON.stringify(data));
        newData.trainingDays = [];
        onChange(newData);
    }
  };

  const handleGenerateAI = async () => {
    if (!data.clientName || !data.physicalData.weight) {
        alert("Preencha pelo menos o Nome e o Peso do aluno na aba de Identificação/Medidas.");
        return;
    }

    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
          Aja como um treinador e nutricionista de elite do 'Team VBR'.
          Crie um protocolo completo para o aluno baseado nos dados abaixo:
          
          DADOS:
          - Nome: ${data.clientName}
          - Idade: ${data.physicalData.age}
          - Gênero: ${data.physicalData.gender}
          - Peso: ${data.physicalData.weight}kg
          - Altura: ${data.physicalData.height}m
          - Objetivo Atual: ${data.protocolTitle}
          - Observações/Restrições (Anamnese): ${data.anamnesis.mainObjective} | ${data.anamnesis.foodPreferences} | ${data.anamnesis.injuries}
          
          Gere um JSON com a seguinte estrutura estrita:
          {
            "nutritionalStrategy": "Texto curto e direto sobre a estratégia (ex: Carb Cycling, Normocalórica, etc)",
            "kcalGoal": "Ex: 2500 kcal",
            "macros": {
               "protein": { "value": "gramas totais", "ratio": "g/kg" },
               "carbs": { "value": "gramas totais", "ratio": "g/kg" },
               "fats": { "value": "gramas totais", "ratio": "g/kg" }
            },
            "meals": [
              { "time": "08:00", "name": "Café da Manhã", "details": "Alimentos e quantidades detalhadas" }
            ],
            "supplements": [
              { "name": "Nome", "dosage": "Dose", "timing": "Horário" }
            ],
            "trainingDays": [
              {
                "title": "Treino A",
                "focus": "Grupo Muscular",
                "exercises": [
                   { "name": "Nome do Exercício", "sets": "4x12" }
                ]
              }
            ],
            "tips": ["Dica 1", "Dica 2"]
          }
          
          Regras:
          1. Use português do Brasil.
          2. Seja específico nas quantidades dos alimentos.
          3. O treino deve ser coerente com o objetivo.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nutritionalStrategy: { type: Type.STRING },
                        kcalGoal: { type: Type.STRING },
                        macros: {
                            type: Type.OBJECT,
                            properties: {
                                protein: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, ratio: { type: Type.STRING } }, required: ["value", "ratio"] },
                                carbs: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, ratio: { type: Type.STRING } }, required: ["value", "ratio"] },
                                fats: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, ratio: { type: Type.STRING } }, required: ["value", "ratio"] }
                            },
                            required: ["protein", "carbs", "fats"]
                        },
                        meals: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    details: { type: Type.STRING }
                                },
                                required: ["time", "name", "details"]
                            }
                        },
                        supplements: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    dosage: { type: Type.STRING },
                                    timing: { type: Type.STRING }
                                },
                                required: ["name", "dosage", "timing"]
                            }
                        },
                        trainingDays: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    exercises: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                sets: { type: Type.STRING }
                                            },
                                            required: ["name", "sets"]
                                        }
                                    }
                                },
                                required: ["title", "focus", "exercises"]
                            }
                        },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["nutritionalStrategy", "kcalGoal", "macros", "meals", "supplements", "trainingDays", "tips"]
                }
            }
        });

        // Limpeza do JSON
        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
        }
        
        const aiData = JSON.parse(jsonStr);

        // Merge com dados existentes
        const newData = JSON.parse(JSON.stringify(data));
        
        if (aiData.nutritionalStrategy) newData.nutritionalStrategy = aiData.nutritionalStrategy;
        if (aiData.kcalGoal) newData.kcalGoal = aiData.kcalGoal;
        if (aiData.macros) newData.macros = aiData.macros;
        
        if (aiData.meals && Array.isArray(aiData.meals)) {
            newData.meals = aiData.meals.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) }));
        }
        
        if (aiData.supplements && Array.isArray(aiData.supplements)) {
            newData.supplements = aiData.supplements.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
        }
        
        if (aiData.trainingDays && Array.isArray(aiData.trainingDays)) {
            newData.trainingDays = aiData.trainingDays.map((d: any) => ({
                 id: Math.random().toString(36).substr(2, 9),
                 title: d.title,
                 focus: d.focus,
                 exercises: (d.exercises || []).map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))
            }));
        }

        if (aiData.tips && Array.isArray(aiData.tips)) {
            newData.tips = aiData.tips;
        }

        onChange(newData);
        alert("Protocolo gerado com sucesso! Revise os dados.");

    } catch (err: any) {
        console.error(err);
        alert("Erro ao gerar com IA: " + err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    const weight = parseFloat(data.physicalData.weight.replace(',', '.'));
    if (!isNaN(weight) && weight > 0) {
        const liters = (weight * 0.035).toFixed(1).replace('.', ',');
        if (data.waterGoal !== liters) handleChange('waterGoal', liters);
    }
  }, [data.physicalData.weight]);

  useEffect(() => {
    if (data.contract.startDate && data.contract.planType) {
      const parts = data.contract.startDate.split('/');
      if (data.contract.planType === 'Avulso') {
        const newData = JSON.parse(JSON.stringify(data));
        if (newData.contract.endDate !== newData.contract.startDate) {
          newData.contract.endDate = newData.contract.startDate;
          newData.contract.durationDays = "1";
          onChange(newData);
        }
        return;
      }
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) {
          const monthsToAdd = data.contract.planType === 'Trimestral' ? 3 : 6;
          dateObj.setMonth(dateObj.getMonth() + monthsToAdd);
          const endDay = String(dateObj.getDate()).padStart(2, '0');
          const endMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
          const endYear = dateObj.getFullYear();
          const newEndDate = `${endDay}/${endMonth}/${endYear}`;
          
          const startObj = new Date(year, month, day);
          const diffTime = Math.abs(dateObj.getTime() - startObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (data.contract.endDate !== newEndDate || data.contract.durationDays !== String(diffDays)) {
             const newData = JSON.parse(JSON.stringify(data));
             newData.contract.endDate = newEndDate;
             newData.contract.durationDays = String(diffDays);
             onChange(newData);
          }
        }
      }
    }
  }, [data.contract.startDate, data.contract.planType]);

  useEffect(() => {
    const w = parseFloat(data.physicalData.weight.replace(',', '.'));
    const h = parseFloat(data.physicalData.height.replace(',', '.'));
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const imc = (w / (h * h)).toFixed(2).replace('.', ',');
      if (data.physicalData.imc !== imc) handleChange('physicalData.imc', imc);
    }
  }, [data.physicalData.weight, data.physicalData.height]);

  const converterParaExtenso = (num: number): string => {
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
    if (num === 0) return "zero reais";
    let n = Math.floor(num);
    let c = Math.round((num - n) * 100);
    let res = "";
    if (n >= 1000) { const mil = Math.floor(n / 1000); res += (mil === 1 ? "" : conv(mil)) + " mil"; n %= 1000; if (n > 0) res += (n < 100 || n % 100 === 0 ? " e " : ", "); }
    if (n > 0 || res === "") res += conv(n);
    res += (n === 1 && res === "um") ? " real" : " reais";
    if (c > 0) res += " e " + conv(c) + (c === 1 ? " centavo" : " centavos");
    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  useEffect(() => {
    const valStr = data.contract.planValue.replace(/[^\d,.-]/g, '').replace(',', '.');
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const extenso = converterParaExtenso(val);
      if (data.contract.planValueWords !== extenso) handleChange('contract.planValueWords', extenso);
    }
  }, [data.contract.planValue]);

  const addMeal = () => handleChange('meals', [...data.meals, { id: Date.now().toString(), time: '', name: '', details: '' }]);
  const removeMeal = (index: number) => { const newMeals = [...data.meals]; newMeals.splice(index, 1); handleChange('meals', newMeals); };
  const updateMeal = (index: number, field: keyof Meal, val: string) => { const newMeals = [...data.meals]; newMeals[index] = { ...newMeals[index], [field]: val }; handleChange('meals', newMeals); };

  const addSupplement = () => handleChange('supplements', [...data.supplements, { id: Date.now().toString(), name: '', dosage: '', timing: '' }]);
  const removeSupplement = (index: number) => { const newSupps = [...data.supplements]; newSupps.splice(index, 1); handleChange('supplements', newSupps); };
  const updateSupplement = (index: number, field: keyof Supplement, val: string) => { const newSupps = [...data.supplements]; newSupps[index] = { ...newSupps[index], [field]: val }; handleChange('supplements', newSupps); };

  const addTip = () => handleChange('tips', [...(data.tips || []), ""]);
  const removeTip = (index: number) => { const newTips = [...(data.tips || [])]; newTips.splice(index, 1); handleChange('tips', newTips); };
  const updateTip = (index: number, val: string) => { const newTips = [...(data.tips || [])]; newTips[index] = val; handleChange('tips', newTips); };

  const addTrainingDay = () => handleChange('trainingDays', [...data.trainingDays, { id: Date.now().toString(), title: '', focus: '', exercises: [] }]);
  const removeTrainingDay = (index: number) => { const newDays = [...data.trainingDays]; newDays.splice(index, 1); handleChange('trainingDays', newDays); };
  const updateTrainingDay = (index: number, field: keyof TrainingDay, val: any) => { const newDays = [...data.trainingDays]; newDays[index] = { ...newDays[index], [field]: val }; handleChange('trainingDays', newDays); };
  const addExercise = (dayIndex: number) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises.push({ id: Date.now().toString(), name: '', sets: '' }); handleChange('trainingDays', newDays); };
  const removeExercise = (dayIndex: number, exIndex: number) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises.splice(exIndex, 1); handleChange('trainingDays', newDays); };
  const updateExercise = (dayIndex: number, exIndex: number, field: keyof Exercise, val: string) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises[exIndex] = { ...newDays[dayIndex].exercises[exIndex], [field]: val }; handleChange('trainingDays', newDays); };

  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const selectClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all appearance-none cursor-pointer";
  const textAreaClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all min-h-[120px] resize-y";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4 mt-8 first:mt-0";
  const addButtonClass = "w-full py-4 border border-dashed border-white/20 rounded-xl text-white/40 font-black uppercase text-[10px] tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all flex items-center justify-center gap-2";

  const btnBase = "px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap text-xs font-black uppercase tracking-widest";
  const btnVisualizarClass = `${btnBase} bg-[#d4af37] hover:bg-[#b5952f] text-black`;
  const btnPdfClass = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-white/5`;
  const btnClearClass = `${btnBase} bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20`;

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => onTabChange(id)}
      className={`flex flex-1 md:flex-none justify-center items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[120px] ${activeTab === id ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 scale-105' : 'bg-white/5 text-white/40 hover:text-white'}`}
    >
      <Icon size={14} className="shrink-0" /> {label}
    </button>
  );

  return (
    <div className="space-y-8 no-print w-full">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors mb-4">
          <ChevronLeft size={16} /> Voltar
        </button>
      )}

      {!hideTabs && (
        <div className="flex flex-nowrap md:justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide w-full">
            <TabButton id="identificacao" label="Identificação" icon={User} />
            <TabButton id="anamnese" label="Anamnese" icon={BookOpen} />
            <TabButton id="medidas" label="Medidas" icon={Ruler} />
            <TabButton id="nutricao" label="Nutrição" icon={Utensils} />
            <TabButton id="treino" label="Treino" icon={Dumbbell} />
        </div>
      )}

      {activeTab === 'identificacao' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
           <section>
            <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><ShieldCheck size={120} /></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><User size={32} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identificação & Contrato</h2>
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Dados Pessoais e Jurídicos</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2 items-center">
                    <button onClick={() => contractRef.current?.download()} className={btnPdfClass}>
                        <FileDown size={14} /> Salvar PDF
                    </button>
                    <ContractPreview ref={contractRef} data={data} customTrigger={
                        <button className={btnVisualizarClass}>
                            <FileText size={18} /> Visualizar
                        </button>
                    } />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-1 md:col-span-2">
                 <div><label className={labelClass}>WhatsApp</label><input className={inputClass} value={data.contract.phone} onChange={(e) => handlePhoneMask('contract.phone', e.target.value)} placeholder="(00) 00000-0000" maxLength={15} /></div>
                 <div><label className={labelClass}>CPF</label><input className={inputClass} value={data.contract.cpf} onChange={(e) => handleCPFMask('contract.cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} /></div>
                 <div><label className={labelClass}>E-mail</label><input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} placeholder="aluno@email.com" /></div>
              </div>
              
              <div className="md:col-span-2 border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4 text-[#d4af37]"><MapPin size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Endereço</span></div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-4"><label className={labelClass}>Rua / Logradouro</label><input className={inputClass} value={data.contract.street} onChange={(e) => handleChange('contract.street', e.target.value)} /></div>
                  <div className="col-span-1 md:col-span-2"><label className={labelClass}>Número</label><input className={inputClass} value={data.contract.number} onChange={(e) => handleChange('contract.number', e.target.value)} /></div>
                  <div className="col-span-1 md:col-span-2"><label className={labelClass}>Bairro</label><input className={inputClass} value={data.contract.neighborhood} onChange={(e) => handleChange('contract.neighborhood', e.target.value)} /></div>
                  <div className="md:col-span-3"><label className={labelClass}>Cidade</label><input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} placeholder="Cidade" /></div>
                  <div className="md:col-span-1">
                    <label className={labelClass}>UF</label>
                    <select className={selectClass} value={data.contract.state} onChange={(e) => handleChange('contract.state', e.target.value)}>
                      <option value="">--</option>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className={sectionHeaderClass}>
              <ShieldCheck className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Contrato e Pagamento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Tipo de Plano</label>
                <select className={selectClass} value={data.contract.planType} onChange={(e) => handleChange('contract.planType', e.target.value)}>
                  <option value="Avulso">Avulso (1 Dia)</option>
                  <option value="Trimestral">Trimestral (3 Meses)</option>
                  <option value="Semestral">Semestral (6 Meses)</option>
                </select>
              </div>
              <div className="col-span-2 hidden lg:block"></div>

              <div><label className={labelClass}>Início</label><input className={inputClass} value={data.contract.startDate} onChange={(e) => handleDateInput('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" maxLength={10} /></div>
              <div><label className={labelClass}>Término</label><input className={inputClass + " opacity-60"} value={data.contract.endDate} readOnly /></div>
              
              <div className="col-span-1 md:col-span-2"><label className={labelClass}>Valor (R$)</label><input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" /></div>
              <div className="col-span-1 md:col-span-4"><label className={labelClass}>Extenso</label><input className={inputClass + " opacity-60 italic bg-transparent border-none"} value={data.contract.planValueWords} readOnly /></div>
              
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Pagamento</label>
                <select className={selectClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
                  <option value="Pix">Pix (À vista)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {activeTab === 'anamnese' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
            <section>
                <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><BookOpen size={120} /></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><Activity size={32} strokeWidth={2.5} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Anamnese Completa</h2>
                            <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Histórico e Objetivos</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-2 items-center">
                        <button onClick={() => anamnesisRef.current?.download()} className={btnPdfClass}>
                            <FileDown size={14} /> Salvar PDF
                        </button>
                        <AnamnesisPreview ref={anamnesisRef} data={data} customTrigger={
                            <button className={btnVisualizarClass}>
                                <FileText size={18} /> Visualizar
                            </button>
                        } />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div><label className={labelClass}>Objetivo Principal</label><input className={inputClass} value={data.anamnesis?.mainObjective || ''} onChange={(e) => handleChange('anamnesis.mainObjective', e.target.value)} /></div>
                    <div><label className={labelClass}>Rotina Diária</label><textarea className={textAreaClass} value={data.anamnesis?.routine || ''} onChange={(e) => handleChange('anamnesis.routine', e.target.value)} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Histórico Treino/Dieta</label><textarea className={textAreaClass} value={data.anamnesis?.trainingHistory || ''} onChange={(e) => handleChange('anamnesis.trainingHistory', e.target.value)} /></div>
                        <div><label className={labelClass}>Preferências Alimentares</label><textarea className={textAreaClass} value={data.anamnesis?.foodPreferences || ''} onChange={(e) => handleChange('anamnesis.foodPreferences', e.target.value)} /></div>
                    </div>
                    <div><label className={labelClass}>Ergogênicos / Medicamentos</label><textarea className={textAreaClass + " min-h-[80px]"} value={data.anamnesis?.ergogenics || ''} onChange={(e) => handleChange('anamnesis.ergogenics', e.target.value)} /></div>
                </div>
            </section>
        </div>
      )}

      {activeTab === 'medidas' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          <section>
            <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Activity size={120} /></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><Activity size={32} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Bioimpedância & Composição</h2>
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Dados Físicos do Aluno</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2 items-center">
                    <button onClick={() => protocolRef.current?.download()} className={btnPdfClass}>
                        <FileDown size={14} /> Salvar PDF
                    </button>
                    <ProtocolPreview ref={protocolRef} data={data} customTrigger={
                        <button className={btnVisualizarClass}>
                            <FileText size={18} /> Visualizar
                        </button>
                    } />
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Objetivo</label>
                <select className={selectClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)}>
                    <option value="">Selecione</option>
                    {Object.keys(PROTOCOL_TEMPLATES).map((key) => (
                        <option key={key} value={PROTOCOL_TEMPLATES[key as keyof typeof PROTOCOL_TEMPLATES].title}>{PROTOCOL_TEMPLATES[key as keyof typeof PROTOCOL_TEMPLATES].title}</option>
                    ))}
                </select>
              </div>
              <div><label className={labelClass}>Data Avaliação</label><input className={inputClass} value={data.physicalData.date} onChange={(e) => handleDateInput('physicalData.date', e.target.value)} placeholder="DD/MM/AAAA" maxLength={10} /></div>
              <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Gênero</label>
                <select className={selectClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleWeightMask('physicalData.weight', e.target.value)} placeholder="00,00" inputMode="numeric"/></div>
              <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleHeightMask('physicalData.height', e.target.value)} placeholder="1,75" inputMode="decimal"/></div>
              <div className="col-span-2 md:col-span-1"><label className={labelClass}>IMC</label><input className={inputClass + " opacity-60"} value={data.physicalData.imc} readOnly /></div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6"><Ruler className="text-[#d4af37]" size={16} /><h3 className="text-sm font-black text-white uppercase tracking-widest">Medidas (cm)</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                      <div key={key}>
                          <label className={labelClass}>{label}</label>
                          <input 
                            className={inputClass} 
                            value={(data.physicalData.measurements as any)[key] || ''} 
                            onChange={(e) => handleChange(`physicalData.measurements.${key}`, e.target.value)} 
                          />
                      </div>
                  ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'nutricao' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          <section>
            <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Utensils size={120} /></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><Utensils size={32} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Planejamento Alimentar</h2>
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Dieta & Suplementação</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2 items-center">
                    <button onClick={() => protocolRef.current?.download()} className={btnPdfClass}>
                        <FileDown size={14} /> Salvar PDF
                    </button>
                    <ProtocolPreview ref={protocolRef} data={data} customTrigger={
                        <button className={btnVisualizarClass}>
                            <FileText size={18} /> Visualizar
                        </button>
                    } />
                </div>
            </div>

            <div>
              <label className={labelClass}>Linha de raciocínio da dieta</label>
              <textarea className={textAreaClass} value={data.nutritionalStrategy} onChange={(e) => handleChange('nutritionalStrategy', e.target.value)} placeholder="Ex: Dieta Cetogênica..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div><label className={labelClass}>Meta Calórica</label><input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} placeholder="Ex: 2500" /></div>
              <div><label className={labelClass}>Frequência Treino</label><input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5x" /></div>
              <div className="relative"><label className={labelClass}>Meta Água (L)</label><input className={inputClass} value={data.waterGoal} onChange={(e) => handleChange('waterGoal', e.target.value)} placeholder="Ex: 4,0" /><Droplets size={16} className="absolute right-4 top-9 text-[#d4af37] opacity-50" /></div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#d4af37]/10 to-transparent p-6 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] blur-[80px] opacity-10"></div>
            {isGenerating && (
               <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                  <Loader2 size={40} className="text-[#d4af37] animate-spin mb-2" />
                  <p className="text-[#d4af37] font-black uppercase tracking-widest text-xs animate-pulse">CRIANDO PROTOCOLO...</p>
               </div>
            )}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#d4af37] text-black rounded-xl shrink-0"><Sparkles size={24} /></div>
                  <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerador de Protocolo IA</h3>
                      <p className="text-sm text-white/60 max-w-lg">A IA usará os dados de anamnese e medidas para criar um plano otimizado.</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleClearNutrition} className={btnClearClass}><Eraser size={14} /> Limpar</button>
                    <button onClick={handleGenerateAI} disabled={isGenerating} className="px-8 py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center whitespace-nowrap h-auto">{isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}{isGenerating ? 'Gerando...' : 'Gerar com IA'}</button>
                </div>
            </div>
          </section>

          <section>
            <div className={sectionHeaderClass}><Activity className="text-[#d4af37]" size={20} /><h2 className="text-xl font-black text-white uppercase tracking-tighter">Macronutrientes</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2"><label className={labelClass}>Proteínas</label></div>
                <div className="flex gap-2"><input className={inputClass} value={data.macros.protein.value} onChange={(e) => handleChange('macros.protein.value', e.target.value)} placeholder="180" /><input className={inputClass} value={data.macros.protein.ratio} onChange={(e) => handleChange('macros.protein.ratio', e.target.value)} placeholder="2.0" /></div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2"><label className={labelClass}>Carboidratos</label></div>
                <div className="flex gap-2"><input className={inputClass} value={data.macros.carbs.value} onChange={(e) => handleChange('macros.carbs.value', e.target.value)} placeholder="250" /><input className={inputClass} value={data.macros.carbs.ratio} onChange={(e) => handleChange('macros.carbs.ratio', e.target.value)} placeholder="3.0" /></div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2"><label className={labelClass}>Gorduras</label></div>
                <div className="flex gap-2"><input className={inputClass} value={data.macros.fats.value} onChange={(e) => handleChange('macros.fats.value', e.target.value)} placeholder="60" /><input className={inputClass} value={data.macros.fats.ratio} onChange={(e) => handleChange('macros.fats.ratio', e.target.value)} placeholder="0.8" /></div>
              </div>
            </div>
          </section>

          <section>
            <div className={sectionHeaderClass}><Activity className="text-[#d4af37]" size={20} /><h2 className="text-xl font-black text-white uppercase tracking-tighter">Refeições</h2></div>
            <div className="space-y-4">
              {data.meals.map((meal, index) => (
                <div key={meal.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-start group">
                    <div className="w-full md:w-1/4"><label className={labelClass}>Horário</label><input className={inputClass} value={meal.time} onChange={(e) => updateMealTime(index, e.target.value)} placeholder="08:00" maxLength={5}/></div>
                    <div className="flex-1 w-full"><label className={labelClass}>Nome</label><input className={inputClass + " mb-2"} value={meal.name} onChange={(e) => updateMeal(index, 'name', e.target.value)} /><textarea className={inputClass + " min-h-[60px]"} value={meal.details} onChange={(e) => updateMeal(index, 'details', e.target.value)} /></div>
                    <button onClick={() => removeMeal(index)} className="mt-0 md:mt-6 w-full md:w-auto p-2 text-red-500 hover:text-red-500 transition-colors flex justify-center items-center"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addMeal} className={addButtonClass}><Plus size={16} /> Adicionar Refeição</button>
            </div>
          </section>

          <section>
            <div className={sectionHeaderClass}><Pill className="text-[#d4af37]" size={20} /><h2 className="text-xl font-black text-white uppercase tracking-tighter">Suplementação</h2></div>
            <div className="space-y-4">
              {data.supplements.map((supp, index) => (
                <div key={supp.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-end group">
                    <div className="flex-1 w-full"><label className={labelClass}>Nome</label><input className={inputClass} value={supp.name} onChange={(e) => updateSupplement(index, 'name', e.target.value)} placeholder="Creatina" /></div>
                    <div className="w-full md:w-1/4"><label className={labelClass}>Dose</label><input className={inputClass} value={supp.dosage} onChange={(e) => updateSupplement(index, 'dosage', e.target.value)} placeholder="5g" /></div>
                    <div className="w-full md:w-1/3"><label className={labelClass}>Horário</label><input className={inputClass} value={supp.timing} onChange={(e) => updateSupplement(index, 'timing', e.target.value)} placeholder="Pós-treino" /></div>
                    <button onClick={() => removeSupplement(index)} className="w-full md:w-auto p-3 text-red-500 hover:text-red-500 transition-colors flex justify-center"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addSupplement} className={addButtonClass}><Plus size={16} /> Adicionar Suplementação</button>
            </div>
          </section>

          <section>
            <div className={sectionHeaderClass}><Lightbulb className="text-[#d4af37]" size={20} /><h2 className="text-xl font-black text-white uppercase tracking-tighter">Dicas e Recomendações</h2></div>
            <div className="space-y-3">
              {(data.tips || []).map((tip, index) => (
                <div key={index} className="flex gap-3 items-center group">
                    <div className="w-8 h-12 md:h-14 bg-[#d4af37]/10 text-[#d4af37] rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-[#d4af37]/20">
                        {index + 1}
                    </div>
                    <textarea 
                        className={inputClass + " min-h-[50px] md:min-h-[60px] resize-none"} 
                        value={tip} 
                        onChange={(e) => updateTip(index, e.target.value)} 
                        placeholder="Escreva uma dica..."
                    />
                    <button onClick={() => removeTip(index)} className="p-3 text-white/20 hover:text-red-500 transition-colors bg-white/5 rounded-xl hover:bg-red-500/10"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addTip} className={addButtonClass}><Plus size={16} /> Adicionar Nova Dica</button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'treino' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          <section>
            <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Dumbbell size={120} /></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><Dumbbell size={32} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Programação de Treinos</h2>
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Periodização e Exercícios</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2 items-center">
                    <button onClick={handleClearTraining} className={btnClearClass}><Eraser size={14} /> Limpar</button>
                    <button onClick={() => protocolRef.current?.download()} className={btnPdfClass}>
                        <FileDown size={14} /> Salvar PDF
                    </button>
                    <ProtocolPreview ref={protocolRef} data={data} customTrigger={
                        <button className={btnVisualizarClass}>
                            <FileText size={18} /> Visualizar
                        </button>
                    } />
                </div>
            </div>

            <div className="mb-6"><label className={labelClass}>Frequência Semanal</label><input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5x na semana" /></div>
            <div className="space-y-8">
              {data.trainingDays.map((day, dIndex) => (
                <div key={day.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-white/5 pb-4 gap-4 md:gap-0">
                      <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                          <div className="w-full md:w-1/3"><label className={labelClass}>Título</label><input className={inputClass} value={day.title} onChange={(e) => updateTrainingDay(dIndex, 'title', e.target.value)} placeholder="Treino A" /></div>
                          <div className="flex-1 w-full"><label className={labelClass}>Foco</label><input className={inputClass} value={day.focus} onChange={(e) => updateTrainingDay(dIndex, 'focus', e.target.value)} placeholder="Peito e Tríceps" /></div>
                      </div>
                      <button onClick={() => removeTrainingDay(dIndex)} className="ml-0 md:ml-4 p-2 text-red-500 hover:text-red-500 w-full md:w-auto flex justify-center"><Trash2 size={20} /></button>
                    </div>
                    <div className="space-y-2 pl-0 md:pl-4 border-l-0 md:border-l-2 border-white/5">
                      {day.exercises.map((ex, exIndex) => (
                        <div key={ex.id} className="flex gap-2 md:gap-4 items-center">
                            <input className={inputClass + " py-2 text-xs"} value={ex.name} onChange={(e) => updateExercise(dIndex, exIndex, 'name', e.target.value)} placeholder="Exercício" />
                            <input className={inputClass + " py-2 text-xs w-20 md:w-32"} value={ex.sets} onChange={(e) => updateExercise(dIndex, exIndex, 'sets', e.target.value)} placeholder="Séries" />
                            <button onClick={() => removeExercise(dIndex, exIndex)} className="text-white/20 hover:text-red-500 p-2"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => addExercise(dIndex)} className="mt-2 text-[10px] font-bold text-[#d4af37] uppercase tracking-widest hover:underline flex items-center gap-1"><Plus size={10} /> Add Exercício</button>
                    </div>
                </div>
              ))}
              <button onClick={addTrainingDay} className={addButtonClass}><Plus size={16} /> Novo Bloco de Treino</button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};

export default ProtocolForm;
