import React, { useMemo, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK, ICON_MAN, ICON_WOMAN } from '../constants';
import ProtocolPreview from './ProtocolPreview';
import { 
  Users, 
  DollarSign, 
  Target, 
  UserPlus, 
  Search,
  FileText,
  ChevronRight,
  CalendarClock,
  CheckCircle2,
  Link as LinkIcon,
  Bell,
  Check,
  X,
  Loader2,
  Eye,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'manage' | 'student-dashboard') => void;
  onUpdateStudent: (student: ProtocolData) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent, onUpdateStudent, onDeleteStudent }) => {
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewStudent, setPreviewStudent] = useState<ProtocolData | null>(null);
  const [dashboardView, setDashboardView] = useState<'default' | 'active_protocols' | 'financial'>('default');

  const activeProtocols = protocols
    .filter(p => p.contract.status === 'Ativo')
    .sort((a, b) => a.clientName.localeCompare(b.clientName));
  const activeProtocolsCount = activeProtocols.length;
  const pendingStudents = protocols.filter(p => p.contract.status === 'Aguardando');
  
  const totalRevenue = protocols.reduce((acc, curr) => acc + (parseFloat(curr.contract.planValue.replace(',', '.')) || 0), 0);
  
  // Get unique students
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
  
  const uniqueStudents = Array.from(uniqueStudentsMap.values()).sort((a: any, b: any) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  const totalStudents = uniqueStudents.length;

  const metrics = [
    {
      label: 'Total de Alunos',
      val: totalStudents,
      icon: <Users size={20} />,
      bg: 'bg-blue-500/10',
      color: 'text-blue-500',
      border: 'border-blue-500/20',
      action: () => onList()
    },
    {
      label: 'Protocolos Ativos',
      val: activeProtocolsCount,
      icon: <Target size={20} />,
      bg: 'bg-green-500/10',
      color: 'text-green-500',
      border: 'border-green-500/20',
      action: () => setDashboardView('active_protocols')
    },
    {
      label: 'Faturamento Total',
      val: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign size={20} />,
      bg: 'bg-[#d4af37]/10',
      color: 'text-[#d4af37]',
      border: 'border-[#d4af37]/20',
      action: () => setDashboardView('financial')
    }
  ];

  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);
  const [sendDate, setSendDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- LÓGICA DE AGENDA REFORMULADA ---
  const scheduledUpdates = useMemo(() => {
    return uniqueStudents.map((student: any) => {
      // Ignora Avulso e Pendentes
      if (student.contract.planType === 'Avulso') return null;
      if (student.contract.status !== 'Ativo') return null;

      // Verifica se o protocolo está "vazio" (sem refeições e sem treinos)
      const isMissingProtocol = (student.meals?.length || 0) === 0 && (student.trainingDays?.length || 0) === 0;

      // Data Base: Último envio OU Data de Início (fallback)
      const baseDateStr = student.lastSentDate || student.contract.startDate;
      if (!baseDateStr) return null;

      // Converte string DD/MM/AAAA (startDate) ou YYYY-MM-DD (lastSentDate) para Date
      let baseDate = new Date();
      if (baseDateStr.includes('/')) {
          const [d, m, y] = baseDateStr.split('/');
          baseDate = new Date(`${y}-${m}-${d}T00:00:00`);
      } else {
          baseDate = new Date(`${baseDateStr}T00:00:00`);
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      baseDate.setHours(0,0,0,0);

      // Ciclo de 15 dias
      const checkinInterval = 15;
      
      // Próxima data = Base + 15 dias
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + checkinInterval);
      
      // Dias restantes = Próxima - Hoje
      const diffTime = nextDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Status
      const isOverdue = daysLeft < 0; // Venceu ontem ou antes
      const isUrgent = daysLeft >= 0 && daysLeft <= 3; // Vence hoje ou em até 3 dias

      return {
        ...student,
        schedule: {
          daysLeft,
          nextDate: nextDate.toLocaleDateString('pt-BR'),
          baseDate: baseDate.toLocaleDateString('pt-BR'),
          isOverdue,
          isUrgent,
          isMissingProtocol,
          status: isMissingProtocol ? 'PENDENTE' : (isOverdue ? 'ATRASADO' : (isUrgent ? 'VENCENDO' : 'EM DIA'))
        }
      };
    })
    .filter(Boolean)
    // Ordenação: Pendentes -> Atrasados -> Vencendo -> Em dia (mais próximos primeiro)
    .sort((a: any, b: any) => {
        if (a.schedule.isMissingProtocol !== b.schedule.isMissingProtocol) return a.schedule.isMissingProtocol ? -1 : 1;
        return a.schedule.daysLeft - b.schedule.daysLeft;
    });
  }, [uniqueStudents]);

  // Helper para pegar data local YYYY-MM-DD de um ISO string UTC
  const getLocalDateFromISO = (isoStr: string) => {
      if (!isoStr) return '';
      const date = new Date(isoStr);
      // Subtrai o offset do timezone para garantir que pegamos o dia local correto
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - userTimezoneOffset);
      return localDate.toISOString().split('T')[0];
  };

  const handleConfirmSend = async (student: ProtocolData) => {
      if (!sendDate) return;
      
      // Formata data visualmente para o confirm
      const [y, m, d] = sendDate.split('-');
      const formattedDate = `${d}/${m}/${y}`;
      
      if (confirm(`Confirmar envio do protocolo em ${formattedDate}? A contagem de 15 dias reiniciará a partir desta data.`)) {
          setProcessingId(student.id);
          try {
              const updatedStudent = {
                  ...student,
                  lastSentDate: sendDate, // Salva YYYY-MM-DD
                  // updatedAt: new Date().toISOString() // REMOVIDO: O envio não deve contar como edição de conteúdo
              };
              await onUpdateStudent(updatedStudent);
              setConfirmSendId(null);
          } catch (error) {
              console.error(error);
              alert("Erro ao confirmar envio.");
          } finally {
              setProcessingId(null);
          }
      }
  };

  const handleCopyLink = () => {
     const origin = typeof window !== 'undefined' ? window.location.origin : '';
     const link = `${origin}/#student`;
     navigator.clipboard.writeText(link);
     alert("Link de Cadastro do Aluno copiado!\n\nEnvie este link para o aluno preencher seus dados:\n" + link);
  };

  const handleAcceptStudent = async (student: ProtocolData) => {
    if (confirm(`Aceitar o cadastro de ${student.clientName}? Ele será ativado e movido para a agenda.`)) {
        setProcessingId(student.id);
        try {
            const updatedStudent = {
                ...student,
                contract: {
                    ...student.contract,
                    status: 'Ativo' as const, 
                }
            };
            await onUpdateStudent(updatedStudent);
            if (previewStudent?.id === student.id) setPreviewStudent(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao aceitar aluno.");
        } finally {
            setProcessingId(null);
        }
    }
  };

  const handleRejectStudent = async (id: string, name: string) => {
      if (confirm(`Recusar e excluir a solicitação de ${name}? Esta ação não pode ser desfeita.`)) {
          setProcessingId(id);
          try {
              await onDeleteStudent(id);
              if (previewStudent?.id === id) setPreviewStudent(null);
          } catch (error) {
              console.error(error);
              alert("Erro ao recusar aluno.");
          } finally {
              setProcessingId(null);
          }
      }
  };

  const previewLabel = "text-[10px] font-black text-white/40 uppercase tracking-widest mb-1";
  const previewValue = "text-sm font-bold text-white bg-white/5 p-3 rounded-xl border border-white/5 min-h-[46px] flex items-center";
  const previewArea = "text-sm font-medium text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 min-h-[80px] whitespace-pre-wrap";

  const renderActiveProtocols = () => (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setDashboardView('default')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase text-white tracking-tighter">Protocolos Ativos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProtocols.map(student => {
                const isFemale = student.physicalData.gender === 'Feminino';
                const icon = isFemale ? ICON_WOMAN : ICON_MAN;
                return (
                    <div key={student.id} className="bg-[#111] p-6 rounded-[2rem] border border-white/10 flex flex-col justify-between hover:border-[#d4af37]/30 transition-all shadow-lg group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border-b-4 border-[#d4af37] overflow-hidden shrink-0">
                                <img src={icon} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">{student.clientName}</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                                    <Target size={10} className="text-[#d4af37]" /> {student.protocolTitle || 'Sem Objetivo'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/5">
                            <ProtocolPreview 
                                data={student} 
                                customTrigger={
                                    <button className="w-full py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                        <FileText size={16} /> Visualizar Protocolo
                                    </button>
                                }
                            />
                        </div>
                    </div>
                );
            })}
            {activeProtocols.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white/5 rounded-[2rem]">
                    <p className="text-white/20 font-black uppercase tracking-widest">Nenhum protocolo ativo encontrado</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setDashboardView('default')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase text-white tracking-tighter">Relatório Financeiro</h2>
        </div>
        <div className="bg-[#111] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#d4af37] text-black">
                            <th className="p-5 font-black uppercase text-xs tracking-widest">Aluno</th>
                            <th className="p-5 font-black uppercase text-xs tracking-widest">Plano</th>
                            <th className="p-5 font-black uppercase text-xs tracking-widest">Vigência</th>
                            <th className="p-5 font-black uppercase text-xs tracking-widest text-right">Valor Pago</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {protocols.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5"><p className="font-bold text-white text-sm">{p.clientName}</p></td>
                                <td className="p-5"><span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase text-white/60 group-hover:text-white group-hover:bg-white/20 transition-all">{p.contract.planType}</span></td>
                                <td className="p-5 text-xs font-medium text-white/60 font-mono">{p.contract.startDate} — {p.contract.endDate}</td>
                                <td className="p-5 text-right"><p className="font-black text-[#d4af37] text-sm">R$ {p.contract.planValue || '0,00'}</p></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-white/5 border-t border-white/10">
                        <tr>
                            <td colSpan={3} className="p-5 text-right font-black uppercase text-xs tracking-widest text-white/40">Total Arrecadado</td>
                            <td className="p-5 text-right font-black text-xl text-green-500">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
  );

  if (dashboardView === 'active_protocols') return renderActiveProtocols();
  if (dashboardView === 'financial') return renderFinancial();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="bg-[#0a0a0a] rounded-[2rem] p-4 md:p-6 border-b-4 border-[#d4af37] relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 min-h-[100px]">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <img src={LOGO_VBR_BLACK} alt="" className="w-64" />
        </div>
        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="w-16 md:w-20 h-auto" />
          <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">Team VBR</h1>
        </div>
        <div className="relative z-10 flex flex-wrap justify-center gap-2 w-full md:w-auto">
          <button onClick={onNew} className="bg-[#d4af37] text-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 group"><UserPlus size={14}/> Novo</button>
          <button onClick={onList} className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Search size={14}/> Buscar</button>
          <button onClick={handleCopyLink} className="bg-[#111] border border-white/10 text-[#d4af37] px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-lg" title="Copiar Link de Cadastro"><LinkIcon size={14}/> Link Aluno</button>
        </div>
      </div>

      {/* PENDING REQUESTS */}
      {pendingStudents.length > 0 && (
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-[2rem] p-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#d4af37] text-black p-2 rounded-lg"><Bell size={18} className="animate-pulse" /></div>
                <h3 className="font-black uppercase text-sm text-[#d4af37] tracking-widest">Solicitações de Cadastro ({pendingStudents.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingStudents.map((student) => (
                    <div key={student.id} className="bg-[#111] p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 shadow-lg group hover:border-[#d4af37]/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0"><UserPlus size={18} className="text-white/40" /></div>
                             <div className="min-w-0">
                                 <h4 className="text-sm font-bold text-white truncate">{student.clientName}</h4>
                                 <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{new Date(student.createdAt).toLocaleDateString('pt-BR')}</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setPreviewStudent(student)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Eye size={16} /></button>
                            <button onClick={() => handleRejectStudent(student.id, student.clientName)} disabled={processingId === student.id} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">{processingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}</button>
                            <button onClick={() => handleAcceptStudent(student)} disabled={processingId === student.id} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50">{processingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL PREVIEW */}
      {previewStudent && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#d4af37] text-black rounded-xl flex items-center justify-center font-black"><FileText size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">{previewStudent.clientName}</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Solicitado em: {new Date(previewStudent.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <button onClick={() => setPreviewStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">Dados Pessoais</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div><p className={previewLabel}>Telefone</p><div className={previewValue}>{previewStudent.contract.phone}</div></div>
                             <div><p className={previewLabel}>CPF</p><div className={previewValue}>{previewStudent.contract.cpf}</div></div>
                             <div><p className={previewLabel}>Email</p><div className={previewValue}>{previewStudent.contract.email || '-'}</div></div>
                         </div>
                    </div>
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">Anamnese</h3>
                         <div><p className={previewLabel}>Objetivo</p><div className={previewArea}>{previewStudent.anamnesis.mainObjective}</div></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><p className={previewLabel}>Rotina</p><div className={previewArea}>{previewStudent.anamnesis.routine}</div></div>
                            <div><p className={previewLabel}>Histórico</p><div className={previewArea}>{previewStudent.anamnesis.trainingHistory}</div></div>
                         </div>
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col md:flex-row gap-4 justify-end">
                     <button onClick={() => handleRejectStudent(previewStudent.id, previewStudent.clientName)} disabled={processingId === previewStudent.id} className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50">{processingId === previewStudent.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Recusar</button>
                     <button onClick={() => handleAcceptStudent(previewStudent)} disabled={processingId === previewStudent.id} className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">{processingId === previewStudent.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Aceitar</button>
                </div>
            </div>
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* METRICS */}
        <div className="lg:col-span-1 flex flex-col gap-3 h-full">
            {metrics.map((s, i) => (
            <button key={i} onClick={s.action} className={`bg-white/5 p-4 rounded-[1.5rem] border border-white/10 shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left flex-1 min-h-[140px]`}>
                <div className="flex justify-between items-start mb-3"><div className={`p-2 rounded-xl ${s.bg} ${s.color} border ${s.border}`}>{s.icon}</div><ChevronRight className="text-white/10 group-hover:text-[#d4af37] transition-all" size={16} /></div>
                <div><p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p><p className={`text-xl xl:text-2xl font-black ${s.color}`}>{s.val}</p></div>
            </button>
            ))}
        </div>

        {/* AGENDA */}
        <div className="lg:col-span-3 w-full bg-[#111] border border-white/10 rounded-[2rem] p-6 flex flex-col min-h-[65vh]">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-white"><CalendarClock size={24} className="text-[#d4af37]" /> Agenda de Atualizações</h3>
             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Ciclo: 15 Dias Pós-Ajuste</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {scheduledUpdates.length > 0 ? (
              scheduledUpdates.map((student: any) => {
                const { isOverdue, isUrgent, isMissingProtocol, daysLeft, status, baseDate, nextDate } = student.schedule;
                
                // Configuração visual dinâmica
                let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                let daysColor = 'text-white/40';

                if (isMissingProtocol) {
                    statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                    daysColor = 'text-indigo-400';
                } else if (isOverdue) {
                    statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';
                    daysColor = 'text-red-500 font-bold';
                } else if (isUrgent) {
                    statusColor = 'bg-yellow-500/10 text-[#d4af37] border-yellow-500/20';
                    daysColor = 'text-[#d4af37] font-bold';
                }

                // Lógica de Botão de Confirmação
                // Compara datas zeradas (apenas dia/mês/ano) para evitar problemas de hora/timezone
                const updatedAtDate = new Date(student.updatedAt);
                updatedAtDate.setHours(0,0,0,0);
                
                let lastSentDate = null;
                if (student.lastSentDate) {
                    // Garante que a string YYYY-MM-DD seja interpretada como data local meia-noite
                    const [y, m, d] = student.lastSentDate.split('-');
                    lastSentDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
                    lastSentDate.setHours(0,0,0,0);
                }

                // Mostra botão se: Nunca enviado OU Editado DEPOIS do último envio (Data Edição > Data Envio)
                const showConfirmButton = !lastSentDate || (updatedAtDate.getTime() > lastSentDate.getTime());

                return (
                  <div key={`${student.id}-${student.lastSentDate}-${status}`} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row items-center gap-4 group">
                    
                    {/* INFO ALUNO */}
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto" onClick={() => onLoadStudent(student, 'manage')}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border text-[10px] font-black shrink-0 ${statusColor}`}>
                            {isMissingProtocol ? <Sparkles size={16} /> : (daysLeft === 0 ? 'HOJE' : (isOverdue ? `-${Math.abs(daysLeft)}` : `${daysLeft}`))}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-black text-sm text-white leading-tight truncate flex items-center gap-2">
                                {student.clientName}
                                {isMissingProtocol && <span className="bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase">Novo</span>}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-white/40 uppercase font-bold mt-1">
                                <span className="flex items-center gap-1"><CalendarClock size={10}/> Base: {baseDate}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                <span className={daysColor}>Próximo: {nextDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="w-full md:w-auto flex justify-start md:justify-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
                            {status}
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-2 w-full md:w-auto border-t border-white/5 pt-3 md:pt-0 md:border-0">
                        {confirmSendId === student.id ? (
                            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10 animate-in fade-in slide-in-from-right-5" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="date" 
                                    value={sendDate} 
                                    onChange={(e) => setSendDate(e.target.value)}
                                    className="bg-transparent text-white text-[10px] p-1.5 rounded border border-white/10 outline-none focus:border-[#d4af37] w-24"
                                />
                                <button onClick={() => handleConfirmSend(student)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"><Check size={12} /></button>
                                <button onClick={() => setConfirmSendId(null)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"><X size={12} /></button>
                            </div>
                        ) : (
                            showConfirmButton ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setConfirmSendId(student.id); setSendDate(new Date().toISOString().split('T')[0]); }}
                                    className="px-3 py-2 bg-white/5 hover:bg-[#d4af37] hover:text-black border border-white/10 hover:border-[#d4af37] rounded-lg text-white/60 font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <span>Confirmar</span>
                                    <CheckCircle2 size={12} />
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setConfirmSendId(student.id); setSendDate(student.lastSentDate || new Date().toISOString().split('T')[0]); }}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl border border-green-500/20 transition-all group/sent"
                                    title="Clique para alterar a data de envio"
                                >
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Enviado</span>
                                    <span className="hidden group-hover/sent:inline text-[9px] text-green-500 ml-1"> (Editar)</span>
                                </button>
                            )
                        )}
                        
                        <button onClick={() => onLoadStudent(student, 'manage')} className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                 <CheckCircle2 size={48} className="mb-4 opacity-20" />
                 <p className="text-xs font-black uppercase tracking-widest">Nenhuma atualização pendente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;