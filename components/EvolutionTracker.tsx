
import React, { useState, useEffect, useMemo } from 'react';
import { ProtocolData, PhysicalData, BodyMeasurements } from '../types';
import { 
  TrendingUp, 
  Save, 
  Loader2, 
  PlusCircle, 
  History, 
  Ruler, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Scale,
  CalendarCheck,
  FilePlus,
  Flag,
  Trash2,
  Eye,
  ChevronRight
} from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData: (newData: ProtocolData, createHistory?: boolean, forceNewId?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onDeleteHistory?: (id: string) => void; 
  onOpenEditor?: () => void;
}

// Componente de Campo de Comparação Renovado
const ComparisonField = ({ label, value, onChange, prevValue, inverse = false }: any) => {
    
    // Cálculo da diferença
    let diff = 0;
    let hasPrev = false;
    let diffLabel = "";
    
    if (value && prevValue) {
        const c = parseFloat(value.replace(',', '.'));
        const p = parseFloat(prevValue.replace(',', '.'));
        if (!isNaN(c) && !isNaN(p)) {
            diff = c - p;
            hasPrev = true;
            diffLabel = Math.abs(diff).toFixed(1).replace('.', ',');
        }
    }

    const isPositive = diff > 0;
    const isStable = Math.abs(diff) < 0.1;
    
    // Define cor baseado se "aumentar" é bom (ex: massa) ou ruim (ex: gordura)
    // inverse = true -> aumentar é ruim (vermelho)
    // inverse = false -> aumentar é bom (verde)
    let colorClass = 'text-gray-400';
    if (!isStable && hasPrev) {
        if (inverse) {
            colorClass = isPositive ? 'text-red-400' : 'text-green-400';
        } else {
            colorClass = isPositive ? 'text-green-400' : 'text-red-400';
        }
    }

    return (
        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-all group">
            <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</label>
                {hasPrev && (
                    <div className={`flex items-center gap-1 text-[9px] font-bold ${colorClass} bg-white/5 px-1.5 py-0.5 rounded`}>
                        {!isStable && (isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />)}
                        {isStable ? <Minus size={10} /> : diffLabel}
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {/* Valor Anterior (se existir) */}
                {prevValue && (
                    <div className="flex flex-col items-end border-r border-white/10 pr-3">
                        <span className="text-[8px] font-bold text-white/20 uppercase">Anterior</span>
                        <span className="text-sm font-bold text-white/40">{prevValue}</span>
                    </div>
                )}

                {/* Input Atual */}
                <div className="flex-1">
                    <span className="text-[8px] font-bold text-[#d4af37] uppercase block mb-0.5">Atual</span>
                    <input 
                        className="w-full bg-transparent text-white font-black text-xl outline-none placeholder:text-white/10 focus:placeholder:text-transparent"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="-"
                    />
                </div>
            </div>
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
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProtocol, setIsCreatingProtocol] = useState(false);
  
  // Garante que measurements sempre existe
  const [localPhysical, setLocalPhysical] = useState<PhysicalData>(() => ({
      ...currentProtocol.physicalData,
      measurements: {
          thorax: "", waist: "", abdomen: "", glutes: "",
          rightArmRelaxed: "", leftArmRelaxed: "", rightArmContracted: "", leftArmContracted: "",
          rightThigh: "", leftThigh: "", rightCalf: "", leftCalf: "",
          ...(currentProtocol.physicalData?.measurements || {})
      }
  }));

  // Sincroniza o estado local
  useEffect(() => {
    setLocalPhysical({
        ...currentProtocol.physicalData,
        measurements: {
            thorax: "", waist: "", abdomen: "", glutes: "",
            rightArmRelaxed: "", leftArmRelaxed: "", rightArmContracted: "", leftArmContracted: "",
            rightThigh: "", leftThigh: "", rightCalf: "", leftCalf: "",
            ...(currentProtocol.physicalData?.measurements || {})
        }
    });
  }, [currentProtocol.id, currentProtocol.updatedAt]);

  // --- PREPARAÇÃO DE DADOS ---

  const sortedHistoryList = useMemo(() => {
    const uniqueMap = new Map();
    [currentProtocol, ...history].forEach(p => {
        uniqueMap.set(p.id, p);
    });
    // Ordena do mais recente para o mais antigo
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Encontra o protocolo imediatamente anterior ao atual na lista temporal
  const previousProtocol = useMemo(() => {
    // Como a lista já está ordenada (Recent -> Old), o "próximo" item no array é o anterior no tempo
    const currentIndex = sortedHistoryList.findIndex(p => p.id === currentProtocol.id);
    if (currentIndex !== -1 && currentIndex < sortedHistoryList.length - 1) {
        return sortedHistoryList[currentIndex + 1];
    }
    return null;
  }, [sortedHistoryList, currentProtocol.id]);

  const chartData = useMemo(() => {
    const data = sortedHistoryList
      .map(p => ({
        date: new Date(p.updatedAt).toLocaleDateString('pt-BR').slice(0, 5), // DD/MM
        weight: parseFloat(p.physicalData.weight?.replace(',', '.') || '0'),
        bodyFat: parseFloat(p.physicalData.bodyFat?.replace(',', '.') || '0'),
        muscleMass: parseFloat(p.physicalData.muscleMass?.replace(',', '.') || '0'),
      }))
      .filter(d => !isNaN(d.weight) && d.weight > 0)
      .reverse();
    return data;
  }, [sortedHistoryList]);

  // --- HANDLERS ---

  const handleInputChange = (field: keyof PhysicalData, value: string) => {
    setLocalPhysical(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setLocalPhysical(prev => ({
      ...prev,
      measurements: {
        ...(prev.measurements || {
            thorax: "", waist: "", abdomen: "", glutes: "",
            rightArmRelaxed: "", leftArmRelaxed: "", rightArmContracted: "", leftArmContracted: "",
            rightThigh: "", leftThigh: "", rightCalf: "", leftCalf: ""
        }),
        [key]: value
      } as BodyMeasurements
    }));
  };

  const handleNewCheckin = async () => {
    if (confirm("Deseja criar uma nova atualização na linha do tempo com os dados inseridos?")) {
      setIsSaving(true);
      try {
        const newProtocolState = {
          ...currentProtocol,
          physicalData: {
             ...localPhysical,
             date: new Date().toLocaleDateString('pt-BR'),
          },
          updatedAt: new Date().toISOString(),
          privateNotes: ""
        };
        await onUpdateData(newProtocolState, true, false); 
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }
  };

  const handleCreateNextProtocol = async () => {
    if (confirm("Isso criará um NOVO PROTOCOLO (novo ciclo) usando a evolução atual como base.\nDeseja continuar?")) {
        setIsCreatingProtocol(true);
        try {
            const today = new Date().toLocaleDateString('pt-BR');
            const newProtocolState = {
                ...currentProtocol,
                createdAt: currentProtocol.createdAt,
                updatedAt: new Date().toISOString(),
                contract: {
                    ...currentProtocol.contract,
                    startDate: today,
                    endDate: "",
                    status: 'Ativo' as const
                },
                physicalData: {
                    ...localPhysical,
                    date: today
                },
                privateNotes: "" 
            };
            await onUpdateData(newProtocolState, false, true);
        } finally {
            setIsCreatingProtocol(false);
        }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* HEADER DO ALUNO */}
      <div className="bg-[#111] p-6 rounded-[2.5rem] border border-white/10 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-[#d4af37]">
               <Activity size={28} />
            </div>
            <div>
               <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-1">
                 Evolução: {currentProtocol.clientName}
               </h1>
               <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span className="bg-white/5 px-2 py-1 rounded-md text-white/60">
                    {sortedHistoryList.length} Registros
                  </span>
                  <span>•</span>
                  <span>Último: {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: LINHA DO TEMPO */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-[#d4af37]" /> Histórico
              </h3>
              
              <div className="space-y-3">
                {sortedHistoryList.map((p, idx) => {
                  const isActive = p.id === currentProtocol.id;
                  const isStart = idx === sortedHistoryList.length - 1;

                  return (
                    <div key={p.id} className="relative group">
                        <div 
                            className={`w-full rounded-2xl border transition-all relative z-10 overflow-hidden ${
                                isActive 
                                ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg scale-105' 
                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            <button
                                onClick={() => onSelectHistory && onSelectHistory(p)}
                                className="w-full text-left p-4 pb-2"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        {isStart ? <Flag size={12} className={isActive ? 'text-black' : 'text-blue-400'} /> : <CalendarCheck size={12} className={isActive ? 'text-black' : 'text-[#d4af37]'} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                        {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    {isActive && <span className="bg-black text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded">ATUAL</span>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className={`bg-black/10 p-2 rounded-lg text-center ${isActive ? 'text-black' : 'text-white'}`}>
                                        <span className="block text-[8px] font-black uppercase opacity-60">Peso</span>
                                        <span className="text-xs font-bold">{p.physicalData.weight || '-'}</span>
                                    </div>
                                    <div className={`bg-black/10 p-2 rounded-lg text-center ${isActive ? 'text-black' : 'text-white'}`}>
                                        <span className="block text-[8px] font-black uppercase opacity-60">BF%</span>
                                        <span className="text-xs font-bold">{p.physicalData.bodyFat || '-'}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Botão de Visualizar Protocolo (Apenas aparece se ativo ou hover) */}
                            {isActive && onOpenEditor && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenEditor();
                                    }}
                                    className="w-full py-2 bg-black/20 hover:bg-black/40 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-colors border-t border-black/10"
                                >
                                    <Eye size={10} /> Ver Treino/Dieta
                                </button>
                            )}
                        </div>

                        {onDeleteHistory && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteHistory(p.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white/40 hover:text-red-500 hover:bg-black rounded-lg transition-all z-20 opacity-0 group-hover:opacity-100"
                                title="Excluir este registro"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* COLUNA CENTRAL: DADOS & GRÁFICOS */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* GRÁFICOS RÁPIDOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Gráfico Peso */}
             <div className="bg-[#111] p-5 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Scale size={40} /></div>
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Evolução de Peso</h4>
                <div className="h-24 flex items-end gap-1">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 bg-[#d4af37]/20 hover:bg-[#d4af37] transition-colors rounded-t-sm relative group/bar" style={{ height: `${(d.weight / 150) * 100}%` }}>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {d.weight}kg
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Gráfico BF */}
             <div className="bg-[#111] p-5 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={40} /></div>
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Evolução de Gordura</h4>
                <div className="h-24 flex items-end gap-1">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 bg-red-500/20 hover:bg-red-500 transition-colors rounded-t-sm relative group/bar" style={{ height: `${(d.bodyFat / 50) * 100}%` }}>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {d.bodyFat}%
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Gráfico Massa */}
             <div className="bg-[#111] p-5 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={40} /></div>
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Evolução Muscular</h4>
                <div className="h-24 flex items-end gap-1">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500 transition-colors rounded-t-sm relative group/bar" style={{ height: `${(d.muscleMass / 100) * 100}%` }}>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {d.muscleMass}kg
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* INPUTS DE CHECK-IN */}
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                   <Activity size={20} className="text-[#d4af37]" /> Bioimpedância & Composição
                </h2>
                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded text-white/40">
                   {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}
                </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <ComparisonField 
                    label="Peso (kg)" 
                    value={localPhysical.weight} 
                    onChange={(v: string) => handleInputChange('weight', v)}
                    prevValue={previousProtocol?.physicalData.weight}
                    inverse={true}
                 />
                 <ComparisonField 
                    label="Gordura (%)" 
                    value={localPhysical.bodyFat} 
                    onChange={(v: string) => handleInputChange('bodyFat', v)}
                    prevValue={previousProtocol?.physicalData.bodyFat}
                    inverse={true}
                 />
                 <ComparisonField 
                    label="Massa Musc. (kg)" 
                    value={localPhysical.muscleMass} 
                    onChange={(v: string) => handleInputChange('muscleMass', v)}
                    prevValue={previousProtocol?.physicalData.muscleMass}
                    inverse={false}
                 />
                 <ComparisonField 
                    label="Visceral" 
                    value={localPhysical.visceralFat} 
                    onChange={(v: string) => handleInputChange('visceralFat', v)}
                    prevValue={previousProtocol?.physicalData.visceralFat}
                    inverse={true}
                 />
             </div>

             {/* MEDIDAS */}
             <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Ruler size={14} /> Medidas Corporais (cm)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    { k: 'thorax', l: 'Tórax' }, { k: 'waist', l: 'Cintura' }, { k: 'abdomen', l: 'Abdômen' }, 
                    { k: 'glutes', l: 'Glúteo' }, { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }, { k: 'rightCalf', l: 'Pantur. Dir' }, { k: 'leftCalf', l: 'Pantur. Esq' }
                  ].map((m) => (
                    <ComparisonField 
                        key={m.k}
                        label={m.l}
                        value={(localPhysical.measurements as any)?.[m.k] || ''}
                        onChange={(val: string) => handleMeasurementChange(m.k, val)}
                        prevValue={(previousProtocol?.physicalData.measurements as any)?.[m.k]}
                        inverse={false}
                    />
                  ))}
                </div>
             </div>

             {/* OBSERVAÇÕES (Sem fotos) */}
             <div className="w-full">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4">
                   Observações
                </h4>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/80 focus:border-[#d4af37] outline-none min-h-[100px] resize-y"
                  placeholder="Feedback sobre a adesão, pontos de melhoria, queixas..."
                  value={currentProtocol.privateNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                />
             </div>

             {/* AÇÕES: Botão atualizado para "Nova Atualização" e "Novo Protocolo" */}
             <div className="flex flex-col md:flex-row justify-end gap-4 mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={handleCreateNextProtocol}
                  disabled={isCreatingProtocol}
                  className="bg-white/5 text-white/60 hover:text-white border border-white/10 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                >
                  {isCreatingProtocol ? <Loader2 className="animate-spin" size={16} /> : <FilePlus size={16} />}
                  Gerar Novo Protocolo Base
                </button>

                <button 
                  onClick={handleNewCheckin}
                  disabled={isSaving}
                  className="bg-[#d4af37] text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                  Nova Atualização
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTracker;
