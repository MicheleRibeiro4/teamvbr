
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
  activeTab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'ergogenicos';
  onTabChange: (tab: 'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'ergogenicos') => void;
  hideTabs?: boolean;
}

const ProtocolForm: React.FC<Props> = ({ data, onChange, onBack, activeTab, onTabChange, hideTabs }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contractRef = useRef<ContractPreviewHandle>(null);
  const anamnesisRef = useRef<AnamnesisPreviewHandle>(null);
  const protocolRef = useRef<ProtocolPreviewHandle>(null);

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...data };
    let current: any = newData;

    // Enforce uppercase for client name
    let finalValue = value;
    if (path === 'clientName' && typeof value === 'string') {
        finalValue = value.toUpperCase();
    }

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
    }
    current[keys[keys.length - 1]] = finalValue;
    onChange(newData);
  };

  // Sincronização automática: Meta de Água -> Dicas
  useEffect(() => {
    if (!data.waterGoal) return;
    
    // Normaliza o valor da meta (remove letras, mantem numeros e virgula/ponto)
    const goalVal = data.waterGoal.replace(/[^0-9.,]/g, '').trim();
    if (!goalVal) return;

    const currentTips = data.tips || [];
    const waterTipText = `Beber no mínimo ${goalVal}L de água por dia.`;
    
    // Procura se já existe uma dica de água
    const waterTipIndex = currentTips.findIndex(t => 
        t.toLowerCase().includes('água') || t.toLowerCase().includes('hidratação')
    );

    if (waterTipIndex !== -1) {
        // Se existe, mas o texto é diferente (ex: valor antigo), atualiza
        if (currentTips[waterTipIndex] !== waterTipText) {
            const newTips = [...currentTips];
            newTips[waterTipIndex] = waterTipText;
            onChange({ ...data, tips: newTips });
        }
    } else {
        // Se não existe, adiciona no topo
        const newTips = [waterTipText, ...currentTips];
        onChange({ ...data, tips: newTips });
    }
  }, [data.waterGoal]); 

  const handleApplyTemplate = (type: keyof typeof PROTOCOL_TEMPLATES) => {
    const template = PROTOCOL_TEMPLATES[type];
    const newData = JSON.parse(JSON.stringify(data));
    newData.protocolTitle = template.title;
    // Mantém dicas existentes e adiciona as novas se não existirem
    const existingTips = new Set(newData.tips || []);
    template.tips.forEach((t: string) => existingTips.add(t));
    newData.tips = Array.from(existingTips);
    
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
    if(confirm("Tem certeza? Isso apagará as Metas, Macros, Refeições, Suplementos e Dicas.")) {
        const newData = {
            ...data,
            kcalGoal: "",
            kcalSubtext: "",
            waterGoal: "",
            macros: {
                protein: { value: "", ratio: "" },
                carbs: { value: "", ratio: "" },
                fats: { value: "", ratio: "" }
            },
            meals: [],
            supplements: [],
            tips: []
        };
        onChange(newData);
    }
  };

  const handleClearTraining = () => {
    if(confirm("Tem certeza? Isso apagará todos os dias de treino cadastrados.")) {
        const newData = {
            ...data,
            trainingDays: []
        };
        onChange(newData);
    }
  };

  const handleGenerateNutritionAI = async () => {
    if (!data.clientName || !data.physicalData.weight) {
        alert("Preencha pelo menos o Nome e o Peso do aluno na aba de Identificação/Medidas.");
        return;
    }

    setIsGenerating(true);

    try {
        const prompt = `
          Aja como um nutricionista de elite do 'Team VBR'.
          Crie uma estratégia nutricional e dieta baseada nos dados abaixo:
          
          DADOS DO ALUNO:
          - Nome: ${data.clientName}
          - Idade: ${data.physicalData.age}
          - Gênero: ${data.physicalData.gender}
          - Peso: ${data.physicalData.weight}kg
          - Altura: ${data.physicalData.height}m
          - Objetivo Atual: ${data.protocolTitle}
          
          ANAMNESE COMPLETA:
          - Objetivo Principal: ${data.anamnesis.mainObjective}
          - Rotina Diária: ${data.anamnesis.routine}
          - Preferências Alimentares: ${data.anamnesis.foodPreferences}
          - Ergogênicos/Medicamentos: ${data.anamnesis.ergogenics} | ${data.anamnesis.medications}

          ESTRATÉGIA NUTRICIONAL JÁ DEFINIDA (SE HOUVER):
          "${data.nutritionalStrategy || "Nenhuma definida ainda."}"
          
          Gere um JSON com a seguinte estrutura:
          {
            "nutritionalStrategy": "Texto curto e direto sobre a estratégia",
            "kcalGoal": "Ex: 2500",
            "waterGoal": "Ex: 3,5", 
            "macros": {
               "protein": { "value": "180", "ratio": "2.0" },
               "carbs": { "value": "250", "ratio": "3.0" },
               "fats": { "value": "60", "ratio": "0.8" }
            },
            "meals": [
              { "time": "08:00", "name": "Café da Manhã", "details": "Alimentos e quantidades detalhadas", "substitutions": "Opções de substituição para esta refeição" }
            ],
            "supplements": [
              { "name": "Nome", "dosage": "Dose", "timing": "Horário" }
            ],
            "tips": ["Dica 1", "Dica 2"]
          }

          REGRAS:
          1. NÃO inclua unidades de medida (g, kcal, L, g/kg) nos campos numéricos de macros, calorias e água. Retorne APENAS o número.
          2. O campo waterGoal deve ser APENAS O NÚMERO (ex: "3,5").
          3. Seja específico nas quantidades dos alimentos.
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
                        waterGoal: { type: Type.STRING },
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
                                    details: { type: Type.STRING },
                                    substitutions: { type: Type.STRING }
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
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["nutritionalStrategy", "kcalGoal", "macros", "meals", "supplements", "tips"]
                }
            }
        });

        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
        
        const aiDataRaw = JSON.parse(jsonStr);
        
        // Sanitização para remover unidades repetidas caso a IA ignore as regras
        const sanitize = (val: any) => {
            if (typeof val !== 'string') return val;
            return val.replace(/kcal/gi, '')
                      .replace(/g\/kg/gi, '')
                      .replace(/g/gi, '')
                      .replace(/litros/gi, '')
                      .replace(/litro/gi, '')
                      .replace(/ L/gi, '')
                      .trim();
        };

        const aiData = {
            ...aiDataRaw,
            kcalGoal: sanitize(aiDataRaw.kcalGoal),
            waterGoal: sanitize(aiDataRaw.waterGoal),
            macros: {
                protein: { 
                    value: sanitize(aiDataRaw.macros?.protein?.value), 
                    ratio: sanitize(aiDataRaw.macros?.protein?.ratio) 
                },
                carbs: { 
                    value: sanitize(aiDataRaw.macros?.carbs?.value), 
                    ratio: sanitize(aiDataRaw.macros?.carbs?.ratio) 
                },
                fats: { 
                    value: sanitize(aiDataRaw.macros?.fats?.value), 
                    ratio: sanitize(aiDataRaw.macros?.fats?.ratio) 
                }
            }
        };

        const newData = { ...data };
        
        if (aiData.nutritionalStrategy) {
            if (!newData.nutritionalStrategy || newData.nutritionalStrategy.trim() === "") {
                newData.nutritionalStrategy = aiData.nutritionalStrategy;
            }
        }
        if (aiData.kcalGoal) newData.kcalGoal = aiData.kcalGoal;
        if (aiData.waterGoal) newData.waterGoal = aiData.waterGoal.replace('L', '').trim();
        if (aiData.macros) newData.macros = aiData.macros;
        if (aiData.meals) newData.meals = aiData.meals.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) }));
        if (aiData.supplements) newData.supplements = aiData.supplements.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
        if (aiData.tips) newData.tips = aiData.tips;
        
        onChange(newData);
        alert("Dieta gerada com sucesso!");
    } catch (err: any) {
        console.error(err);
        alert("Erro ao gerar dieta: " + err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateTrainingAI = async () => {
    if (!data.clientName || !data.physicalData.weight) {
        alert("Preencha pelo menos o Nome e o Peso do aluno na aba de Identificação/Medidas.");
        return;
    }

    setIsGenerating(true);

    try {
        const freqMatch = (data.trainingFrequency || '').match(/\d+/);
        const freqNum = freqMatch ? parseInt(freqMatch[0]) : 5;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const requiredDaysList = Array.from({ length: freqNum }, (_, i) => letters[i] || (i + 1).toString()).map(l => `Treino ${l}`).join(', ');

        const prompt = `
          Aja como um treinador de elite do 'Team VBR'.
          Crie um plano de treino baseado nos dados abaixo:
          
          DADOS DO ALUNO:
          - Nome: ${data.clientName}
          - Objetivo Atual: ${data.protocolTitle}
          - Frequência de Treino: ${freqNum} vezes na semana.
          
          ANAMNESE:
          - Objetivo Principal: ${data.anamnesis.mainObjective}
          - Histórico de Treino: ${data.anamnesis.trainingHistory}
          - Lesões/Limitações: ${data.anamnesis.injuries}
          
          REQUISITO:
          Gere EXATAMENTE ${freqNum} treinos.
          Títulos: ${requiredDaysList}.
          
          Gere um JSON:
          {
            "trainingReasoning": "Explicação detalhada da linha de raciocínio adotada para este aluno, considerando o objetivo, frequência e histórico.",
            "trainingDays": [
              {
                "title": "Treino A",
                "focus": "Grupo Muscular",
                "exercises": [
                   { "name": "Nome", "sets": "4x12" }
                ]
              }
            ]
          }
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trainingReasoning: { type: Type.STRING },
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
                        }
                    },
                    required: ["trainingReasoning", "trainingDays"]
                }
            }
        });

        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
        
        const aiData = JSON.parse(jsonStr);
        const newData = { ...data };
        
        if (aiData.trainingReasoning) {
            newData.trainingReasoning = aiData.trainingReasoning;
        }

        let generatedTrainingDays = aiData.trainingDays || [];
        if (generatedTrainingDays.length < freqNum) {
            for (let i = generatedTrainingDays.length; i < freqNum; i++) {
                generatedTrainingDays.push({
                    title: `Treino ${letters[i] || (i + 1)}`,
                    focus: "Foco a definir",
                    exercises: [{ name: "Exercício Principal", sets: "4x10" }]
                });
            }
        } else if (generatedTrainingDays.length > freqNum) {
            generatedTrainingDays = generatedTrainingDays.slice(0, freqNum);
        }

        newData.trainingDays = generatedTrainingDays.map((d: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                title: d.title || "Treino",
                focus: d.focus || "Geral",
                exercises: (d.exercises || []).map((e: any) => ({ 
                    id: Math.random().toString(36).substr(2, 9),
                    name: e.name || "Exercício",
                    sets: e.sets || "3x10"
                }))
        }));
        
        onChange(newData);
        alert("Treino gerado com sucesso!");
    } catch (err: any) {
        console.error(err);
        alert("Erro ao gerar treino: " + err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Garante que o objeto de medidas exista (correção para dados antigos)
    if (data.physicalData && !data.physicalData.measurements) {
        handleChange('physicalData.measurements', {});
    }
    // Garante que o array de treinos exista
    if (!data.trainingDays) {
        handleChange('trainingDays', []);
    }
  }, [data.physicalData, data.trainingDays]);

  useEffect(() => {
    // Cálculo inicial de água caso esteja vazio ao carregar, baseado no peso
    const weight = parseFloat(data.physicalData.weight.replace(',', '.'));
    if (!isNaN(weight) && weight > 0 && (!data.waterGoal || data.waterGoal === '')) {
        const liters = (weight * 0.045).toFixed(1).replace('.', ',');
        if (data.waterGoal !== liters) handleChange('waterGoal', liters);
    }
  }, [data.physicalData.weight]);

  const calculateEndDate = (startDateStr: string, planType: string) => {
    if (!startDateStr || !planType) return null;

    let day, month, year;
    if (startDateStr.includes('/')) {
      const parts = startDateStr.split('/');
      if (parts.length !== 3) return null;
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    } else if (startDateStr.includes('-')) {
      const parts = startDateStr.split('-');
      if (parts.length !== 3) return null;
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      return null;
    }
    
    if (day < 1 || day > 31 || month < 0 || month > 11 || isNaN(year)) return null;

    const startDate = new Date(year, month, day);
    if (isNaN(startDate.getTime())) return null;

    let monthsToAdd = 0;
    switch (planType) {
        case 'Avulso': monthsToAdd = 1; break;
        case 'Trimestral': monthsToAdd = 3; break;
        case 'Semestral': monthsToAdd = 6; break;
        case 'Anual': monthsToAdd = 12; break;
        default: return null;
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    endDate.setDate(endDate.getDate() - 1);

    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endYear = endDate.getFullYear();
    
    // Retorna no formato YYYY-MM-DD para o input type="date"
    const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    
    return {
      endDate: formattedEndDate,
      durationDays: String(diffDays)
    };
  };

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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMeal = () => handleChange('meals', [...data.meals, { id: generateId(), time: '', name: '', details: '' }]);
  const removeMeal = (index: number) => { const newMeals = [...data.meals]; newMeals.splice(index, 1); handleChange('meals', newMeals); };
  const updateMeal = (index: number, field: keyof Meal, val: string) => { const newMeals = [...data.meals]; newMeals[index] = { ...newMeals[index], [field]: val }; handleChange('meals', newMeals); };

  const addSupplement = () => handleChange('supplements', [...data.supplements, { id: generateId(), name: '', dosage: '', timing: '' }]);
  const removeSupplement = (index: number) => { const newSupps = [...data.supplements]; newSupps.splice(index, 1); handleChange('supplements', newSupps); };
  const updateSupplement = (index: number, field: keyof Supplement, val: string) => { const newSupps = [...data.supplements]; newSupps[index] = { ...newSupps[index], [field]: val }; handleChange('supplements', newSupps); };

  const addTip = () => handleChange('tips', [...(data.tips || []), ""]);
  const removeTip = (index: number) => { const newTips = [...(data.tips || [])]; newTips.splice(index, 1); handleChange('tips', newTips); };
  const updateTip = (index: number, val: string) => { const newTips = [...(data.tips || [])]; newTips[index] = val; handleChange('tips', newTips); };

  const addTrainingDay = () => handleChange('trainingDays', [...(data.trainingDays || []), { id: generateId(), title: '', focus: '', exercises: [] }]);
  const removeTrainingDay = (index: number) => { const newDays = [...data.trainingDays]; newDays.splice(index, 1); handleChange('trainingDays', newDays); };
  const updateTrainingDay = (index: number, field: keyof TrainingDay, val: any) => { const newDays = [...data.trainingDays]; newDays[index] = { ...newDays[index], [field]: val }; handleChange('trainingDays', newDays); };
  const addExercise = (dayIndex: number) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises.push({ id: generateId(), name: '', sets: '' }); handleChange('trainingDays', newDays); };
  const removeExercise = (dayIndex: number, exIndex: number) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises.splice(exIndex, 1); handleChange('trainingDays', newDays); };
  const updateExercise = (dayIndex: number, exIndex: number, field: keyof Exercise, val: string) => { const newDays = [...data.trainingDays]; newDays[dayIndex].exercises[exIndex] = { ...newDays[dayIndex].exercises[exIndex], [field]: val }; handleChange('trainingDays', newDays); };

  const addErgogenic = () => handleChange('ergogenics', [...(data.ergogenics || []), { id: generateId(), name: '', dosage: '', timing: '' }]);
  const removeErgogenic = (index: number) => { const newErgs = [...(data.ergogenics || [])]; newErgs.splice(index, 1); handleChange('ergogenics', newErgs); };
  const updateErgogenic = (index: number, field: any, val: string) => { const newErgs = [...(data.ergogenics || [])]; newErgs[index] = { ...newErgs[index], [field]: val }; handleChange('ergogenics', newErgs); };

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
            <TabButton id="ergogenicos" label="Ergogênicos" icon={Pill} />
        </div>
      )}

      {activeTab === 'identificacao' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
           {/* ... existing identification fields ... */}
           {/* Include original content for identification tab */}
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
                <select className={selectClass} value={data.contract.planType} onChange={(e) => {
                    const val = e.target.value;
                    let price = data.contract.planValue;
                    if (val === 'Avulso') price = '119,99';
                    else if (val === 'Trimestral') price = '289,99';
                    else if (val === 'Semestral') price = '499,99';
                    else if (val === 'Anual') price = '899,99';
                    
                    const newData = JSON.parse(JSON.stringify(data));
                    newData.contract.planType = val;
                    newData.contract.planValue = price;
                    
                    // Calcula nova data de término
                    const calc = calculateEndDate(data.contract.startDate, val);
                    if (calc) {
                      newData.contract.endDate = calc.endDate;
                      newData.contract.durationDays = calc.durationDays;
                    }
                    
                    onChange(newData);
                }}>
                  <option value="Avulso">Avulso (1 Mês)</option>
                  <option value="Trimestral">Trimestral (3 Meses)</option>
                  <option value="Semestral">Semestral (6 Meses)</option>
                  <option value="Anual">Anual (12 Meses)</option>
                </select>
              </div>
              <div className="col-span-2 hidden lg:block"></div>

              <div>
                <label className={labelClass}>Início</label>
                <input 
                  type="date" 
                  className={inputClass} 
                  value={(() => {
                    const val = data.contract.startDate;
                    if (!val) return '';
                    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
                    if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const [day, month, year] = val.split('/');
                      return `${year}-${month}-${day}`;
                    }
                    return val;
                  })()} 
                  onChange={(e) => {
                    const newVal = e.target.value;
                    const newData = JSON.parse(JSON.stringify(data));
                    newData.contract.startDate = newVal;
                    
                    // Calcula nova data de término
                    const calc = calculateEndDate(newVal, data.contract.planType);
                    if (calc) {
                      newData.contract.endDate = calc.endDate;
                      newData.contract.durationDays = calc.durationDays;
                    }
                    
                    onChange(newData);
                  }} 
                />
              </div>
              <div>
                <label className={labelClass}>Término</label>
                <input 
                  type="date" 
                  className={inputClass} 
                  value={(() => {
                    const val = data.contract.endDate;
                    if (!val) return '';
                    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
                    if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const [day, month, year] = val.split('/');
                      return `${year}-${month}-${day}`;
                    }
                    return val;
                  })()} 
                  onChange={(e) => handleChange('contract.endDate', e.target.value)} 
                />
              </div>
              
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
              <div>
                <label className={labelClass}>Data Avaliação</label>
                <input 
                  type="date" 
                  className={inputClass} 
                  value={(() => {
                    const val = data.physicalData.date;
                    if (!val) return '';
                    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
                    if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const [day, month, year] = val.split('/');
                      return `${year}-${month}-${day}`;
                    }
                    return val;
                  })()} 
                  onChange={(e) => handleChange('physicalData.date', e.target.value)} 
                />
              </div>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div><label className={labelClass}>Massa Muscular (kg)</label><input className={inputClass} value={data.physicalData.muscleMass} onChange={(e) => handleChange('physicalData.muscleMass', e.target.value)} placeholder="00,0" /></div>
              <div><label className={labelClass}>Gordura Corporal (%)</label><input className={inputClass} value={data.physicalData.bodyFat} onChange={(e) => handleChange('physicalData.bodyFat', e.target.value)} placeholder="00,0" /></div>
              <div><label className={labelClass}>Gordura Visceral</label><input className={inputClass} value={data.physicalData.visceralFat} onChange={(e) => handleChange('physicalData.visceralFat', e.target.value)} placeholder="0" /></div>
              <div><label className={labelClass}>Água Corporal (%)</label><input className={inputClass} value={data.physicalData.waterPercentage} onChange={(e) => handleChange('physicalData.waterPercentage', e.target.value)} placeholder="00,0" /></div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6"><Ruler className="text-[#d4af37]" size={16} /><h3 className="text-sm font-black text-white uppercase tracking-widest">Medidas (cm)</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                      <div key={key}>
                          <label className={labelClass}>{label}</label>
                          <input 
                            className={inputClass} 
                            value={(data.physicalData?.measurements as any)?.[key] || ''} 
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
                <div className="flex gap-2 w-full md:w-auto flex-wrap">
                    <button onClick={handleClearNutrition} className={btnClearClass}><Eraser size={14} /> Limpar</button>
                    <button onClick={handleGenerateNutritionAI} disabled={isGenerating} className="px-4 py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-auto">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{isGenerating ? 'Gerando...' : 'Gerar Dieta (Gemini)'}</button>
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
                    <div className="flex-1 w-full">
                        <label className={labelClass}>Nome</label>
                        <input className={inputClass + " mb-2"} value={meal.name} onChange={(e) => updateMeal(index, 'name', e.target.value)} />
                        <label className={labelClass}>Alimentos</label>
                        <textarea className={inputClass + " min-h-[60px] mb-2"} value={meal.details} onChange={(e) => updateMeal(index, 'details', e.target.value)} placeholder="Lista de alimentos..." />
                        <label className={labelClass}>Substituições (Opcional)</label>
                        <textarea className={inputClass + " min-h-[40px] text-xs opacity-80"} value={meal.substitutions || ''} onChange={(e) => updateMeal(index, 'substitutions', e.target.value)} placeholder="Opções de troca..." />
                    </div>
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

            <section className="bg-gradient-to-r from-[#d4af37]/10 to-transparent p-6 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] blur-[80px] opacity-10"></div>
              {isGenerating && (
                 <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <Loader2 size={40} className="text-[#d4af37] animate-spin mb-2" />
                    <p className="text-[#d4af37] font-black uppercase tracking-widest text-xs animate-pulse">CRIANDO TREINO...</p>
                 </div>
              )}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#d4af37] text-black rounded-xl shrink-0"><Sparkles size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerador de Treino IA</h3>
                        <p className="text-sm text-white/60 max-w-lg">A IA criará uma periodização completa baseada na frequência e nível do aluno.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto flex-wrap">
                      <button onClick={handleGenerateTrainingAI} disabled={isGenerating} className="px-4 py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-auto">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{isGenerating ? 'Gerando...' : 'Gerar Treino (Gemini)'}</button>
                  </div>
              </div>
            </section>

            <div className="mb-6"><label className={labelClass}>Frequência Semanal</label><input className={inputClass} value={data.trainingFrequency} onChange={(e) => handleChange('trainingFrequency', e.target.value)} placeholder="Ex: 5x na semana" /></div>
            <div className="mb-6">
                <label className={labelClass}>Linha de Raciocínio</label>
                <textarea 
                    className={textAreaClass} 
                    value={data.trainingReasoning || ''} 
                    onChange={(e) => handleChange('trainingReasoning', e.target.value)} 
                    placeholder="Explique a linha de raciocínio adotada para este treino..." 
                />
            </div>
            <div className="space-y-8">
              {(data.trainingDays || []).map((day, dIndex) => (
                <div key={day.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-white/5 pb-4 gap-4 md:gap-0">
                      <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                          <div className="w-full md:w-1/3"><label className={labelClass}>Título</label><input className={inputClass} value={day.title} onChange={(e) => updateTrainingDay(dIndex, 'title', e.target.value)} placeholder="Treino A" /></div>
                          <div className="flex-1 w-full"><label className={labelClass}>Foco</label><input className={inputClass} value={day.focus} onChange={(e) => updateTrainingDay(dIndex, 'focus', e.target.value)} placeholder="Peito e Tríceps" /></div>
                      </div>
                      <button onClick={() => removeTrainingDay(dIndex)} className="ml-0 md:ml-4 p-2 text-red-500 hover:text-red-500 w-full md:w-auto flex justify-center"><Trash2 size={20} /></button>
                    </div>
                    <div className="space-y-2 pl-0 md:pl-4 border-l-0 md:border-l-2 border-white/5">
                      {(day.exercises || []).map((ex, exIndex) => (
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

      {activeTab === 'ergogenicos' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
          <section>
            <div className="bg-[#d4af37]/10 p-6 rounded-[2rem] border border-[#d4af37]/20 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Pill size={120} /></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-lg"><Pill size={32} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Recursos Ergogênicos</h2>
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mt-1">Itens, Dosagens e Posologia</p>
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

            <div className="space-y-4">
              {(data.ergogenics || []).map((erg, index) => (
                <div key={erg.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-end group">
                    <div className="flex-1 w-full"><label className={labelClass}>Item / Substância</label><input className={inputClass} value={erg.name} onChange={(e) => updateErgogenic(index, 'name', e.target.value)} placeholder="Ex: Enantato de Testosterona" /></div>
                    <div className="w-full md:w-1/4"><label className={labelClass}>Dosagem</label><input className={inputClass} value={erg.dosage} onChange={(e) => updateErgogenic(index, 'dosage', e.target.value)} placeholder="Ex: 250mg" /></div>
                    <div className="w-full md:w-1/3"><label className={labelClass}>Posologia / Horário</label><input className={inputClass} value={erg.timing} onChange={(e) => updateErgogenic(index, 'timing', e.target.value)} placeholder="Ex: 1ml por semana" /></div>
                    <button onClick={() => removeErgogenic(index)} className="w-full md:w-auto p-3 text-red-500 hover:text-red-500 transition-colors flex justify-center"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addErgogenic} className={addButtonClass}><Plus size={16} /> Adicionar Item Ergogênico</button>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl mt-12">
              <div className="flex items-center gap-3 mb-3 text-red-500">
                <AlertCircle size={20} />
                <h4 className="font-black uppercase text-xs tracking-widest">Aviso de Segurança</h4>
              </div>
              <p className="text-white/40 text-xs leading-relaxed italic">
                A prescrição de ergogênicos é de responsabilidade técnica. Certifique-se de que o aluno está ciente dos riscos e benefícios. 
                Este campo é destinado apenas para organização do protocolo.
              </p>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};

export default React.memo(ProtocolForm);
