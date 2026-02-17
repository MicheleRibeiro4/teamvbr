
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Minus,
  Scale,
  Calendar,
  FileText,
  Dumbbell,
  ChevronRight,
  Lock,
  Trash2,
  FileDown,
  RefreshCw,
  AlertTriangle
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

// Componente de Card de Métrica com Comparação Completa (Início -> Anterior -> Atual)
const ComparisonCard = ({ label, current, prev, start, inverse = false, isEditable, onChange }: any) => {
    
    // Cálculos
    const valCurrent = parseFloat(current?.replace(',', '.') || '0');
    const valPrev = parseFloat(prev?.replace(',', '.') || '0');
    const valStart = parseFloat(start?.replace(',', '.') || '0');

    const diffPrev = valCurrent - valPrev;
    const diffStart = valCurrent - valStart;

    const isStable = Math.abs(diffPrev) < 0.1;
    const isPositive = diffPrev > 0;
    
    // Cores (Inverse: Aumentar é "ruim", ex: gordura)
    let badgeColor = 'text-gray-400';
    if (!isStable && prev) {
        if (inverse) {
            badgeColor = isPositive ? 'text-red-400' : 'text-green-400';
        } else {
            badgeColor = isPositive ? 'text-green-400' : 'text-red-400';
        }
    }

    const totalChangeColor = (inverse ? diffStart <= 0 : diffStart >= 0) ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`p-4 rounded-2xl border transition-all relative group flex flex-col justify-between h-full ${isEditable ? 'bg-[#1a1a1a] border-white/10 hover:border-[#d4af37]/50' : 'bg-black/40 border-white/5'}`}>
            
            <div className="flex justify-between items-start mb-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</label>
                {start && Math.abs(diffStart) > 0.1 && (
                    <span className={`text-[9px] font-bold ${totalChangeColor} bg-white/5 px-1.5 py-0.5 rounded`}>
                        Total: {diffStart > 0 ? '+' : ''}{diffStart.toFixed(1).replace('.', ',')}
                    </span>
                )}
            </div>
            
            <div className="flex items-end gap-3 mt-1">
                {isEditable ? (
                    <input 
                        className="w-full bg-transparent text-white font-black text-2xl outline-none placeholder:text-white/10 focus:placeholder:text-transparent border-b border-transparent focus:border-[#d4af37]"
                        value={current}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="-"
                    />
                ) : (
                    <span className="text-2xl font-black text-white">{current || '-'}</span>
                )}
                
                <div className="flex flex-col items-end text-[9px] font-bold text-white/30 pb-1">
                    {prev && <span>Ant: {prev}</span>}
                    {start && <span>Início: {start}</span>}
                </div>
            </div>

            {/* Indicador de Mudança Recente */}
            {prev && !isStable && (
                <div className={`absolute top-2 right-2 flex items-center ${badgeColor}`}>
                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                </div>
            )}
        </div>
    );
};

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
    // Junta o protocolo atual (que pode ser editado/não salvo ainda no App) com o histórico salvo
    [currentProtocol, ...history].forEach(p => uniqueMap.set(p.id, p));
    
    // Ordena do mais recente para o mais antigo para a UI
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Protocolo Inicial (O mais antigo) - IMUTÁVEL COMO REFERÊNCIA
  const startProtocol = useMemo(() => {
      if (sortedHistory.length === 0) return currentProtocol;
      return sortedHistory[sortedHistory.length - 1];
  }, [sortedHistory]);

  // Protocolo Anterior ao Selecionado (Para comparação passo-a-passo)
  const previousProtocol = useMemo(() => {
    const currentIndex = sortedHistory.findIndex(p => p.id === currentProtocol.id);
    if (currentIndex !== -1 && currentIndex < sortedHistory.length - 1) {
        return sortedHistory[currentIndex + 1];
    }
    return null;
  }, [sortedHistory, currentProtocol.id]);

  // Identifica se estamos vendo o registro mais recente
  const isLatest = sortedHistory.length > 0 && currentProtocol.id === sortedHistory[0].id;

  // Estado Local para Edição (Só usado quando mode !== 'view')
  const [editData, setEditData] = useState<PhysicalData>(currentProtocol.physicalData);

  // Resetar modo ao trocar de histórico
  useEffect(() => {
    setMode('view');
    setEditData(currentProtocol.physicalData);
  }, [currentProtocol.id]);

  // --- HANDLERS ---

  const handleStartNewCheckin = () => {
      // Clona os dados físicos atuais para começar a edição
      setEditData({
          ...currentProtocol.physicalData,
          date: new Date().toLocaleDateString('pt-BR'),
          weight: "", // Limpa peso para forçar nova pesagem ou manter anterior se preencher
      });
      setMode('new_checkin');
  };

  const handleStartNewProtocol = () => {
      // Similar ao checkin, mas com intenção de mudar o treino/dieta depois
      setEditData({
          ...currentProtocol.physicalData,
          date: new Date().toLocaleDateString('pt-BR'),
      });
      setMode('new_protocol');
  };

  const handleSave = async () => {
    if (!editData.weight) {
        alert("Por favor, informe pelo menos o Peso atual.");
        return;
    }

    setIsSaving(true);
    try {
        const newProtocolState = {
            ...currentProtocol,
            physicalData: editData,
            updatedAt: new Date().toISOString(),
            privateNotes: mode === 'new_protocol' ? "Início de Novo Protocolo" : ""
        };

        if (mode === 'new_checkin') {
            // createHistory=true: Cria novo registro vinculado ao mesmo aluno
            await onUpdateData(newProtocolState, true, false);
        } else if (mode === 'new_protocol') {
            // forceNewId=true: Cria um novo registro e idealmente resetaria o editor para permitir novo treino
            await onUpdateData(newProtocolState, false, true);
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
        filename: `Relatorio_Evolucao_${currentProtocol.clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      try {
        // @ts-ignore
        await html2pdf().set(opt).from(reportRef.current).save();
      } catch (err) {
        console.error(err);
        alert("Erro ao gerar PDF.");
      } finally {
        setIsGeneratingReport(false);
      }
  };

  // Funções de Update do Estado Local
  const updateMeasurement = (key: string, val: string) => {
      setEditData(prev => ({
          ...prev,
          measurements: { ...prev.measurements, [key]: val } as BodyMeasurements
      }));
  };

  // --- RENDER ---

  const isEditing = mode !== 'view';
  const displayData = isEditing ? editData : currentProtocol.physicalData;

  // Cálculo de Progresso Total
  const startWeight = parseFloat(startProtocol.physicalData.weight?.replace(',', '.') || '0');
  const currentWeight = parseFloat(displayData.weight?.replace(',', '.') || '0');
  const totalChange = currentWeight - startWeight;

  return (
    <div className="animate-in fade-in duration-500 pb-20 relative">
      
      {/* HEADER DE RESUMO */}
      <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10 mb-8 shadow-lg flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#d4af37] text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <TrendingUp size={32} />
              </div>
              <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Painel de Evolução</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                      <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <p className="text-[9px] text-white/40 font-bold uppercase">Início</p>
                          <p className="text-xs font-black text-white">{new Date(startProtocol.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <p className="text-[9px] text-white/40 font-bold uppercase">Peso Inicial</p>
                          <p className="text-xs font-black text-white">{startProtocol.physicalData.weight} kg</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border ${totalChange <= 0 ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                          <p className="text-[9px] font-bold uppercase opacity-80">Resultado Total</p>
                          <p className="text-xs font-black flex items-center gap-1">
                              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1).replace('.', ',')} kg
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
              {mode === 'view' ? (
                  <>
                    <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                        {isGeneratingReport ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16}/>} Relatório
                    </button>
                    <button onClick={handleStartNewProtocol} className="bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-500 border border-blue-600/30 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                        <RefreshCw size={16}/> Gerar Novo Protocolo
                    </button>
                    <button onClick={handleStartNewCheckin} className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 shadow-lg flex items-center gap-2 transition-all">
                        <Plus size={16}/> Nova Evolução
                    </button>
                  </>
              ) : (
                  <>
                    <button onClick={handleCancel} className="bg-white/5 text-white/60 hover:text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-500 text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 shadow-lg flex items-center gap-2 transition-all">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} 
                        {mode === 'new_protocol' ? 'Salvar e Criar Protocolo' : 'Salvar Evolução'}
                    </button>
                  </>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BARRA LATERAL: LINHA DO TEMPO */}
          <div className="lg:col-span-3 space-y-4">
              <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 max-h-[80vh] overflow-y-auto custom-scrollbar sticky top-24">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <History size={14} className="text-[#d4af37]" /> Histórico
                  </h3>
                  
                  <div className="space-y-3 relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/5 z-0"></div>
                      
                      {sortedHistory.map((p, idx) => {
                          const isActive = p.id === currentProtocol.id;
                          const isStart = idx === sortedHistory.length - 1;
                          
                          return (
                              <div key={p.id} className="relative z-10 group">
                                  <button
                                      onClick={() => mode === 'view' && onSelectHistory && onSelectHistory(p)}
                                      disabled={mode !== 'view'}
                                      className={`w-full text-left p-3 pl-12 rounded-xl border transition-all relative ${isActive ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg' : 'bg-[#1a1a1a] border-white/5 text-white/60 hover:bg-white/5'}`}
                                  >
                                      {/* Dot Indicador */}
                                      <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-black border-black text-[#d4af37]' : isStart ? 'bg-blue-500 border-blue-500 text-white' : 'bg-[#111] border-white/20 text-white/40'}`}>
                                          {isStart ? <Calendar size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                      </div>

                                      <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                                          {isActive && <ChevronRight size={14} />}
                                      </div>
                                      <div className="text-[10px] font-bold opacity-70 flex items-center gap-2 mt-1">
                                          <Scale size={10} /> {p.physicalData.weight || '-'} kg
                                      </div>
                                  </button>

                                  {/* Botão de Exclusão (Só aparece se não for o inicial e estiver no modo view) */}
                                  {onDeleteHistory && !isStart && mode === 'view' && (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); onDeleteHistory(p.id); }}
                                          className="absolute top-1/2 -translate-y-1/2 -right-8 p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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

          {/* CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-9 space-y-6">
              
              {/* STATUS BAR */}
              {isEditing ? (
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${mode === 'new_protocol' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]'}`}>
                      {mode === 'new_protocol' ? <RefreshCw size={20}/> : <Plus size={20}/>}
                      <div>
                          <h4 className="font-black uppercase text-sm tracking-widest">{mode === 'new_protocol' ? 'Gerando Novo Protocolo' : 'Registrando Nova Evolução'}</h4>
                          <p className="text-[10px] opacity-70">Preencha os dados atuais abaixo. O histórico anterior será preservado.</p>
                      </div>
                  </div>
              ) : (
                  <div className="bg-[#111] p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isLatest ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/40'}`}>
                              {isLatest ? <Activity size={16} /> : <Lock size={16} />}
                          </div>
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Status do Registro</p>
                              <p className="text-xs font-bold text-white">{isLatest ? 'Registro Mais Recente (Ativo)' : 'Registro Histórico (Leitura)'}</p>
                          </div>
                      </div>
                      
                      {/* Botão Ver Protocolo só aparece se não estivermos editando */}
                      {!isEditing && onOpenEditor && (
                          <button 
                              onClick={onOpenEditor}
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 border border-white/10 transition-all"
                          >
                              <FileText size={14} /> Visualizar Dieta/Treino deste dia
                          </button>
                      )}
                  </div>
              )}

              {/* GRID DE DADOS (3 COLUNAS PARA COMPARAR) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ComparisonCard 
                      label="Peso (kg)" 
                      current={displayData.weight} 
                      prev={previousProtocol?.physicalData.weight}
                      start={startProtocol.physicalData.weight}
                      isEditable={isEditing}
                      onChange={(v: string) => setEditData({...editData, weight: v})}
                      inverse={true}
                  />
                  <ComparisonCard 
                      label="Gordura (%)" 
                      current={displayData.bodyFat} 
                      prev={previousProtocol?.physicalData.bodyFat}
                      start={startProtocol.physicalData.bodyFat}
                      isEditable={isEditing}
                      onChange={(v: string) => setEditData({...editData, bodyFat: v})}
                      inverse={true}
                  />
                  <ComparisonCard 
                      label="Massa Musc. (kg)" 
                      current={displayData.muscleMass} 
                      prev={previousProtocol?.physicalData.muscleMass}
                      start={startProtocol.physicalData.muscleMass}
                      isEditable={isEditing}
                      onChange={(v: string) => setEditData({...editData, muscleMass: v})}
                      inverse={false}
                  />
                  <ComparisonCard 
                      label="Cintura (cm)" 
                      current={(displayData.measurements as any)?.waist} 
                      prev={(previousProtocol?.physicalData.measurements as any)?.waist}
                      start={(startProtocol.physicalData.measurements as any)?.waist}
                      isEditable={isEditing}
                      onChange={(v: string) => updateMeasurement('waist', v)}
                      inverse={true}
                  />
              </div>

              {/* MEDIDAS DETALHADAS */}
              <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10">
                  <div className="flex items-center gap-2 mb-6">
                      <Ruler className="text-[#d4af37]" size={16} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Medidas Corporais (cm)</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { k: 'thorax', l: 'Tórax' }, { k: 'abdomen', l: 'Abdômen' }, 
                        { k: 'glutes', l: 'Glúteo' }, { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                        { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }, { k: 'rightCalf', l: 'Pantur. Dir' }, { k: 'leftCalf', l: 'Pantur. Esq' }
                      ].map((m) => (
                          <ComparisonCard 
                              key={m.k}
                              label={m.l}
                              current={(displayData.measurements as any)?.[m.k]}
                              prev={(previousProtocol?.physicalData.measurements as any)?.[m.k]}
                              start={(startProtocol.physicalData.measurements as any)?.[m.k]}
                              isEditable={isEditing}
                              onChange={(v: string) => updateMeasurement(m.k, v)}
                              inverse={false}
                          />
                      ))}
                  </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                      <Activity className="text-[#d4af37]" size={16} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Observações do Check-in</h3>
                  </div>
                  {isEditing ? (
                      <textarea 
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#d4af37] outline-none min-h-[100px]"
                          placeholder="Como foi a adesão? Alguma queixa ou dificuldade?"
                          value={currentProtocol.privateNotes}
                          onChange={(e) => onNotesChange(e.target.value)}
                      />
                  ) : (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/60 italic min-h-[60px]">
                          {currentProtocol.privateNotes || "Sem observações para esta data."}
                      </div>
                  )}
              </div>

          </div>
      </div>

      {/* --- HIDDEN REPORT GENERATOR --- */}
      <div className="fixed left-[-9999px] top-0">
          <div ref={reportRef} className="bg-white text-black p-10 w-[297mm] min-h-[210mm]">
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
                  <img src={LOGO_VBR_BLACK} className="h-16" />
                  <div className="text-right">
                      <h1 className="text-3xl font-black uppercase">Relatório de Evolução</h1>
                      <p className="text-lg">{currentProtocol.clientName}</p>
                  </div>
              </div>

              <table className="w-full text-sm border-collapse">
                  <thead>
                      <tr className="bg-black text-white">
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3">Peso (kg)</th>
                          <th className="p-3">Gordura (%)</th>
                          <th className="p-3">Massa (kg)</th>
                          <th className="p-3">Cintura (cm)</th>
                          <th className="p-3">Abdômen (cm)</th>
                          <th className="p-3">Braço (cm)</th>
                          <th className="p-3">Coxa (cm)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {/* Mostra do mais antigo para o mais novo no relatório */}
                      {[...sortedHistory].reverse().map((p, i) => (
                          <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                              <td className="p-3 font-bold border-b border-gray-300">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.weight}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.bodyFat}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.muscleMass}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.measurements?.waist}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.measurements?.abdomen}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.measurements?.rightArmContracted}</td>
                              <td className="p-3 text-center border-b border-gray-300">{p.physicalData.measurements?.rightThigh}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="bg-gray-100 p-4 rounded text-center">
                      <p className="text-xs uppercase font-bold text-gray-500">Peso Inicial</p>
                      <p className="text-2xl font-black">{startProtocol.physicalData.weight} kg</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded text-center">
                      <p className="text-xs uppercase font-bold text-gray-500">Peso Atual</p>
                      <p className="text-2xl font-black">{currentProtocol.physicalData.weight} kg</p>
                  </div>
                  <div className="bg-black text-white p-4 rounded text-center">
                      <p className="text-xs uppercase font-bold text-[#d4af37]">Resultado</p>
                      <p className="text-2xl font-black">{totalChange > 0 ? '+' : ''}{totalChange.toFixed(1).replace('.', ',')} kg</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default EvolutionTracker;
