
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { Search, Trash2, ChevronRight, Calendar, User, Target, FileText, TrendingUp, ScrollText } from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onLoad: (protocol: ProtocolData, view: 'manage' | 'evolution' | 'student-dashboard') => void;
  onDelete: (id: string) => void;
}

const StudentSearch: React.FC<Props> = ({ protocols, onLoad, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = protocols.filter(p => 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.protocolTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Pesquisar por nome ou protocolo..."
            className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-[1.5rem] focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
            <User className="mx-auto text-white/5 mb-4" size={64} />
            <p className="text-white/20 font-black uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div 
              key={p.id} 
              className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5 shadow-sm hover:shadow-2xl hover:border-[#d4af37]/40 transition-all flex flex-col md:flex-row md:items-center justify-between group gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#d4af37] border-b-4 border-[#d4af37] shadow-xl group-hover:scale-105 transition-transform">
                  <User size={30} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-[#d4af37] transition-colors">
                    {p.clientName || 'Novo Aluno'}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/10 rounded-md">
                      <Target size={12}/> {p.protocolTitle || 'Sem Objetivo'}
                    </span>
                    <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onLoad(p, 'manage')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 flex flex-col items-center gap-1 min-w-[65px]"
                    title="Gerenciar Aluno"
                  >
                    <FileText size={18} />
                    <span className="text-[7px] font-black uppercase">Gerenciar</span>
                  </button>
                  <button 
                    onClick={() => onLoad(p, 'evolution')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 flex flex-col items-center gap-1 min-w-[65px]"
                    title="Ver Evolução"
                  >
                    <TrendingUp size={18} />
                    <span className="text-[7px] font-black uppercase">Evolução</span>
                  </button>
                  <button 
                    onClick={() => onLoad(p, 'student-dashboard')}
                    className="p-3 bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all text-[#d4af37] flex flex-col items-center gap-1 min-w-[65px] border border-[#d4af37]/20"
                    title="Painel do Aluno"
                  >
                    <ChevronRight size={18} />
                    <span className="text-[7px] font-black uppercase">Painel</span>
                  </button>
                </div>

                <div className="h-10 w-px bg-white/5 mx-2 hidden md:block"></div>

                <button 
                  onClick={() => onDelete(p.id)}
                  className="p-4 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
