
import React from 'react';
import { ProtocolData } from '../types';
import { FileText, TrendingUp, ScrollText, Calendar, User, ArrowRight, Settings2, Activity } from 'lucide-react';

interface Props {
  data: ProtocolData;
  setView: (view: string) => void;
}

const StudentDashboard: React.FC<Props> = ({ data, setView }) => {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 px-4 md:px-0">
      
      {/* CARD DO ALUNO */}
      <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
        {/* Efeito de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37] blur-[120px] opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative z-10 w-full md:w-auto">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl border-2 border-[#d4af37] flex items-center justify-center bg-black/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] shrink-0">
            <User size={40} className="text-[#d4af37]" strokeWidth={1.5} />
          </div>
          
          {/* Info */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4 break-words">
              {data.clientName}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-black uppercase tracking-widest justify-center md:justify-start">
              <span className="bg-[#d4af37] text-black px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                Perfil Ativo
              </span>
              <span className="flex items-center gap-2 text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar size={12} />
                Atualizado em: {new Date(data.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Estratégia */}
        <div className="text-center md:text-right border-t border-white/5 pt-6 md:border-0 md:pt-0 w-full md:w-auto relative z-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Estratégia Atual</p>
          <span className="text-xl md:text-2xl font-black text-[#d4af37] uppercase max-w-md block leading-tight">
            {data.protocolTitle || "Sem Objetivo Definido"}
          </span>
        </div>
      </div>

      {/* GRID DE AÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. GERENCIAR ALUNO */}
        <button 
          onClick={() => setView('manage')}
          className="group relative bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#d4af37]/30 transition-all hover:bg-white/[0.02] text-left overflow-hidden h-[320px] flex flex-col justify-between"
        >
          {/* Background Icon Faded */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-150 pointer-events-none">
             <Settings2 size={240} />
          </div>

          <div>
             <div className="w-16 h-16 bg-[#d4af37] text-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform duration-300">
               <Settings2 size={32} strokeWidth={2} />
             </div>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
               Gerenciar Aluno
             </h3>
             <p className="text-sm text-white/40 leading-relaxed font-medium max-w-sm">
               Editor completo para Treinos, Dieta e Contratos. Gere PDFs e documentação em um só lugar.
             </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#d4af37] mt-8 group-hover:translate-x-2 transition-transform">
            Abrir Editor Unificado <ArrowRight size={14} />
          </div>
        </button>

        {/* 2. EVOLUÇÃO */}
        <button 
          onClick={() => setView('evolution')}
          className="group relative bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#d4af37]/30 transition-all hover:bg-white/[0.02] text-left overflow-hidden h-[320px] flex flex-col justify-between"
        >
          {/* Background Icon Faded */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-150 pointer-events-none">
             <TrendingUp size={240} />
          </div>

          <div>
             <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-[#d4af37] group-hover:text-black group-hover:border-[#d4af37] shadow-lg group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 group-hover:scale-110">
               <TrendingUp size={32} strokeWidth={2} />
             </div>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
               Evolução & Progresso
             </h3>
             <p className="text-sm text-white/40 leading-relaxed font-medium max-w-sm">
               Histórico de peso, gordura e massa muscular. Gráficos de tendência e anotações privadas.
             </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#d4af37] mt-8 group-hover:translate-x-2 transition-transform">
            Ver Progresso <ArrowRight size={14} />
          </div>
        </button>

      </div>
    </div>
  );
};

export default StudentDashboard;
