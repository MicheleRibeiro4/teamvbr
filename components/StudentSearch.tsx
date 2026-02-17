
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { Search, Trash2, ChevronRight, Calendar, Target, FileText, User } from 'lucide-react';
import { ICON_MAN, ICON_WOMAN } from '../constants';

interface Props {
  protocols: ProtocolData[];
  onLoad: (protocol: ProtocolData, view: 'manage' | 'student-dashboard') => void;
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
      <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 mb-8 flex flex-col md:flex-row items-center gap-6">
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
          filtered.map((p) => {
            const isFemale = p.physicalData.gender === 'Feminino';
            
            // Alterado bg-black para bg-white para dar contraste aos ícones
            let iconBgClass = 'bg-white text-[#d4af37] border-[#d4af37]';
            let nameHoverClass = 'group-hover:text-[#d4af37]';
            let borderClass = 'hover:border-[#d4af37]/40';
            let badgeClass = 'text-[#d4af37] bg-[#d4af37]/10';
            let buttonClass = 'bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black text-[#d4af37] border-[#d4af37]/20';

            const userIconSrc = isFemale ? ICON_WOMAN : ICON_MAN;

            return (
              <div 
                key={p.id} 
                className={`bg-white/5 p-6 rounded-[1.5rem] border shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between group gap-6 border-white/5 ${borderClass}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 shadow-xl group-hover:scale-105 transition-transform shrink-0 relative ${iconBgClass} overflow-hidden`}>
                    <img src={userIconSrc} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 ${nameHoverClass} transition-colors break-words`}>
                        {p.clientName || 'Novo Aluno'}
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md w-fit ${badgeClass}`}>
                        <Target size={12}/> {p.protocolTitle || 'Sem Objetivo'}
                      </span>
                      <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex gap-2">
                      <button 
                          onClick={() => onLoad(p, 'manage')}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 flex flex-col items-center gap-1 min-w-[65px]"
                          title="Gerenciar Aluno"
                      >
                          <FileText size={18} />
                          <span className="text-[7px] font-black uppercase">Gerenciar</span>
                      </button>
                      <button 
                          onClick={() => onLoad(p, 'student-dashboard')}
                          className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[65px] border ${buttonClass}`}
                          title="Painel do Aluno"
                      >
                          <ChevronRight size={18} />
                          <span className="text-[7px] font-black uppercase">Painel</span>
                      </button>
                    </div>

                    <div className="h-10 w-px bg-white/5 mx-2 hidden md:block"></div>

                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-4 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all ml-auto md:ml-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
