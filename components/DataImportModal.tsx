import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, FileText, Copy } from 'lucide-react';
import { db } from '../services/db';
import { ProtocolData } from '../types';
import Papa from 'papaparse';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const DataImportModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, errors: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedSql, setGeneratedSql] = useState('');

  const [view, setView] = useState<'input' | 'processing' | 'sql'>('input');

  const parseCSV = (text: string) => {
    const trimmed = text.trim();

    // 1. Try parsing as a pure JSON array first (in case user pasted a JSON export)
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
            let jsonFull = JSON.parse(trimmed);
            if (!Array.isArray(jsonFull)) {
                jsonFull = [jsonFull]; // Convert single object to array
            }

            return jsonFull.map((item: any) => {
                // If the item has a 'data' field that is a string/object, use it
                // Otherwise, assume the item itself is the protocol data
                let protocolData = item;
                
                // If there's a nested 'data' or 'json' field, try to use that
                if (item.data || item.json) {
                        const rawData = item.data || item.json;
                        // Remove raw data strings to avoid nesting/duplication
                        const { data: _d, json: _j, ...cleanItem } = item;

                        if (typeof rawData === 'object') {
                            protocolData = { ...rawData, ...cleanItem }; // Merge metadata
                        } else if (typeof rawData === 'string') {
                            try {
                                const parsed = JSON.parse(rawData);
                                protocolData = { ...parsed, ...cleanItem };
                            } catch (e) {
                                // Keep item as is if parsing fails
                            }
                        }
                }

                return {
                    ...protocolData,
                    id: item.id || protocolData.id,
                    clientName: item.client_name || item.name || protocolData.clientName || 'Sem Nome',
                    updatedAt: item.updated_at || item.date || protocolData.updatedAt || new Date().toISOString()
                };
            });
        } catch (e) {
            const errorMsg = (e as Error).message;
            if (errorMsg.includes('Unexpected end of JSON input') || errorMsg.includes('Unterminated string')) {
                setLogs(prev => [...prev, `❌ Erro de JSON: O conteúdo parece estar incompleto (cortado). Verifique se copiou todo o texto.`]);
            } else {
                // Fallback to CSV parsing if JSON fails (maybe it just started with { but is CSV?)
            }
        }
    }

    // 2. Use Papa Parse for robust CSV parsing
    const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim().replace(/['"]/g, '')
    });

    if (result.errors.length > 0) {
        result.errors.forEach(err => {
             // Only log critical errors
             if (err.type === 'Quotes' || err.type === 'Delimiter') {
                setLogs(prev => [...prev, `⚠️ CSV Warning na linha ${err.row}: ${err.message}`]);
             }
        });
    }

    const parsedData: any[] = [];
    
    result.data.forEach((row: any, index: number) => {
        try {
            // Normalize keys
            const rowId = row['id'];
            const rowName = row['client_name'] || row['name'];
            const rowDate = row['updated_at'] || row['date'];
            let jsonDataRaw = row['data'] || row['json'];

            // If data column is missing, try to find it in other columns
            if (!jsonDataRaw) {
                 // Fallback: check if any value looks like JSON
                 const values = Object.values(row);
                 const jsonVal = values.find((v: any) => typeof v === 'string' && v.trim().startsWith('{') && v.trim().endsWith('}'));
                 if (jsonVal) jsonDataRaw = jsonVal;
            }

            if (!jsonDataRaw) {
                if (Object.keys(row).length > 1) {
                    setLogs(prev => [...prev, `⚠️ Linha ${index + 1}: Coluna de dados (JSON) não encontrada.`]);
                }
                return;
            }

            // Robust JSON Parsing Strategy
            let jsonData: any = null;
            let parseError: Error | null = null;
            
            const attempts = [
                () => typeof jsonDataRaw === 'object' ? jsonDataRaw : JSON.parse(jsonDataRaw), // 1. Direct
                () => JSON.parse(jsonDataRaw.replace(/""/g, '"')), // 2. Fix CSV double escaping
                () => { // 3. Handle wrapped quotes: "{...}" -> {...}
                    let s = jsonDataRaw.trim();
                    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
                    return JSON.parse(s.replace(/""/g, '"'));
                },
                () => JSON.parse(jsonDataRaw.replace(/'/g, '"')), // 4. Replace single quotes (common in Python/JS dumps)
                () => JSON.parse(jsonDataRaw.replace(/\\"/g, '"')) // 5. Unescape backslashes
            ];

            for (const attempt of attempts) {
                try {
                    jsonData = attempt();
                    if (jsonData && typeof jsonData === 'object') break;
                } catch (e) {
                    parseError = e as Error;
                }
            }

            if (!jsonData) {
                throw new Error(`Falha ao ler JSON: ${parseError?.message || 'Formato inválido'}`);
            }
            
            // Merge metadata
            if (!jsonData.id && rowId) jsonData.id = rowId;
            if (!jsonData.clientName && rowName) jsonData.clientName = rowName;
            if (!jsonData.updatedAt && rowDate) jsonData.updatedAt = rowDate;

            // Validation Warning
            if (!jsonData.meals && !jsonData.tips && !jsonData.anamnesis) {
                setLogs(prev => [...prev, `⚠️ Aviso (Linha ${index + 1}): O registro de "${jsonData.clientName}" parece vazio (sem refeições/dicas).`]);
            }

            parsedData.push(jsonData);
        } catch (e) {
            setLogs(prev => [...prev, `❌ Erro na linha ${index + 1}: ${(e as Error).message}`]);
        }
    });
    
    return parsedData;
  };

  const generateSQL = (data: any[]) => {
      if (!data || data.length === 0) return '';
      
      let sql = `-- SCRIPT DE IMPORTAÇÃO GERADO EM ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n`;
      sql += `-- Execute este script no SQL Editor do Supabase\n\n`;
      sql += `INSERT INTO public.protocols (id, client_name, updated_at, data)\nVALUES\n`;
      
      const values = data.map((item, index) => {
          const id = item.id;
          const name = (item.clientName || 'Sem Nome').replace(/'/g, "''"); // Escape quotes
          const date = item.updatedAt || new Date().toISOString();
          
          // Clean up the object for JSONB storage
          // Remove raw 'data'/'json' strings if they exist to prevent recursion/bloat
          // Ensure we are saving the UNWRAPPED data (tips, meals, etc)
          const { data: _d, json: _j, ...rest } = item;
          const jsonObject = {
              ...rest,
              id,
              clientName: item.clientName || 'Sem Nome',
              updatedAt: date
          };
          
          const json = JSON.stringify(jsonObject).replace(/'/g, "''"); // Escape quotes for SQL
          
          return `  ('${id}', '${name}', '${date}', '${json}'::jsonb)${index < data.length - 1 ? ',' : ''}`;
      });
      
      sql += values.join('\n');
      sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
      sql += `  client_name = EXCLUDED.client_name,\n`;
      sql += `  updated_at = EXCLUDED.updated_at,\n`;
      sql += `  data = EXCLUDED.data;\n`;
      
      return sql;
  };

  const handleProcess = async (mode: 'import' | 'sql') => {
    if (!csvContent.trim()) return;
    
    console.log("Starting process...");
    setView('processing');
    setIsImporting(true);
    setLogs([]);
    
    // Allow UI to update before blocking
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        console.log("Parsing content...");
        const dataToImport = parseCSV(csvContent);
        console.log("Parsed data:", dataToImport.length, "records");
        
        setProgress({ current: 0, total: dataToImport.length, success: 0, errors: 0 });
        
        if (dataToImport.length === 0) {
            setLogs(prev => [...prev, "⚠️ Nenhum dado válido encontrado para importar. Verifique o formato do CSV."]);
            setIsImporting(false);
            return;
        }

        if (mode === 'sql') {
            const sql = generateSQL(dataToImport);
            setGeneratedSql(sql);
            setView('sql');
            setIsImporting(false);
            return;
        }

        setLogs(prev => [...prev, `🚀 Iniciando importação de ${dataToImport.length} registros...`]);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataToImport.length; i++) {
            const protocol = dataToImport[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));
            
            try {
                // Use db.importProtocol which handles upsert and preserves dates
                await db.importProtocol(protocol);
                successCount++;
                setProgress(prev => ({ ...prev, success: successCount }));
            } catch (err) {
                console.error("Import error for item", i, err);
                errorCount++;
                setProgress(prev => ({ ...prev, errors: errorCount }));
                setLogs(prev => [...prev, `❌ Falha ao salvar ${protocol.clientName || protocol.id}: ${(err as Error).message}`]);
            }
        }
        
        setLogs(prev => [...prev, "✅ Processo finalizado!"]);
        
        if (errorCount === 0) {
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }

    } catch (error) {
        console.error("Fatal import error:", error);
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
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Cole o CSV ou JSON abaixo</p>
                </div>
            </div>
            <button onClick={onClose} disabled={isImporting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white disabled:opacity-50">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
            {view === 'input' ? (
                <textarea 
                    className="w-full h-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 outline-none focus:border-[#d4af37] resize-none custom-scrollbar"
                    placeholder="Cole aqui o conteúdo CSV (id,client_name,updated_at,data...) ou JSON Array"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                />
            ) : view === 'sql' ? (
                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <div>
                            <h4 className="font-bold text-green-500 text-sm">SQL Gerado com Sucesso</h4>
                            <p className="text-xs text-white/60">Copie o código abaixo e execute no SQL Editor do Supabase.</p>
                        </div>
                    </div>
                    <textarea 
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 outline-none focus:border-[#d4af37] resize-none custom-scrollbar"
                        value={generatedSql}
                        readOnly
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-white/60">
                            <span>Progresso</span>
                            <span>{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#d4af37] transition-all duration-300"
                                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
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
                    
                    {!isImporting && (
                        <button 
                            onClick={() => setView('input')}
                            className="text-xs text-[#d4af37] hover:underline uppercase font-bold tracking-widest"
                        >
                            Voltar e tentar novamente
                        </button>
                    )}
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
            
            {view === 'input' && (
                <>

                    <button 
                        onClick={() => handleProcess('import')}
                        disabled={!csvContent.trim()}
                        className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:grayscale"
                    >
                        <Upload size={16} /> Importar Direto
                    </button>
                </>
            )}

            {view === 'sql' && (
                <button 
                    onClick={() => { navigator.clipboard.writeText(generatedSql); alert('SQL Copiado!'); }}
                    className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                    <Copy size={16} /> Copiar SQL
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default DataImportModal;
