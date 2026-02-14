
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { 
  Users, 
  DollarSign, 
  Target, 
  UserPlus, 
  Search,
  Clock,
  FileText,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'manage' | 'evolution' | 'student-dashboard') => void;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent }) => {
  
  const activeProtocolsCount = protocols.filter(p => p.contract.status === 'Ativo').length;
  const totalRevenue = protocols.reduce((acc, curr) => acc + (parseFloat(curr.contract.planValue.replace(',', '.')) || 0), 0);
  const totalStudents = Array.from(new Set(protocols.map(p => p.clientName))).length;

  const recentStudents = [...protocols].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4);

  const metrics = [
    { label: 'Alunos Ativos', val: totalStudents, icon: <Users/>, color: 'text-blue-400' },
    { label: 'Protocolos Ativos', val: activeProtocolsCount, icon: <Target/>, color: 'text-[#d4af37]' },
    { label: 'Faturamento Total', val: 'R$ ' + totalRevenue.toLocaleString('pt-BR'), icon: <DollarSign/>, color: 'text-green-500' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
      
      <div className="bg-[#0a0a0a] rounded-[2.5rem] p-6 md:p-8 border-b-[8px] border-[#d4af37] relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <img src={LOGO_VBR_BLACK} alt="" className="w-96" />
        </div>
        
        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="w-24 md:w-32 h-auto" />
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
            Team VBR
          </h1>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
          <button 
            onClick={onNew} 
            className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 group"
          >
            <UserPlus size={16}/> Novo Aluno
          </button>
          <button 
            onClick={onList}
            className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Search size={16}/> Buscar Aluno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((s, i) => (
          <button 
            key={i} 
            onClick={onList}
            className="bg-white/5 p-5 rounded-[1.5rem] border border-white/10 shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left"
          >
             <div className="flex justify-between items-start mb-3">
               <div className={`p-2.5 bg-white/5 rounded-xl ${s.color} group-hover:bg-[#d4af37] group-hover:text-black transition-all`}>
                 {s.icon}
               </div>
               <ChevronRight className="text-white/10 group-hover:text-[#d4af37] transition-all" size={18} />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
               <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
            <Clock size={18} className="text-[#d4af37]" /> Alunos Recentes
          </h3>
          <button onClick={onList} className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest hover:underline">Ver Todos</button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {recentStudents.length > 0 ? recentStudents.map((p) => (
            <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                 <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-[#d4af37] border border-white/10 group-hover:bg-[#d4af37] group-hover:text-black transition-all shrink-0">
                    <Users size={20} />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <h4 className="font-black text-lg uppercase tracking-tighter text-white group-hover:text-[#d4af37] transition-colors leading-none truncate">{p.clientName}</h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest truncate max-w-[200px]">{p.protocolTitle}</span>
                      <span className="w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
                      <span className="text-[9px] text-green-500/80 font-black uppercase tracking-widest">Ativo</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-white/5 md:border-0 pt-3 md:pt-0 mt-1 md:mt-0 shrink-0">
                <div className="flex gap-2">
                  <button onClick={() => onLoadStudent(p, 'manage')} className="p-2 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-lg transition-all text-white/40" title="Gerenciar Aluno"><FileText size={16} /></button>
                  <button onClick={() => onLoadStudent(p, 'evolution')} className="p-2 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-lg transition-all text-white/40" title="Ver Evolução"><TrendingUp size={16} /></button>
                </div>
                <div className="w-px h-8 bg-white/5 mx-2 hidden md:block"></div>
                <button onClick={() => onLoadStudent(p, 'student-dashboard')} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-[#d4af37] ml-auto md:ml-0"><ChevronRight size={20} /></button>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
              <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Nenhum registro recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
