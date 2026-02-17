
import React, { useState } from 'react';
import { ProtocolData, Anamnesis } from '../types';
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
  AlertCircle
} from 'lucide-react';

interface Props {
  onCancel: () => void;
}

const StudentEntryForm: React.FC<Props> = ({ onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ProtocolData>({
    ...EMPTY_DATA,
    id: "vbr-student-" + Date.now().toString(36),
    updatedAt: new Date().toISOString()
  });

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
        alert("Por favor, preencha pelo menos Nome e Celular.");
        return;
    }

    setIsSaving(true);
    try {
        await db.saveProtocol(data);
        alert("Cadastro realizado com sucesso! Aguarde o contato do treinador.");
        onCancel();
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-10 relative z-10">
           <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-16 w-auto mx-auto mb-6" />
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ficha de Cadastro Team VBR</h1>
           <p className="text-white/40 text-xs mt-2 max-w-md mx-auto">
             Preencha as informações com atenção. Esses dados serão usados para montar seu contrato e seu protocolo personalizado.
           </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-10 px-4 md:px-20 relative z-10">
            {[
                { n: 1, l: "Dados Pessoais", i: <User size={16}/> },
                { n: 2, l: "Anamnese", i: <FileText size={16}/> },
                { n: 3, l: "Dados Físicos", i: <Activity size={16}/> }
            ].map((s) => (
                <div key={s.n} className={`flex flex-col items-center gap-2 ${step === s.n ? 'text-[#d4af37] scale-110' : step > s.n ? 'text-white/40' : 'text-white/10'} transition-all`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.n ? 'border-[#d4af37] bg-[#d4af37]/10' : step > s.n ? 'border-white/20 bg-white/10' : 'border-white/5 bg-transparent'}`}>
                        {step > s.n ? <CheckCircle2 size={16} /> : s.i}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">{s.l}</span>
                </div>
            ))}
            {/* Linha de progresso visual */}
            <div className="absolute top-5 left-24 right-24 h-[2px] bg-white/5 -z-10 hidden md:block">
                <div className="h-full bg-[#d4af37] transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>
        </div>

        {/* STEP 1: DADOS PESSOAIS */}
        {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2 border-b border-white/5 pb-4">
                    <User className="text-[#d4af37]" size={20} /> Identificação e Contrato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nome Completo</label>
                        <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Seu nome" />
                    </div>
                    <div>
                        <label className={labelClass}>Celular (WhatsApp)</label>
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
                    <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14}/> Endereço Completo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3"><label className={labelClass}>Rua</label><input className={inputClass} value={data.contract.street} onChange={(e) => handleChange('contract.street', e.target.value)} /></div>
                        <div><label className={labelClass}>Número</label><input className={inputClass} value={data.contract.number} onChange={(e) => handleChange('contract.number', e.target.value)} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>Bairro</label><input className={inputClass} value={data.contract.neighborhood} onChange={(e) => handleChange('contract.neighborhood', e.target.value)} /></div>
                        <div><label className={labelClass}>Cidade</label><input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} /></div>
                        <div><label className={labelClass}>Estado (UF)</label><input className={inputClass} value={data.contract.state} onChange={(e) => handleChange('contract.state', e.target.value)} maxLength={2} /></div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: ANAMNESE */}
        {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2 border-b border-white/5 pb-4">
                    <FileText className="text-[#d4af37]" size={20} /> Anamnese Detalhada
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
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2 border-b border-white/5 pb-4">
                    <Activity className="text-[#d4af37]" size={20} /> Dados Físicos Atuais
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
                    <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest mb-4">Se souber suas medidas (Opcional)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className={labelClass}>Cintura</label><input className={inputClass} value={data.physicalData.measurements.waist} onChange={(e) => handleChange('physicalData.measurements.waist', e.target.value)} /></div>
                        <div><label className={labelClass}>Abdômen</label><input className={inputClass} value={data.physicalData.measurements.abdomen} onChange={(e) => handleChange('physicalData.measurements.abdomen', e.target.value)} /></div>
                        <div><label className={labelClass}>Quadril/Glúteo</label><input className={inputClass} value={data.physicalData.measurements.glutes} onChange={(e) => handleChange('physicalData.measurements.glutes', e.target.value)} /></div>
                        <div><label className={labelClass}>Braço</label><input className={inputClass} value={data.physicalData.measurements.rightArmRelaxed} onChange={(e) => handleChange('physicalData.measurements.rightArmRelaxed', e.target.value)} /></div>
                    </div>
                </div>
            </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
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
                <button onClick={() => setStep(step + 1)} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                    Próximo <ChevronRight size={16} />
                </button>
            ) : (
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-[#d4af37] text-black px-10 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Finalizar Cadastro'} <Save size={16} />
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default StudentEntryForm;
