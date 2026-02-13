
import React from 'react';
import { ProtocolData } from '../types';
import { FileText, TrendingUp, ScrollText, Calendar, User, ArrowRight } from 'lucide-react';

interface Props {
  data: ProtocolData;
  setView: (view: 'search' | 'dashboard' | 'protocol' | 'evolution' | 'contract') => void;
}

const StudentDashboard: React.FC<Props> = ({ data, setView }) => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Header do Dashboard */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#111] rounded-2xl flex items-center justify-center border-b-4 border-[#d4af37] shadow-xl">
            <User size={40} className="text-[#d4af37]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
              {data.clientName}
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span className="text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/10 rounded-md">Ativo</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Última atualização: {new Date(data.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Objetivo Atual</p>
          <span className="text-xl font-black text-[#d4af37] uppercase">{data.protocolTitle}</span>
        </div>
      </div>

      {/* Grid de Opções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Protocolo */}
        <button 
          onClick={() => setView('protocol')}
          className="group relative bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-[#d4af37] transition-all hover:shadow-2xl text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={120} />
          </div>
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
            <FileText size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Protocolo Técnico</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
            Gestão completa de treino, dieta e suplementação. Gere o PDF profissional para o aluno.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
            Acessar Protocolo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card Evolução */}
        <button 
          onClick={() => setView('evolution')}
          className="group relative bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-[#d4af37] transition-all hover:shadow-2xl text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={120} />
          </div>
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Evolução & Notas</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
            Compare métricas anteriores, veja o progresso visual e registre notas privadas de coach.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
            Ver Progresso <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card Contrato */}
        <button 
          onClick={() => setView('contract')}
          className="group relative bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-[#d4af37] transition-all hover:shadow-2xl text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ScrollText size={120} />
          </div>
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
            <ScrollText size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Contrato & Jurídico</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
            Gerencie termos de responsabilidade, valores de planos e vigência contratual.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
            Gerenciar Contrato <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      <div className="mt-12 bg-[#111] p-10 rounded-[3rem] text-center border-b-8 border-[#d4af37]">
        <img src="https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png" alt="Logo" className="h-16 mx-auto mb-6 opacity-80" />
        <p className="text-gray-400 font-medium italic text-lg max-w-2xl mx-auto">
          "O trabalho de excelência exige ferramentas de precisão. O sistema VBR foca no seu resultado."
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
