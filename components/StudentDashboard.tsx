
import React from 'react';
import { ProtocolData } from '../types';
import { Calendar, ArrowRight, Settings2, TrendingUp, Activity } from 'lucide-react';
import { ICON_MAN, ICON_WOMAN, getDisplayDate } from '../constants';

interface Props {
  data: ProtocolData;
  setView: (view: string, tab?: string) => void;
}

const StudentDashboard: React.FC<Props> = ({ data, setView }) => {
  const isFemale = data.physicalData.gender === 'Feminino';
  
  // Cores padronizadas (Dourado/Preto) para todos
  let accentColor = 'text-[#d4af37]';
  let borderColor = 'border-[#d4af37]';
  let bgGlow = 'bg-[#d4af37]';
  let hoverBorder = 'hover:border-[#d4af37]/30';
  let iconBg = 'bg-[#d4af37]';
  let badgeBg = 'bg-[#d4af37]';

  const userIconSrc = isFemale ? ICON_WOMAN : ICON_MAN;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 px-4 md:px-0">
      
      {/* CARD DO ALUNO */}
      <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
        {/* Efeito de fundo */}
        <div className={`absolute top-0 right-0 w-96 h-96 ${bgGlow} blur-[120px] opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000`}></div>

        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative z-10 w-full md:w-auto">
          {/* Avatar - Agora clicável - Fundo Branco */}
          <button 
            onClick={() => setView('manage')}
            className={`w-24 h-24 rounded-3xl border-2 ${borderColor} flex items-center justify-center bg-white shadow-[0_0_20px_rgba(255,255,255,0.05)] shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden`}
          >
            <img src={userIconSrc} alt="Avatar" className="w-full h-full object-cover" />
          </button>
          
          {/* Info - Nome agora clicável e menor */}
          <div>
            <button 
              onClick={() => setView('manage')}
              className="text-left group/name hover:opacity-80 transition-opacity"
            >
              <h2 className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4 break-words group-hover/name:${accentColor} transition-colors`}>
                {data.clientName}
              </h2>
            </button>
            <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-black uppercase tracking-widest justify-center md:justify-start">
              <span className={`${badgeBg} text-black px-3 py-1.5 rounded-lg shadow-lg`}>
                Perfil Ativo
              </span>
              <span className="flex items-center gap-2 text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar size={12} />
                Atualizado em: {getDisplayDate(data)}
              </span>
            </div>
          </div>
        </div>

        {/* Estratégia - Texto menor */}
        <div className="text-center md:text-right border-t border-white/5 pt-6 md:border-0 md:pt-0 w-full md:w-auto relative z-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Estratégia Atual</p>
          <span className={`text-sm md:text-base font-black ${accentColor} uppercase max-w-md block leading-tight`}>
            {data.protocolTitle || "Sem Objetivo Definido"}
          </span>
        </div>
      </div>

      {/* GRID DE AÇÕES */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        
        {/* 1. GERENCIAR ALUNO */}
        <button 
          onClick={() => setView('manage')}
          className={`w-full group relative bg-[#111] p-8 rounded-[2.5rem] border border-white/5 ${hoverBorder} transition-all hover:bg-white/[0.02] text-left overflow-hidden h-[180px] flex flex-row items-center justify-between cursor-pointer shadow-2xl`}
        >
          <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-150 pointer-events-none">
             <Settings2 size={200} />
          </div>

          <div className="flex items-center gap-6 relative z-10">
             <div className={`w-16 h-16 ${iconBg} text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-300`}>
               <Settings2 size={32} strokeWidth={2} />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
                  Painel do Aluno
                </h3>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium max-w-[200px]">
                  Edição de protocolos, anamnese e medidas.
                </p>
             </div>
          </div>

          <div className={`hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${accentColor} bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:bg-[#d4af37] group-hover:text-black transition-all`}>
            Acessar <ArrowRight size={14} />
          </div>
        </button>

      </div>
    </div>
  );
};

export default StudentDashboard;
