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
    if (lines.length === 0) return [];

    const parsedData: any[] = [];
    
    // Helper to parse a single CSV line respecting quotes
    const parseLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    // Parse headers
    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());
    
    // Identify column indices
    const idIndex = headers.findIndex(h => h === 'id');
    const nameIndex = headers.findIndex(h => h === 'client_name' || h === 'name');
    const dateIndex = headers.findIndex(h => h === 'updated_at' || h === 'date');
    const dataIndex = headers.findIndex(h => h === 'data' || h === 'json');

    // If we found at least 'id' or 'data' in headers, assume first row is header
    const startIndex = (idIndex !== -1 || dataIndex !== -1) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        try {
            const cols = parseLine(lines[i]);
            
            // If we found headers, use them. Otherwise assume default order: id, name, date, data
            // Note: If no headers found, we assume the standard export format: id, client_name, updated_at, data
            let rowId = (idIndex !== -1) ? cols[idIndex] : cols[0];
            let rowName = (nameIndex !== -1) ? cols[nameIndex] : cols[1];
            let rowDate = (dateIndex !== -1) ? cols[dateIndex] : cols[2];
            let jsonDataRaw = (dataIndex !== -1) ? cols[dataIndex] : (cols.length > 3 ? cols[3] : null);

            // If we still don't have json, try to find a column that looks like JSON
            if (!jsonDataRaw) {
                 const jsonCol = cols.find(c => c && c.trim().startsWith('{') && c.trim().endsWith('}'));
                 if (jsonCol) jsonDataRaw = jsonCol;
            }

            if (!jsonDataRaw) {
                setLogs(prev => [...prev, `⚠️ Linha ${i + 1}: Coluna de dados (JSON) não encontrada.`]);
                continue;
            }

            // Clean up JSON string if needed (sometimes CSV export adds extra quotes)
            let jsonClean = jsonDataRaw.trim();
            if (jsonClean.startsWith('"{') && jsonClean.endsWith('}"')) {
                jsonClean = jsonClean.substring(1, jsonClean.length - 1).replace(/""/g, '"');
            }

            const jsonData = JSON.parse(jsonClean);
            
            // Merge metadata
            if (!jsonData.id && rowId) jsonData.id = rowId;
            if (!jsonData.clientName && rowName) jsonData.clientName = rowName;
            if (!jsonData.updatedAt && rowDate) jsonData.updatedAt = rowDate;

            parsedData.push(jsonData);
        } catch (e) {
            setLogs(prev => [...prev, `❌ Erro na linha ${i + 1}: ${(e as Error).message}`]);
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
