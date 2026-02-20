import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';
import { Loader2, Sparkles, User, Target, ChevronLeft, Dumbbell, Activity, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  onGenerate: (data: ProtocolData) => void;
  onCancel: () => void;
}

const ProtocolGenerator: React.FC<Props> = ({ onGenerate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Masculino',
    weight: '',
    height: '',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    frequency: '5',
    observations: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.weight) {
      setError("Nome e Peso são obrigatórios.");
      return;
    }
    setError('');
    setLoading(true);

    // SIMULAÇÃO SEM IA PARA CORRIGIR ERRO DE BUILD
    setTimeout(() => {
        const timestamp = new Date().toISOString();
        const newId = "vbr-" + Math.random().toString(36).substr(2, 9);

        const finalProtocol: ProtocolData = {
          ...EMPTY_DATA,
          id: newId,
          clientName: formData.name,
          createdAt: timestamp,
          updatedAt: timestamp,
          protocolTitle: formData.goal,
          physicalData: {
            ...EMPTY_DATA.physicalData,
            weight: formData.weight,
            height: formData.height,
            age: formData.age,
            gender: formData.gender as any,
          },
          nutritionalStrategy: "Estratégia a ser definida manualmente.",
          trainingFrequency: `${formData.frequency}x na semana`,
          generalObservations: formData.observations,
          anamnesis: {
             ...EMPTY_DATA.anamnesis,
             mainObjective: formData.goal,
             routine: formData.observations
          }
        };

        alert("A geração automática por IA foi desativada temporariamente para manutenção. Um protocolo base foi criado com seus dados.");
        onGenerate(finalProtocol);
        setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <button onClick={onCancel} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors mb-6">
        <ChevronLeft size={16} /> Cancelar e Voltar
      </button>

      <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <Sparkles size={300} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-[#d4af37] text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
               <Sparkles size={28} fill="black" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Gerador de Protocolo</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Criação Rápida de Ficha</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             {/* Coluna 1 */}
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Nome do Aluno</label>
                   <div className="relative">
                      <input 
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#d4af37] outline-none transition-colors"
                        placeholder="Nome Completo"
                      />
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Idade</label>
                      <input 
                        value={formData.age}
                        onChange={e => handleChange('age', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                        placeholder="Anos"
                        type="number"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Gênero</label>
                      <select 
                        value={formData.gender}
                        onChange={e => handleChange('gender', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                      >
                         <option value="Masculino">Masculino</option>
                         <option value="Feminino">Feminino</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Peso (kg)</label>
                      <input 
                        value={formData.weight}
                        onChange={e => handleChange('weight', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                        placeholder="00.0"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Altura (m)</label>
                      <input 
                        value={formData.height}
                        onChange={e => handleChange('height', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                        placeholder="1.75"
                      />
                   </div>
                </div>
             </div>

             {/* Coluna 2 */}
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Objetivo Principal</label>
                   <div className="relative">
                      <select 
                        value={formData.goal}
                        onChange={e => handleChange('goal', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                      >
                         <option value="Emagrecimento">Emagrecimento (Perda de Gordura)</option>
                         <option value="Hipertrofia">Hipertrofia (Ganho de Massa)</option>
                         <option value="Recomposição">Recomposição Corporal</option>
                         <option value="Performance">Performance Atlética</option>
                      </select>
                      <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Nível</label>
                      <div className="relative">
                        <select 
                            value={formData.level}
                            onChange={e => handleChange('level', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                        >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                        </select>
                        <Activity size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Frequência</label>
                      <div className="relative">
                        <input 
                            value={formData.frequency}
                            onChange={e => handleChange('frequency', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-bold focus:border-[#d4af37] outline-none"
                            placeholder="Dias"
                            type="number"
                        />
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Observações / Restrições</label>
                   <textarea 
                     value={formData.observations}
                     onChange={e => handleChange('observations', e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none resize-none h-[110px]"
                     placeholder="Ex: Lesão no joelho, não come peixe, treina pela manhã..."
                   />
                </div>
             </div>
          </div>

          {error && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-xs font-bold text-red-400">{error}</p>
             </div>
          )}

          <div className="flex gap-4">
             <button 
                onClick={() => onGenerate({ ...EMPTY_DATA, clientName: formData.name || "Novo Aluno" })}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all"
             >
                Pular (Manual)
             </button>
             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex-[2] py-4 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Criando...' : 'Iniciar Protocolo'}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProtocolGenerator;