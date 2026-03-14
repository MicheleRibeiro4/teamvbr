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
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'timeline' | 'medidas' | 'protocolos' | 'feedback' | 'checkin'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>([]);
  const [versions, setVersions] = useState<ProtocolData[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentData, feedbacksData, measurementsData, versionsData] = await Promise.all([
        db.getStudent(studentId),
        db.getFeedbacks(studentId),
        db.getMeasurements(studentId),
        db.getProtocolVersions(studentId)
      ]);

      const uniqueFeedbacks = feedbacksData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const uniqueMeasurements = measurementsData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const uniqueVersions = versionsData.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

      setStudent(studentData);
      setFeedbacks(uniqueFeedbacks);
      setMeasurements(uniqueMeasurements);
      setVersions(uniqueVersions);
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

  const handleDelete = async (type: 'feedback' | 'measurement' | 'protocol', id: string) => {
    try {
      if (type === 'feedback') {
        await db.deleteFeedback(id);
      } else if (type === 'measurement') {
        await db.deleteMeasurement(id);
      } else if (type === 'protocol') {
        await db.deleteProtocol(id);
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
