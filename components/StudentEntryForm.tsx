
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { EMPTY_DATA, LOGO_VBR_BLACK } from '../constants';
import { db } from '../services/db';
import { 
  User, 
  MapPin, 
  Activity, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Dumbbell,
  Utensils,
  AlertCircle,
  Loader2,
  Trophy
} from 'lucide-react';

interface Props {
  onCancel: () => void;
}

const StudentEntryForm: React.FC<Props> = ({ onCancel }) => {
  const [step, setStep] = useState(0); // Começa no passo 0 (Intro)
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [data, setData] = useState<ProtocolData>(() => ({
    ...EMPTY_DATA,
    id: "vbr-student-" + Date.now().toString(36),
    updatedAt: new Date().toISOString(),
    contract: {
        ...EMPTY_DATA.contract,
        status: 'Aguardando'
    },
    physicalData: {
        ...EMPTY_DATA.physicalData,
        measurements: EMPTY_DATA.physicalData.measurements || {
            thorax: "", waist: "", abdomen: "", glutes: "",
            rightArmRelaxed: "", leftArmRelaxed: "", rightArmContracted: "", leftArmContracted: "",
            rightThigh: "", leftThigh: "", rightCalf: "", leftCalf: ""
        }
    }
  }));

  const handleChange = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setData(newData);
  };

  const handleSave = async () => {
    if (!data.clientName || !data.contract.phone) {
        alert("⚠️ Nome e Celular são obrigatórios.");
        return;
    }

    setIsSaving(true);
    try {
        const finalData = {
            ...data,
            updatedAt: new Date().toISOString(),
            contract: { ...data.contract, status: 'Aguardando' as const }
        };
        await db.saveProtocol(finalData);
        setIsSuccess(true);
    } catch (error: any) {
        alert("Erro ao enviar: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  // Styles
  const labelClass = "block text-[11px] font-black text-white/40 mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-5 bg-[#1a1a1a] border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none font-bold text-white text-base transition-all";
  const textAreaClass = "w-full p-5 bg-[#1a1a1a] border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none font-medium text-white text-base transition-all min-h-[140px] resize-y";

  // TELA DE SUCESSO
  if (isSuccess) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#111] border border-white/10 p-10 rounded-[2.5rem] text-center max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#d4af37]"></div>
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Recebido!</h2>
                <p className="text-white/60 text-sm mb-10 font-medium leading-relaxed">
                    Seus dados já estão com nossa equipe. Seu treinador irá analisar seu perfil e entrará em contato em breve para dar início ao seu protocolo.
                </p>
                <button 
                    onClick={onCancel}
                    className="w-full bg-[#d4af37] text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-lg"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
      );
  }

  // TELA DE INTRODUÇÃO (PASSO 0)
  if (step === 0) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
             <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-24 w-auto mb-12" />
             <div className="text-center max-w-lg space-y-6">
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Bem-vindo ao <span className="text-[#d4af37]">Team VBR</span>
                 </h1>
                 <p className="text-white/60 text-lg font-medium leading-relaxed">
                    Para criarmos o protocolo perfeito para você, precisamos conhecer seus hábitos, histórico e objetivos.
                 </p>
                 <div className="flex flex-col gap-4 pt-8 w-full">
                     <button 
                        onClick={() => setStep(1)}
                        className="w-full bg-[#d4af37] text-black py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                     >
                        Iniciar Cadastro <ChevronRight size={20} />
                     </button>
                     <p className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-4">
                        Tempo estimado: 3 minutos
                     </p>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#111] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col h-[90vh]">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setStep(step - 1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/60">
                <ChevronLeft size={20} />
            </button>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#d4af37] transition-all duration-500 ease-out" 
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>
            <span className="text-xs font-black text-[#d4af37]">{step}/3</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
            
            {/* STEP 1 */}
            {step === 1 && (
                <div className="animate-in slide-in-from-right-10 duration-500">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Quem é você?</h2>
                        <p className="text-white/50">Seus dados de contato para envio do protocolo.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Nome Completo</label>
                            <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Seu nome completo" autoFocus />
                        </div>
                        <div>
                            <label className={labelClass}>Celular (WhatsApp)</label>
                            <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" type="tel" />
                        </div>
                        <div>
                            <label className={labelClass}>E-mail (Opcional)</label>
                            <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} type="email" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Idade</label>
                                <input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} type="number" />
                            </div>
                            <div>
                                <label className={labelClass}>Gênero</label>
                                <select className={inputClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
                                    <option value="">--</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <div className="animate-in slide-in-from-right-10 duration-500">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Seus Objetivos</h2>
                        <p className="text-white/50">Conte-nos onde você quer chegar e seu histórico.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Qual seu principal objetivo?</label>
                            <input 
                                className={inputClass} 
                                value={data.anamnesis.mainObjective} 
                                onChange={(e) => handleChange('anamnesis.mainObjective', e.target.value)} 
                                placeholder="Ex: Perder gordura, ganhar massa..." 
                            />
                        </div>
                        
                        <div>
                            <label className={labelClass}>Como é sua rotina diária?</label>
                            <textarea 
                                className={textAreaClass} 
                                value={data.anamnesis.routine} 
                                onChange={(e) => handleChange('anamnesis.routine', e.target.value)} 
                                placeholder="Horário que acorda, trabalha, dorme. É sedentário no trabalho?" 
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Histórico de Treino e Lesões</label>
                            <textarea 
                                className={textAreaClass} 
                                value={data.anamnesis.trainingHistory} 
                                onChange={(e) => handleChange('anamnesis.trainingHistory', e.target.value)} 
                                placeholder="Já treina? Tem alguma lesão que impeça movimentos?" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div className="animate-in slide-in-from-right-10 duration-500">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Corpo & Nutrição</h2>
                        <p className="text-white/50">Dados para cálculo metabólico.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} type="number" /></div>
                        <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} /></div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Preferências Alimentares / Alergias</label>
                            <textarea 
                                className={textAreaClass} 
                                value={data.anamnesis.foodPreferences} 
                                onChange={(e) => handleChange('anamnesis.foodPreferences', e.target.value)} 
                                placeholder="O que você gosta de comer? O que não suporta? Tem alergias?" 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Uso de Medicamentos / Suplementos</label>
                            <textarea 
                                className={textAreaClass + " min-h-[80px]"} 
                                value={data.anamnesis.ergogenics} 
                                onChange={(e) => handleChange('anamnesis.ergogenics', e.target.value)} 
                                placeholder="Toma algo atualmente?" 
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Botão Flutuante de Ação */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#111] via-[#111] to-transparent">
            {step < 3 ? (
                <button 
                    onClick={() => setStep(step + 1)} 
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#d4af37] transition-all flex items-center justify-center gap-2"
                >
                    Continuar <ChevronRight size={16} />
                </button>
            ) : (
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full bg-[#d4af37] text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} 
                    {isSaving ? 'Enviando...' : 'Finalizar Cadastro'}
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default StudentEntryForm;
