
import React, { useState, useMemo, useRef } from 'react';
import { ProtocolData, PhysicalData, BodyMeasurements } from '../types';
import { 
  TrendingUp, 
  Save, 
  Loader2, 
  Plus, 
  History, 
  Ruler, 
  Activity, 
  Calendar,
  FileText,
  ChevronRight,
  Trash2,
  FileDown,
  RefreshCw,
  Target,
  Clock,
  Dumbbell,
  X,
  Maximize2,
  Edit3,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { LOGO_VBR_BLACK } from '../constants';
import ProtocolPreview from './ProtocolPreview';
import ContractPreview from './ContractPreview';
import AnamnesisPreview from './AnamnesisPreview';

const LOGO_VBR_GOLD = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/DOURADO.png";

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData: (newData: ProtocolData, createHistory?: boolean, forceNewId?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onDeleteHistory?: (id: string) => void; 
  onOpenEditor?: () => void;
}

// --- SUB-COMPONENT: SIMPLE SVG CHART ---
const EvolutionChart = ({ history }: { history: ProtocolData[] }) => {
    const dataPoints = useMemo(() => {
        return [...history].reverse().map(p => ({
            date: new Date(p.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            weight: parseFloat(p.physicalData.weight.replace(',', '.') || '0'),
        })).filter(p => p.weight > 0);
    }, [history]);

    if (dataPoints.length < 2) return (
        <div className="h-64 flex flex-col items-center justify-center text-white/20 border border-white/5 rounded-3xl bg-black/20 backdrop-blur-sm">
            <Activity size={32} className="mb-3 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest">Dados insuficientes para gráfico</p>
        </div>
    );

    const maxWeight = Math.max(...dataPoints.map(d => d.weight)) * 1.02;
    const minWeight = Math.min(...dataPoints.map(d => d.weight)) * 0.98;
    const range = maxWeight - minWeight;

    // SVG Dimensions
    const getX = (index: number) => (index / (dataPoints.length - 1)) * 100;
    const getY = (val: number) => 100 - ((val - minWeight) / range) * 80 - 10; 

    const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

    return (
        <div className="w-full h-64 relative group">
            <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[20, 50, 80].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeDasharray="4" />
                ))}

                <defs>
                    <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="gradientFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                <path d={`M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`} fill="url(#gradientFill)" />
                <polyline fill="none" stroke="url(#gradientStroke)" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_10px_rgba(212,175,55,0.4)]" />

                {dataPoints.map((d, i) => (
                    <circle key={i} cx={getX(i)} cy={getY(d.weight)} r="2" fill="#0a0a0a" stroke="#d4af37" strokeWidth="1.5" className="transition-all duration-300 hover:r-4 cursor-pointer" />
                ))}
            </svg>

            {/* Tooltips */}
            <div className="absolute inset-0 pointer-events-none">
                {dataPoints.map((d, i) => (
                    <div key={i} className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full mb-3 transition-opacity duration-200 opacity-0 group-hover:opacity-100" style={{ left: `${getX(i)}%`, top: `${getY(d.weight)}%` }}>
                        <div className="bg-[#1a1a1a] border border-[#d4af37]/30 px-3 py-1.5 rounded-lg shadow-xl z-10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-[#d4af37] whitespace-nowrap">{d.weight} kg</p>
                            <p className="text-[8px] text-white/50 text-center">{d.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const EvolutionTracker: React.FC<Props> = ({ 
  currentProtocol, 
  history, 
  onNotesChange, 
  onUpdateData, 
  onSelectHistory,
  onDeleteHistory, 
  onOpenEditor 
}) => {
  const [mode, setMode] = useState<'view' | 'new_checkin' | 'new_protocol'>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const viewReportRef = useRef<HTMLDivElement>(null);

  // --- GESTÃO DE HISTÓRICO ---
  const sortedHistory = useMemo(() => {
    const uniqueMap = new Map();
    [currentProtocol, ...history].forEach(p => uniqueMap.set(p.id, p));
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  const startSnapshot = useMemo(() => {
      if (sortedHistory.length === 0) return currentProtocol;
      return sortedHistory[sortedHistory.length - 1];
  }, [sortedHistory]);

  const [editData, setEditData] = useState<PhysicalData>(currentProtocol.physicalData);
  const [editTitle, setEditTitle] = useState(currentProtocol.protocolTitle);

  React.useEffect(() => {
    setMode('view');
    setEditData(currentProtocol.physicalData);
    setEditTitle(currentProtocol.protocolTitle);
  }, [currentProtocol.id]);

  // --- HANDLERS ---
  const handleStartNewCheckin = () => {
      setEditData({ ...currentProtocol.physicalData, date: new Date().toLocaleDateString('pt-BR'), weight: "" });
      setMode('new_checkin');
  };

  const handleStartNewProtocol = () => {
      setEditData({ ...currentProtocol.physicalData, date: new Date().toLocaleDateString('pt-BR') });
      setEditTitle(currentProtocol.protocolTitle);
      setMode('new_protocol');
  };

  const handleSave = async () => {
    if (!editData.weight) { alert("⚠️ Por favor, informe o Peso Atual."); return; }
    setIsSaving(true);
    try {
        const newProtocolState = {
            ...currentProtocol,
            protocolTitle: editTitle, // Atualiza o título se estiver em modo de novo protocolo
            physicalData: editData,
            updatedAt: new Date().toISOString(),
            privateNotes: mode === 'new_protocol' ? `Início de Novo Protocolo: ${editTitle}` : currentProtocol.privateNotes
        };
        if (mode === 'new_checkin') {
            // Cria um histórico (snapshot) do momento atual
            await onUpdateData(newProtocolState, true, false); 
        } else if (mode === 'new_protocol') {
            // Cria um NOVO protocolo (Novo ID) mantendo os dados anteriores como base
            await onUpdateData(newProtocolState, false, true); 
        }
        setMode('view');
    } catch (error) { console.error(error); alert("Erro ao salvar."); } 
    finally { setIsSaving(false); }
  };

  const handleCancel = () => {
      setMode('view');
      setEditData(currentProtocol.physicalData);
      setEditTitle(currentProtocol.protocolTitle);
  };

  const handleGenerateReport = async () => {
      // Usa a referência oculta para garantir formatação correta no PDF
      const targetRef = reportRef.current;
      if (!targetRef) return;
      
      setIsGeneratingReport(true);
      const opt = {
        margin: 10,
        filename: `Relatorio_VBR_${currentProtocol.clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      try {
        // @ts-ignore
        await html2pdf().set(opt).from(targetRef).save();
      } catch (err) { alert("Erro ao gerar PDF."); } 
      finally { setIsGeneratingReport(false); }
  };

  const isEditing = mode !== 'view';
  const displayData = isEditing ? editData : currentProtocol.physicalData;

  // --- CÁLCULOS ---
  const startDate = new Date(startSnapshot.createdAt || startSnapshot.updatedAt);
  const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const startWeight = parseFloat(startSnapshot.physicalData.weight?.replace(',', '.') || '0');
  const currentWeight = parseFloat(displayData.weight?.replace(',', '.') || '0');
  const weightChange = currentWeight - startWeight;
  const percentChange = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;
  const protocolType = currentProtocol.protocolTitle || "Geral";
  const isGoodResult = protocolType.toLowerCase().includes('emagrecimento') ? weightChange <= 0 : weightChange >= 0;
  const resultColor = isGoodResult ? 'text-green-500' : 'text-red-500';

  // --- REPORT CONTENT RENDERER ---
  const renderReportContent = (isPdfMode = false) => (
    <div className={`bg-white text-black p-10 ${isPdfMode ? 'w-[297mm]' : 'w-full max-w-[297mm] mx-auto shadow-2xl rounded-xl'}`}>
        <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-8">
            <img src={LOGO_VBR_GOLD} className="h-20" alt="Logo" />
            <div className="text-right">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Relatório de Evolução</h1>
                <p className="text-xl font-medium text-gray-600">{currentProtocol.clientName}</p>
                <p className="text-sm text-gray-400 font-bold uppercase mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-10">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-xs font-bold text-gray-500 uppercase">Início</p>
                <p className="text-lg font-black">{startDate.toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-xs font-bold text-gray-500 uppercase">Duração</p>
                <p className="text-lg font-black">{diffDays} dias</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-xs font-bold text-gray-500 uppercase">Peso Inicial</p>
                <p className="text-lg font-black">{startWeight.toFixed(1)} kg</p>
            </div>
            <div className="bg-black text-white p-4 rounded-lg text-center">
                <p className="text-xs font-bold text-[#d4af37] uppercase">Resultado</p>
                <p className="text-lg font-black">{weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg</p>
            </div>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
            <thead>
                <tr className="bg-black text-white">
                    <th className="p-4 text-left rounded-tl-lg">Data</th>
                    <th className="p-4 text-center">Peso (kg)</th>
                    <th className="p-4 text-center">BF (%)</th>
                    <th className="p-4 text-center">Massa (kg)</th>
                    <th className="p-4 text-center">Cintura (cm)</th>
                    <th className="p-4 text-left rounded-tr-lg">Observações</th>
                </tr>
            </thead>
            <tbody>
                {[...sortedHistory].reverse().map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-4 font-bold border-b border-gray-200">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4 text-center border-b border-gray-200 font-medium">{p.physicalData.weight}</td>
                        <td className="p-4 text-center border-b border-gray-200">{p.physicalData.bodyFat || '-'}</td>
                        <td className="p-4 text-center border-b border-gray-200">{p.physicalData.muscleMass || '-'}</td>
                        <td className="p-4 text-center border-b border-gray-200">{p.physicalData.measurements?.waist || '-'}</td>
                        <td className="p-4 text-xs italic text-gray-500 border-b border-gray-200 max-w-[200px] truncate">{p.privateNotes || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Team VBR System © 2026</p>
        </div>
    </div>
  );

  const docBtnClass = "p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all flex flex-col items-center justify-center gap-1 min-w-[70px]";

  return (
    <div className="animate-in fade-in duration-500 pb-20 space-y-8">
      
      {/* 1. RESUMO DO PROGRESSO (TOP BLOCK) */}
      <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
              <TrendingUp size={250} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 border-b border-white/5 pb-6 relative z-10">
              <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="bg-[#d4af37] text-black p-2 rounded-lg"><Target size={20} /></div>
                      {mode === 'new_protocol' ? 'Iniciando Novo Protocolo' : 'Resumo do Progresso'}
                  </h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 pl-1">
                      {mode === 'new_protocol' 
                        ? 'Defina o objetivo e os dados iniciais para esta nova fase.'
                        : `Acompanhamento iniciado em ${startDate.toLocaleDateString('pt-BR')} • ${diffDays} dias de foco`
                      }
                  </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-end">
                  {mode === 'view' ? (
                      <>
                        <div className="flex gap-2 mr-2 pr-2 border-r border-white/5">
                            <button onClick={() => setShowReportModal(true)} className={docBtnClass} title="Relatório">
                                <TrendingUp size={16}/> <span className="text-[8px] font-black uppercase">Relatório</span>
                            </button>
                            
                            <ProtocolPreview 
                                data={currentProtocol} 
                                customTrigger={
                                    <button className={docBtnClass} title="Protocolo">
                                        <Dumbbell size={16}/> <span className="text-[8px] font-black uppercase">Protocolo</span>
                                    </button>
                                } 
                            />

                            <ContractPreview 
                                data={currentProtocol} 
                                customTrigger={
                                    <button className={docBtnClass} title="Contrato">
                                        <ShieldCheck size={16}/> <span className="text-[8px] font-black uppercase">Contrato</span>
                                    </button>
                                }
                            />

                            <AnamnesisPreview 
                                data={currentProtocol} 
                                customTrigger={
                                    <button className={docBtnClass} title="Anamnese">
                                        <BookOpen size={16}/> <span className="text-[8px] font-black uppercase">Anamnese</span>
                                    </button>
                                }
                            />
                        </div>

                        <button onClick={handleStartNewProtocol} className="px-5 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 border border-blue-500/30 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 h-full">
                            <RefreshCw size={14}/> Novo Protocolo
                        </button>
                        <button onClick={handleStartNewCheckin} className="px-6 py-3 rounded-xl bg-[#d4af37] text-black hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 h-full">
                            <Plus size={16}/> Nova Evolução
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={handleCancel} className="px-6 py-3 rounded-xl bg-white/5 hover:text-white text-white/40 font-black uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-green-500 text-black hover:scale-105 shadow-lg font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} 
                            {mode === 'new_protocol' ? 'Criar Protocolo' : 'Salvar Registro'}
                        </button>
                      </>
                  )}
              </div>
          </div>

          {/* ÁREA DE EDIÇÃO DO TÍTULO DO PROTOCOLO (SE FOR NOVO PROTOCOLO) */}
          {mode === 'new_protocol' && (
              <div className="mb-6 relative z-10 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
                  <div className="p-3 bg-blue-500 text-white rounded-lg"><Target size={20} /></div>
                  <div className="flex-1 w-full">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 block">Objetivo desta Nova Fase</label>
                      <input 
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-bold focus:border-blue-500 outline-none"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Ex: Cutting Radical, Bulking Limpo..."
                      />
                  </div>
                  <div className="text-xs text-white/40 max-w-xs text-center md:text-right">
                      Isso criará um novo marco no histórico. Os treinos e dieta anteriores serão mantidos até você editá-los.
                  </div>
              </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 text-white/30">
                      <Clock size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Peso Inicial</span>
                  </div>
                  <p className="text-2xl font-black text-white/50">{startWeight.toFixed(1)} <span className="text-sm font-bold">kg</span></p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 text-white/30">
                      <Activity size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">BF Inicial</span>
                  </div>
                  <p className="text-2xl font-black text-white/50">{startSnapshot.physicalData.bodyFat || '-'} <span className="text-sm font-bold">%</span></p>
              </div>

              <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                  <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Dumbbell size={40} className="text-[#d4af37]" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                      <Target size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                          {mode === 'new_protocol' ? 'Peso de Início' : 'Peso Atual'}
                      </span>
                  </div>
                  {isEditing ? (
                      <input 
                        autoFocus
                        className="bg-transparent text-3xl font-black text-white w-full outline-none border-b border-[#d4af37] pb-1"
                        value={editData.weight}
                        onChange={(e) => setEditData({...editData, weight: e.target.value})}
                      />
                  ) : (
                      <p className="text-3xl font-black text-white">{currentWeight.toFixed(1)} <span className="text-sm font-bold text-[#d4af37]">kg</span></p>
                  )}
              </div>

              <div className={`p-5 rounded-2xl border relative overflow-hidden ${isGoodResult ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                      <TrendingUp size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Evolução Total</span>
                  </div>
                  <div className={`text-3xl font-black flex items-end gap-2 ${resultColor}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} 
                      <span className="text-sm font-bold mb-1">kg</span>
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${resultColor} opacity-80`}>
                      {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% do peso inicial
                  </p>
              </div>
          </div>
      </div>

      {/* 2. GRID PRINCIPAL (PROTOCOLO + GRÁFICO vs TIMELINE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA (2/3) */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* CARD PROTOCOLO ATIVO */}
              {!isEditing && (
                  <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]"></div>
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37]">
                              <FileText size={24} />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Protocolo Ativo</h3>
                              <p className="text-xs text-white/50 font-bold uppercase">{currentProtocol.protocolTitle}</p>
                              <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-bold uppercase bg-green-500/20 text-green-500 px-2 py-0.5 rounded animate-pulse">Em Execução</span>
                                  <span className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                                      <Calendar size={10} /> Criado em {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}
                                  </span>
                              </div>
                          </div>
                      </div>
                      
                      {onOpenEditor && (
                          <button 
                              onClick={onOpenEditor}
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all w-full md:w-auto justify-center"
                          >
                              Ver Dieta & Treino <ChevronRight size={14} />
                          </button>
                      )}
                  </div>
              )}

              {/* GRÁFICO DE EVOLUÇÃO */}
              <div className="bg-[#111] p-8 rounded-[2rem] border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="text-[#d4af37]" size={16} /> Curva de Peso
                      </h3>
                      <div className="flex gap-2">
                          <span className="flex items-center gap-1 text-[9px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded">
                              <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div> Peso (kg)
                          </span>
                      </div>
                  </div>
                  <EvolutionChart history={sortedHistory} />
              </div>

              {/* INPUTS DE EDIÇÃO */}
              {isEditing && (
                  <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-[#d4af37]/30 shadow-2xl animate-in slide-in-from-bottom-4">
                      <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest mb-6 border-b border-[#d4af37]/20 pb-2">
                          {mode === 'new_protocol' ? 'Novas Medidas e Observações' : 'Atualizar Medidas (cm) & Observações'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {['waist', 'abdomen', 'glutes', 'rightArmContracted', 'rightThigh', 'rightCalf'].map((key) => (
                              <div key={key}>
                                  <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </label>
                                  <input 
                                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                                      value={(editData.measurements as any)?.[key] || ''}
                                      onChange={(e) => setEditData({
                                          ...editData,
                                          measurements: { ...editData.measurements, [key]: e.target.value } as BodyMeasurements
                                      })}
                                      placeholder="0 cm"
                                  />
                              </div>
                          ))}
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">
                              {mode === 'new_protocol' ? 'Observações Iniciais do Novo Protocolo' : 'Observações do Check-in'}
                          </label>
                          <textarea 
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[80px]"
                              placeholder={mode === 'new_protocol' ? "Metas para esta nova fase..." : "Como foi a semana? Dificuldades?"}
                              value={currentProtocol.privateNotes}
                              onChange={(e) => onNotesChange(e.target.value)}
                          />
                      </div>
                  </div>
              )}
          </div>

          {/* COLUNA DIREITA (1/3) - LINHA DO TEMPO */}
          <div className="lg:col-span-1">
              <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10 h-full max-h-[800px] overflow-hidden flex flex-col">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
                      <History size={16} className="text-[#d4af37]" /> Histórico
                  </h3>
                  
                  <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4 relative flex-1">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/5 z-0 rounded-full"></div>

                      {sortedHistory.map((p, idx) => {
                          const isActive = p.id === currentProtocol.id;
                          const isNewProtocol = p.privateNotes?.includes('Novo Protocolo') || idx === sortedHistory.length - 1;
                          
                          return (
                              <div key={p.id} className="relative z-10 group">
                                  <button
                                      onClick={() => mode === 'view' && onSelectHistory && onSelectHistory(p)}
                                      disabled={mode !== 'view'}
                                      className={`w-full text-left p-4 pl-12 rounded-2xl border transition-all relative ${isActive ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg scale-[1.02]' : 'bg-[#1a1a1a] border-white/5 text-white/60 hover:bg-white/5 hover:border-white/10'}`}
                                  >
                                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${isActive ? 'bg-black border-black' : isNewProtocol ? 'bg-blue-500 border-blue-500' : 'bg-[#111] border-white/20'}`}></div>

                                      <div className="flex justify-between items-start">
                                          <div>
                                              <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5">
                                                  {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                                              </span>
                                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isNewProtocol ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white/40'}`}>
                                                  {isNewProtocol ? 'Novo Protocolo' : 'Check-in'}
                                              </span>
                                              {isNewProtocol && (
                                                  <p className="text-[8px] font-bold mt-1 opacity-70 truncate max-w-[100px]">{p.protocolTitle}</p>
                                              )}
                                          </div>
                                          <div className="text-right">
                                              <p className="text-sm font-black">{p.physicalData.weight || '-'} <span className="text-[9px]">kg</span></p>
                                          </div>
                                      </div>
                                  </button>

                                  {onDeleteHistory && idx !== sortedHistory.length - 1 && mode === 'view' && (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); onDeleteHistory(p.id); }}
                                          className="absolute top-2 right-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg"
                                          title="Excluir este registro"
                                      >
                                          <Trash2 size={14} />
                                      </button>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>

      {/* REPORT PREVIEW MODAL (VISUALIZAR) */}
      {showReportModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                        <FileText size={20} className="text-[#d4af37]" /> Visualização de Relatório
                    </h2>
                    <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar-light">
                    {renderReportContent(false)}
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4">
                    <button 
                        onClick={() => setShowReportModal(false)} 
                        className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={isGeneratingReport}
                        className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                        {isGeneratingReport ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                        Baixar PDF
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HIDDEN REPORT FOR PDF GENERATION */}
      <div className="fixed left-[-9999px]">
          <div ref={reportRef} className="bg-white">
              {renderReportContent(true)}
          </div>
      </div>

    </div>
  );
};

export default EvolutionTracker;
