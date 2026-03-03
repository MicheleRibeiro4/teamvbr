import React from 'react';
import { ProtocolData } from '../../types';
import { db } from '../../services/db';
import { 
  FileText, 
  Copy, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import ProtocolPreview from '../ProtocolPreview';

interface Props {
  versions: ProtocolData[];
  currentProtocol: ProtocolData;
  onUpdate: () => void;
  onSelectProtocol: (protocol: ProtocolData) => void;
  studentId: string;
}

const ProtocolVersions: React.FC<Props> = ({ versions, currentProtocol, onUpdate, onSelectProtocol, studentId }) => {
  const [previewProtocol, setPreviewProtocol] = React.useState<ProtocolData | null>(null);

  const handleDuplicate = async (protocol: ProtocolData) => {
    if (!confirm("Gerar nova versão baseada neste protocolo?")) return;
    
    try {
      const newVersion = {
        ...protocol,
        id: "vbr-" + Math.random().toString(36).substr(2, 9),
        version: (versions.length > 0 ? (versions[0].version || 1) : 1) + 1,
        isOriginal: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        protocolTitle: `${protocol.protocolTitle} (v${(versions.length > 0 ? (versions[0].version || 1) : 1) + 1})`,
        studentId: studentId
      };

      await db.saveProtocol(newVersion);
      onUpdate();
      alert("Nova versão criada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar nova versão.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <FileText className="text-[#d4af37]" size={24} /> 
          Histórico de Protocolos
        </h2>
      </div>

      <div className="grid gap-4">
        {versions.map((protocol) => {
          const isCurrent = protocol.id === currentProtocol.id;
          return (
            <div 
              key={protocol.id} 
              className={`border rounded-2xl p-6 transition-all group ${
                isCurrent 
                  ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                  : 'bg-[#111] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    isCurrent ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-white/40'
                  }`}>
                    v{protocol.version || 1}
                  </div>
                  <div>
                    <h3 className={`font-black uppercase tracking-tighter text-lg ${isCurrent ? 'text-[#d4af37]' : 'text-white'}`}>
                      {protocol.protocolTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(protocol.updatedAt).toLocaleDateString('pt-BR')}</span>
                      {protocol.isOriginal && <span className="flex items-center gap-1 text-blue-400"><Lock size={12} /> Original</span>}
                      {isCurrent && <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12} /> Ativo</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setPreviewProtocol(protocol)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye size={14} /> Visualizar
                  </button>
                  
                  {!isCurrent && (
                    <button 
                      onClick={() => onSelectProtocol(protocol)}
                      className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 size={14} /> Ativar
                    </button>
                  )}

                  <button 
                    onClick={() => handleDuplicate(protocol)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy size={14} /> Duplicar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {versions.length === 0 && (
          <div className="text-center py-12 bg-[#111] rounded-2xl border border-white/5 border-dashed">
            <FileText size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Nenhum protocolo encontrado</p>
          </div>
        )}
      </div>

      {previewProtocol && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl h-[90vh] relative flex flex-col">
             <div className="flex justify-end mb-4">
                <button onClick={() => setPreviewProtocol(null)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all">
                    Fechar <X size={16} />
                </button>
             </div>
             <div className="flex-1 bg-white rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="h-full overflow-y-auto custom-scrollbar bg-[#333]">
                    <div className="flex justify-center p-8">
                        <ProtocolPreview data={previewProtocol} />
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolVersions;
