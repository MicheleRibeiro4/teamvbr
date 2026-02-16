
import React, { useState, useEffect, useMemo } from 'react';
import { ProtocolData, PhysicalData } from '../types';
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
  Calendar,
  ChevronRight,
  Scale
} from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData: (newData: ProtocolData, createHistory?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onOpenEditor?: () => void;
}

const EvolutionTracker: React.FC<Props> = ({ 
  currentProtocol, 
  history, 
  onNotesChange, 
  onUpdateData, 
  onSelectHistory, 
  onOpenEditor 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado local para edição dos dados físicos
  const [localPhysical, setLocalPhysical] = useState<PhysicalData>(currentProtocol.physicalData);
  
  // Estado para controlar qual gráfico está visível
  const [activeChart, setActiveChart] = useState<'weight' | 'bodyFat' | 'muscleMass'>('weight');

  // Sincroniza o estado local quando o protocolo selecionado muda (ex: clicou no histórico)
  useEffect(() => {
    setLocalPhysical(currentProtocol.physicalData);
  }, [currentProtocol.id, currentProtocol.updatedAt]);

  // --- PREPARAÇÃO DE DADOS ---

  // Ordena o histórico do mais novo para o mais antigo para a lista lateral
  const sortedHistoryList = useMemo(() => {
    const list = [...history];
    // Garante que o atual esteja na lista se não estiver salvo ainda no banco como histórico
    if (!list.find(p => p.id === currentProtocol.id)) {
      list.unshift(currentProtocol);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Encontra o item anterior para comparação (o próximo na lista ordenada por data desc)
  const previousProtocol = useMemo(() => {
    const currentIndex = sortedHistoryList.findIndex(p => p.id === currentProtocol.id);
    if (currentIndex >= 0 && currentIndex < sortedHistoryList.length - 1) {
      return sortedHistoryList[currentIndex + 1];
    }
    return null;
  }, [sortedHistoryList, currentProtocol]);

  // Dados para o gráfico (Ordenados Cronologicamente: Antigo -> Novo)
  const chartData = useMemo(() => {
    const data = sortedHistoryList
      .map(p => ({
        date: new Date(p.updatedAt).toLocaleDateString('pt-BR').slice(0, 5), // DD/MM
        weight: parseFloat(p.physicalData.weight?.replace(',', '.') || '0'),
        bodyFat: parseFloat(p.physicalData.bodyFat?.replace(',', '.') || '0'),
        muscleMass: parseFloat(p.physicalData.muscleMass?.replace(',', '.') || '0'),
      }))
      .filter(d => !isNaN(d.weight) && d.weight > 0)
      .reverse(); // Inverte para ficar cronológico no gráfico
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
        ...prev.measurements,
        [key]: value
      }
    }));
  };

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    try {
      // Reconstrói o objeto completo garantindo que physicalData seja o local editado
      const updatedProtocol = {
        ...currentProtocol,
        physicalData: localPhysical
      };
      
      await onUpdateData(updatedProtocol, false);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleCloseCycle = async () => {
    if (confirm("Deseja fechar este ciclo de avaliação?\n\nIsso salvará os dados atuais no histórico e criará uma nova ficha com a data de hoje para novos registros.")) {
      setIsSaving(true);
      try {
        const updatedProtocol = {
          ...currentProtocol,
          physicalData: {
             ...localPhysical,
             date: new Date().toLocaleDateString('pt-BR') // Atualiza data para hoje
          },
          updatedAt: new Date().toISOString()
        };
        await onUpdateData(updatedProtocol, true); // true = createHistory
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }
  };

  // --- COMPONENTES AUXILIARES ---

  const DiffBadge = ({ current, prev, inverse = false }: { current: string, prev?: string, inverse?: boolean }) => {
    if (!current || !prev) return null;
    
    const c = parseFloat(current.replace(',', '.'));
    const p = parseFloat(prev.replace(',', '.'));
    
    if (isNaN(c) || isNaN(p)) return null;
    
    const diff = c - p;
    if (Math.abs(diff) < 0.1) return <div className="text-[9px] text-white/30 font-bold bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1"><Minus size={10}/> Estável</div>;

    const isPositive = diff > 0;
    // Se inverse for true (ex: gordura), aumentar é RUIM (vermelho). Se false (ex: musculo), aumentar é BOM (verde).
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

  // Input Estilizado
  const InputField = ({ 
    label, 
    value, 
    onChange, 
    prevValue, 
    inverse = false 
  }: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    prevValue?: string, 
    inverse?: boolean 
  }) => (
    <div className="bg-[#151515] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</label>
        <DiffBadge current={value} prev={prevValue} inverse={inverse} />
      </div>
      <input 
        className="w-full bg-transparent text-white font-bold text-lg outline-none placeholder:text-white/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="-"
      />
      {prevValue && (
        <div className="text-[9px] text-white/20 mt-1 font-mono">
          Ant: {prevValue}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: LISTA DE HISTÓRICO */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 h-fit sticky top-24">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-[#d4af37]" /> Histórico
              </h3>
              
              <div className="space-y-2">
                {sortedHistoryList.map((p) => {
                  const isActive = p.id === currentProtocol.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectHistory && onSelectHistory(p)}
                      className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                        isActive 
                        ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black/60' : 'text-[#d4af37]'}`}>
                           {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                        {isActive && <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>}
                      </div>
                      <div className={`text-sm font-bold leading-tight ${isActive ? 'text-black' : 'text-white'}`}>
                        {p.protocolTitle || 'Avaliação'}
                      </div>
                      {/* Mini Resumo */}
                      <div className={`mt-2 flex gap-3 text-[9px] font-mono ${isActive ? 'text-black/70' : 'text-white/30'}`}>
                         <span>{p.physicalData.weight || '-'}kg</span>
                         <span>{p.physicalData.bodyFat || '-'}% BF</span>
                      </div>
                    </button>
                  );
                })}
              </div>
           </div>
        </div>

        {/* COLUNA CENTRAL: EDITOR E DADOS */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* GRÁFICO DE TENDÊNCIA */}
          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp className="text-[#d4af37]" size={18} /> Tendência
               </h3>
               <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                 {[
                   { id: 'weight', label: 'Peso' },
                   { id: 'bodyFat', label: 'Gordura' },
                   { id: 'muscleMass', label: 'Massa' }
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => setActiveChart(opt.id as any)}
                     className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                       activeChart === opt.id 
                       ? 'bg-[#d4af37] text-black shadow-md' 
                       : 'text-white/40 hover:text-white'
                     }`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
             </div>
             
             {/* Componente de Gráfico Customizado */}
             <div className="h-48 w-full flex items-end justify-between gap-2 px-4 relative z-10">
                {chartData.length < 2 ? (
                   <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase border-2 border-dashed border-white/5 rounded-xl">
                     Dados insuficientes para gráfico
                   </div>
                ) : (
                  chartData.map((d, i) => {
                    // Normalização simples para altura das barras
                    const values = chartData.map(x => x[activeChart] as number);
                    const min = Math.min(...values) * 0.9;
                    const max = Math.max(...values) * 1.1;
                    const heightPercent = (( (d[activeChart] as number) - min) / (max - min)) * 100;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group h-full">
                         <div 
                           className="w-full bg-[#d4af37]/20 border-t border-x border-[#d4af37]/40 rounded-t-sm transition-all group-hover:bg-[#d4af37] relative min-h-[10%]"
                           style={{ height: `${heightPercent}%` }}
                         >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 rounded border border-white/10">
                              {d[activeChart]}
                            </div>
                         </div>
                         <div className="mt-2 text-[8px] text-white/20 font-mono rotate-0 truncate w-full text-center">
                           {d.date}
                         </div>
                      </div>
                    )
                  })
                )}
             </div>
             {/* Background Decoration */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/5 to-transparent pointer-events-none"></div>
          </div>

          {/* EDITOR PRINCIPAL */}
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
             
             {/* Cabeçalho do Editor */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/5 gap-4">
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <Scale size={24} className="text-[#d4af37]" /> 
                      {currentProtocol.clientName}
                   </h2>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                      Editando Avaliação de: <span className="text-white">{new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}</span>
                   </p>
                </div>
                
                {/* Botão para ir ao Editor Completo */}
                {onOpenEditor && (
                  <button 
                    onClick={onOpenEditor}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
                  >
                    Editar Ficha Completa <ChevronRight size={12} />
                  </button>
                )}
             </div>

             {/* Grid de Inputs Principais */}
             <div className="mb-8">
               <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Activity size={12} /> Composição Corporal
               </h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <InputField 
                    label="Peso (kg)" 
                    value={localPhysical.weight} 
                    onChange={v => handleInputChange('weight', v)}
                    prevValue={previousProtocol?.physicalData.weight}
                    inverse={true} // Perder peso nem sempre é bom, mas vamos assumir que sim para geral, ou false se for hipertrofia.
                                   // Para simplificar, deixei true (reduzir = verde) para peso/gordura por padrão estético de "cutting".
                                   // Num app real, dependeria do objetivo.
                 />
                 <InputField 
                    label="Gordura (%)" 
                    value={localPhysical.bodyFat} 
                    onChange={v => handleInputChange('bodyFat', v)}
                    prevValue={previousProtocol?.physicalData.bodyFat}
                    inverse={true}
                 />
                 <InputField 
                    label="Massa Musc. (kg)" 
                    value={localPhysical.muscleMass} 
                    onChange={v => handleInputChange('muscleMass', v)}
                    prevValue={previousProtocol?.physicalData.muscleMass}
                    inverse={false}
                 />
                 <InputField 
                    label="Visceral" 
                    value={localPhysical.visceralFat} 
                    onChange={v => handleInputChange('visceralFat', v)}
                    prevValue={previousProtocol?.physicalData.visceralFat}
                    inverse={true}
                 />
               </div>
             </div>

             {/* Medidas */}
             <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Ruler size={12} /> Perimetria (cm)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { k: 'thorax', l: 'Tórax' }, { k: 'waist', l: 'Cintura' }, { k: 'abdomen', l: 'Abdômen' }, 
                    { k: 'glutes', l: 'Glúteo' }, { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }, { k: 'rightCalf', l: 'Pantur. Dir' }, { k: 'leftCalf', l: 'Pantur. Esq' }
                  ].map((m) => (
                    <div key={m.k}>
                       <label className="text-[8px] font-bold text-white/30 uppercase block mb-1">{m.l}</label>
                       <input 
                         className="w-full bg-[#151515] border border-white/5 rounded-lg p-2 text-xs font-bold text-white text-center focus:border-[#d4af37] outline-none transition-colors"
                         value={(localPhysical.measurements as any)?.[m.k] || ''}
                         onChange={(e) => handleMeasurementChange(m.k, e.target.value)}
                         placeholder="0"
                       />
                       <div className="flex justify-center mt-1">
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

             {/* Notas do Coach */}
             <div className="mb-8">
                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2">
                   Notas Privadas
                </h4>
                <textarea
                  className="w-full bg-[#151515] border border-white/5 rounded-xl p-4 text-xs font-medium text-white/80 focus:border-[#d4af37] outline-none min-h-[80px] resize-y"
                  placeholder="Registre aqui observações sobre o progresso, adesão ou feedback do aluno..."
                  value={currentProtocol.privateNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                />
             </div>

             {/* Botões de Ação */}
             <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
                <button 
                  onClick={handleSaveCurrent}
                  disabled={isSaving}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Salvar Alterações
                </button>
                
                <button 
                  onClick={handleCloseCycle}
                  disabled={isSaving}
                  className="flex-1 bg-[#d4af37] hover:bg-[#b5952f] text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-50"
                >
                  <PlusCircle size={16} />
                  Fechar Ciclo & Nova Avaliação
                </button>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default EvolutionTracker;
