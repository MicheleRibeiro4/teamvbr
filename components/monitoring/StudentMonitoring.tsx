import React, { useState, useEffect } from 'react';
import { ProtocolData, Feedback, BodyMeasurementEntry, Student } from '../../types';
import { db } from '../../services/db';
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  Clock, 
  User, 
  Loader2,
  Plus
} from 'lucide-react';
import FeedbackList from './FeedbackList';
import EvolutionCharts from './EvolutionCharts';
import ProtocolVersions from './ProtocolVersions';
import Timeline from './Timeline';

interface Props {
  studentId: string;
  currentProtocol: ProtocolData;
  onUpdateProtocol: (protocol: ProtocolData) => void;
  onBack: () => void;
}

const StudentMonitoring: React.FC<Props> = ({ studentId, currentProtocol, onUpdateProtocol, onBack }) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'feedbacks' | 'protocols' | 'timeline'>('evolution');
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

      setStudent(studentData);
      setFeedbacks(feedbacksData);
      setMeasurements(measurementsData);
      setVersions(versionsData);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-white/50">
        <Loader2 size={40} className="animate-spin mb-4 text-[#d4af37]" />
        <p className="text-xs font-black uppercase tracking-widest">Carregando dados do aluno...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#d4af37] rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{student?.name || currentProtocol.clientName}</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                Acompanhamento Contínuo • {versions.length} Protocolos • {feedbacks.length} Feedbacks
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'evolution', label: 'Evolução', icon: Activity },
              { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
              { id: 'protocols', label: 'Protocolos', icon: FileText },
              { id: 'timeline', label: 'Histórico', icon: Clock },
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

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'evolution' && (
          <EvolutionCharts 
            measurements={measurements} 
            onUpdate={handleRefresh} 
            studentId={studentId}
          />
        )}
        
        {activeTab === 'feedbacks' && (
          <FeedbackList 
            feedbacks={feedbacks} 
            onUpdate={handleRefresh} 
            studentId={studentId}
          />
        )}

        {activeTab === 'protocols' && (
          <ProtocolVersions 
            versions={versions} 
            currentProtocol={currentProtocol}
            onUpdate={handleRefresh}
            onSelectProtocol={onUpdateProtocol}
            studentId={studentId}
          />
        )}

        {activeTab === 'timeline' && (
          <Timeline 
            feedbacks={feedbacks} 
            measurements={measurements} 
            versions={versions} 
            student={student}
          />
        )}
      </div>
    </div>
  );
};

export default StudentMonitoring;
