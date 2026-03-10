import React, { useState, useMemo } from 'react';
import { ProtocolData } from '../types';
import { Search, Trash2, ChevronRight, Calendar, Target, FileText, User, ToggleLeft, ToggleRight, Settings2 } from 'lucide-react';
import { ICON_MAN, ICON_WOMAN, getDisplayDate } from '../constants';

interface Props {
  protocols: ProtocolData[];
  onLoad: (protocol: ProtocolData, view: 'manage' | 'student-dashboard') => void;
  onDelete: (id: string) => void;
  onUpdate: (protocol: ProtocolData) => void;
}

const StudentSearch: React.FC<Props> = ({ protocols, onLoad, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica para agrupar alunos pelo nome e pegar apenas a versão mais recente
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, ProtocolData>();
    
    protocols.forEach(p => {
      if (!p) return;
      // Normaliza o nome para evitar duplicatas por espaços extras
      const rawName = p.clientName;
      const name = (typeof rawName === 'string' ? rawName : '').trim();
      
      if (!name) return; // Pula registros sem nome se necessário, ou agrupa em "Sem Nome"

      if (!map.has(name)) {
        map.set(name, p);
      } else {
        const existing = map.get(name)!;
        // Se o protocolo atual (p) for mais novo que o existente no mapa, substitui
        if (new Date(p.updatedAt) > new Date(existing.updatedAt)) {
          map.set(name, p);
        }
      }
    });

    // Retorna array ordenado alfabeticamente pelo nome do aluno
    return Array.from(map.values()).sort((a, b) => 
        (a.clientName || '').localeCompare(b.clientName || '')
    );
  }, [protocols]);

  const filtered = uniqueStudents.filter(p => 
    (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.protocolTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (student: ProtocolData) => {
      const newStatus: 'Ativo' | 'Cancelado' = student.contract.status === 'Ativo' ? 'Cancelado' : 'Ativo';
      const updatedStudent = {
          ...student,
          contract: {
              ...student.contract,
              status: newStatus
          }
      };
      onUpdate(updatedStudent);
  };

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
        <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Total de Alunos</p>
            <p className="text-2xl font-black text-[#d4af37]">{uniqueStudents.length}</p>
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
            const isActive = p.contract.status === 'Ativo';
            
            let iconBgClass = isActive ? 'bg-white text-[#d4af37] border-[#d4af37]' : 'bg-gray-800 text-gray-500 border-gray-700 opacity-50';
            let nameHoverClass = 'group-hover:text-[#d4af37]';
            let borderClass = 'hover:border-[#d4af37]/40';
            let badgeClass = isActive ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-red-500 bg-red-500/10';

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
                        {!isActive && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold uppercase rounded-md">Inativo</span>}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md w-fit ${badgeClass}`}>
                        <Target size={12}/> {p.protocolTitle || 'Sem Objetivo'}
                      </span>
                      <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {getDisplayDate(p)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                    
                    {/* Botão EDITOR (vai direto pro Manage) */}
                    <button 
                        onClick={() => onLoad(p, 'manage')} 
                        className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[65px] border bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black text-[#d4af37] border-[#d4af37]/20`}
                        title="Abrir Editor"
                    >
                        <Settings2 size={18} />
                        <span className="text-[7px] font-black uppercase">Editor</span>
                    </button>

                    {/* Botão ATIVAR/DESATIVAR */}
                    <button 
                        onClick={() => toggleStatus(p)}
                        className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[65px] border ${isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black border-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'}`}
                        title={isActive ? "Desativar Aluno" : "Ativar Aluno"}
                    >
                        {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        <span className="text-[7px] font-black uppercase">{isActive ? 'Ativo' : 'Inativo'}</span>
                    </button>

                    <div className="h-10 w-px bg-white/5 mx-2 hidden md:block"></div>

                    {/* Botão EXCLUIR */}
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-4 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all ml-auto md:ml-0"
                      title="Excluir Aluno"
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