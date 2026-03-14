import React from 'react';
import { ProtocolData } from '../../types';
import { 
  FileText, 
  Plus, 
  History, 
  CheckCircle2, 
  Clock,
  Trash2,
  Calendar,
  ChevronRight,
  ExternalLink,
  Activity,
  Dumbbell
} from 'lucide-react';
import ProtocolPreview from '../ProtocolPreview';

interface Props {
  studentId: string;
  versions: ProtocolData[];
  onRefresh: () => void;
  onGenerateNew: () => void;
}

const ProtocolsManager: React.FC<Props> = ({ studentId, versions, onRefresh, onGenerateNew }) => {
  
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  const activeProtocol = sortedVersions[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <FileText className="text-[#d4af37]" size={24} /> 
          Histórico de Protocolos
        </h2>
        <button 
          onClick={onGenerateNew}
          className="bg-[#d4af37] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={14} />
          Gerar Novo Protocolo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedVersions.map((protocol, index) => {
          const isActive = index === 0;
          return (
            <div 
              key={protocol.id} 
              className={`bg-[#111] border rounded-[2rem] p-6 transition-all group ${
                isActive ? 'border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/5' : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isActive ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-white/40'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                        {protocol.protocolTitle || `Protocolo v${protocol.version || (sortedVersions.length - index)}`}
                      </h3>
                      {isActive ? (
                        <span className="bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Ativo</span>
                      ) : (
                        <span className="bg-white/5 text-white/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Antigo</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} />
                      Criado em: {new Date(protocol.updatedAt || protocol.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 md:flex-none grid grid-cols-2 gap-2">
                    <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Activity size={12} className="text-[#d4af37]" />
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Dieta</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Dumbbell size={12} className="text-[#d4af37]" />
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Treino</span>
                    </div>
                  </div>

                  <ProtocolPreview 
                    data={protocol} 
                    customTrigger={
                      <button className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10">
                        <ExternalLink size={14} />
                        Visualizar
                      </button>
                    } 
                  />
                </div>
              </div>

              {protocol.privateNotes && (
                <div className="mt-6 p-4 bg-black/40 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Notas do Profissional</p>
                  <p className="text-xs text-white/60 leading-relaxed italic">
                    "{protocol.privateNotes}"
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {sortedVersions.length === 0 && (
          <div className="text-center py-20 bg-[#111] border border-dashed border-white/10 rounded-[2rem]">
            <FileText size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Nenhum protocolo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolsManager;
