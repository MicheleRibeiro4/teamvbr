
import React from 'react';
import { ProtocolData } from '../types';
import { Calendar, ArrowRight, Settings2, TrendingUp, Activity } from 'lucide-react';
import { ICON_MAN, ICON_WOMAN } from '../constants';

interface Props {
  data: ProtocolData;
  setView: (view: string) => void;
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
          {/* Avatar - Agora clicável */}
          <button 
            onClick={() => setView('manage')}
            className={`w-24 h-24 rounded-3xl border-2 ${borderColor} flex items-center justify-center bg-black/50 shadow-[0_0_20px_rgba(255,255,255,0.05)] shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden`}
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
                Atualizado em: {new Date(data.updatedAt).toLocaleDateString('pt-BR')}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. GERENCIAR ALUNO */}
        <button 
          onClick={() => setView('manage')}
          className={`group relative bg-[#111] p-8 rounded-[2rem] border border-white/5 ${hoverBorder} transition-all hover:bg-white/[0.02] text-left overflow-hidden h-[280px] flex flex-col justify-between cursor-pointer`}
        >
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-150 pointer-events-none">
             <Settings2 size={200} />
          </div>

          <div>
             <div className={`w-14 h-14 ${iconBg} text-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300`}>
               <Settings2 size={28} strokeWidth={2} />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
               Editor Completo
             </h3>
             <p className="text-xs text-white/40 leading-relaxed font-medium max-w-xs">
               Ajuste treinos, dieta, suplementação e gere o contrato PDF.
             </p>
          </div>

          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${accentColor} mt-4 group-hover:translate-x-2 transition-transform`}>
            Acessar Editor <ArrowRight size={12} />
          </div>
        </button>

        {/* 2. EVOLUÇÃO E CHECK-IN */}
        <button 
          onClick={() => setView('evolution')}
          className={`group relative bg-[#111] p-8 rounded-[2rem] border border-white/5 ${hoverBorder} transition-all hover:bg-white/[0.02] text-left overflow-hidden h-[280px] flex flex-col justify-between cursor-pointer`}
        >
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-150 pointer-events-none">
             <TrendingUp size={200} />
          </div>

          <div>
             <div className={`w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform duration-300 border border-white/10`}>
               <Activity size={28} strokeWidth={2} className={accentColor} />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
               Acompanhar Evolução
             </h3>
             <p className="text-xs text-white/40 leading-relaxed font-medium max-w-xs">
               Registre novos check-ins, compare fotos, medidas e visualize gráficos de progresso.
             </p>
          </div>

          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${accentColor} mt-4 group-hover:translate-x-2 transition-transform`}>
            Ver Progresso <ArrowRight size={12} />
          </div>
        </button>

      </div>
    </div>
  );
};

export default StudentDashboard;
