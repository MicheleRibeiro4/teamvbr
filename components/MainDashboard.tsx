import React, { useMemo, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK, ICON_MAN, ICON_WOMAN, EMPTY_DATA } from '../constants';
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
  Sparkles,
  Lock
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'manage' | 'student-dashboard') => void;
  onUpdateStudent: (student: ProtocolData) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onReload: () => Promise<void>;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent, onUpdateStudent, onDeleteStudent, onReload }) => {
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewStudent, setPreviewStudent] = useState<ProtocolData | null>(null);
  const [dashboardView, setDashboardView] = useState<'default' | 'active_protocols' | 'financial'>('default');

  const activeProtocols = protocols
    .filter(p => p.contract?.status === 'Ativo')
    .sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
  const activeProtocolsCount = activeProtocols.length;
  const pendingStudents = protocols.filter(p => p.contract?.status === 'Aguardando');
  
  const totalRevenue = protocols.reduce((acc, curr) => acc + (parseFloat(curr.contract?.planValue?.replace(',', '.') || '0') || 0), 0);
  
  // Get unique students
  const uniqueStudentsMap = new Map();
  protocols.forEach(p => {
    const name = p.clientName || 'Sem Nome';
    if (!uniqueStudentsMap.has(name)) {
        uniqueStudentsMap.set(name, p);
    } else {
        const existing = uniqueStudentsMap.get(name);
        if (new Date(p.updatedAt) > new Date(existing.updatedAt)) {
            uniqueStudentsMap.set(name, p);
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

  const [currentTab, setCurrentTab] = useState<'agenda' | 'pending'>('agenda');
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);
  const [sendDate, setSendDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- LÓGICA DE FILTRAGEM E CLASSIFICAÇÃO ---
  const { agendaStudents, pendingEvaluationStudents, summary } = useMemo(() => {
    const agenda: any[] = [];
    const pending: any[] = [];
    
    let countOverdue = 0;
    let countDueToday = 0;
    let countThisWeek = 0;

    uniqueStudents.forEach((student: any) => {
        // Ignora Avulso
        if (student.contract?.planType === 'Avulso') return;

        // Aguardando Avaliação:
        // 1. Status do contrato é 'Aguardando' (Solicitações)
        // 2. Status é 'Ativo' MAS não tem data de envio (Protocolo em criação/não enviado)
        if (student.contract?.status === 'Aguardando' || (student.contract?.status === 'Ativo' && !student.lastSentDate)) {
            pending.push(student);
            return;
        }

        // Agenda de Atualizações:
        // 1. Status 'Ativo' E tem data de envio
        if (student.contract?.status === 'Ativo' && student.lastSentDate) {
            // Cálculo de Datas
            // Data Base: Último envio
            const [y, m, d] = student.lastSentDate.split('-');
            const baseDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
            baseDate.setHours(0,0,0,0);

            const today = new Date();
            today.setHours(0,0,0,0);

            // Ciclo de 15 dias
            const checkinInterval = 15;
            
            // Próxima data = Base + 15 dias
            const nextDate = new Date(baseDate);
            nextDate.setDate(baseDate.getDate() + checkinInterval);
            
            // Dias restantes = Próxima - Hoje
            const diffTime = nextDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Status
            let status = 'EM DIA';
            let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
            
            if (daysLeft < 0) {
                status = 'ATRASADO';
                statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';
                countOverdue++;
            } else if (daysLeft === 0) {
                status = 'VENCE HOJE';
                statusColor = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                countDueToday++;
            } else if (daysLeft <= 3) {
                status = 'PRÓXIMO';
                statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                countThisWeek++; // Considerando "Próximo" como parte da semana/atenção
            } else {
                // Em dia
            }
            
            // Se estiver entre 4 e 7 dias, também conta como "Esta semana" para o resumo
            if (daysLeft > 3 && daysLeft <= 7) {
                countThisWeek++;
            }

            agenda.push({
                ...student,
                schedule: {
                    daysLeft,
                    nextDate: nextDate.toLocaleDateString('pt-BR'),
                    baseDate: baseDate.toLocaleDateString('pt-BR'),
                    status,
                    statusColor,
                    nextDateObj: nextDate // Para ordenação
                }
            });
        }
    });

    // Ordenação da Agenda:
    // 1. Atrasados (menor daysLeft)
    // 2. Vence Hoje
    // 3. Próximos
    // 4. Distantes
    agenda.sort((a, b) => a.schedule.daysLeft - b.schedule.daysLeft);

    // Ordenação de Pendentes: Mais antigos primeiro (FIFO)
    pending.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { 
        agendaStudents: agenda, 
        pendingEvaluationStudents: pending,
        summary: { countOverdue, countDueToday, countThisWeek }
    };
  }, [uniqueStudents]);

  // ... (rest of the component logic)

  // RENDERIZAÇÃO DA AGENDA
  const renderAgendaTab = () => (
    <div className="flex flex-col h-full">
        {/* RESUMO DE PRIORIDADES */}
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <div>
                    <p className="text-2xl font-black text-red-500 leading-none">{summary.countOverdue}</p>
                    <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">Atrasados</p>
                </div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div>
                    <p className="text-2xl font-black text-orange-500 leading-none">{summary.countDueToday}</p>
                    <p className="text-[9px] font-bold text-orange-500/60 uppercase tracking-widest">Vencem Hoje</p>
                </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div>
                    <p className="text-2xl font-black text-yellow-500 leading-none">{summary.countThisWeek}</p>
                    <p className="text-[9px] font-bold text-yellow-500/60 uppercase tracking-widest">Esta Semana</p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {agendaStudents.length > 0 ? (
                agendaStudents.map((student: any) => {
                    const { daysLeft, status, statusColor, nextDate } = student.schedule;
                    
                    // Lógica de Botão de Confirmação (Mantida e Ajustada)
                    const updatedAtDate = new Date(student.updatedAt);
                    updatedAtDate.setHours(0,0,0,0);
                    
                    let lastSentDate = null;
                    if (student.lastSentDate) {
                        const [y, m, d] = student.lastSentDate.split('-');
                        lastSentDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
                        lastSentDate.setHours(0,0,0,0);
                    }

                    const showConfirmButton = !lastSentDate || (updatedAtDate.getTime() > lastSentDate.getTime());

                    return (
                        <div key={student.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* STATUS INDICATOR */}
                                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 ${statusColor}`}>
                                    <span className="text-xl font-black">{daysLeft === 0 ? 'HOJE' : (daysLeft < 0 ? daysLeft : daysLeft)}</span>
                                    <span className="text-[8px] font-bold uppercase">{daysLeft === 0 ? 'Vence' : 'Dias'}</span>
                                </div>

                                {/* INFO */}
                                <div className="flex-1 min-w-0 text-center md:text-left">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">{student.clientName}</h4>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>{status}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase flex items-center gap-1">
                                            <CalendarClock size={10} /> Próxima: {nextDate}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
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
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setConfirmSendId(student.id); setSendDate(new Date().toISOString().split('T')[0]); }}
                                            className="px-4 py-2 bg-[#d4af37] text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                            title="Confirmar que enviou a atualização"
                                        >
                                            <CheckCircle2 size={14} /> Confirmar
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => onLoadStudent(student, 'manage')}
                                        className="px-4 py-2 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2"
                                        title="Gerar Novo Protocolo / Visualizar"
                                    >
                                        <FileText size={14} /> Visualizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                    <CheckCircle2 size={64} className="mb-6 opacity-20 text-green-500" />
                    <p className="text-sm font-black uppercase tracking-widest">Todos os alunos estão em dia.</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderPendingTab = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 h-full">
        {pendingEvaluationStudents.length > 0 ? (
            pendingEvaluationStudents.map((student: any) => {
                const isRequest = student.contract?.status === 'Aguardando';
                const statusLabel = isRequest ? 'Solicitação de Cadastro' : 'Protocolo Ativo - Envio Pendente';
                const statusColor = isRequest ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20';

                return (
                    <div key={student.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                         <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                <UserPlus size={20} className="text-white/40" />
                            </div>
                            
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">{student.clientName}</h4>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>{statusLabel}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase">
                                        Desde: {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
                                {isRequest ? (
                                    <>
                                        <button onClick={() => setPreviewStudent(student)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all" title="Visualizar"><Eye size={16} /></button>
                                        <button onClick={() => handleAcceptStudent(student)} disabled={processingId === student.id} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50" title="Aceitar"><Check size={16} /></button>
                                        <button onClick={() => handleRejectStudent(student.id, student.clientName)} disabled={processingId === student.id} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50" title="Recusar"><X size={16} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => onLoadStudent(student, 'manage')}
                                            className="px-4 py-2 bg-[#d4af37] text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Sparkles size={14} /> Criar Protocolo
                                        </button>
                                        {/* Botão de confirmação de envio também aqui, caso já tenha criado mas não enviado */}
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
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setConfirmSendId(student.id); setSendDate(new Date().toISOString().split('T')[0]); }}
                                                className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                                                title="Marcar como Enviado"
                                            >
                                                <CheckCircle2 size={14} /> Já Enviei
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                         </div>
                    </div>
                );
            })
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                <UserPlus size={64} className="mb-6 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">Nenhuma avaliação pendente.</p>
            </div>
        )}
    </div>
  );

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
                    ...EMPTY_DATA.contract,
                    ...(student.contract || {}),
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
                                    <Target size={10} className="text-[#d4af37]" /> {student.protocolTitle || student.anamnesis?.mainObjective || 'Sem Objetivo'}
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
                                <td className="p-5"><span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase text-white/60 group-hover:text-white group-hover:bg-white/20 transition-all">{p.contract?.planType}</span></td>
                                <td className="p-5 text-xs font-medium text-white/60 font-mono">{p.contract?.startDate} — {p.contract?.endDate}</td>
                                <td className="p-5 text-right"><p className="font-black text-[#d4af37] text-sm">R$ {p.contract?.planValue || '0,00'}</p></td>
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
          <button onClick={() => onNew()} className="bg-[#d4af37] text-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 group"><UserPlus size={14}/> Novo Aluno</button>
          <button onClick={onList} className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Search size={14}/> Buscar</button>
          <button onClick={() => {
             const origin = typeof window !== 'undefined' ? window.location.origin : '';
             const link = `${origin}/#portal`;
             navigator.clipboard.writeText(link);
             alert("Link do Portal do Aluno copiado!\n\nEnvie este link para o aluno acessar seu perfil:\n" + link);
          }} className="bg-[#111] border border-white/10 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-lg" title="Copiar Link do Portal"><Lock size={14}/> Portal</button>
          <button onClick={handleCopyLink} className="bg-[#111] border border-white/10 text-[#d4af37] px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-lg" title="Copiar Link de Cadastro"><LinkIcon size={14}/> Cadastro</button>
        </div>
      </div>

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
                             <div><p className={previewLabel}>Telefone</p><div className={previewValue}>{previewStudent.contract?.phone}</div></div>
                             <div><p className={previewLabel}>CPF</p><div className={previewValue}>{previewStudent.contract?.cpf}</div></div>
                             <div><p className={previewLabel}>Email</p><div className={previewValue}>{previewStudent.contract?.email || '-'}</div></div>
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
      <div className="flex flex-col gap-6 h-full">
        {/* METRICS - Horizontal Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((s, i) => (
            <button key={i} onClick={s.action} className={`bg-white/5 p-6 rounded-[1.5rem] border border-white/10 shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left min-h-[120px]`}>
                <div className="flex justify-between items-start mb-3"><div className={`p-3 rounded-xl ${s.bg} ${s.color} border ${s.border}`}>{s.icon}</div><ChevronRight className="text-white/10 group-hover:text-[#d4af37] transition-all" size={20} /></div>
                <div><p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p><p className={`text-2xl xl:text-3xl font-black ${s.color}`}>{s.val}</p></div>
            </button>
            ))}
        </div>

        {/* AGENDA & PENDING TABS */}
        <div className="w-full bg-[#111] border border-white/10 rounded-[2rem] p-6 flex flex-col min-h-[60vh] overflow-hidden flex-1 shadow-2xl">
          
          {/* TABS HEADER */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
              <button 
                  onClick={() => setCurrentTab('agenda')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'agenda' ? 'bg-[#d4af37] text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                  <CalendarClock size={16} /> Agenda de Atualizações
              </button>
              <button 
                  onClick={() => setCurrentTab('pending')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'pending' ? 'bg-[#d4af37] text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                  <UserPlus size={16} /> Pendências
                  {pendingEvaluationStudents.length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] ml-1">{pendingEvaluationStudents.length}</span>}
              </button>
          </div>

          {/* CONTENT */}
          {currentTab === 'agenda' ? renderAgendaTab() : renderPendingTab()}
          
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;