
import React, { useState, useEffect } from 'react';
import { ProtocolData } from '../types';
import { TrendingUp, ClipboardList, ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock, Activity, Edit3, Save, Loader2, Eye, PlusCircle, FileText, ArrowRight } from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData?: (newData: ProtocolData, createHistory?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onOpenEditor?: () => void;
}

const EvolutionTracker: React.FC<Props> = ({ currentProtocol, history, onNotesChange, onUpdateData, onSelectHistory, onOpenEditor }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tempData, setTempData] = useState(currentProtocol.physicalData);

  // Sincroniza o estado local (inputs) se o protocolo atual mudar externamente
  useEffect(() => {
    setTempData(currentProtocol.physicalData);
  }, [currentProtocol.physicalData]);

  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistory = [...history].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Encontra o item anterior para comparação
  const previous = sortedHistory.find(p => p.id !== currentProtocol.id) || (sortedHistory.length > 1 ? sortedHistory[1] : null);

  const getDifference = (curr: string | undefined, prev: string | undefined) => {
    if (!curr || !prev) return null;
    const c = parseFloat(curr.replace(',', '.'));
    const p = parseFloat(prev.replace(',', '.'));
    if (isNaN(c) || isNaN(p)) return null;
    return c - p;
  };

  const renderDiff = (diff: number | null, inverse: boolean = false) => {
    if (diff === null) return null;
    if (Math.abs(diff) < 0.01) return <span className="text-white/20 flex items-center gap-0.5 font-bold"><Minus size={10}/> 0</span>;
    
    const isPositive = diff > 0;
    const isGood = inverse ? !isPositive : isPositive;
    
    return (
      <span className={`flex items-center gap-0.5 text-[10px] font-black ${isGood ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
        {Math.abs(diff).toFixed(1)}
      </span>
    );
  };

  // Salva alterações no protocolo ATUAL (sem criar novo ID)
  const handleSaveChanges = () => {
    if (onUpdateData) {
      setIsSaving(true);
      onUpdateData({
        ...currentProtocol,
        physicalData: tempData,
      }, false);
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  // Cria um NOVO protocolo baseado no atual (Gera Histórico)
  const handleNewEvolution = () => {
    if (onUpdateData) {
      if(confirm("Deseja gerar uma nova evolução? Isso salvará o estado atual no histórico e criará um novo registro com a data de hoje.")) {
        setIsSaving(true);
        onUpdateData({
          ...currentProtocol,
          physicalData: {
             ...tempData,
             date: new Date().toLocaleDateString('pt-BR') // Atualiza data da avaliação para hoje
          },
          updatedAt: new Date().toISOString()
        }, true); // true = createHistory
        setTimeout(() => setIsSaving(false), 800);
      }
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xl font-black text-[#d4af37] outline-none focus:ring-1 focus:ring-[#d4af37] transition-all";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA PRINCIPAL: DADOS ATUAIS + OBSERVAÇÕES + AÇÕES */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/5 p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-8 border-b border-white/5">
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <TrendingUp className="text-[#d4af37]" size={28} /> Evolução Corporal
                 </h3>
                 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 pl-10">
                   Editando protocolo de: <span className="text-[#d4af37]">{formatDate(currentProtocol.updatedAt)}</span>
                 </p>
              </div>
              
              {previous && (
                <div className="flex items-center gap-2 bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                  <Clock size={16} className="text-[#d4af37]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    Comparando com: <span className="text-white/80">{formatDate(previous.updatedAt)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Grid de Medidas */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { key: 'weight', label: 'Peso (kg)', value: currentProtocol.physicalData.weight, prev: previous?.physicalData.weight, inverse: true },
                { key: 'bodyFat', label: 'Gordura (%)', value: currentProtocol.physicalData.bodyFat, prev: previous?.physicalData.bodyFat, inverse: true },
                { key: 'muscleMass', label: 'Massa Musc. (kg)', value: currentProtocol.physicalData.muscleMass, prev: previous?.physicalData.muscleMass, inverse: false },
                { key: 'visceralFat', label: 'G. Visceral', value: currentProtocol.physicalData.visceralFat, prev: previous?.physicalData.visceralFat, inverse: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-black/20 p-5 rounded-3xl border border-white/5 hover:border-[#d4af37]/30 transition-all group">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-3 group-hover:text-[#d4af37] transition-colors">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <input 
                      className={inputClass}
                      value={(tempData as any)[item.key]}
                      onChange={(e) => setTempData({...tempData, [item.key]: e.target.value})}
                      placeholder="0.0"
                    />
                    {renderDiff(getDifference(item.value, item.prev), item.inverse)}
                  </div>
                </div>
              ))}
            </div>

            {/* Observações Integradas */}
            <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
               <div className="flex items-center gap-2 mb-4">
                 <ClipboardList size={16} className="text-[#d4af37]" />
                 <h4 className="text-xs font-black text-white/60 uppercase tracking-widest">Observações & Ajustes</h4>
               </div>
               <textarea
                className="w-full bg-transparent border-0 text-sm text-white/80 focus:ring-0 outline-none resize-none min-h-[100px] placeholder:text-white/20"
                placeholder="Descreva aqui o feedback do aluno, ajustes na dieta ou treino para este período..."
                value={currentProtocol.privateNotes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </div>

            {/* Área de Ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
               <button 
                 onClick={handleSaveChanges}
                 disabled={isSaving}
                 className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/10"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                 Salvar Alterações
               </button>

               <button 
                 onClick={handleNewEvolution}
                 disabled={isSaving}
                 className="flex items-center justify-center gap-3 bg-[#d4af37] hover:bg-[#b5952f] text-black p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-[#d4af37]/20 hover:-translate-y-1"
               >
                 <PlusCircle size={16} />
                 Gerar Novo Protocolo
               </button>
            </div>
            <p className="text-[9px] text-white/30 text-center mt-4">
              "Gerar Novo Protocolo" arquiva os dados atuais no histórico e inicia um novo ciclo.
            </p>

          </div>
        </div>

        {/* COLUNA LATERAL: HISTÓRICO */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 h-full flex flex-col">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar size={14} className="text-[#d4af37]" /> Histórico de Protocolos
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[600px]">
                {sortedHistory.map((p, idx) => {
                  const isSelected = p.id === currentProtocol.id;
                  return (
                    <div key={p.id} className={`group relative transition-all duration-300`}>
                      <button 
                        onClick={() => onSelectHistory && onSelectHistory(p)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-white/10'}`}></div>
                          <div>
                            <span className={`text-xs font-black uppercase tracking-tight block mb-1 ${isSelected ? 'text-[#d4af37]' : 'text-white group-hover:text-white/80'}`}>
                              {p.protocolTitle || 'Sem Título'}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest block ${isSelected ? 'text-[#d4af37]/60' : 'text-white/20'}`}>
                              {formatDate(p.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="flex flex-col items-end gap-1">
                             <span className="text-[10px] font-bold text-white/60">{p.physicalData.weight}kg</span>
                             <span className="text-[9px] text-white/30">{p.physicalData.bodyFat}% BF</span>
                           </div>
                        </div>
                      </button>
                      
                      {/* Botão para visualizar protocolo completo se este item estiver selecionado */}
                      {isSelected && onOpenEditor && (
                        <div className="mt-2 animate-in slide-in-from-top-2 fade-in">
                           <button 
                             onClick={onOpenEditor}
                             className="w-full flex items-center justify-center gap-2 bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black p-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[#d4af37]/30"
                           >
                             <FileText size={12} /> Abrir Editor Completo <ArrowRight size={12} />
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default EvolutionTracker;
