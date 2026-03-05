import React, { useState, useEffect } from 'react';
import { ProtocolData, Feedback, BodyMeasurementEntry, Student } from '../../types';
import { db } from '../../services/db';
import { 
  Clock, 
  Loader2,
  ClipboardCheck
} from 'lucide-react';
import Timeline from './Timeline';
import CheckInForm from './CheckInForm';

interface Props {
  studentId: string;
  currentProtocol: ProtocolData;
  onUpdateProtocol: (protocol: ProtocolData) => void;
  onBack: () => void;
}

const StudentMonitoring: React.FC<Props> = ({ studentId, currentProtocol, onUpdateProtocol, onBack }) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'timeline'>('checkin');
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
      <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-4 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex justify-center relative z-10">
          <div className="flex flex-wrap justify-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'checkin', label: 'Acompanhamento', icon: ClipboardCheck },
              { id: 'timeline', label: 'Histórico Completo', icon: Clock },
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
        {activeTab === 'checkin' && (
          <CheckInForm 
            studentId={studentId}
            currentProtocol={currentProtocol}
            onUpdateProtocol={onUpdateProtocol}
            onSuccess={handleRefresh}
          />
        )}

        {activeTab === 'timeline' && (
          <Timeline 
            feedbacks={feedbacks} 
            measurements={measurements} 
            versions={versions} 
            student={student}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default StudentMonitoring;
