
import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

interface Props {
  onCancel: () => void;
}

const StudentEntryForm: React.FC<Props> = ({ onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Novo estado para tela de sucesso

  // Inicialização segura garantindo que objetos aninhados existam
  const [data, setData] = useState<ProtocolData>(() => ({
    ...EMPTY_DATA,
    id: "vbr-student-" + Date.now().toString(36),
    updatedAt: new Date().toISOString(),
    contract: {
        ...EMPTY_DATA.contract,
        status: 'Aguardando' // Garante status correto
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
    
    // Navega e cria objetos se não existirem
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setData(newData);
  };

  const handleSave = async () => {
    if (!data.clientName || !data.contract.phone) {
        alert("Por favor, preencha pelo menos Nome e Celular para que possamos entrar em contato.");
        setStep(1); // Volta para o passo 1 se faltar dados básicos
        return;
    }

    setIsSaving(true);
    try {
        // Força status e data atualizada
        const finalData = {
            ...data,
            updatedAt: new Date().toISOString(),
            contract: {
                ...data.contract,
                status: 'Aguardando' as const
            }
        };
        
        await db.saveProtocol(finalData);
        setIsSuccess(true); // Ativa tela de sucesso
    } catch (error: any) {
        alert("Erro ao salvar: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  // Classes de Estilo
  const labelClass = "block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const textAreaClass = "w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all min-h-[120px] resize-y";

  // TELA DE SUCESSO
  if (isSuccess) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] text-center max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#d4af37]"></div>
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Cadastro Recebido!</h2>
                <p className="text-white/60 text-sm mb-8 font-medium">
                    Seus dados foram enviados com sucesso para a equipe Team VBR. Em breve seu treinador entrará em contato para finalizar seu protocolo.
                </p>
                <button 
                    onClick={onCancel}
                    className="w-full bg-[#d4af37] text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-lg"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Compacto */}
        <div className="text-center mb-6 relative z-10 shrink-0">
           <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-12 w-auto mx-auto mb-4" />
           <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Ficha de Cadastro Team VBR</h1>
        </div>

        {/* Stepper Compacto */}
        <div className="flex justify-between items-center mb-8 px-4 md:px-20 relative z-10 shrink-0">
            {[
                { n: 1, l: "Dados Pessoais", i: <User size={14}/> },
                { n: 2, l: "Anamnese", i: <FileText size={14}/> },
                { n: 3, l: "Dados Físicos", i: <Activity size={14}/> }
            ].map((s) => (
                <div key={s.n} className={`flex flex-col items-center gap-2 ${step === s.n ? 'text-[#d4af37] scale-110' : step > s.n ? 'text-white/40' : 'text-white/10'} transition-all`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === s.n ? 'border-[#d4af37] bg-[#d4af37]/10' : step > s.n ? 'border-white/20 bg-white/10' : 'border-white/5 bg-transparent'}`}>
                        {step > s.n ? <CheckCircle2 size={14} /> : s.i}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest hidden md:block">{s.l}</span>
                </div>
            ))}
            <div className="absolute top-4 left-24 right-24 h-[1px] bg-white/5 -z-10 hidden md:block">
                <div className="h-full bg-[#d4af37] transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
            {/* STEP 1: DADOS PESSOAIS */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 text-[#d4af37]">
                        <User size={16} /> Identificação
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nome Completo *</label>
                            <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Seu nome" />
                        </div>
                        <div>
                            <label className={labelClass}>Celular (WhatsApp) *</label>
                            <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className={labelClass}>CPF</label>
                            <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} placeholder="000.000.000-00" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>E-mail</label>
                            <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} placeholder="seu@email.com" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={12}/> Endereço</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 md:col-span-3"><label className={labelClass}>Rua</label><input className={inputClass} value={data.contract.street} onChange={(e) => handleChange('contract.street', e.target.value)} /></div>
                            <div><label className={labelClass}>Número</label><input className={inputClass} value={data.contract.number} onChange={(e) => handleChange('contract.number', e.target.value)} /></div>
                            <div className="col-span-2"><label className={labelClass}>Bairro</label><input className={inputClass} value={data.contract.neighborhood} onChange={(e) => handleChange('contract.neighborhood', e.target.value)} /></div>
                            <div><label className={labelClass}>Cidade</label><input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} /></div>
                            <div><label className={labelClass}>UF</label><input className={inputClass} value={data.contract.state} onChange={(e) => handleChange('contract.state', e.target.value)} maxLength={2} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: ANAMNESE */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 text-[#d4af37]">
                        <FileText size={16} /> Anamnese
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Objetivo Principal</label>
                            <input 
                                className={inputClass} 
                                value={data.anamnesis.mainObjective} 
                                onChange={(e) => handleChange('anamnesis.mainObjective', e.target.value)} 
                                placeholder="Ex: Emagrecimento, Hipertrofia, Performance..." 
                            />
                        </div>
                        
                        <div>
                            <label className={labelClass}>Rotina Diária (Trabalho, Sono, Horários)</label>
                            <textarea 
                                className={textAreaClass} 
                                value={data.anamnesis.routine} 
                                onChange={(e) => handleChange('anamnesis.routine', e.target.value)} 
                                placeholder="Descreva como é o seu dia a dia, horários que acorda, trabalha, dorme, etc." 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className={labelClass + " flex items-center gap-2"}><Dumbbell size={12} className="text-[#d4af37]" /> Histórico de Treino</label>
                                <textarea 
                                    className={textAreaClass} 
                                    value={data.anamnesis.trainingHistory} 
                                    onChange={(e) => handleChange('anamnesis.trainingHistory', e.target.value)} 
                                    placeholder="Treina há quanto tempo? Qual modalidade? Já fez dieta?" 
                                />
                             </div>
                             <div>
                                <label className={labelClass + " flex items-center gap-2"}><Utensils size={12} className="text-[#d4af37]" /> Preferências Alimentares</label>
                                <textarea 
                                    className={textAreaClass} 
                                    value={data.anamnesis.foodPreferences} 
                                    onChange={(e) => handleChange('anamnesis.foodPreferences', e.target.value)} 
                                    placeholder="Alimentos que ama, odeia ou tem alergia." 
                                />
                             </div>
                        </div>

                        <div>
                            <label className={labelClass + " flex items-center gap-2"}><AlertCircle size={12} className="text-[#d4af37]" /> Uso de Ergogênicos / Medicamentos</label>
                            <textarea 
                                className={textAreaClass + " min-h-[80px]"} 
                                value={data.anamnesis.ergogenics} 
                                onChange={(e) => handleChange('anamnesis.ergogenics', e.target.value)} 
                                placeholder="Usa ou já usou hormônios? Toma algum medicamento contínuo?" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: DADOS FÍSICOS */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 text-[#d4af37]">
                        <Activity size={16} /> Dados Físicos
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className={labelClass}>Peso (kg)</label><input className={inputClass} value={data.physicalData.weight} onChange={(e) => handleChange('physicalData.weight', e.target.value)} placeholder="00,00" /></div>
                        <div><label className={labelClass}>Altura (m)</label><input className={inputClass} value={data.physicalData.height} onChange={(e) => handleChange('physicalData.height', e.target.value)} placeholder="1,75" /></div>
                        <div><label className={labelClass}>Idade</label><input className={inputClass} value={data.physicalData.age} onChange={(e) => handleChange('physicalData.age', e.target.value)} /></div>
                        <div>
                            <label className={labelClass}>Gênero</label>
                            <select className={inputClass} value={data.physicalData.gender} onChange={(e) => handleChange('physicalData.gender', e.target.value)}>
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mt-6">
                        <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4">Medidas (Se souber)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Usando encadeamento opcional e fallback para evitar crash */}
                            <div><label className={labelClass}>Cintura</label><input className={inputClass} value={data.physicalData.measurements?.waist || ''} onChange={(e) => handleChange('physicalData.measurements.waist', e.target.value)} /></div>
                            <div><label className={labelClass}>Abdômen</label><input className={inputClass} value={data.physicalData.measurements?.abdomen || ''} onChange={(e) => handleChange('physicalData.measurements.abdomen', e.target.value)} /></div>
                            <div><label className={labelClass}>Quadril</label><input className={inputClass} value={data.physicalData.measurements?.glutes || ''} onChange={(e) => handleChange('physicalData.measurements.glutes', e.target.value)} /></div>
                            <div><label className={labelClass}>Braço</label><input className={inputClass} value={data.physicalData.measurements?.rightArmRelaxed || ''} onChange={(e) => handleChange('physicalData.measurements.rightArmRelaxed', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-between items-center pt-6 border-t border-white/5 shrink-0">
            {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    <ChevronLeft size={16} /> Voltar
                </button>
            ) : (
                <button onClick={onCancel} className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400">
                    Cancelar
                </button>
            )}

            {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                    Próximo <ChevronRight size={16} />
                </button>
            ) : (
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
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
