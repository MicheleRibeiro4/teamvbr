
import React, { useState, useEffect, useMemo } from 'react';
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
  Lock
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

// Componente de Campo de Comparação (Visual)
const MetricCard = ({ label, value, prevValue, inverse = false, isEditable, onChange }: any) => {
    
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
    
    // Cores indicativas (Inverse: Aumentar é "ruim", ex: gordura)
    let badgeColor = 'bg-gray-500/10 text-gray-400';
    if (!isStable && hasPrev) {
        if (inverse) {
            badgeColor = isPositive ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500';
        } else {
            badgeColor = isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500';
        }
    }

    return (
        <div className={`p-4 rounded-2xl border transition-all relative group ${isEditable ? 'bg-[#1a1a1a] border-white/10 hover:border-[#d4af37]/50' : 'bg-black/40 border-white/5 opacity-90'}`}>
            <div className="flex justify-between items-start mb-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</label>
                {hasPrev && (
                    <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md ${badgeColor}`}>
                        {!isStable && (isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
                        {isStable ? <Minus size={12} /> : diffLabel}
                    </div>
                )}
            </div>
            
            <div className="flex items-end gap-2">
                {isEditable ? (
                    <input 
                        className="w-full bg-transparent text-white font-black text-2xl outline-none placeholder:text-white/10 focus:placeholder:text-transparent"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="-"
                    />
                ) : (
                    <span className="text-2xl font-black text-white">{value || '-'}</span>
                )}
                
                {prevValue && (
                    <div className="text-[10px] font-bold text-white/20 mb-1.5 whitespace-nowrap">
                        Ant: {prevValue}
                    </div>
                )}
            </div>
            {!isEditable && <Lock size={12} className="absolute bottom-4 right-4 text-white/10" />}
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
  const [localPhysical, setLocalPhysical] = useState<PhysicalData>(currentProtocol.physicalData);

  // Sincroniza estado local quando o protocolo selecionado muda
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

  // --- ORDENAÇÃO E HISTÓRICO ---
  const sortedHistoryList = useMemo(() => {
    const uniqueMap = new Map();
    [currentProtocol, ...history].forEach(p => uniqueMap.set(p.id, p));
    // Do mais recente para o mais antigo
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Identifica se estamos visualizando o registro mais recente (ativo) ou um histórico (apenas leitura)
  // O registro "Ativo" é sempre o primeiro da lista ordenada por data.
  const isLatest = sortedHistoryList.length > 0 && currentProtocol.id === sortedHistoryList[0].id;

  // Encontra o registro anterior na linha do tempo para comparação
  const previousProtocol = useMemo(() => {
    const currentIndex = sortedHistoryList.findIndex(p => p.id === currentProtocol.id);
    if (currentIndex !== -1 && currentIndex < sortedHistoryList.length - 1) {
        return sortedHistoryList[currentIndex + 1];
    }
    return null;
  }, [sortedHistoryList, currentProtocol.id]);

  // --- HANDLERS ---
  const handleInputChange = (field: keyof PhysicalData, value: string) => {
    if (!isLatest) return; // Bloqueia edição em histórico antigo
    setLocalPhysical(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (key: string, value: string) => {
    if (!isLatest) return; // Bloqueia edição em histórico antigo
    setLocalPhysical(prev => ({
      ...prev,
      measurements: {
        ...(prev.measurements || {}),
        [key]: value
      } as BodyMeasurements
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updatedProtocol = {
            ...currentProtocol,
            physicalData: localPhysical,
            updatedAt: new Date().toISOString()
        };
        // Salva as alterações no registro ATUAL (sem criar novo ID, apenas update)
        await onUpdateData(updatedProtocol, false, false); 
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleNewCheckin = async () => {
    if (confirm("Iniciar novo Check-in? Isso copiará os dados atuais para um novo registro na data de hoje.")) {
      setIsSaving(true);
      try {
        const newProtocolState = {
          ...currentProtocol,
          physicalData: {
             ...localPhysical, // Copia dados atuais como base
             date: new Date().toLocaleDateString('pt-BR'), // Data de hoje
          },
          updatedAt: new Date().toISOString(),
          privateNotes: ""
        };
        // createHistory=true cria um novo registro no banco mantendo o histórico anterior intacto
        await onUpdateData(newProtocolState, true, false); 
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }
  };

  const handleNewCycle = async () => {
    if (confirm("Iniciar um NOVO PROTOCOLO/CICLO?\n\nUse isso quando mudar radicalmente a estratégia (ex: Bulking -> Cutting). Isso manterá o histórico mas indicará uma nova fase.")) {
        setIsSaving(true);
        try {
            const today = new Date().toLocaleDateString('pt-BR');
            const newProtocolState = {
                ...currentProtocol,
                createdAt: new Date().toISOString(), // Nova data de criação base
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
            // forceNewId=true gera um ID totalmente novo, desvinculando do "histórico linear" visual se desejado, 
            // mas mantendo o nome do cliente para agrupamento no dashboard.
            await onUpdateData(newProtocolState, false, true);
        } finally {
            setIsSaving(false);
        }
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER SUPERIOR: AÇÕES PRINCIPAIS --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-[#111] p-6 rounded-[2rem] border border-white/10 shadow-lg">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-[#d4af37] text-black rounded-xl flex items-center justify-center font-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Activity size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Evolução</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                    Visualizando: <span className="text-[#d4af37]">{new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}</span> {isLatest ? '(Atual)' : '(Histórico)'}
                </p>
            </div>
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Se for o registro mais recente, mostra opção de Novo Checkin */}
            {isLatest ? (
                <>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 md:flex-none py-3 px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-white/60 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Salvar
                    </button>
                    <button 
                        onClick={handleNewCheckin}
                        className="flex-1 md:flex-none py-3 px-6 bg-[#d4af37] text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Novo Check-in
                    </button>
                </>
            ) : (
                /* Se for histórico, mostra opção de ver o treino daquela época */
                <button 
                    onClick={onOpenEditor}
                    className="w-full md:w-auto py-3 px-8 bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                >
                    <Dumbbell size={16} /> Ver Treino Desta Data
                </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLUNA ESQUERDA: LINHA DO TEMPO (HISTÓRICO) --- */}
        <div className="lg:col-span-3">
           <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-[#d4af37]" /> Histórico
                  </h3>
                  <button onClick={handleNewCycle} className="text-[9px] font-bold text-white/20 hover:text-[#d4af37] uppercase tracking-widest transition-colors">
                      + Novo Ciclo
                  </button>
              </div>
              
              <div className="space-y-0 relative">
                {/* Linha vertical conectora */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/5 z-0"></div>

                {sortedHistoryList.map((p, idx) => {
                  const isActive = p.id === currentProtocol.id;
                  
                  return (
                    <div key={p.id} className="relative z-10 group pl-2 py-2">
                        <button
                            onClick={() => onSelectHistory && onSelectHistory(p)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left group-hover:translate-x-1 ${
                                isActive 
                                ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg' 
                                : 'bg-[#1a1a1a] border-white/5 text-white/60 hover:bg-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border ${isActive ? 'bg-black text-[#d4af37] border-black' : 'bg-black/30 border-white/10'}`}>
                                {sortedHistoryList.length - idx}
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest block leading-none mb-1">
                                    {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex items-center gap-2 text-[9px] font-bold opacity-70">
                                    <span className="flex items-center gap-1"><Scale size={10}/> {p.physicalData.weight || '-'}kg</span>
                                </div>
                            </div>
                            {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </button>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* --- COLUNA DIREITA: DADOS DO CHECK-IN SELECIONADO --- */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* AVISO DE MODO LEITURA */}
          {!isLatest && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <Lock size={18} className="text-blue-400" />
                  <div>
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-wide">Modo Histórico (Leitura)</p>
                      <p className="text-[10px] text-blue-400/60">Você está visualizando dados passados. Para editar, selecione o registro mais recente ou crie um novo.</p>
                  </div>
              </div>
          )}

          {/* DADOS PRINCIPAIS (Cards Grandes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <MetricCard 
                    label="Peso (kg)" 
                    value={localPhysical.weight} 
                    onChange={(v: string) => handleInputChange('weight', v)}
                    prevValue={previousProtocol?.physicalData.weight}
                    inverse={true}
                    isEditable={isLatest}
                 />
                 <MetricCard 
                    label="Gordura (%)" 
                    value={localPhysical.bodyFat} 
                    onChange={(v: string) => handleInputChange('bodyFat', v)}
                    prevValue={previousProtocol?.physicalData.bodyFat}
                    inverse={true}
                    isEditable={isLatest}
                 />
                 <MetricCard 
                    label="Massa Musc. (kg)" 
                    value={localPhysical.muscleMass} 
                    onChange={(v: string) => handleInputChange('muscleMass', v)}
                    prevValue={previousProtocol?.physicalData.muscleMass}
                    inverse={false}
                    isEditable={isLatest}
                 />
                 <MetricCard 
                    label="Visceral" 
                    value={localPhysical.visceralFat} 
                    onChange={(v: string) => handleInputChange('visceralFat', v)}
                    prevValue={previousProtocol?.physicalData.visceralFat}
                    inverse={true}
                    isEditable={isLatest}
                 />
          </div>

          {/* MEDIDAS CORPORAIS (Grid Compacto) */}
          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                        <Ruler size={14} /> Medidas Corporais (cm)
                    </h4>
                    {isLatest && <span className="text-[9px] text-white/20 font-bold uppercase">Editável</span>}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { k: 'thorax', l: 'Tórax' }, { k: 'waist', l: 'Cintura' }, { k: 'abdomen', l: 'Abdômen' }, 
                    { k: 'glutes', l: 'Glúteo' }, { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }, { k: 'rightCalf', l: 'Pantur. Dir' }, { k: 'leftCalf', l: 'Pantur. Esq' }
                  ].map((m) => (
                    <div key={m.k}>
                        <MetricCard 
                            label={m.l}
                            value={(localPhysical.measurements as any)?.[m.k] || ''}
                            onChange={(val: string) => handleMeasurementChange(m.k, val)}
                            prevValue={(previousProtocol?.physicalData.measurements as any)?.[m.k]}
                            inverse={false}
                            isEditable={isLatest}
                        />
                    </div>
                  ))}
                </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <FileText size={14} /> Observações & Feedback
                </h4>
                {isLatest ? (
                    <textarea
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:border-[#d4af37] outline-none min-h-[120px] resize-y placeholder:text-white/20"
                    placeholder="Feedback sobre a adesão, pontos de melhoria, queixas..."
                    value={currentProtocol.privateNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    />
                ) : (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-white/60 min-h-[80px] italic">
                        {currentProtocol.privateNotes || "Sem observações registradas."}
                    </div>
                )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EvolutionTracker;
