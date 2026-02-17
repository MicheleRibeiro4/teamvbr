
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
  CalendarCheck
} from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData: (newData: ProtocolData, createHistory?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onOpenEditor?: () => void;
}

// Componente isolado para evitar re-render desnecessário e perda de foco
const InputField = ({ label, value, onChange, prevValue, inverse = false }: any) => {
    
    const DiffBadge = ({ current, prev, inverse = false }: { current: string, prev?: string, inverse?: boolean }) => {
        if (!current || !prev) return null;
        const c = parseFloat(current.replace(',', '.'));
        const p = parseFloat(prev.replace(',', '.'));
        if (isNaN(c) || isNaN(p)) return null;
        
        const diff = c - p;
        if (Math.abs(diff) < 0.1) return <div className="text-[9px] text-white/30 font-bold bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1"><Minus size={10}/> Estável</div>;

        const isPositive = diff > 0;
        const isGood = inverse ? !isPositive : isPositive;
        const colorClass = isGood ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20';
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

        return (
        <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md border ${colorClass}`}>
            <Icon size={10} />
            {Math.abs(diff).toFixed(1).replace('.', ',')}
        </div>
        );
    };

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 hover:border-[#d4af37]/50 transition-colors group relative">
        <div className="flex justify-between items-start mb-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</label>
            <DiffBadge current={value} prev={prevValue} inverse={inverse} />
        </div>
        <div className="flex items-end gap-1">
            <input 
            className="w-full bg-transparent text-white font-black text-2xl outline-none placeholder:text-white/5"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0,0"
            />
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
  onOpenEditor 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Garante que measurements sempre existe para evitar erros ao digitar, usando fallback seguro
  const [localPhysical, setLocalPhysical] = useState<PhysicalData>(() => ({
      ...currentProtocol.physicalData,
      measurements: {
          thorax: "", waist: "", abdomen: "", glutes: "",
          rightArmRelaxed: "", leftArmRelaxed: "", rightArmContracted: "", leftArmContracted: "",
          rightThigh: "", leftThigh: "", rightCalf: "", leftCalf: "",
          ...(currentProtocol.physicalData?.measurements || {})
      }
  }));

  // Sincroniza o estado local apenas se o ID ou data de atualização mudar
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
    
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  const previousProtocol = useMemo(() => {
    if (sortedHistoryList.length > 1) {
      return sortedHistoryList[1];
    }
    return null;
  }, [sortedHistoryList]);

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
          updatedAt: new Date().toISOString()
        };
        
        await onUpdateData(newProtocolState, true); 
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }
  };

  // --- COMPONENTES VISUAIS AUXILIARES ---
  
  const DiffBadge = ({ current, prev, inverse = false }: { current: string, prev?: string, inverse?: boolean }) => {
    if (!current || !prev) return null;
    const c = parseFloat(current.replace(',', '.'));
    const p = parseFloat(prev.replace(',', '.'));
    if (isNaN(c) || isNaN(p)) return null;
    
    const diff = c - p;
    if (Math.abs(diff) < 0.1) return <div className="text-[9px] text-white/30 font-bold bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1"><Minus size={10}/> Estável</div>;

    const isPositive = diff > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const colorClass = isGood ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md border ${colorClass}`}>
        <Icon size={10} />
        {Math.abs(diff).toFixed(1).replace('.', ',')}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* HEADER DO ALUNO */}
      <div className="bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-white/10 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-[#d4af37]">
               <Activity size={32} />
            </div>
            <div>
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">
                 Evolução: {currentProtocol.clientName}
               </h1>
               <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span className="bg-white/5 px-2 py-1 rounded-md text-white/60">
                    {sortedHistoryList.length} Avaliações
                  </span>
                  <span>•</span>
                  <span>Último: {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}</span>
               </div>
            </div>
         </div>
         
         {/* BOTÃO REMOVIDO DAQUI CONFORME SOLICITADO */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: LINHA DO TEMPO */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-[#d4af37]" /> Linha do Tempo
              </h3>
              
              <div className="space-y-3">
                {sortedHistoryList.map((p, idx) => {
                  const isActive = p.id === currentProtocol.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectHistory && onSelectHistory(p)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${
                        isActive 
                        ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg scale-105 z-10' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                         <div className="flex items-center gap-2">
                            <CalendarCheck size={12} className={isActive ? 'text-black' : 'text-[#d4af37]'} />
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
                   EDITANDO: {new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}
                </span>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 <InputField 
                    label="Peso (kg)" 
                    value={localPhysical.weight} 
                    onChange={(v: string) => handleInputChange('weight', v)}
                    prevValue={previousProtocol?.physicalData.weight}
                    inverse={true}
                 />
                 <InputField 
                    label="Gordura (%)" 
                    value={localPhysical.bodyFat} 
                    onChange={(v: string) => handleInputChange('bodyFat', v)}
                    prevValue={previousProtocol?.physicalData.bodyFat}
                    inverse={true}
                 />
                 <InputField 
                    label="Massa Musc. (kg)" 
                    value={localPhysical.muscleMass} 
                    onChange={(v: string) => handleInputChange('muscleMass', v)}
                    prevValue={previousProtocol?.physicalData.muscleMass}
                    inverse={false}
                 />
                 <InputField 
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
                  {[
                    { k: 'thorax', l: 'Tórax' }, { k: 'waist', l: 'Cintura' }, { k: 'abdomen', l: 'Abdômen' }, 
                    { k: 'glutes', l: 'Glúteo' }, { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }, { k: 'rightCalf', l: 'Pantur. Dir' }, { k: 'leftCalf', l: 'Pantur. Esq' }
                  ].map((m) => (
                    <div key={m.k} className="relative">
                       <label className="text-[8px] font-bold text-white/30 uppercase block mb-1">{m.l}</label>
                       <input 
                         className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:border-[#d4af37] outline-none transition-colors"
                         value={(localPhysical.measurements as any)?.[m.k] || ''}
                         onChange={(e) => handleMeasurementChange(m.k, e.target.value)}
                         placeholder="-"
                       />
                       <div className="absolute top-0 right-0">
                          <DiffBadge 
                            current={(localPhysical.measurements as any)?.[m.k]} 
                            prev={(previousProtocol?.physicalData.measurements as any)?.[m.k]} 
                            inverse={false}
                          />
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* OBSERVAÇÕES (Sem fotos) */}
             <div className="w-full">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4">
                   Observações
                </h4>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white/80 focus:border-[#d4af37] outline-none min-h-[120px] resize-y"
                  placeholder="Feedback sobre a adesão, pontos de melhoria, queixas..."
                  value={currentProtocol.privateNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                />
             </div>

             {/* AÇÕES: Botão atualizado para "Nova Atualização" */}
             <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={handleNewCheckin}
                  disabled={isSaving}
                  className="bg-[#d4af37] text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
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
