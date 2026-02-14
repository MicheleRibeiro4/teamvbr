
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { TrendingUp, ClipboardList, ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock, Activity, Edit3, Save, Loader2 } from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData?: (newData: ProtocolData, createHistory?: boolean) => void;
}

const EvolutionTracker: React.FC<Props> = ({ currentProtocol, history, onNotesChange, onUpdateData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [tempData, setTempData] = useState(currentProtocol.physicalData);

  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistory = [...history].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const previous = sortedHistory.length > 1 ? sortedHistory[1] : null;

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

  const handleQuickSave = () => {
    if (onUpdateData) {
      // Ao salvar medidas, passamos true para createHistory, forçando um novo registro no histórico
      onUpdateData({
        ...currentProtocol,
        physicalData: tempData,
        updatedAt: new Date().toISOString()
      }, true);
    }
    setIsEditing(false);
  };

  const handleSaveNotes = () => {
    if (onUpdateData) {
      setIsSavingNotes(true);
      // Ao salvar notas, passamos false para não criar duplicata, apenas atualizar o registro atual
      onUpdateData(currentProtocol, false);
      setTimeout(() => setIsSavingNotes(false), 1000);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xl font-black text-[#d4af37] outline-none focus:ring-1 focus:ring-[#d4af37]";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <TrendingUp className="text-[#d4af37]" /> Evolução Corporal
              </h3>
              
              <div className="flex items-center gap-3">
                {previous && (
                  <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Clock size={14} className="text-[#d4af37]" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                      Comparativo: <span className="text-[#d4af37]">{formatDate(currentProtocol.updatedAt)}</span> vs <span className="text-white/60">{formatDate(previous.updatedAt)}</span>
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={() => isEditing ? handleQuickSave() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-[#d4af37] text-black hover:scale-105'}`}
                >
                  {isEditing ? <><Save size={14}/> Salvar Atualização</> : <><Edit3 size={14}/> Atualizar Medidas</>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'weight', label: 'Peso (kg)', value: currentProtocol.physicalData.weight, prev: previous?.physicalData.weight, inverse: true },
                { key: 'bodyFat', label: 'Gordura (%)', value: currentProtocol.physicalData.bodyFat, prev: previous?.physicalData.bodyFat, inverse: true },
                { key: 'muscleMass', label: 'Massa Musc. (kg)', value: currentProtocol.physicalData.muscleMass, prev: previous?.physicalData.muscleMass, inverse: false },
                { key: 'visceralFat', label: 'G. Visceral', value: currentProtocol.physicalData.visceralFat, prev: previous?.physicalData.visceralFat, inverse: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-4 group-hover:text-[#d4af37] transition-colors">{item.label}</span>
                  <div className="flex items-baseline gap-2">
                    {isEditing ? (
                      <input 
                        className={inputClass}
                        value={(tempData as any)[item.key]}
                        onChange={(e) => setTempData({...tempData, [item.key]: e.target.value})}
                      />
                    ) : (
                      <span className="text-3xl font-black text-white">{item.value || '-'}</span>
                    )}
                    {!isEditing && renderDiff(getDifference(item.value, item.prev), item.inverse)}
                  </div>
                  {previous && !isEditing && (
                    <div className="mt-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                      Anterior: {item.prev || '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <p className="text-[10px] text-white/40 mt-4 text-center font-bold uppercase tracking-widest">
                * Ao salvar, um novo ponto no histórico será criado.
              </p>
            )}
          </div>

          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={14} className="text-[#d4af37]" /> Histórico de Sessões
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedHistory.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-white/10'}`}></div>
                    <div>
                      <span className={`text-sm font-black uppercase tracking-tight block ${idx === 0 ? 'text-white' : 'text-white/40'}`}>
                        {p.protocolTitle || 'Sem Título'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Activity size={10} className="text-[#d4af37] opacity-50" />
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{p.physicalData.weight}kg • {p.physicalData.bodyFat}% BF</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/60 font-black tracking-widest uppercase">
                      {formatDate(p.updatedAt)}
                    </span>
                    <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                      {new Date(p.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-[#d4af37]" />
              <h3 className="text-lg font-black text-[#d4af37] uppercase tracking-tighter">Observações</h3>
            </div>
            <button 
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest text-white/40 transition-all flex items-center gap-2"
            >
              {isSavingNotes ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
              Salvar Notas
            </button>
          </div>
          <textarea
            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm focus:ring-1 focus:ring-[#d4af37] outline-none text-white/60 resize-none leading-relaxed font-medium flex-1"
            placeholder="Anotações privadas sobre o progresso do aluno, feedback de treinos e ajustes futuros..."
            value={currentProtocol.privateNotes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
          <p className="text-[9px] text-white/20 mt-4 text-center">
            Essas observações são privadas e não aparecem no PDF do aluno.
          </p>
        </div>

      </div>
    </div>
  );
};

export default EvolutionTracker;
