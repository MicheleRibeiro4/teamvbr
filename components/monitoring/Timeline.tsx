import React from 'react';
import { Feedback, BodyMeasurementEntry, ProtocolData, Student } from '../../types';
import { 
  Clock, 
  MessageSquare, 
  Activity, 
  FileText, 
  UserPlus,
  Trash2
} from 'lucide-react';

interface Props {
  feedbacks: Feedback[];
  measurements: BodyMeasurementEntry[];
  versions: ProtocolData[];
  student: Student | null;
  onDelete: (type: 'feedback' | 'measurement' | 'protocol', id: string) => void;
}

const Timeline: React.FC<Props> = ({ feedbacks, measurements, versions, student, onDelete }) => {
  
  const handleDelete = (type: 'feedback' | 'measurement' | 'protocol', id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do histórico? Esta ação não pode ser desfeita.')) {
      onDelete(type, id);
    }
  };

  const events = [
    ...(student ? [{
      id: student.id,
      type: 'register',
      date: new Date(student.createdAt),
      title: 'Início da Consultoria',
      details: 'Cadastro realizado no sistema',
      icon: UserPlus,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    }] : []),
    ...feedbacks.map(f => ({
      id: f.id,
      type: 'feedback',
      date: new Date(f.date),
      title: 'Feedback Registrado',
      details: f.notes,
      icon: MessageSquare,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30'
    })),
    ...measurements.map(m => ({
      id: m.id,
      type: 'measurement',
      date: new Date(m.date),
      title: 'Atualização de Medidas',
      details: `Peso: ${m.weight}kg • Gordura: ${m.bodyFat}%`,
      icon: Activity,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30'
    })),
    ...versions.map(v => ({
      id: v.id,
      type: 'protocol',
      date: new Date(v.updatedAt),
      title: `Protocolo v${v.version || 1}: ${v.protocolTitle}`,
      details: v.privateNotes || 'Atualização de protocolo',
      icon: FileText,
      color: 'text-[#d4af37]',
      bg: 'bg-[#d4af37]/10',
      border: 'border-[#d4af37]/30'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <Clock className="text-[#d4af37]" size={24} /> 
          Linha do Tempo
        </h2>
      </div>

      <div className="relative pl-8 border-l border-white/10 space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-[#0a0a0a] ${event.bg.replace('/10', '')}`}></div>
            
            <div className={`bg-[#111] border rounded-2xl p-6 ${event.border} group`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${event.bg} ${event.color}`}>
                    <event.icon size={18} />
                  </div>
                  <h3 className={`font-black uppercase tracking-tighter text-sm ${event.color}`}>
                    {event.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    {event.date.toLocaleDateString('pt-BR')}
                  </span>
                  {event.type !== 'register' && (
                    <button 
                      onClick={() => handleDelete(event.type as any, event.id!)}
                      className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir evento"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pl-[52px]">
                {event.details}
              </p>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Nenhum evento registrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
