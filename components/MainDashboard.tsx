
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  UserPlus, 
  Search,
  Clock,
  AlertCircle,
  FileText,
  ScrollText,
  ChevronRight
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'protocol' | 'contract' | 'evolution') => void;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent }) => {
  
  const activeProtocolsCount = protocols.filter(p => p.contract.status === 'Ativo').length;
  const totalRevenue = protocols.reduce((acc, curr) => acc + (parseFloat(curr.contract.planValue.replace(',', '.')) || 0), 0);
  const totalStudents = Array.from(new Set(protocols.map(p => p.clientName))).length;

  const recentStudents = [...protocols].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4);

  const expiringSoon = protocols.filter(p => {
    if (!p.contract.endDate) return false;
    const [day, month, year] = p.contract.endDate.split('/');
    const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15 && p.contract.status === 'Ativo';
  });

  const metrics = [
    { label: 'Alunos Ativos', val: totalStudents, icon: <Users/>, color: 'text-blue-400' },
    { label: 'Protocolos Ativos', val: activeProtocolsCount, icon: <Target/>, color: 'text-[#d4af37]' },
    { label: 'Faturamento Total', val: 'R$ ' + totalRevenue.toLocaleString('pt-BR'), icon: <DollarSign/>, color: 'text-green-500' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      
      {/* Banner Principal */}
      <div className="bg-[#0a0a0a] rounded-[3rem] p-10 border-b-[12px] border-[#d4af37] relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <img src={LOGO_RHINO_BLACK} alt="" className="w-96" />
        </div>
        
        <div className="relative z-10 text-center md:text-left flex items-center gap-6">
          <img src={LOGO_RHINO_BLACK} alt="Team VBR Rhino" className="w-48 h-auto hidden md:block" />
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Team VBR
          </h1>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
          <button 
            onClick={onNew} 
            className="bg-[#d4af37] text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 group"
          >
            <UserPlus size={18}/> Novo Aluno
          </button>
          <button 
            onClick={onList}
            className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Search size={18}/> Buscar Aluno
          </button>
        </div>
      </div>

      {/* Grid de Métricas Clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((s, i) => (
          <button 
            key={i} 
            onClick={onList}
            className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left"
          >
             <div className="flex justify-between items-start mb-6">
               <div className={`p-3 bg-white/5 rounded-xl ${s.color} group-hover:bg-[#d4af37] group-hover:text-black transition-all`}>
                 {s.icon}
               </div>
               <ChevronRight className="text-white/10 group-hover:text-[#d4af37] transition-all" size={20} />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
               <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Clock size={20} className="text-[#d4af37]" /> Alunos Recentes
            </h3>
            <button onClick={onList} className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {recentStudents.length > 0 ? recentStudents.map((p) => (
              <div key={p.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#d4af37] border border-white/10 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                      <Users size={28} />
                   </div>
                   <div>
                      <h4 className="font-black text-2xl uppercase tracking-tighter text-white group-hover:text-[#d4af37] transition-colors leading-none">{p.clientName}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p.protocolTitle}</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="text-[10px] text-green-500/80 font-black uppercase tracking-widest">Ativo</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => onLoadStudent(p, 'protocol')} className="p-3 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all text-white/40" title="Abrir Protocolo"><FileText size={18} /></button>
                  <button onClick={() => onLoadStudent(p, 'evolution')} className="p-3 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all text-white/40" title="Ver Evolução"><TrendingUp size={18} /></button>
                  <button onClick={() => onLoadStudent(p, 'contract')} className="p-3 bg-white/5 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all text-white/40" title="Ver Contrato"><ScrollText size={18} /></button>
                  <div className="w-px h-10 bg-white/5 mx-2"></div>
                  <button onClick={() => onLoadStudent(p, 'protocol')} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-[#d4af37]"><ChevronRight size={24} /></button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/5">
                <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Nenhum registro recente</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 px-2">
            <AlertCircle size={20} className="text-[#d4af37]" /> Alertas & Status
          </h3>
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Renovações Próximas</p>
            <div className="space-y-3">
              {expiringSoon.length > 0 ? expiringSoon.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl group hover:bg-red-500/10 transition-all cursor-pointer" onClick={() => onLoadStudent(p, 'contract')}>
                  <div>
                    <p className="text-sm font-black text-white/80">{p.clientName}</p>
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Expira em: {p.contract.endDate}</p>
                  </div>
                  <ArrowRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )) : (
                <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <p className="text-xs font-bold text-green-500/60 uppercase tracking-widest text-center">Tudo em dia ✅</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
