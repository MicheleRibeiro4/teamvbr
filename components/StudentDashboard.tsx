
import React from 'react';
import { ProtocolData } from '../types';
import { FileText, TrendingUp, ScrollText, Calendar, User, ArrowRight, Settings2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  setView: (view: string) => void;
}

const StudentDashboard: React.FC<Props> = ({ data, setView }) => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Header do Dashboard */}
      <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/10 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center border-b-4 border-[#d4af37] shadow-xl">
            <User size={40} className="text-[#d4af37]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              {data.clientName}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest justify-center md:justify-start">
              <span className="text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/10 rounded-md">Perfil Ativo</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Atualizado em: {new Date(data.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-center md:text-right border-t border-white/5 pt-4 md:border-0 md:pt-0 w-full md:w-auto">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Estratégia Atual</p>
          <span className="text-xl font-black text-[#d4af37] uppercase">{data.protocolTitle || "Sem Objetivo"}</span>
        </div>
      </div>

      {/* Grid de Opções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Gerenciar (Unificado) */}
        <button 
          onClick={() => setView('manage')}
          className="group relative bg-[#d4af37]/5 p-8 rounded-[2rem] border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all hover:bg-[#d4af37]/10 text-left overflow-hidden h-full"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings2 size={160} />
          </div>
          <div className="w-16 h-16 bg-[#d4af37] text-black rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110">
            <Settings2 size={32} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Gerenciar Aluno</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium mb-8">
            Aba completa para editar Treinos, Dieta e Contrato em um só lugar. Gere PDFs de Protocolo e Documentação Jurídica.
          </p>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#d4af37]">
            Abrir Editor Unificado <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card Evolução */}
        <button 
          onClick={() => setView('evolution')}
          className="group relative bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-[#d4af37]/50 transition-all hover:bg-white/[0.08] text-left overflow-hidden h-full"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={160} />
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37] group-hover:text-black transition-all group-hover:scale-110">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Evolução & Progresso</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium mb-8">
            Acompanhe o histórico de peso, gordura e massa muscular. Anotações privadas do coach e comparativos rápidos.
          </p>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#d4af37]">
            Ver Progresso <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>
    </div>
  );
};

export default StudentDashboard;
