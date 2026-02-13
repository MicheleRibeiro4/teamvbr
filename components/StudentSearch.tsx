
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import { Search, Trash2, ChevronRight, Calendar, User, Target } from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onLoad: (protocol: ProtocolData) => void;
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
            placeholder="Pesquisar aluno..."
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
                      <Target size={12}/> {p.protocolTitle}
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
                <button 
                  onClick={() => onDelete(p.id)}
                  className="p-4 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                  title="Remover"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => onLoad(p)}
                  className="flex items-center gap-3 bg-[#d4af37] text-black px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  Abrir Perfil <ChevronRight size={18} />
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
