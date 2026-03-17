import React, { useState, useEffect } from 'react';
import { ProtocolData, Feedback, BodyMeasurementEntry, Student } from '../../types';
import { db } from '../../services/db';
import { 
  Clock, 
  Loader2,
  ClipboardCheck,
  TrendingUp,
  History,
  Ruler,
  FileText,
  MessageSquare,
  ChevronLeft,
  Sparkles,
  Dumbbell,
  Calendar,
  Pill,
  LayoutDashboard
} from 'lucide-react';
import Timeline from './Timeline';
import CheckInForm from './CheckInForm';
import MeasurementsManager from './MeasurementsManager';
import ProtocolsManager from './ProtocolsManager';
import FeedbackManager from './FeedbackManager';

interface Props {
  studentId: string;
  currentProtocol: ProtocolData;
  onUpdateProtocol: (protocol: ProtocolData) => void;
  onBack: () => void;
  initialTab?: 'timeline' | 'medidas' | 'protocolos' | 'feedback' | 'checkin';
}

const StudentMonitoring: React.FC<Props> = ({ studentId, currentProtocol, onBack, initialTab = 'timeline' }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'medidas' | 'protocolos' | 'feedback' | 'checkin' | 'treinos' | 'ergogenicos' | 'acessos'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>([]);
  const [versions, setVersions] = useState<ProtocolData[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentData, feedbacksData, measurementsData, versionsData, workoutLogsData, activityLogsData] = await Promise.all([
        db.getStudent(studentId),
        db.getFeedbacks(studentId),
        db.getMeasurements(studentId),
        db.getProtocolVersions(studentId),
        db.getWorkoutLogs(studentId),
        db.getActivityLogs(studentId)
      ]);

      const uniqueFeedbacks = feedbacksData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const uniqueMeasurements = measurementsData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const uniqueVersions = versionsData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

      setStudent(studentData);
      setFeedbacks(uniqueFeedbacks);
      setMeasurements(uniqueMeasurements);
      setVersions(uniqueVersions);
      setWorkoutLogs(workoutLogsData);
      setActivityLogs(activityLogsData);
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const handleRefresh = () => {
    loadData();
  };

  const handleDelete = async (type: 'feedback' | 'measurement' | 'protocol' | 'workout', id: string) => {
    try {
      if (type === 'feedback') {
        await db.deleteFeedback(id);
      } else if (type === 'measurement') {
        await db.deleteMeasurement(id);
      } else if (type === 'protocol') {
        await db.deleteProtocol(id);
      } else if (type === 'workout') {
        await db.deleteWorkoutLog(id);
      }
      handleRefresh();
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      alert("Erro ao excluir item. Tente novamente.");
    }
  };

  const handleUpdateProtocol = (newProtocol: ProtocolData) => {
    // Aqui poderíamos chamar o onUpdateProtocol do pai se necessário, 
    // mas o ProtocolsManager e CheckInForm já lidam com o db.saveProtocol via onUpdateProtocol
    // Vamos garantir que a lista local seja atualizada
    handleRefresh();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-white/50">
        <Loader2 size={40} className="animate-spin mb-4 text-[#d4af37]" />
        <p className="text-xs font-black uppercase tracking-widest">Carregando painel de acompanhamento...</p>
      </div>
    );
  }

  const latestMeasurement = measurements[measurements.length - 1];
  const latestFeedback = feedbacks[0];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-xl">
            <Ruler size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Último Peso</p>
            <p className="text-xl font-black text-white">{latestMeasurement?.weight || '--'}<span className="text-xs text-white/40 ml-1">kg</span></p>
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Protocolo Atual</p>
            <p className="text-xl font-black text-white">v{versions[0]?.version || 1}</p>
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-green-500/10 text-green-400 p-3 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Última Atualização</p>
            <p className="text-sm font-black text-white">
              {versions[0] ? new Date(versions[0].updatedAt).toLocaleDateString('pt-BR') : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#111] border border-white/10 rounded-[2rem] p-4 shadow-2xl relative overflow-hidden no-print">
        <div className="flex justify-center relative z-10">
          <div className="flex flex-wrap justify-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'timeline', label: 'Histórico', icon: Clock },
              { id: 'medidas', label: 'Medidas', icon: Ruler },
              { id: 'protocolos', label: 'Protocolos', icon: FileText },
              { id: 'treinos', label: 'Treinos', icon: Dumbbell },
              { id: 'ergogenicos', label: 'Ergogênicos', icon: Pill },
              { id: 'acessos', label: 'Acessos', icon: History },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'checkin', label: 'Novo Check-in', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#d4af37] text-black shadow-lg' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'timeline' && (
          <Timeline 
            feedbacks={feedbacks}
            measurements={measurements}
            versions={versions}
            workoutLogs={workoutLogs}
            student={student}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'medidas' && (
          <MeasurementsManager 
            studentId={studentId}
            measurements={measurements}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'protocolos' && (
          <ProtocolsManager 
            studentId={studentId}
            versions={versions}
            onRefresh={handleRefresh}
            onGenerateNew={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackManager 
            studentId={studentId}
            feedbacks={feedbacks}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'treinos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Histórico de Treinos</h2>
            </div>
            
            {workoutLogs.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                <Calendar size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 text-sm font-medium">O aluno ainda não registrou nenhum treino.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutLogs.map((log) => (
                  <div key={log.id} className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase text-sm">{log.workout_title}</h4>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">{log.workout_focus}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#d4af37] font-black text-xs">
                        {new Date(log.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-white/20 text-[10px]">
                        {new Date(log.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ergogenicos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Protocolo de Ergogênicos</h2>
            </div>
            
            {!currentProtocol.ergogenics || currentProtocol.ergogenics.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                <Pill size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 text-sm font-medium">Nenhum ergogênico registrado no protocolo atual.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProtocol.ergogenics.map((erg) => (
                  <div key={erg.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-[#d4af37]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-xl group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                        <Pill size={20} />
                      </div>
                      <h4 className="text-white font-black uppercase text-lg">{erg.name}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Dosagem</span>
                        <span className="text-sm font-bold text-white">{erg.dosage}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Posologia</span>
                        <span className="text-sm font-bold text-white">{erg.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'acessos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <History className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Histórico de Acessos e Downloads</h2>
            </div>
            
            {activityLogs.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                <History size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 text-sm font-medium">Nenhuma atividade registrada até o momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-[#111] border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.activity_type === 'portal_access' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                        {log.activity_type === 'portal_access' ? <LayoutDashboard size={16} /> : <FileText size={16} />}
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase text-[10px] tracking-wider mb-1">
                          {log.activity_type === 'portal_access' ? 'Acesso ao Portal' : 'Download de Protocolo'}
                        </h4>
                        <p className="text-white/40 text-[9px] uppercase tracking-widest">
                          {log.activity_type === 'portal_access' ? 'Login realizado' : `Protocolo v${versions.find(v => v.id === log.details)?.version || '?'}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#d4af37] font-black text-[10px]">
                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-white/20 text-[9px]">
                        {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <CheckInForm 
            studentId={studentId}
            currentProtocol={currentProtocol}
            onUpdateProtocol={(p) => {
              // Salva o protocolo e recarrega
              db.saveProtocol(p).then(() => {
                handleRefresh();
                setActiveTab('protocolos');
              });
            }}
            onSuccess={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default StudentMonitoring;
