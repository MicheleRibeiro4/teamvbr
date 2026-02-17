
import React, { useMemo, useState } from 'react';
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
  Bell,
  XCircle,
  Check,
  X,
  Loader2,
  Eye,
  MapPin,
  Activity,
  Phone,
  Mail,
  User
} from 'lucide-react';

interface Props {
  protocols: ProtocolData[];
  onNew: () => void;
  onList: () => void;
  onLoadStudent: (student: ProtocolData, view: 'manage' | 'student-dashboard' | 'evolution') => void;
  onUpdateStudent: (student: ProtocolData) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

const MainDashboard: React.FC<Props> = ({ protocols, onNew, onList, onLoadStudent, onUpdateStudent, onDeleteStudent }) => {
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewStudent, setPreviewStudent] = useState<ProtocolData | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false); // New state for filtering

  const activeProtocolsCount = protocols.filter(p => p.contract.status === 'Ativo').length;
  // Filtra alunos pendentes
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
  
  // Lista de alunos únicos ordenada por data de atualização (mais recente primeiro)
  const uniqueStudents = Array.from(uniqueStudentsMap.values()).sort((a: any, b: any) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  const totalStudents = uniqueStudents.length;

  // Alunos recentes (apenas ativos ou já processados)
  // Modified to support filtering based on `showOnlyActive`
  const displayedStudents = uniqueStudents
    .filter((p: any) => {
        if (p.contract.status === 'Aguardando') return false; // Never show pending in recent list
        if (showOnlyActive) return p.contract.status === 'Ativo'; // Filter active if requested
        return true;
    })
    .slice(0, showOnlyActive ? 100 : 5); // Show more if filtering, else limit to 5

  // --- LÓGICA DE AGENDA QUINZENAL ---
  const scheduledUpdates = useMemo(() => {
    return uniqueStudents.map((student: any) => {
      // FILTRO: Ignora alunos com plano Avulso E alunos pendentes (Aguardando)
      if (student.contract.planType === 'Avulso') return null;
      if (student.contract.status !== 'Ativo') return null;

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
    .filter(Boolean) // Remove nulos
    .sort((a: any, b: any) => a.schedule.daysLeft - b.schedule.daysLeft); // Ordena por urgência
  }, [uniqueStudents]);

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
                    status: 'Ativo' as const, // Força status Ativo
                    // Opcional: Atualizar data de início para hoje se necessário, 
                    // mas manter o que o aluno preencheu geralmente é melhor.
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

  const metrics = [
    { label: 'Alunos Cadastrados', val: totalStudents, icon: <Users size={20}/>, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/10', action: () => setShowOnlyActive(false) },
    { label: 'Protocolos Ativos', val: activeProtocolsCount, icon: <Target size={20}/>, color: 'text-[#d4af37]', border: 'border-[#d4af37]/20', bg: 'bg-[#d4af37]/10', action: () => setShowOnlyActive(true) },
    { label: 'Faturamento', val: 'R$ ' + totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: <DollarSign size={20}/>, color: 'text-green-500', border: 'border-green-500/20', bg: 'bg-green-500/10', action: () => {} },
  ];

  // Styles for Preview Modal
  const previewLabel = "text-[10px] font-black text-white/40 uppercase tracking-widest mb-1";
  const previewValue = "text-sm font-bold text-white bg-white/5 p-3 rounded-xl border border-white/5 min-h-[46px] flex items-center";
  const previewArea = "text-sm font-medium text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 min-h-[80px] whitespace-pre-wrap";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 pb-20">
      
      {/* HEADER DO DASHBOARD */}
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

      {/* ÁREA DE SOLICITAÇÕES DE CADASTRO (LISTA EXPANDIDA) */}
      {pendingStudents.length > 0 && (
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-[2rem] p-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#d4af37] text-black p-2 rounded-lg">
                    <Bell size={18} className="animate-pulse" />
                </div>
                <h3 className="font-black uppercase text-sm text-[#d4af37] tracking-widest">Solicitações de Cadastro ({pendingStudents.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingStudents.map((student) => (
                    <div key={student.id} className="bg-[#111] p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 shadow-lg group hover:border-[#d4af37]/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                <UserPlus size={18} className="text-white/40" />
                             </div>
                             <div className="min-w-0">
                                 <h4 className="text-sm font-bold text-white truncate">{student.clientName}</h4>
                                 <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{new Date(student.createdAt).toLocaleDateString('pt-BR')}</p>
                             </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setPreviewStudent(student)}
                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                title="Visualizar Detalhes"
                            >
                                <Eye size={16} />
                            </button>
                            <button 
                                onClick={() => handleRejectStudent(student.id, student.clientName)}
                                disabled={processingId === student.id}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                title="Recusar"
                            >
                                {processingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            </button>
                            <button 
                                onClick={() => handleAcceptStudent(student)}
                                disabled={processingId === student.id}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                                title="Aceitar"
                            >
                                {processingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL DE PRÉ-VISUALIZAÇÃO */}
      {previewStudent && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#d4af37] text-black rounded-xl flex items-center justify-center font-black">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">{previewStudent.clientName}</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Solicitado em: {new Date(previewStudent.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <button onClick={() => setPreviewStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                    
                    {/* Seção Pessoal */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
                            <User size={16}/> Dados Pessoais
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div><p className={previewLabel}>Telefone</p><div className={previewValue}>{previewStudent.contract.phone}</div></div>
                             <div><p className={previewLabel}>CPF</p><div className={previewValue}>{previewStudent.contract.cpf}</div></div>
                             <div><p className={previewLabel}>Email</p><div className={previewValue}>{previewStudent.contract.email || '-'}</div></div>
                             <div className="md:col-span-3">
                                <p className={previewLabel}>Endereço</p>
                                <div className={previewValue}>
                                    {previewStudent.contract.street}, {previewStudent.contract.number} - {previewStudent.contract.neighborhood}, {previewStudent.contract.city}/{previewStudent.contract.state}
                                </div>
                             </div>
                         </div>
                    </div>

                    {/* Seção Física */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
                            <Activity size={16}/> Dados Físicos
                         </h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div><p className={previewLabel}>Idade</p><div className={previewValue}>{previewStudent.physicalData.age} anos</div></div>
                             <div><p className={previewLabel}>Peso</p><div className={previewValue}>{previewStudent.physicalData.weight} kg</div></div>
                             <div><p className={previewLabel}>Altura</p><div className={previewValue}>{previewStudent.physicalData.height} m</div></div>
                             <div><p className={previewLabel}>Gênero</p><div className={previewValue}>{previewStudent.physicalData.gender}</div></div>
                         </div>
                    </div>

                    {/* Seção Anamnese */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
                            <FileText size={16}/> Anamnese Detalhada
                         </h3>
                         
                         <div>
                            <p className={previewLabel}>Objetivo Principal</p>
                            <div className={previewArea}>{previewStudent.anamnesis.mainObjective}</div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className={previewLabel}>Rotina Diária</p>
                                <div className={previewArea}>{previewStudent.anamnesis.routine}</div>
                            </div>
                            <div>
                                <p className={previewLabel}>Histórico de Treino / Lesões</p>
                                <div className={previewArea}>{previewStudent.anamnesis.trainingHistory}</div>
                            </div>
                         </div>

                         <div>
                            <p className={previewLabel}>Preferências Alimentares / Alergias</p>
                            <div className={previewArea}>{previewStudent.anamnesis.foodPreferences}</div>
                         </div>
                         <div>
                            <p className={previewLabel}>Medicamentos / Uso de Ergogênicos</p>
                            <div className={previewArea}>{previewStudent.anamnesis.ergogenics}</div>
                         </div>
                    </div>

                </div>

                {/* Modal Actions */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col md:flex-row gap-4 justify-end">
                     <button 
                        onClick={() => handleRejectStudent(previewStudent.id, previewStudent.clientName)}
                        disabled={processingId === previewStudent.id}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {processingId === previewStudent.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        Recusar Solicitação
                     </button>

                     <button 
                        onClick={() => handleAcceptStudent(previewStudent)}
                        disabled={processingId === previewStudent.id}
                        className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {processingId === previewStudent.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Aceitar e Cadastrar
                     </button>
                </div>

            </div>
        </div>
      )}

      {/* GRID PRINCIPAL: MÉTRICAS (ESQ) + AGENDA (DIR) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUNA ESQUERDA: MÉTRICAS VERTICAIS */}
        <div className="lg:col-span-1 flex flex-col gap-3">
            {metrics.map((s, i) => (
            <button 
                key={i} 
                onClick={s.action}
                className={`bg-white/5 p-4 rounded-[1.5rem] border ${showOnlyActive && i === 1 ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-white/10'} shadow-sm flex flex-col justify-between group hover:bg-white/[0.1] hover:border-[#d4af37]/30 transition-all text-left h-full min-h-[120px]`}
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
                    onClick={() => onLoadStudent(student, 'manage')}
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
                            {isToday ? 'Check-in Necessário' : 'Aguardando ajuste'}
                        </span>
                        <ChevronRight size={14} className={`opacity-50 group-hover:opacity-100 ${iconColor}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                 <CheckCircle2 size={32} className="mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma atualização pendente</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RODAPÉ: ALUNOS RECENTES (LARGURA TOTAL) */}
      <div className="w-full bg-[#111] border border-white/10 rounded-[2rem] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Clock size={16} className="text-[#d4af37]" /> {showOnlyActive ? 'Alunos Ativos' : 'Alunos Recentes'}
            </h3>
            {showOnlyActive && (
                <button onClick={() => setShowOnlyActive(false)} className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white flex items-center gap-1">
                    <XCircle size={12}/> Limpar Filtro
                </button>
            )}
            {!showOnlyActive && (
                <button onClick={onList} className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest hover:underline">Ver Todos</button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {displayedStudents.length > 0 ? displayedStudents.map((p: any) => {
              const isFemale = p.physicalData.gender === 'Feminino';
              
              // Alterado bg-black para bg-white para garantir contraste
              let iconColorClass = 'bg-white border-white/10';
              let hoverTextClass = 'group-hover:text-[#d4af37]';
              let buttonHoverBg = 'hover:bg-[#d4af37]';
              let statusBadge = null;

              if (p.contract.status === 'Ativo') {
                  statusBadge = <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>;
              }
              
              const userIconSrc = isFemale ? ICON_WOMAN : ICON_MAN;

              return (
                <div key={p.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all group relative overflow-hidden">
                  {statusBadge}
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
                <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">
                    {showOnlyActive ? 'Nenhum aluno ativo encontrado.' : 'Nenhum registro recente.'}
                </p>
              </div>
            )}
          </div>
      </div>

    </div>
  );
};

export default MainDashboard;
