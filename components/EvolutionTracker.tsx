
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
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  FileText,
  ChevronRight,
  Trash2,
  FileDown,
  RefreshCw,
  Target,
  Clock,
  Dumbbell
} from 'lucide-react';
import { LOGO_VBR_BLACK } from '../constants';

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
    // Prepara dados (ordem cronológica: antigo -> novo)
    const dataPoints = useMemo(() => {
        return [...history].reverse().map(p => ({
            date: new Date(p.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            weight: parseFloat(p.physicalData.weight.replace(',', '.') || '0'),
            bf: parseFloat(p.physicalData.bodyFat.replace(',', '.') || '0')
        })).filter(p => p.weight > 0);
    }, [history]);

    if (dataPoints.length < 2) return (
        <div className="h-64 flex flex-col items-center justify-center text-white/20 border border-white/5 rounded-2xl bg-black/20">
            <Activity size={32} className="mb-2 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest">Dados insuficientes para gráfico</p>
        </div>
    );

    const maxWeight = Math.max(...dataPoints.map(d => d.weight)) * 1.05;
    const minWeight = Math.min(...dataPoints.map(d => d.weight)) * 0.95;
    const range = maxWeight - minWeight;

    // SVG Dimensions
    const width = 100; // percent
    const height = 100; // logical units
    
    const getX = (index: number) => (index / (dataPoints.length - 1)) * 100;
    const getY = (val: number) => 100 - ((val - minWeight) / range) * 80 - 10; // padding top/bottom

    const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

    return (
        <div className="w-full h-64 relative group">
            <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeDasharray="2" />

                {/* Line Path */}
                <defs>
                    <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="gradientFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Area Fill */}
                <path 
                    d={`M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`} 
                    fill="url(#gradientFill)" 
                />
                
                {/* Stroke */}
                <polyline 
                    fill="none" 
                    stroke="url(#gradientStroke)" 
                    strokeWidth="1.5" 
                    points={points} 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                />

                {/* Dots */}
                {dataPoints.map((d, i) => (
                    <circle 
                        key={i} 
                        cx={getX(i)} 
                        cy={getY(d.weight)} 
                        r="1.5" 
                        fill="#000" 
                        stroke="#d4af37" 
                        strokeWidth="1"
                        className="transition-all duration-300 hover:r-3"
                    />
                ))}
            </svg>

            {/* Labels (HTML Overlay for better text rendering) */}
            <div className="absolute inset-0 pointer-events-none">
                {dataPoints.map((d, i) => (
                    <div 
                        key={i} 
                        className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full"
                        style={{ left: `${getX(i)}%`, top: `${getY(d.weight)}%` }}
                    >
                        <div className="bg-[#111] border border-[#d4af37]/30 px-2 py-1 rounded mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                            <p className="text-[10px] font-black text-[#d4af37]">{d.weight} kg</p>
                            <p className="text-[8px] text-white/50">{d.date}</p>
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
  const reportRef = useRef<HTMLDivElement>(null);

  // --- GESTÃO DE HISTÓRICO ---
  const sortedHistory = useMemo(() => {
    const uniqueMap = new Map();
    // Junta o protocolo atual com o histórico salvo
    [currentProtocol, ...history].forEach(p => uniqueMap.set(p.id, p));
    // Ordena do mais recente para o mais antigo
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Snapshot Inicial (Imutável)
  const startSnapshot = useMemo(() => {
      if (sortedHistory.length === 0) return currentProtocol;
      return sortedHistory[sortedHistory.length - 1]; // O último do array (mais antigo)
  }, [sortedHistory]);

  // Estado Local para Edição
  const [editData, setEditData] = useState<PhysicalData>(currentProtocol.physicalData);

  // Resetar modo ao trocar de histórico
  React.useEffect(() => {
    setMode('view');
    setEditData(currentProtocol.physicalData);
  }, [currentProtocol.id]);

  // --- HANDLERS ---
  const handleStartNewCheckin = () => {
      setEditData({
          ...currentProtocol.physicalData,
          date: new Date().toLocaleDateString('pt-BR'),
          weight: "", // Limpa para forçar nova entrada
      });
      setMode('new_checkin');
  };

  const handleStartNewProtocol = () => {
      setEditData({
          ...currentProtocol.physicalData,
          date: new Date().toLocaleDateString('pt-BR'),
      });
      setMode('new_protocol');
  };

  const handleSave = async () => {
    if (!editData.weight) {
        alert("⚠️ Por favor, informe o Peso Atual.");
        return;
    }

    setIsSaving(true);
    try {
        const newProtocolState = {
            ...currentProtocol,
            physicalData: editData,
            updatedAt: new Date().toISOString(),
            privateNotes: mode === 'new_protocol' ? "Início de Novo Protocolo (Estratégia Alterada)" : currentProtocol.privateNotes
        };

        if (mode === 'new_checkin') {
            await onUpdateData(newProtocolState, true, false); // createHistory=true
        } else if (mode === 'new_protocol') {
            await onUpdateData(newProtocolState, false, true); // forceNewId=true (Snapshot anterior vai pro histórico)
        }
        setMode('view');
    } catch (error) {
        console.error(error);
        alert("Erro ao salvar.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
      setMode('view');
      setEditData(currentProtocol.physicalData);
  };

  const handleGenerateReport = async () => {
      if (!reportRef.current) return;
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
        await html2pdf().set(opt).from(reportRef.current).save();
      } catch (err) { alert("Erro ao gerar PDF."); } 
      finally { setIsGeneratingReport(false); }
  };

  const isEditing = mode !== 'view';
  const displayData = isEditing ? editData : currentProtocol.physicalData;

  // --- CÁLCULOS DO DASHBOARD ---
  const startDate = new Date(startSnapshot.createdAt || startSnapshot.updatedAt);
  const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  const startWeight = parseFloat(startSnapshot.physicalData.weight?.replace(',', '.') || '0');
  const currentWeight = parseFloat(displayData.weight?.replace(',', '.') || '0');
  const weightChange = currentWeight - startWeight;
  const percentChange = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;

  const isPositive = weightChange > 0; // Ganho de peso
  const protocolType = currentProtocol.protocolTitle || "Geral"; // Ex: Hipertrofia
  // Se for hipertrofia, ganhar peso é bom (verde). Se emagrecimento, perder é bom (verde).
  const isGoodResult = protocolType.toLowerCase().includes('emagrecimento') ? weightChange <= 0 : weightChange >= 0;
  const resultColor = isGoodResult ? 'text-green-500' : 'text-red-500';

  return (
    <div className="animate-in fade-in duration-500 pb-20 space-y-8">
      
      {/* 1. RESUMO DO PROGRESSO (TOP BLOCK) */}
      <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <TrendingUp size={200} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 border-b border-white/5 pb-6">
              <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <Target className="text-[#d4af37]" size={28} /> Resumo do Progresso
                  </h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1 pl-1">
                      Acompanhamento iniciado em {startDate.toLocaleDateString('pt-BR')} ({diffDays} dias)
                  </p>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                  {mode === 'view' ? (
                      <>
                        <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            {isGeneratingReport ? <Loader2 size={14} className="animate-spin"/> : <FileDown size={14}/>} Relatório
                        </button>
                        <button onClick={handleStartNewProtocol} className="px-5 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 border border-blue-500/30 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            <RefreshCw size={14}/> Novo Protocolo
                        </button>
                        <button onClick={handleStartNewCheckin} className="px-6 py-3 rounded-xl bg-[#d4af37] text-black hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            <Plus size={16}/> Nova Evolução
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={handleCancel} className="px-6 py-3 rounded-xl bg-white/5 hover:text-white text-white/40 font-black uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-green-500 text-black hover:scale-105 shadow-lg font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Salvar Registro
                        </button>
                      </>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Card Imutável Inicial */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-white/30">
                      <Clock size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Peso Inicial</span>
                  </div>
                  <p className="text-2xl font-black text-white/50">{startWeight.toFixed(1)} <span className="text-sm font-bold">kg</span></p>
              </div>

              {/* Card Imutável Gordura Inicial */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-white/30">
                      <Activity size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">BF Inicial</span>
                  </div>
                  <p className="text-2xl font-black text-white/50">{startSnapshot.physicalData.bodyFat || '-'} <span className="text-sm font-bold">%</span></p>
              </div>

              {/* Destaque: Peso Atual */}
              <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Dumbbell size={40} className="text-[#d4af37]" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                      <Target size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Peso Atual</span>
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

              {/* Destaque: Resultado Total */}
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
                  <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white/40">
                              <FileText size={24} />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Protocolo Ativo</h3>
                              <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-bold uppercase bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Em Execução</span>
                                  <span className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                                      <Calendar size={10} /> Criado em {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}
                                  </span>
                              </div>
                          </div>
                      </div>
                      
                      {onOpenEditor && (
                          <button 
                              onClick={onOpenEditor}
                              className="px-6 py-3 bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black text-[#d4af37] border border-[#d4af37]/20 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all w-full md:w-auto justify-center"
                          >
                              Visualizar Dieta & Treino <ChevronRight size={14} />
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

              {/* INPUTS DE EDIÇÃO (APARECEM SÓ QUANDO EDITANDO) */}
              {isEditing && (
                  <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-[#d4af37]/30 shadow-2xl animate-in slide-in-from-bottom-4">
                      <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest mb-6 border-b border-[#d4af37]/20 pb-2">
                          Atualizar Medidas (cm) & Observações
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
                          <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">Observações do Check-in</label>
                          <textarea 
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[80px]"
                              placeholder="Como foi a semana? Dificuldades?"
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
                      {/* Vertical Line */}
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
                                      {/* Dot Indicador */}
                                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${isActive ? 'bg-black border-black' : isNewProtocol ? 'bg-blue-500 border-blue-500' : 'bg-[#111] border-white/20'}`}></div>

                                      <div className="flex justify-between items-start">
                                          <div>
                                              <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5">
                                                  {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                                              </span>
                                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isNewProtocol ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white/40'}`}>
                                                  {isNewProtocol ? 'Novo Protocolo' : 'Check-in'}
                                              </span>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-sm font-black">{p.physicalData.weight || '-'} <span className="text-[9px]">kg</span></p>
                                          </div>
                                      </div>
                                  </button>

                                  {/* Delete Button (Só aparece no hover e se não for o snapshot inicial) */}
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

      {/* Hidden Report Template */}
      <div className="fixed left-[-9999px]">
          <div ref={reportRef} className="bg-white text-black p-10 w-[297mm]">
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
                  <img src={LOGO_VBR_BLACK} className="h-16" />
                  <div>
                      <h1 className="text-3xl font-black uppercase text-right">Relatório de Evolução</h1>
                      <p className="text-lg text-right">{currentProtocol.clientName}</p>
                  </div>
              </div>
              <table className="w-full text-sm border-collapse mb-8">
                  <thead>
                      <tr className="bg-black text-white">
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3">Peso (kg)</th>
                          <th className="p-3">BF (%)</th>
                          <th className="p-3">Massa (kg)</th>
                          <th className="p-3">Cintura (cm)</th>
                          <th className="p-3">Obs</th>
                      </tr>
                  </thead>
                  <tbody>
                      {[...sortedHistory].reverse().map((p, i) => (
                          <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                              <td className="p-3 font-bold border-b border-gray-300">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.weight}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.bodyFat}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.muscleMass}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.measurements?.waist}</td>
                              <td className="p-3 text-xs italic text-gray-500 border-b border-gray-300 truncate max-w-[200px]">{p.privateNotes}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};

export default EvolutionTracker;
