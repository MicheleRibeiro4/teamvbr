
import React, { useMemo } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK, ICON_MAN, ICON_WOMAN } from '../constants';
import { 
  Users, 
  DollarSign, 
  Target, 
  UserPlus, 
  Search,
  Clock,
  FileText,
  ChevronRight,
  CalendarClock,
  CheckCircle2,
  Link as LinkIcon,
  Bell
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'manage' | 'student-dashboard' | 'evolution') => void;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent }) => {
  
  const activeProtocolsCount = protocols.filter(p => p.contract.status === 'Ativo').length;
  // Filtra alunos pendentes (cadastros novos que ainda não foram ativados)
  const pendingStudents = protocols.filter(p => p.contract.status === 'Aguardando');
  
  const totalRevenue = protocols.reduce((acc, curr) => acc + (parseFloat(curr.contract.planValue.replace(',', '.')) || 0), 0);
  
  // Get unique students (latest protocol for each)
  const uniqueStudentsMap = new Map();
  protocols.forEach(p => {
    if (!uniqueStudentsMap.has(p.clientName)) {
        uniqueStudentsMap.set(p.clientName, p);
    } else {
        const existing = uniqueStudentsMap.get(p.clientName);
        if (new Date(p.updatedAt) > new Date(existing.updatedAt)) {
            uniqueStudentsMap.set(p.clientName, p);
        }
    }
  });
  const uniqueStudents = Array.from(uniqueStudentsMap.values());
  const totalStudents = uniqueStudents.length;

  const recentStudents = [...protocols].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5); // Aumentei para 5 para preencher melhor a linha

  // --- LÓGICA DE AGENDA QUINZENAL ---
  const scheduledUpdates = useMemo(() => {
    return uniqueStudents.map(student => {
      // FILTRO: Ignora alunos com plano Avulso
      if (student.contract.planType === 'Avulso') return null;

      const startDateStr = student.contract.startDate;
      if (!startDateStr || startDateStr.length !== 10) return null;

      const parts = startDateStr.split('/');
      const start = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const today = new Date();
      
      // Zera as horas para comparar apenas datas
      today.setHours(0,0,0,0);
      start.setHours(0,0,0,0);

      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Se a data de início for futura, ignora
      if (diffDays < 0) return null;

      // Ciclo de 15 dias
      const cycle = 15;
      const remainder = diffDays % cycle;
      
      // Se remainder for 0, é dia de check-in (ex: dia 0, 15, 30...)
      // Se não, calcula quanto falta para o próximo
      const daysLeft = remainder === 0 ? 0 : cycle - remainder;
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysLeft);

      return {
        ...student,
        schedule: {
          daysLeft,
          nextDate: nextDate.toLocaleDateString('pt-BR'),
          isToday: daysLeft === 0,
          isUrgent: daysLeft > 0 && daysLeft <= 3
        }
      };
    })
    .filter(Boolean) // Remove nulos e avulsos
    .sort((a: any, b: any) => a.schedule.daysLeft - b.schedule.daysLeft); // Ordena por urgência
  }, [uniqueStudents]);

  const handleCopyLink = () => {
     // URL Específica para a Página do Aluno (#student)
     const origin = typeof window !== 'undefined' ? window.location.origin : '';
     const link = `${origin}/#student`;
     navigator.clipboard.writeText(link);
     alert("Link de Cadastro do Aluno copiado!\n\nEnvie este link para o aluno preencher seus dados:\n" + link);
  };

  const metrics = [
    { label: 'Alunos Ativos', val: totalStudents, icon: <Users size={20}/>, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/10' },
    { label: 'Protocolos Ativos', val: activeProtocolsCount, icon: <Target size={20}/>, color: 'text-[#d4af37]', border: 'border-[#d4af37]/20', bg: 'bg-[#d4af37]/10' },
    { label: 'Faturamento', val: 'R$ ' + totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: <DollarSign size={20}/>, color: 'text-green-500', border: 'border-green-500/20', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 pb-20">
      
      {/* NOTIFICAÇÃO DE NOVOS CADASTROS PENDENTES */}
      {pendingStudents.length > 0 && (
        <div className="bg-[#d4af37] text-black p-4 rounded-[1.5rem] mb-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
                <div className="bg-black/10 p-3 rounded-xl shrink-0">
                    <Bell size={20} className="animate-pulse" />
                </div>
                <div>
                    <h3 className="font-black uppercase text-sm leading-none mb-1">Solicitações de Cadastro</h3>
                    <p className="text-xs font-bold opacity-70">
                        Você tem {pendingStudents.length} novos alunos aguardando.
                    </p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
               <button 
                  onClick={onList} 
                  className="bg-black text-[#d4af37] px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg whitespace-nowrap"
               >
                  Ver Agora
               </button>
            </div>
        </div>
      )}

      {/* HEADER DO DASHBOARD - VERSÃO COMPACTA */}
      <div className="bg-[#0a0a0a] rounded-[2rem] p-4 md:p-6 border-b-4 border-[#d4af37] relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 min-h-[100px]">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <img src={LOGO_VBR_BLACK} alt="" className="w-64" />
        </div>
        
        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="w-16 md:w-20 h-auto" />
          <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Team VBR
          </h1>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center gap-2 w-full md:w-auto">
          <button 
            onClick={onNew} 
            className="bg-[#d4af37] text-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 group"
          >
            <UserPlus size={14}/> Novo
          </button>
          <button 
            onClick={onList}
            className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Search size={14}/> Buscar
          </button>
          <button 
            onClick={handleCopyLink}
            className="bg-[#111] border border-white/10 text-[#d4af37] px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-lg"
            title="Copiar Link de Cadastro para Alunos"
          >
            <LinkIcon size={14}/> Link Aluno
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL: MÉTICAS (ESQ) + AGENDA (DIR) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUNA ESQUERDA: MÉTRICAS VERTICAIS */}
        <div className="lg:col-span-1 flex flex-col gap-3">
            {metrics.map((s, i) => (
            <button 
                key={i} 
                onClick={onList}
                className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left h-full min-h-[120px]"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${s.bg} ${s.color} border ${s.border}`}>
                        {s.icon}
                    </div>
                    <ChevronRight className="text-white/10 group-hover:text-[#d4af37] transition-all" size={16} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-xl xl:text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
            </button>
            ))}
        </div>

        {/* COLUNA DIREITA: AGENDA DE ATUALIZAÇÕES */}
        <div className="lg:col-span-3 w-full bg-[#111] border border-white/10 rounded-[2rem] p-6 flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-3 text-white">
               <CalendarClock size={18} className="text-[#d4af37]" /> Agenda de Atualizações
             </h3>
             <span className="text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Ciclo de 15 Dias</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {scheduledUpdates.length > 0 ? (
              scheduledUpdates.map((student: any) => {
                const { isToday, isUrgent } = student.schedule;
                
                // Configuração padrão (Em dia = Verde)
                let containerStyle = 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20';
                let circleStyle = 'bg-green-500/20 text-green-500 border-green-500/30';
                let dateColor = 'text-green-400';
                let iconColor = 'text-green-500';

                if (isToday) {
                    containerStyle = 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20';
                    circleStyle = 'bg-red-500 text-white border-red-500';
                    dateColor = 'text-red-400';
                    iconColor = 'text-red-500';
                } else if (isUrgent) {
                    containerStyle = 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20';
                    circleStyle = 'bg-yellow-500 text-black border-yellow-500';
                    dateColor = 'text-[#d4af37]';
                    iconColor = 'text-[#d4af37]';
                }

                return (
                  <div 
                    key={student.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between group transition-all cursor-pointer ${containerStyle}`}
                    onClick={() => onLoadStudent(student, 'evolution')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border text-[10px] font-black shrink-0 ${circleStyle}`}>
                          {student.schedule.daysLeft === 0 ? 'HOJE' : `${student.schedule.daysLeft}d`}
                      </div>
                      <div>
                          <h4 className="font-bold text-xs text-white leading-none mb-1">{student.clientName}</h4>
                          <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase font-bold">
                            <span>Base: {student.contract.startDate}</span>
                            <span>•</span>
                            <span className={dateColor}>
                                Próx: {student.schedule.nextDate}
                            </span>
                          </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-block text-[9px] font-black uppercase tracking-widest text-white/20">
                            {isToday ? 'Check-in Necessário' : 'Aguardando ajuste quinzenal'}
                        </span>
                        <ChevronRight size={14} className={`opacity-50 group-hover:opacity-100 ${iconColor}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                 <CheckCircle2 size={32} className="mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Todos em dia</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RODAPÉ: ALUNOS RECENTES (LARGURA TOTAL) */}
      <div className="w-full bg-[#111] border border-white/10 rounded-[2rem] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Clock size={16} className="text-[#d4af37]" /> Alunos Recentes
            </h3>
            <button onClick={onList} className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {recentStudents.length > 0 ? recentStudents.map((p) => {
              const isFemale = p.physicalData.gender === 'Feminino';
              
              // Alterado bg-black para bg-white para garantir contraste
              let iconColorClass = 'bg-white border-white/10';
              let hoverTextClass = 'group-hover:text-[#d4af37]';
              let buttonHoverBg = 'hover:bg-[#d4af37]';
              
              const userIconSrc = isFemale ? ICON_WOMAN : ICON_MAN;

              // Se for status Aguardando, destaca
              const isPending = p.contract.status === 'Aguardando';

              return (
                <div key={p.id} className={`bg-white/5 p-3 rounded-xl border ${isPending ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5'} flex flex-col justify-between gap-3 hover:border-white/20 transition-all group`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0 ${iconColorClass} overflow-hidden`}>
                        <img src={userIconSrc} alt="Icon" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                           <h4 className={`font-black text-[10px] uppercase tracking-tighter text-white ${hoverTextClass} transition-colors leading-none truncate`}>{p.clientName}</h4>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[7px] text-white/30 font-bold uppercase tracking-widest block truncate">{p.protocolTitle || 'Sem Objetivo'}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-white/5 pt-2 mt-1">
                    <button onClick={() => onLoadStudent(p, 'manage')} className={`flex-1 p-1.5 bg-white/5 ${buttonHoverBg} hover:text-black rounded-lg transition-all text-white/40 flex justify-center`} title="Gerenciar"><FileText size={12} /></button>
                    <button onClick={() => onLoadStudent(p, 'student-dashboard')} className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-[#d4af37]"><ChevronRight size={14} /></button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-8">
                <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Nenhum registro recente</p>
              </div>
            )}
          </div>
      </div>

    </div>
  );
};

export default MainDashboard;
