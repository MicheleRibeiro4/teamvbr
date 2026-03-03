import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { db } from '../services/db';
import { ProtocolData } from '../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const DataImportModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, errors: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const parsedData: any[] = [];
    
    // Detect header
    const startIndex = lines[0].toLowerCase().startsWith('id,') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Basic CSV parsing for the specific format: id,name,date,"json"
      // We assume the first 3 fields don't contain commas for now, or we find the 3rd comma.
      // A more robust way is to find the index of the first quote of the JSON data.
      
      const firstQuoteIndex = line.indexOf('"');
      if (firstQuoteIndex === -1) {
          setLogs(prev => [...prev, `⚠️ Linha ${i + 1}: Formato inválido (JSON não encontrado)`]);
          continue;
      }
      
      // Everything before the quote is metadata
      const metaPart = line.substring(0, firstQuoteIndex);
      const metaParts = metaPart.split(',');
      
      // We expect at least 3 commas before the JSON, but the last comma is right before the quote usually?
      // Actually the format is: id,name,date,"json"
      // So metaParts should have id, name, date, and an empty string (due to trailing comma)
      
      // Let's try a different approach: find the first 3 commas.
      let commaCount = 0;
      let thirdCommaIndex = -1;
      
      for (let j = 0; j < line.length; j++) {
          if (line[j] === ',') {
              commaCount++;
              if (commaCount === 3) {
                  thirdCommaIndex = j;
                  break;
              }
          }
      }
      
      if (thirdCommaIndex === -1) {
           setLogs(prev => [...prev, `⚠️ Linha ${i + 1}: Formato inválido (colunas insuficientes)`]);
           continue;
      }
      
      const id = line.substring(0, line.indexOf(',')).trim();
      // Name might have commas? Unlikely but let's assume standard format provided.
      // The provided format: id,client_name,updated_at,data
      
      // Let's rely on the structure provided by the user which seems consistent.
      const meta = line.substring(0, thirdCommaIndex).split(',');
      const rowId = meta[0];
      const rowName = meta[1]; // If name has comma, this breaks. But let's assume it doesn't for now.
      const rowDate = meta[2];
      
      let jsonRaw = line.substring(thirdCommaIndex + 1).trim();
      
      // Remove surrounding quotes
      if (jsonRaw.startsWith('"') && jsonRaw.endsWith('"')) {
          jsonRaw = jsonRaw.substring(1, jsonRaw.length - 1);
      }
      
      // Unescape double quotes: "" -> "
      jsonRaw = jsonRaw.replace(/""/g, '"');
      
      try {
          const jsonData = JSON.parse(jsonRaw);
          // Ensure the ID matches or use the one from JSON
          if (!jsonData.id) jsonData.id = rowId;
          
          // Inject CSV metadata if missing in JSON
          if (!jsonData.clientName && rowName) jsonData.clientName = rowName;
          if (!jsonData.updatedAt && rowDate) jsonData.updatedAt = rowDate;
          
          parsedData.push(jsonData);
      } catch (e) {
          setLogs(prev => [...prev, `❌ Erro ao processar JSON da linha ${i + 1}: ${(e as Error).message}`]);
      }
    }
    
    return parsedData;
  };

  const handleImport = async () => {
    if (!csvContent.trim()) return;
    
    setIsImporting(true);
    setLogs([]);
    
    try {
        const dataToImport = parseCSV(csvContent);
        setProgress({ current: 0, total: dataToImport.length, success: 0, errors: 0 });
        
        if (dataToImport.length === 0) {
            setLogs(prev => [...prev, "⚠️ Nenhum dado válido encontrado para importar."]);
            setIsImporting(false);
            return;
        }

        setLogs(prev => [...prev, `🚀 Iniciando importação de ${dataToImport.length} registros...`]);

        for (let i = 0; i < dataToImport.length; i++) {
            const protocol = dataToImport[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));
            
            try {
                // Use db.importProtocol which handles upsert and preserves dates
                await db.importProtocol(protocol);
                setProgress(prev => ({ ...prev, success: prev.success + 1 }));
            } catch (err) {
                console.error(err);
                setProgress(prev => ({ ...prev, errors: prev.errors + 1 }));
                setLogs(prev => [...prev, `❌ Falha ao salvar ${protocol.clientName || protocol.id}: ${(err as Error).message}`]);
            }
        }
        
        setLogs(prev => [...prev, "✅ Processo finalizado!"]);
        
        if (progress.errors === 0) {
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        }

    } catch (error) {
        console.error(error);
        setLogs(prev => [...prev, `❌ Erro fatal: ${(error as Error).message}`]);
    } finally {
        setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#d4af37] text-black rounded-xl flex items-center justify-center font-black">
                    <Upload size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Importar Dados</h2>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Cole o CSV do Supabase abaixo</p>
                </div>
            </div>
            <button onClick={onClose} disabled={isImporting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white disabled:opacity-50">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
            {!isImporting && progress.total === 0 ? (
                <textarea 
                    className="w-full h-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 outline-none focus:border-[#d4af37] resize-none custom-scrollbar"
                    placeholder="Cole aqui o conteúdo CSV (id,client_name,updated_at,data...)"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-white/60">
                            <span>Progresso</span>
                            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#d4af37] transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-white/40 mt-2">
                            <span className="text-green-500">Sucesso: {progress.success}</span>
                            <span className="text-red-500">Erros: {progress.errors}</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-black/50 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar border border-white/10">
                        {logs.map((log, i) => (
                            <p key={i} className="text-[10px] font-mono mb-1 text-white/70 border-b border-white/5 pb-1 last:border-0">{log}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4">
            <button 
                onClick={onClose} 
                disabled={isImporting}
                className="px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
                Cancelar
            </button>
            {!isImporting && (
                <button 
                    onClick={handleImport}
                    disabled={!csvContent.trim()}
                    className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:grayscale"
                >
                    <Upload size={16} /> Importar Agora
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default DataImportModal;
