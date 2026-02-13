
import React from 'react';
import { ProtocolData } from '../types';
import { TrendingUp, MessageSquare, ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock, Activity } from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
}

const EvolutionTracker: React.FC<Props> = ({ currentProtocol, history, onNotesChange }) => {
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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <TrendingUp className="text-[#d4af37]" /> Evolução Corporal
              </h3>
              {previous && (
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Clock size={14} className="text-[#d4af37]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    Comparativo: <span className="text-[#d4af37]">{formatDate(currentProtocol.updatedAt)}</span> vs <span className="text-white/60">{formatDate(previous.updatedAt)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Peso (kg)', value: currentProtocol.physicalData.weight, prev: previous?.physicalData.weight, inverse: true },
                { label: 'Gordura (%)', value: currentProtocol.physicalData.bodyFat, prev: previous?.physicalData.bodyFat, inverse: true },
                { label: 'Massa Musc. (kg)', value: currentProtocol.physicalData.muscleMass, prev: previous?.physicalData.muscleMass, inverse: false },
                { label: 'G. Visceral', value: currentProtocol.physicalData.visceralFat, prev: previous?.physicalData.visceralFat, inverse: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-4 group-hover:text-[#d4af37] transition-colors">{item.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{item.value || '-'}</span>
                    {renderDiff(getDifference(item.value, item.prev), item.inverse)}
                  </div>
                  {previous && (
                    <div className="mt-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                      Anterior: {item.prev || '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={14} className="text-[#d4af37]" /> Histórico de Sessões
            </h3>
            <div className="space-y-3">
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

        <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-[#d4af37]" />
            <h3 className="text-lg font-black text-[#d4af37] uppercase tracking-tighter">Área do Coach</h3>
          </div>
          <textarea
            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm focus:ring-1 focus:ring-[#d4af37] outline-none text-white/60 min-h-[400px] resize-none leading-relaxed font-medium"
            placeholder="Anotações privadas sobre o progresso do aluno, feedback de treinos e ajustes futuros..."
            value={currentProtocol.privateNotes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
};

export default EvolutionTracker;
