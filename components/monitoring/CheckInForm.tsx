import React, { useState } from 'react';
import { ProtocolData, BodyMeasurementEntry, Feedback } from '../../types';
import { db } from '../../services/db';
import { MEASUREMENT_LABELS } from '../../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Save, 
  Loader2, 
  FileText, 
  Sparkles, 
  Calendar, 
  Ruler, 
  MessageSquare,
  ArrowRight,
  Activity,
  Info
} from 'lucide-react';
import ProtocolPreview from '../ProtocolPreview';

interface Props {
  studentId: string;
  currentProtocol: ProtocolData;
  onUpdateProtocol: (protocol: ProtocolData) => void;
  onSuccess: () => void;
}

const CheckInForm: React.FC<Props> = ({ studentId, currentProtocol, onUpdateProtocol, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [generateNewProtocol, setGenerateNewProtocol] = useState(false);
  
  // Estado unificado para o check-in
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [measurements, setMeasurements] = useState<Partial<BodyMeasurementEntry>>({
    weight: '',
    chest: '',
    waist: '',
    abdomen: '',
    hip: '',
    armRight: '',
    armLeft: '',
    thighRight: '',
    thighLeft: '',
    calf: '',
    bodyFat: ''
  });

  const [feedback, setFeedback] = useState<Partial<Feedback>>({
    dietAdherence: 'Boa',
    trainingAdherence: 'Boa',
    sleepQuality: '',
    energyLevel: '',
    notes: '',
  });

  const generateAIProtocol = async (baseProtocol: ProtocolData, feedback: Partial<Feedback>, measurements: Partial<BodyMeasurementEntry>) => {
    try {
        const prompt = `
          Aja como um nutricionista e treinador de elite do 'Team VBR'.
          O aluno realizou um CHECK-IN de acompanhamento.
          Gere um NOVO protocolo (Dieta e Treino) ajustado com base no feedback, novas medidas e no protocolo atual.

          DADOS DO ALUNO:
          - Nome: ${baseProtocol.clientName}
          - Idade: ${baseProtocol.physicalData.age}
          - Peso Anterior: ${baseProtocol.physicalData.weight}kg
          - Peso ATUAL (Check-in): ${measurements.weight}kg
          - Objetivo: ${baseProtocol.protocolTitle}

          PROTOCOLO ATUAL (USE COMO BASE PARA O NOVO):
          - Estratégia Nutricional Atual: ${baseProtocol.nutritionalStrategy || 'Não informada'}
          - Refeições Atuais: ${JSON.stringify(baseProtocol.meals || [])}
          - Treino Atual: ${JSON.stringify(baseProtocol.trainingDays || [])}
          - Observações Gerais / Anamnese: ${JSON.stringify(baseProtocol.anamnesis || {})}

          FEEDBACK DO CHECK-IN:
          - Adesão à Dieta: ${feedback.dietAdherence}
          - Adesão ao Treino: ${feedback.trainingAdherence}
          - Qualidade do Sono: ${feedback.sleepQuality}
          - Nível de Energia: ${feedback.energyLevel}
          - Observações do Aluno: "${feedback.notes}"

          DIRETRIZES:
          1. Utilize o PROTOCOLO ATUAL como base. Faça ajustes apenas onde for necessário com base no feedback e nas novas medidas.
          2. Se a adesão foi BAIXA, simplifique a dieta e o treino.
          3. Se o peso estagnou e o objetivo é emagrecer, reduza levemente as calorias.
          4. Se o peso subiu e o objetivo é ganho de massa, mantenha ou ajuste conforme adesão.
          5. Mantenha a estrutura de refeições mas varie os alimentos para não enjoar.
          6. Leve em consideração as Observações Gerais / Anamnese para restrições e preferências.

          Gere um JSON com a seguinte estrutura (apenas os campos que devem ser atualizados):
          {
            "nutritionalStrategy": "Nova estratégia baseada no feedback",
            "kcalGoal": "Nova meta calórica",
            "macros": {
               "protein": { "value": "g", "ratio": "g/kg" },
               "carbs": { "value": "g", "ratio": "g/kg" },
               "fats": { "value": "g", "ratio": "g/kg" }
            },
            "meals": [
              { "time": "08:00", "name": "Nome", "details": "Alimentos", "substitutions": "Opções" }
            ],
            "trainingReasoning": "Explicação do novo treino",
            "trainingDays": [
              {
                "title": "Treino A",
                "focus": "Foco",
                "exercises": [ { "name": "Nome", "sets": "4x10" } ]
              }
            ],
            "tips": ["Nova dica baseada no feedback"]
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
                                    details: { type: Type.STRING },
                                    substitutions: { type: Type.STRING }
                                },
                                required: ["time", "name", "details"]
                            }
                        },
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
                        },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["nutritionalStrategy", "kcalGoal", "macros", "meals", "trainingReasoning", "trainingDays", "tips"]
                }
            }
        });

        const jsonStr = response.text?.trim() || "{}";
        const aiData = JSON.parse(jsonStr.replace(/^```json/, '').replace(/```$/, ''));
        return aiData;

    } catch (error) {
        console.error("Erro ao gerar protocolo IA:", error);
        alert("Erro ao gerar novo protocolo com IA. O protocolo será criado apenas com atualização de medidas.");
        return null;
    }
  };

  const handleSave = async () => {
    if (!measurements.weight) {
      alert("Peso é obrigatório para o check-in.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Salvar Medidas
      const cleanMeasurements = {
        ...measurements,
        date: checkInDate,
        studentId,
        weight: measurements.weight ? parseFloat(measurements.weight) : null,
        chest: measurements.chest ? parseFloat(measurements.chest) : null,
        waist: measurements.waist ? parseFloat(measurements.waist) : null,
        abdomen: measurements.abdomen ? parseFloat(measurements.abdomen) : null,
        hip: measurements.hip ? parseFloat(measurements.hip) : null,
        armRight: measurements.armRight ? parseFloat(measurements.armRight) : null,
        armLeft: measurements.armLeft ? parseFloat(measurements.armLeft) : null,
        thighRight: measurements.thighRight ? parseFloat(measurements.thighRight) : null,
        thighLeft: measurements.thighLeft ? parseFloat(measurements.thighLeft) : null,
        calf: measurements.calf ? parseFloat(measurements.calf) : null,
        bodyFat: measurements.bodyFat ? parseFloat(measurements.bodyFat) : null,
        createdAt: new Date().toISOString()
      };
      
      await db.saveMeasurement(cleanMeasurements);

      // 2. Salvar Feedback (se houver observações ou dados preenchidos)
      if (feedback.notes || feedback.sleepQuality || feedback.energyLevel) {
        await db.saveFeedback({
          ...feedback,
          date: checkInDate,
          studentId,
          createdAt: new Date().toISOString()
        });
      }

      // 3. Gerar Novo Protocolo (se selecionado)
      if (generateNewProtocol) {
        let aiProtocolData = null;
        
        // Chama a IA para gerar novos dados
        aiProtocolData = await generateAIProtocol(currentProtocol, feedback, measurements);

        const newProtocol: ProtocolData = {
          ...currentProtocol,
          id: Math.random().toString(36).substr(2, 9), // Novo ID temporário, será ajustado no save real
          studentId: studentId, // Garante o vínculo com o aluno
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOriginal: false,
          version: (currentProtocol.version || 1) + 1,
          physicalData: {
            ...currentProtocol.physicalData,
            date: checkInDate,
            weight: measurements.weight || currentProtocol.physicalData.weight,
            bodyFat: measurements.bodyFat || currentProtocol.physicalData.bodyFat,
            measurements: {
              ...currentProtocol.physicalData.measurements,
              thorax: measurements.chest || currentProtocol.physicalData.measurements.thorax,
              waist: measurements.waist || currentProtocol.physicalData.measurements.waist,
              abdomen: measurements.abdomen || currentProtocol.physicalData.measurements.abdomen,
              glutes: measurements.hip || currentProtocol.physicalData.measurements.glutes,
              rightArmRelaxed: measurements.armRight || currentProtocol.physicalData.measurements.rightArmRelaxed,
              leftArmRelaxed: measurements.armLeft || currentProtocol.physicalData.measurements.leftArmRelaxed,
              rightThigh: measurements.thighRight || currentProtocol.physicalData.measurements.rightThigh,
              leftThigh: measurements.thighLeft || currentProtocol.physicalData.measurements.leftThigh,
              rightCalf: measurements.calf || currentProtocol.physicalData.measurements.rightCalf,
              leftCalf: measurements.calf || currentProtocol.physicalData.measurements.leftCalf, // Assumindo simetria se só um campo
            },
            observations: feedback.notes || currentProtocol.physicalData.observations
          },
          anamnesis: {
            ...currentProtocol.anamnesis,
            // Adiciona notas do feedback ao histórico ou observações gerais se desejar
          },
          generalObservations: feedback.notes ? `${currentProtocol.generalObservations || ''}\n\n[Check-in ${checkInDate}]: ${feedback.notes}` : currentProtocol.generalObservations,
          
          // Atualiza com dados da IA se disponíveis
          ...(aiProtocolData ? {
            nutritionalStrategy: aiProtocolData.nutritionalStrategy || currentProtocol.nutritionalStrategy,
            kcalGoal: aiProtocolData.kcalGoal || currentProtocol.kcalGoal,
            macros: aiProtocolData.macros || currentProtocol.macros,
            meals: aiProtocolData.meals ? aiProtocolData.meals.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) })) : currentProtocol.meals,
            trainingReasoning: aiProtocolData.trainingReasoning || currentProtocol.trainingReasoning,
            trainingDays: aiProtocolData.trainingDays ? aiProtocolData.trainingDays.map((d: any) => ({
                ...d,
                id: Math.random().toString(36).substr(2, 9),
                exercises: d.exercises.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))
            })) : currentProtocol.trainingDays,
            tips: aiProtocolData.tips || currentProtocol.tips
          } : {})
        };
        
        onUpdateProtocol(newProtocol);
      } else {
        onSuccess(); // Apenas recarrega os dados na tela de monitoramento
      }

      alert("Check-in realizado com sucesso!");
      
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar check-in.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header e Visualização do Protocolo Atual */}
      <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Activity size={120} /></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <div className="bg-[#d4af37] text-black p-2 rounded-lg"><Calendar size={24} /></div>
              Novo Check-in
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 ml-1">
              Atualização de medidas e feedback
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-2 pr-4 rounded-xl border border-white/5">
            <div className="text-right">
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Protocolo Ativo</p>
              <p className="text-xs font-black text-[#d4af37] uppercase">{currentProtocol.protocolTitle || 'Sem Título'}</p>
            </div>
            <ProtocolPreview data={currentProtocol} customTrigger={
              <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all">
                <FileText size={20} />
              </button>
            } />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coluna 1: Medidas */}
        <div className="bg-[#1a1a1a] border border-[#d4af37]/20 rounded-[2rem] p-6 shadow-lg">
          <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <Ruler size={16} /> Medidas Corporais
          </h3>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Data do Check-in</label>
              <input 
                type="date" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Peso (kg) *</label>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                  value={measurements.weight}
                  onChange={e => setMeasurements({...measurements, weight: e.target.value})}
                  placeholder="00.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Gordura (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                  value={measurements.bodyFat}
                  onChange={e => setMeasurements({...measurements, bodyFat: e.target.value})}
                  placeholder="00.0"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-3">Circunferências (cm)</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <input 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-bold focus:border-[#d4af37] outline-none placeholder-white/20"
                      value={(measurements as any)[key] || ''}
                      onChange={e => setMeasurements({...measurements, [key]: e.target.value})}
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Feedback e Ações */}
        <div className="flex flex-col gap-8">
          
          {/* Feedback */}
          <div className="bg-[#1a1a1a] border border-[#d4af37]/20 rounded-[2rem] p-6 shadow-lg flex-1">
            <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <MessageSquare size={16} /> Feedback & Observações
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Adesão Dieta</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                  value={feedback.dietAdherence}
                  onChange={e => setFeedback({...feedback, dietAdherence: e.target.value as any})}
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Adesão Treino</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                  value={feedback.trainingAdherence}
                  onChange={e => setFeedback({...feedback, trainingAdherence: e.target.value as any})}
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Observações Gerais</label>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[120px]"
                value={feedback.notes}
                onChange={e => setFeedback({...feedback, notes: e.target.value})}
                placeholder="Como foi a semana? Dificuldades? Pontos positivos?..."
              />
            </div>
          </div>

          {/* Ações */}
          <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => setGenerateNewProtocol(!generateNewProtocol)}>
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${generateNewProtocol ? 'bg-[#d4af37] border-[#d4af37] text-black' : 'border-white/20 text-transparent'}`}>
                <Sparkles size={14} fill="black" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest select-none">Gerar Novo Protocolo</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider select-none">Criar nova versão com base nestes dados</p>
              </div>
            </div>

            {!generateNewProtocol && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Modo Histórico</p>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Os dados serão salvos apenas no histórico de acompanhamento. O protocolo atual (Medidas, Dieta e Treino) <strong>não será alterado</strong>.
                  </p>
                </div>
              </div>
            )}

            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                generateNewProtocol 
                  ? 'bg-[#d4af37] text-black hover:bg-[#c5a028]' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : (generateNewProtocol ? <Sparkles size={18} /> : <Save size={18} />)}
              {generateNewProtocol ? 'Salvar & Gerar Novo Protocolo' : 'Registrar Apenas no Histórico'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
