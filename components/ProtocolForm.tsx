
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay, Exercise } from '../types';
import { Activity, User, ShieldCheck, ChevronLeft, MapPin, Dumbbell, Utensils, Pill, Plus, Trash2, FileText, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // --- LÓGICA DO GERADOR IA ---
  const handleGenerateAI = async () => {
    if (!data.protocolTitle || !data.physicalData.weight) {
      alert("Por favor, preencha pelo menos o 'Objetivo do Protocolo' e 'Peso' na seção acima para gerar.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCdc2gt-S321N9qjNU3ZK4vHxPuTeOrVbA" });
      
      const prompt = `
        Você é um treinador de elite e nutricionista esportivo (Estilo Team VBR).
        Com base nos dados do aluno abaixo, gere um protocolo completo em formato JSON.

        DADOS DO ALUNO:
        - Nome: ${data.clientName}
        - Objetivo: ${data.protocolTitle}
        - Gênero: ${data.physicalData.gender}
        - Idade: ${data.physicalData.age}
        - Peso: ${data.physicalData.weight}kg
        - Altura: ${data.physicalData.height}m
        - Gordura Corporal: ${data.physicalData.bodyFat}%
        - Massa Muscular: ${data.physicalData.muscleMass}kg

        Gere um JSON com a seguinte estrutura estrita (não inclua markdown, apenas o JSON):
        {
          "nutritionalStrategy": "Texto explicando a estratégia da dieta (ex: Ciclo de carboidratos...)",
          "kcalGoal": "Ex: 2500",
          "kcalSubtext": "Ex: Déficit Calórico Moderado",
          "macros": {
            "protein": { "value": "Ex: 180", "ratio": "2g/kg" },
            "carbs": { "value": "Ex: 250", "ratio": "3g/kg" },
            "fats": { "value": "Ex: 60", "ratio": "0.8g/kg" }
          },
          "meals": [
            { "id": "1", "time": "08:00", "name": "Café da Manhã", "details": "Detalhes dos alimentos..." }
          ],
          "supplements": [
             { "id": "1", "name": "Creatina", "dosage": "5g", "timing": "Pós-treino" }
          ],
          "trainingFrequency": "Ex: 5x na semana",
          "trainingDays": [
            {
              "id": "1",
              "title": "Treino A",
              "focus": "Peito e Tríceps",
              "exercises": [
                 { "id": "1", "name": "Supino Reto", "sets": "4x 12-10-8-6" }
              ]
            }
          ],
          "generalObservations": "Recomendações finais de cardio, hidratação, etc."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text;
      if (textResponse) {
        const generatedData = JSON.parse(textResponse);

        // Mesclar dados gerados com os dados atuais
        const newData = {
          ...data,
          nutritionalStrategy: generatedData.nutritionalStrategy || data.nutritionalStrategy,
          kcalGoal: generatedData.kcalGoal || data.kcalGoal,
          kcalSubtext: generatedData.kcalSubtext || data.kcalSubtext,
          macros: generatedData.macros || data.macros,
          meals: generatedData.meals ? generatedData.meals.map((m: any, i: number) => ({ ...m, id: Date.now().toString() + i })) : [],
          supplements: generatedData.supplements ? generatedData.supplements.map((s: any, i: number) => ({ ...s, id: Date.now().toString() + i })) : [],
          trainingFrequency: generatedData.trainingFrequency || data.trainingFrequency,
          trainingDays: generatedData.trainingDays ? generatedData.trainingDays.map((d: any, i: number) => ({
             ...d, 
             id: Date.now().toString() + i,
             exercises: d.exercises ? d.exercises.map((e: any, j: number) => ({ ...e, id: Date.now().toString() + i + j })) : []
          })) : [],
          generalObservations: generatedData.generalObservations || data.generalObservations
        };
        
        onChange(newData);
        alert("Protocolo gerado com sucesso pela IA!");
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("Erro ao gerar protocolo. Verifique a conexão ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LÓGICA DE CÁLCULO DE DATA DE TÉRMINO ---
  useEffect(() => {
    if (data.contract.startDate && data.contract.planType) {
      const parts = data.contract.startDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS meses são 0-indexado
        const year = parseInt(parts[2]);
        
        const dateObj = new Date(year, month, day);
        
        if (!isNaN(dateObj.getTime())) {
          // Adiciona meses baseado no plano
          const monthsToAdd = data.contract.planType === 'Trimestral' ? 3 : 6;
          dateObj.setMonth(dateObj.getMonth() + monthsToAdd);
          
          const endDay = String(dateObj.getDate()).padStart(2, '0');
          const endMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
          const endYear = dateObj.getFullYear();
          
          const newEndDate = `${endDay}/${endMonth}/${endYear}`;
          
          // Calcula diferença de dias
          const startObj = new Date(year, month, day);
          const diffTime = Math.abs(dateObj.getTime() - startObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (data.contract.endDate !== newEndDate || data.contract.durationDays !== String(diffDays)) {
             const newData = { ...data };
             newData.contract.endDate = newEndDate;
             newData.contract.durationDays = String(diffDays);
             onChange(newData);
          }
        }
      }
    }
  }, [data.contract.startDate, data.contract.planType]);

  // --- LÓGICA DE CÁLCULO DE IMC ---
  useEffect(() => {
    const w = parseFloat(data.physicalData.weight.replace(',', '.'));
    const h = parseFloat(data.physicalData.height.replace(',', '.'));
    
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const imc = (w / (h * h)).toFixed(2).replace('.', ',');
      if (data.physicalData.imc !== imc) {
        handleChange('physicalData.imc', imc);
      }
    }
  }, [data.physicalData.weight, data.physicalData.height]);

  // --- LÓGICA DE PARCELAS NO PIX ---
  useEffect(() => {
    if (data.contract.paymentMethod === 'Pix' && data.contract.installments !== '1') {
      handleChange('contract.installments', '1');
    }
  }, [data.contract.paymentMethod]);

  // --- LÓGICA DE VALOR POR EXTENSO ---
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
      if (data.contract.planValueWords !== extenso) {
        handleChange('contract.planValueWords', extenso);
      }
    }
  }, [data.contract.planValue]);

  const handleChange = (path: string, value: any) => {
    const newData = { ...data };
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  // --- HANDLERS PARA LISTAS DINÂMICAS ---

  const addMeal = () => {
    const newMeal: Meal = { id: Date.now().toString(), time: '', name: '', details: '' };
    handleChange('meals', [...data.meals, newMeal]);
  };
  const removeMeal = (index: number) => {
    const newMeals = [...data.meals];
    newMeals.splice(index, 1);
    handleChange('meals', newMeals);
  };
  const updateMeal = (index: number, field: keyof Meal, val: string) => {
    const newMeals = [...data.meals];
    newMeals[index] = { ...newMeals[index], [field]: val };
    handleChange('meals', newMeals);
  };

  const addSupplement = () => {
    const newSupp: Supplement = { id: Date.now().toString(), name: '', dosage: '', timing: '' };
    handleChange('supplements', [...data.supplements, newSupp]);
  };
  const removeSupplement = (index: number) => {
    const newSupps = [...data.supplements];
    newSupps.splice(index, 1);
    handleChange('supplements', newSupps);
  };
  const updateSupplement = (index: number, field: keyof Supplement, val: string) => {
    const newSupps = [...data.supplements];
    newSupps[index] = { ...newSupps[index], [field]: val };
    handleChange('supplements', newSupps);
  };

  const addTrainingDay = () => {
    const newDay: TrainingDay = { id: Date.now().toString(), title: '', focus: '', exercises: [] };
    handleChange('trainingDays', [...data.trainingDays, newDay]);
  };
  const removeTrainingDay = (index: number) => {
    const newDays = [...data.trainingDays];
    newDays.splice(index, 1);
    handleChange('trainingDays', newDays);
  };
  const updateTrainingDay = (index: number, field: keyof TrainingDay, val: any) => {
    const newDays = [...data.trainingDays];
    newDays[index] = { ...newDays[index], [field]: val };
    handleChange('trainingDays', newDays);
  };
  const addExercise = (dayIndex: number) => {
    const newDays = [...data.trainingDays];
    newDays[dayIndex].exercises.push({ id: Date.now().toString(), name: '', sets: '' });
    handleChange('trainingDays', newDays);
  };
  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...data.trainingDays];
    newDays[dayIndex].exercises.splice(exIndex, 1);
    handleChange('trainingDays', newDays);
  };
  const updateExercise = (dayIndex: number, exIndex: number, field: keyof Exercise, val: string) => {
    const newDays = [...data.trainingDays];
    newDays[dayIndex].exercises[exIndex] = { ...newDays[dayIndex].exercises[exIndex], [field]: val };
    handleChange('trainingDays', newDays);
  };

  // ESTILOS GERAIS
  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const selectClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all appearance-none cursor-pointer";
  const textAreaClass = "w-full p-4 bg-[#111] border border-white/5 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all min-h-[120px] resize-y";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4 mt-8 first:mt-0";
  const addButtonClass = "w-full py-4 border border-dashed border-white/20 rounded-xl text-white/40 font-black uppercase text-[10px] tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all flex items-center justify-center gap-2";

  return (
    <div className="space-y-10 no-print">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors">
          <ChevronLeft size={16} /> Voltar
        </button>
      )}

      {/* BLOCO 1: IDENTIFICAÇÃO */}
      <section>
        <div className={sectionHeaderClass}>
          <User className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} /></div>
          <div><label className={labelClass}>WhatsApp / Celular</label><input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" /></div>
          <div><label className={labelClass}>CPF</label><input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} placeholder="000.000.000-00" /></div>
          
          <div className="md:col-span-2 border-t border-white/5 pt-4 mt-2">
            <div className="flex items-center gap-2 mb-4 text-[#d4af37]"><MapPin size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Endereço</span></div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-4"><label className={labelClass}>Rua / Logradouro</label><input className={inputClass} value={data.contract.street} onChange={(e) => handleChange('contract.street', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Número</label><input className={inputClass} value={data.contract.number} onChange={(e) => handleChange('contract.number', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Bairro</label><input className={inputClass} value={data.contract.neighborhood} onChange={(e) => handleChange('contract.neighborhood', e.target.value)} /></div>
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

      {/* BLOCO 2: CONTRATO & FINANCEIRO */}
      <section>
        <div className={sectionHeaderClass}>
          <ShieldCheck className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Contrato & Financeiro</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Tipo de Plano</label>
            <select className={selectClass} value={data.contract.planType} onChange={(e) => handleChange('contract.planType', e.target.value)}>
              <option value="Trimestral">Trimestral (3 Meses)</option>
              <option value="Semestral">Semestral (6 Meses)</option>
            </select>
          </div>
          <div className="col-span-2 hidden md:block"></div>

          <div><label className={labelClass}>Início</label><input className={inputClass} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" /></div>
          <div><label className={labelClass}>Término (Automático)</label><input className={inputClass + " opacity-60"} value={data.contract.endDate} readOnly /></div>
          
          <div className="col-span-2"><label className={labelClass}>Valor do Plano (R$)</label><input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" /></div>
          <div className="md:col-span-4"><label className={labelClass}>Valor por Extenso (Automático)</label><input className={inputClass + " opacity-60 italic bg-transparent border-none"} value={data.contract.planValueWords} readOnly /></div>
          
          <div className="col-span-2">
            <label className={labelClass}>Método de Pagamento</label>
            <select className={selectClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
              <option value="Pix">Pix (À vista)</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
            </select>
          </div>
          
          {data.contract.paymentMethod === 'Cartão de Crédito' && (
            <div className="col-span-2 animate-in fade-in"><label className={labelClass}>Parcelas</label><input className={inputClass} type="number" value={data.contract.installments} onChange={(e) => handleChange('contract.installments', e.target.value)} /></div>
          )}
        </div>
      </section>

      {/* BLOCO 3: BIOIMPEDÂNCIA & COMPOSIÇÃO */}
      <section>
        <div className={sectionHeaderClass}>
          <Activity className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Bioimpedância & Composição</h2>
        </div>
        
        {/* Linha 1: Dados Pessoais Básicos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
           <div className="md:col-span-2">
             <label className={labelClass}>Objetivo do Protocolo</label>
             <input className={inputClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)} placeholder="Ex: Hipertrofia, Emagrecimento" />
           </div>
           <div>
             <label className={labelClass}>Data Avaliação</label>
             <input className={inputClass} value={data.physicalData.date} onChange={(e) => handleChange('physicalData.date', e.target.value)} placeholder="DD/MM/AAAA" />
           </div>
           <div>
             <label className={labelClass}>Idade</label>
             <input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} />
           </div>
        </div>

        {/* Linha 2: Antropometria */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
           <div>
             <label className={labelClass}>Gênero</label>
             <select className={selectClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
               <option value="Masculino">Masculino</option>
               <option value="Feminino">Feminino</option>
             </select>
           </div>
           <div>
             <label className={labelClass}>Peso Atual (kg)</label>
             <input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} placeholder="0.0" />
           </div>
           <div>
             <label className={labelClass}>Altura (m)</label>
             <input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} placeholder="0.00" />
           </div>
           <div>
             <label className={labelClass}>IMC (Calc. Auto)</label>
             <input className={inputClass + " opacity-60"} value={data.physicalData.imc} readOnly />
           </div>
        </div>

        {/* Linha 3: Composição Corporal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
             <label className={labelClass}>Gordura Corporal (%)</label>
             <input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} />
           </div>
           <div>
             <label className={labelClass}>Massa Muscular (kg)</label>
             <input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} />
           </div>
           <div>
             <label className={labelClass}>Gordura Visceral</label>
             <input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} />
           </div>
           <div>
             <label className={labelClass}>Água Corporal (%)</label>
             <input className={inputClass} value={data.physicalData.waterPercentage || ''} onChange={(e) => handleChange('physicalData.waterPercentage', e.target.value)} />
           </div>
        </div>
      </section>

      {/* BLOCO IA: GERADOR AUTOMÁTICO */}
      <section className="bg-gradient-to-r from-[#d4af37]/10 to-transparent p-6 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] blur-[80px] opacity-10"></div>
         
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-[#d4af37] text-black rounded-xl">
                 <Sparkles size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerador de Protocolo IA</h3>
                  <p className="text-sm text-white/60 max-w-lg">
                    Preencha os dados de bioimpedância acima e clique para gerar automaticamente a dieta, treino e suplementação personalizados.
                  </p>
               </div>
            </div>
            
            <button 
              onClick={handleGenerateAI} 
              disabled={isGenerating}
              className="px-8 py-4 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'Gerando Inteligência...' : 'Gerar Protocolo Agora'}
            </button>
         </div>
      </section>

      {/* BLOCO 4: ESTRATÉGIA NUTRICIONAL */}
      <section>
        <div className={sectionHeaderClass}>
           <Utensils className="text-[#d4af37]" size={20} />
           <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estratégia Nutricional</h2>
        </div>
        <div>
           <label className={labelClass}>Descreva a linha de raciocínio da dieta...</label>
           <textarea 
             className={textAreaClass}
             value={data.nutritionalStrategy}
             onChange={(e) => handleChange('nutritionalStrategy', e.target.value)}
             placeholder="Ex: Ciclo de carboidratos com foco em refeed nos dias de perna..."
           />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
           <div>
              <label className={labelClass}>Meta Calórica (Kcal)</label>
              <input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} />
           </div>
           <div>
              <label className={labelClass}>Subtexto da Meta</label>
              <input className={inputClass} value={data.kcalSubtext} onChange={(e) => handleChange('kcalSubtext', e.target.value)} />
           </div>
        </div>
      </section>

      {/* BLOCO 5: DISTRIBUIÇÃO DE REFEIÇÕES */}
      <section>
        <div className={sectionHeaderClass}>
           <Activity className="text-[#d4af37]" size={20} />
           <h2 className="text-xl font-black text-white uppercase tracking-tighter">Distribuição de Refeições</h2>
        </div>
        <div className="space-y-4">
           {data.meals.map((meal, index) => (
             <div key={meal.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 items-start group">
                <div className="w-1/4">
                   <label className={labelClass}>Horário</label>
                   <input className={inputClass} value={meal.time} onChange={(e) => updateMeal(index, 'time', e.target.value)} placeholder="08:00" />
                </div>
                <div className="flex-1">
                   <label className={labelClass}>Nome da Refeição</label>
                   <input className={inputClass + " mb-2"} value={meal.name} onChange={(e) => updateMeal(index, 'name', e.target.value)} placeholder="Café da Manhã" />
                   <textarea className={inputClass + " min-h-[60px]"} value={meal.details} onChange={(e) => updateMeal(index, 'details', e.target.value)} placeholder="Detalhes dos alimentos..." />
                </div>
                <button onClick={() => removeMeal(index)} className="mt-6 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
             </div>
           ))}
           <button onClick={addMeal} className={addButtonClass}>
              <Plus size={16} /> Adicionar Refeição
           </button>
        </div>
      </section>

      {/* BLOCO 6: SUPLEMENTAÇÃO */}
      <section>
        <div className={sectionHeaderClass}>
          <Pill className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Suplementação</h2>
        </div>
        <div className="space-y-4">
           {data.supplements.map((supp, index) => (
             <div key={supp.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-end group">
                <div className="flex-1 w-full">
                   <label className={labelClass}>Nome</label>
                   <input className={inputClass} value={supp.name} onChange={(e) => updateSupplement(index, 'name', e.target.value)} placeholder="Creatina" />
                </div>
                <div className="w-full md:w-1/4">
                   <label className={labelClass}>Dose</label>
                   <input className={inputClass} value={supp.dosage} onChange={(e) => updateSupplement(index, 'dosage', e.target.value)} placeholder="5g" />
                </div>
                <div className="w-full md:w-1/3">
                   <label className={labelClass}>Horário</label>
                   <input className={inputClass} value={supp.timing} onChange={(e) => updateSupplement(index, 'timing', e.target.value)} placeholder="Pós-treino" />
                </div>
                <button onClick={() => removeSupplement(index)} className="p-3 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
             </div>
           ))}
           <button onClick={addSupplement} className={addButtonClass}>
              <Plus size={16} /> Adicionar Suplementação
           </button>
        </div>
      </section>

      {/* BLOCO 7: DIVISÃO DE TREINOS */}
      <section>
        <div className={sectionHeaderClass}>
          <Dumbbell className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Divisão de Treinos</h2>
        </div>
        <div className="mb-6">
           <label className={labelClass}>Frequência Semanal</label>
           <input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5x na semana" />
        </div>
        <div className="space-y-8">
           {data.trainingDays.map((day, dIndex) => (
             <div key={day.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                   <div className="flex gap-4 flex-1">
                      <div className="w-1/3">
                        <label className={labelClass}>Título do Treino</label>
                        <input className={inputClass} value={day.title} onChange={(e) => updateTrainingDay(dIndex, 'title', e.target.value)} placeholder="Treino A" />
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>Foco Muscular</label>
                        <input className={inputClass} value={day.focus} onChange={(e) => updateTrainingDay(dIndex, 'focus', e.target.value)} placeholder="Peito e Tríceps" />
                      </div>
                   </div>
                   <button onClick={() => removeTrainingDay(dIndex)} className="ml-4 text-white/20 hover:text-red-500"><Trash2 size={20} /></button>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-white/5">
                   {day.exercises.map((ex, exIndex) => (
                     <div key={ex.id} className="flex gap-4 items-center">
                        <input className={inputClass + " py-2 text-xs"} value={ex.name} onChange={(e) => updateExercise(dIndex, exIndex, 'name', e.target.value)} placeholder="Nome do Exercício" />
                        <input className={inputClass + " py-2 text-xs w-32"} value={ex.sets} onChange={(e) => updateExercise(dIndex, exIndex, 'sets', e.target.value)} placeholder="Séries/Reps" />
                        <button onClick={() => removeExercise(dIndex, exIndex)} className="text-white/20 hover:text-red-500"><Trash2 size={14} /></button>
                     </div>
                   ))}
                   <button onClick={() => addExercise(dIndex)} className="mt-2 text-[10px] font-bold text-[#d4af37] uppercase tracking-widest hover:underline flex items-center gap-1">
                      <Plus size={10} /> Add Exercício
                   </button>
                </div>
             </div>
           ))}
           <button onClick={addTrainingDay} className={addButtonClass}>
              <Plus size={16} /> Novo Bloco de Treino
           </button>
        </div>
      </section>

      {/* BLOCO 8: OBSERVAÇÕES */}
      <section>
        <div className={sectionHeaderClass}>
          <AlertCircle className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Observação</h2>
        </div>
        <textarea 
             className={textAreaClass}
             value={data.generalObservations}
             onChange={(e) => handleChange('generalObservations', e.target.value)}
             placeholder="Recomendações finais para o aluno..."
           />
      </section>

    </div>
  );
};

export default ProtocolForm;
