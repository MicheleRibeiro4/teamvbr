
import React, { useEffect, useState } from 'react';
import { ProtocolData, Meal, Supplement, TrainingDay, Exercise } from '../types';
import { Activity, User, ShieldCheck, ChevronLeft, MapPin, Dumbbell, Utensils, Pill, Plus, Trash2, FileText, AlertCircle, Sparkles, Loader2, Ruler, DollarSign, Droplets, BookOpen } from 'lucide-react';
import OpenAI from "openai";

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
  // Novas props para controle externo das abas
  activeTab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'obs';
  onTabChange: (tab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'obs') => void;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack, activeTab, onTabChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // --- MÁSCARAS E HANDLERS ---
  
  const handleChange = (path: string, value: any) => {
    // CRITICAL FIX: Deep copy to prevent state mutation and ensure React updates correctly
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

  // Máscara de Data (DD/MM/AAAA)
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

  // Máscara de Horário (00:00)
  const formatTime = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 4) v = v.substr(0, 4);
    if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d)/, '$1:$2');
    }
    return v;
  };

  // Máscara de CPF (000.000.000-00)
  const handleCPFMask = (path: string, value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    handleChange(path, v);
  };

  // Máscara de Telefone ((00) 00000-0000)
  const handlePhoneMask = (path: string, value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);

    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');

    handleChange(path, v);
  };

  // Máscara de Altura (Permite 1,XX)
  const handleHeightMask = (path: string, value: string) => {
    // 1. Substituir ponto por vírgula para padronizar
    let v = value.replace(/\./g, ',');
    
    // 2. Remover qualquer coisa que não seja número ou vírgula
    v = v.replace(/[^0-9,]/g, '');
    
    // 3. Impedir mais de uma vírgula
    const parts = v.split(',');
    if (parts.length > 2) {
       v = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // 4. Limitar casas decimais (máx 2)
    if (parts[1] && parts[1].length > 2) {
       v = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    // 5. Limitar tamanho total (ex: 2,55 = 4 chars)
    if (v.length > 4) v = v.substring(0, 4);
    
    handleChange(path, v);
  };

  // Máscara de Peso (00,00) - Mantendo ATM style pois é mais comum para peso, mas pode ser ajustado se necessário
  const handleWeightMask = (path: string, value: string) => {
    let v = value.replace(/\D/g, '');
    // Limita tamanho para evitar números gigantes (ex: 999kg)
    if (v.length > 5) v = v.substring(0, 5);
    
    if (v === '') {
      handleChange(path, '');
      return;
    }

    // Lógica ATM: Preenche da direita para esquerda
    const numberValue = parseInt(v) / 100;
    const formatted = numberValue.toFixed(2).replace('.', ',');
    
    handleChange(path, formatted);
  };

  // Wrapper específico para Horário em Refeições
  const updateMealTime = (index: number, val: string) => {
    const formatted = formatTime(val);
    updateMeal(index, 'time', formatted);
  };

  // --- LÓGICA DO GERADOR IA ---
  const handleGenerateAI = async () => {
    // Validação ajustada para a nova estrutura (Peso está na aba Medidas)
    if (!data.protocolTitle || !data.physicalData.weight) {
      alert("Por favor, preencha pelo menos o 'Objetivo do Protocolo' e 'Peso' na aba 'Medidas' antes de gerar.");
      onTabChange('medidas');
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = "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";
      
      const openai = new OpenAI({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true 
      });
      
      const prompt = `
        DADOS DO ALUNO:
        - Nome: ${data.clientName}
        - Objetivo: ${data.protocolTitle}
        - Gênero: ${data.physicalData.gender}
        - Idade: ${data.physicalData.age}
        - Peso: ${data.physicalData.weight}kg
        - Altura: ${data.physicalData.height}m
        - Gordura Corporal: ${data.physicalData.bodyFat}%
        - Massa Muscular: ${data.physicalData.muscleMass}kg
        
        ANAMNESE (LEVAR EM CONTA):
        - Rotina: ${data.anamnesis.routine}
        - Histórico: ${data.anamnesis.trainingHistory}
        - Ergogênicos: ${data.anamnesis.ergogenics}
        - Preferências: ${data.anamnesis.foodPreferences}

        DIRETRIZES DO TREINADOR (Obrigatório Seguir):
        - Estratégia Nutricional: ${data.nutritionalStrategy || "Definir automaticamente baseada no objetivo"}
        - Meta Calórica: ${data.kcalGoal || "Calcular automaticamente"}
        - Frequência de Treino Definida: ${data.trainingFrequency || "Sugerir baseada no objetivo"}

        INSTRUÇÕES:
        1. Se o treinador já definiu a estratégia ou calorias acima, USE esses valores.
        2. A Frequência de Treino foi definida pelo treinador como "${data.trainingFrequency}". USE EXATAMENTE ESTA FREQUÊNCIA para gerar a divisão de treino.
        3. Gere treinos intensos e periodizados.
        4. Retorne APENAS um JSON válido.

        Gere um JSON com a seguinte estrutura estrita:
        {
          "nutritionalStrategy": "Texto explicando a estratégia",
          "kcalGoal": "Valor numérico",
          "kcalSubtext": "Déficit, Superávit ou Manutenção",
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
          "trainingFrequency": "A frequência definida pelo treinador",
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
          "generalObservations": "Recomendações finais"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um treinador de elite e nutricionista esportivo (Estilo Team VBR). Gere apenas JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const textResponse = completion.choices[0].message.content;
      
      if (textResponse) {
        const generatedData = JSON.parse(textResponse);

        // Mesclar dados gerados com os dados atuais
        const newData = {
          ...data,
          // Prioriza o que a IA gerou/refinou, mas mantém o input do usuário se a IA falhar
          nutritionalStrategy: generatedData.nutritionalStrategy || data.nutritionalStrategy,
          kcalGoal: generatedData.kcalGoal || data.kcalGoal,
          kcalSubtext: generatedData.kcalSubtext || data.kcalSubtext, // A IA gera o contexto agora (déficit/superávit)
          
          macros: generatedData.macros || data.macros,
          meals: generatedData.meals ? generatedData.meals.map((m: any, i: number) => ({ ...m, id: Date.now().toString() + i })) : [],
          supplements: generatedData.supplements ? generatedData.supplements.map((s: any, i: number) => ({ ...s, id: Date.now().toString() + i })) : [],
          
          // Usa a frequência gerada (que deve respeitar a diretriz) ou a digitada
          trainingFrequency: generatedData.trainingFrequency || data.trainingFrequency,
          
          trainingDays: generatedData.trainingDays ? generatedData.trainingDays.map((d: any, i: number) => ({
             ...d, 
             id: Date.now().toString() + i,
             exercises: d.exercises ? d.exercises.map((e: any, j: number) => ({ ...e, id: Date.now().toString() + i + j })) : []
          })) : [],
          generalObservations: generatedData.generalObservations || data.generalObservations
        };
        
        onChange(newData);
        alert("Protocolo gerado com sucesso considerando sua estratégia e frequência de treino!");
      }
    } catch (error: any) {
      console.error("Erro na IA:", error);
      alert(`Erro ao gerar protocolo: ${error.message || "Verifique a conexão ou tente novamente."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LÓGICA DE CÁLCULO DE ÁGUA ---
  useEffect(() => {
    const weight = parseFloat(data.physicalData.weight.replace(',', '.'));
    if (!isNaN(weight) && weight > 0) {
        // Cálculo atualizado: 35ml por kg
        const liters = (weight * 0.035).toFixed(1).replace('.', ',');
        
        // Atualiza se estiver vazio ou se o valor calculado for diferente 
        // (mantendo a sincronia com o peso, mas permitindo edição manual se o usuário mudar depois)
        // Decisão: Forçar atualização se o peso mudar, pois é um dado derivado crítico.
        if (data.waterGoal !== liters) {
           handleChange('waterGoal', liters);
        }
    }
  }, [data.physicalData.weight]);

  // --- LÓGICA DE CÁLCULO DE DATA DE TÉRMINO ---
  useEffect(() => {
    if (data.contract.startDate && data.contract.planType) {
      const parts = data.contract.startDate.split('/');
      
      // Lógica para Plano Avulso
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
             const newData = JSON.parse(JSON.stringify(data));
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

  // --- COMPONENTE DE TABS ---
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

      {/* NAVEGAÇÃO POR ABAS - CENTRALIZADO e RESPONSIVO */}
      <div className="flex flex-nowrap md:flex-wrap md:justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide w-full">
        <TabButton id="identificacao" label="Identificação" icon={User} />
        <TabButton id="anamnese" label="Anamnese" icon={BookOpen} />
        <TabButton id="medidas" label="Medidas" icon={Ruler} />
        <TabButton id="nutricao" label="Nutrição" icon={Utensils} />
        <TabButton id="treino" label="Treino" icon={Dumbbell} />
        <TabButton id="obs" label="Observações" icon={FileText} />
      </div>

      {/* ABA: IDENTIFICAÇÃO E CONTRATO */}
      {activeTab === 'identificacao' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
           {/* Identificação */}
           <section>
            <div className={sectionHeaderClass}>
              <User className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identificação do Aluno</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                 <div>
                   <label className={labelClass}>WhatsApp / Celular</label>
                   <input 
                      className={inputClass} 
                      value={data.contract.phone} 
                      onChange={(e) => handlePhoneMask('contract.phone', e.target.value)} 
                      placeholder="(00) 00000-0000" 
                      maxLength={15}
                    />
                 </div>
                 <div>
                   <label className={labelClass}>CPF</label>
                   <input 
                      className={inputClass} 
                      value={data.contract.cpf} 
                      onChange={(e) => handleCPFMask('contract.cpf', e.target.value)} 
                      placeholder="000.000.000-00" 
                      maxLength={14}
                    />
                 </div>
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

          {/* Contrato & Financeiro */}
          <section>
            <div className={sectionHeaderClass}>
              <ShieldCheck className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Detalhes do Contrato e Pagamento</h2>
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

              <div>
                <label className={labelClass}>Início</label>
                <input className={inputClass} value={data.contract.startDate} onChange={(e) => handleDateInput('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" maxLength={10} />
              </div>
              <div>
                <label className={labelClass}>Término (Automático)</label>
                <input className={inputClass + " opacity-60"} value={data.contract.endDate} readOnly />
              </div>
              
              <div className="col-span-1 md:col-span-2"><label className={labelClass}>Valor do Plano (R$)</label><input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="0,00" /></div>
              <div className="col-span-1 md:col-span-4"><label className={labelClass}>Valor por Extenso (Automático)</label><input className={inputClass + " opacity-60 italic bg-transparent border-none"} value={data.contract.planValueWords} readOnly /></div>
              
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Método de Pagamento</label>
                <select className={selectClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
                  <option value="Pix">Pix (À vista)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ABA: ANAMNESE (NOVA) */}
      {activeTab === 'anamnese' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
            <section>
                <div className={sectionHeaderClass}>
                    <BookOpen className="text-[#d4af37]" size={20} />
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Anamnese do Aluno</h2>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Objetivo Principal do Aluno</label>
                        <input className={inputClass} value={data.anamnesis.mainObjective} onChange={(e) => handleChange('anamnesis.mainObjective', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Rotina Diária (Trabalho, Sono, Horários)</label>
                        <textarea className={textAreaClass} value={data.anamnesis.routine} onChange={(e) => handleChange('anamnesis.routine', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Histórico de Treino/Dieta</label>
                            <textarea className={textAreaClass} value={data.anamnesis.trainingHistory} onChange={(e) => handleChange('anamnesis.trainingHistory', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Preferências Alimentares</label>
                            <textarea className={textAreaClass} value={data.anamnesis.foodPreferences} onChange={(e) => handleChange('anamnesis.foodPreferences', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Uso de Ergogênicos / Medicamentos</label>
                        <textarea className={textAreaClass + " min-h-[80px]"} value={data.anamnesis.ergogenics} onChange={(e) => handleChange('anamnesis.ergogenics', e.target.value)} />
                    </div>
                </div>
            </section>
        </div>
      )}

      {/* ABA: MEDIDAS (Bioimpedância + Medidas Corporais) */}
      {activeTab === 'medidas' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          {/* Bioimpedância & Composição */}
          <section>
            <div className={sectionHeaderClass}>
              <Activity className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Bioimpedância & Composição</h2>
            </div>
            
            {/* Linha 1: Dados Pessoais Básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Objetivo do Protocolo</label>
                <select className={selectClass} value={data.protocolTitle} onChange={(e) => handleChange('protocolTitle', e.target.value)}>
                    <option value="">Selecione o Objetivo</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Recomposição Corporal">Recomposição Corporal</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Data Avaliação</label>
                <input className={inputClass} value={data.physicalData.date} onChange={(e) => handleDateInput('physicalData.date', e.target.value)} placeholder="DD/MM/AAAA" maxLength={10} />
              </div>
              <div>
                <label className={labelClass}>Idade</label>
                <input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} />
              </div>
            </div>

            {/* Linha 2: Antropometria */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Gênero</label>
                <select className={selectClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Peso Atual (kg)</label>
                <input 
                  className={inputClass} 
                  value={data.physicalData.weight} 
                  onChange={(e) => handleWeightMask('physicalData.weight', e.target.value)} 
                  placeholder="00,00" 
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className={labelClass}>Altura (m)</label>
                <input 
                  className={inputClass} 
                  value={data.physicalData.height} 
                  onChange={(e) => handleHeightMask('physicalData.height', e.target.value)} 
                  placeholder="1,75" 
                  inputMode="decimal"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>IMC (Calc. Auto)</label>
                <input className={inputClass + " opacity-60"} value={data.physicalData.imc} readOnly />
              </div>
            </div>

            {/* Linha 3: Composição Corporal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

            {/* NOVAS MEDIDAS CORPORAIS */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Ruler className="text-[#d4af37]" size={16} />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Medidas Corporais (cm)</h3>
              </div>
              
              {/* Parte Superior */}
              <div className="mb-6">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Parte Superior</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className={labelClass}>Tórax / Peitoral</label><input className={inputClass} value={data.physicalData.measurements?.thorax} onChange={(e) => handleChange('physicalData.measurements.thorax', e.target.value)} /></div>
                  <div><label className={labelClass}>Cintura</label><input className={inputClass} value={data.physicalData.measurements?.waist} onChange={(e) => handleChange('physicalData.measurements.waist', e.target.value)} /></div>
                  <div><label className={labelClass}>Abdômen</label><input className={inputClass} value={data.physicalData.measurements?.abdomen} onChange={(e) => handleChange('physicalData.measurements.abdomen', e.target.value)} /></div>
                  <div><label className={labelClass}>Glúteo</label><input className={inputClass} value={data.physicalData.measurements?.glutes} onChange={(e) => handleChange('physicalData.measurements.glutes', e.target.value)} /></div>
                  
                  <div><label className={labelClass}>Braço Dir. Relaxado</label><input className={inputClass} value={data.physicalData.measurements?.rightArmRelaxed} onChange={(e) => handleChange('physicalData.measurements.rightArmRelaxed', e.target.value)} /></div>
                  <div><label className={labelClass}>Braço Esq. Relaxado</label><input className={inputClass} value={data.physicalData.measurements?.leftArmRelaxed} onChange={(e) => handleChange('physicalData.measurements.leftArmRelaxed', e.target.value)} /></div>
                  <div><label className={labelClass}>Braço Dir. Contraído</label><input className={inputClass} value={data.physicalData.measurements?.rightArmContracted} onChange={(e) => handleChange('physicalData.measurements.rightArmContracted', e.target.value)} /></div>
                  <div><label className={labelClass}>Braço Esq. Contraído</label><input className={inputClass} value={data.physicalData.measurements?.leftArmContracted} onChange={(e) => handleChange('physicalData.measurements.leftArmContracted', e.target.value)} /></div>
                </div>
              </div>

              {/* Parte Inferior */}
              <div>
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Parte Inferior</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className={labelClass}>Coxa Direita</label><input className={inputClass} value={data.physicalData.measurements?.rightThigh} onChange={(e) => handleChange('physicalData.measurements.rightThigh', e.target.value)} /></div>
                  <div><label className={labelClass}>Coxa Esquerda</label><input className={inputClass} value={data.physicalData.measurements?.leftThigh} onChange={(e) => handleChange('physicalData.measurements.leftThigh', e.target.value)} /></div>
                  <div><label className={labelClass}>Panturrilha Direita</label><input className={inputClass} value={data.physicalData.measurements?.rightCalf} onChange={(e) => handleChange('physicalData.measurements.rightCalf', e.target.value)} /></div>
                  <div><label className={labelClass}>Panturrilha Esquerda</label><input className={inputClass} value={data.physicalData.measurements?.leftCalf} onChange={(e) => handleChange('physicalData.measurements.leftCalf', e.target.value)} /></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ABA: NUTRIÇÃO */}
      {activeTab === 'nutricao' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
           {/* ESTRATÉGIA NUTRICIONAL */}
          <section>
            <div className={sectionHeaderClass}>
              <Utensils className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estratégia Nutricional</h2>
            </div>
            <div>
              <label className={labelClass}>Descreva a linha de raciocínio da dieta (Use isso para guiar a IA)...</label>
              <textarea 
                className={textAreaClass}
                value={data.nutritionalStrategy}
                onChange={(e) => handleChange('nutritionalStrategy', e.target.value)}
                placeholder="Ex: Dieta Cetogênica, Ciclo de Carboidratos, Jejum Intermitente..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                  <label className={labelClass}>Meta Calórica (Kcal)</label>
                  <input className={inputClass} value={data.kcalGoal} onChange={(e) => handleChange('kcalGoal', e.target.value)} placeholder="Ex: 2500 (Deixe vazio para IA calcular)" />
              </div>
              <div>
                  <label className={labelClass}>Frequência de Treino</label>
                  <input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5x na semana" />
              </div>
              <div className="relative">
                  <label className={labelClass}>Meta Hídrica Diária (L)</label>
                  <input className={inputClass} value={data.waterGoal} onChange={(e) => handleChange('waterGoal', e.target.value)} placeholder="Ex: 4,0" />
                  <Droplets size={16} className="absolute right-4 top-9 text-[#d4af37] opacity-50" />
              </div>
            </div>
          </section>

          {/* GERADOR AUTOMÁTICO IA */}
          <section className="bg-gradient-to-r from-[#d4af37]/10 to-transparent p-6 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] blur-[80px] opacity-10"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#d4af37] text-black rounded-xl shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerador de Protocolo IA</h3>
                      <p className="text-sm text-white/60 max-w-lg">
                        A IA usará seus dados de bioimpedância e a estratégia nutricional definida acima para criar um plano completo.
                      </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleGenerateAI} 
                  disabled={isGenerating}
                  className="px-8 py-4 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center whitespace-nowrap"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {isGenerating ? 'Gerando...' : 'Gerar Protocolo Agora'}
                </button>
            </div>
          </section>

          {/* DISTRIBUIÇÃO DE MACRONUTRIENTES */}
          <section>
            <div className={sectionHeaderClass}>
              <Activity className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Distribuição de Macronutrientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Proteínas */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Proteínas</label>
                  <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest">g/kg</span>
                </div>
                <div className="flex gap-2">
                  <input className={inputClass} value={data.macros.protein.value} onChange={(e) => handleChange('macros.protein.value', e.target.value)} placeholder="Ex: 180" />
                  <input className={inputClass} value={data.macros.protein.ratio} onChange={(e) => handleChange('macros.protein.ratio', e.target.value)} placeholder="2.0" />
                </div>
              </div>

              {/* Carboidratos */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Carboidratos</label>
                  <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest">g/kg</span>
                </div>
                <div className="flex gap-2">
                  <input className={inputClass} value={data.macros.carbs.value} onChange={(e) => handleChange('macros.carbs.value', e.target.value)} placeholder="Ex: 250" />
                  <input className={inputClass} value={data.macros.carbs.ratio} onChange={(e) => handleChange('macros.carbs.ratio', e.target.value)} placeholder="3.0" />
                </div>
              </div>

              {/* Gorduras */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Gorduras</label>
                  <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest">g/kg</span>
                </div>
                <div className="flex gap-2">
                  <input className={inputClass} value={data.macros.fats.value} onChange={(e) => handleChange('macros.fats.value', e.target.value)} placeholder="Ex: 60" />
                  <input className={inputClass} value={data.macros.fats.ratio} onChange={(e) => handleChange('macros.fats.ratio', e.target.value)} placeholder="0.8" />
                </div>
              </div>
            </div>
          </section>

          {/* DISTRIBUIÇÃO DE REFEIÇÕES */}
          <section>
            <div className={sectionHeaderClass}>
              <Activity className="text-[#d4af37]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Distribuição de Refeições</h2>
            </div>
            <div className="space-y-4">
              {data.meals.map((meal, index) => (
                <div key={meal.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-start group">
                    <div className="w-full md:w-1/4">
                      <label className={labelClass}>Horário</label>
                      <input 
                        className={inputClass} 
                        value={meal.time} 
                        onChange={(e) => updateMealTime(index, e.target.value)} 
                        placeholder="08:00" 
                        maxLength={5}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className={labelClass}>Nome da Refeição</label>
                      <input className={inputClass + " mb-2"} value={meal.name} onChange={(e) => updateMeal(index, 'name', e.target.value)} placeholder="Café da Manhã" />
                      <textarea className={inputClass + " min-h-[60px]"} value={meal.details} onChange={(e) => updateMeal(index, 'details', e.target.value)} placeholder="Detalhes dos alimentos..." />
                    </div>
                    <button onClick={() => removeMeal(index)} className="mt-0 md:mt-6 w-full md:w-auto p-2 bg-red-500/10 text-red-500 rounded-lg md:bg-transparent md:text-white/20 hover:text-red-500 transition-colors flex justify-center items-center"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addMeal} className={addButtonClass}>
                  <Plus size={16} /> Adicionar Refeição
              </button>
            </div>
          </section>

          {/* SUPLEMENTAÇÃO */}
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
                    <button onClick={() => removeSupplement(index)} className="w-full md:w-auto p-3 bg-red-500/10 rounded-lg md:bg-transparent md:p-3 text-red-500 md:text-white/20 hover:text-red-500 transition-colors flex justify-center"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addSupplement} className={addButtonClass}>
                  <Plus size={16} /> Adicionar Suplementação
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ABA: TREINO */}
      {activeTab === 'treino' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
           {/* DIVISÃO DE TREINOS */}
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-white/5 pb-4 gap-4 md:gap-0">
                      <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                          <div className="w-full md:w-1/3">
                            <label className={labelClass}>Título do Treino</label>
                            <input className={inputClass} value={day.title} onChange={(e) => updateTrainingDay(dIndex, 'title', e.target.value)} placeholder="Treino A" />
                          </div>
                          <div className="flex-1 w-full">
                            <label className={labelClass}>Foco Muscular</label>
                            <input className={inputClass} value={day.focus} onChange={(e) => updateTrainingDay(dIndex, 'focus', e.target.value)} placeholder="Peito e Tríceps" />
                          </div>
                      </div>
                      <button onClick={() => removeTrainingDay(dIndex)} className="ml-0 md:ml-4 p-2 bg-red-500/10 rounded-lg md:bg-transparent text-red-500 md:text-white/20 hover:text-red-500 w-full md:w-auto flex justify-center"><Trash2 size={20} /></button>
                    </div>

                    <div className="space-y-2 pl-0 md:pl-4 border-l-0 md:border-l-2 border-white/5">
                      {day.exercises.map((ex, exIndex) => (
                        <div key={ex.id} className="flex gap-2 md:gap-4 items-center">
                            <input className={inputClass + " py-2 text-xs"} value={ex.name} onChange={(e) => updateExercise(dIndex, exIndex, 'name', e.target.value)} placeholder="Nome do Exercício" />
                            <input className={inputClass + " py-2 text-xs w-20 md:w-32"} value={ex.sets} onChange={(e) => updateExercise(dIndex, exIndex, 'sets', e.target.value)} placeholder="Séries" />
                            <button onClick={() => removeExercise(dIndex, exIndex)} className="text-white/20 hover:text-red-500 p-2"><Trash2 size={14} /></button>
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
        </div>
      )}

      {/* ABA: OBS */}
      {activeTab === 'obs' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          {/* OBSERVAÇÕES */}
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
      )}

    </div>
  );
};

export default ProtocolForm;
