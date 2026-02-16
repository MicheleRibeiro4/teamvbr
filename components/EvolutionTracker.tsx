
import React, { useState, useEffect, useMemo } from 'react';
import { ProtocolData } from '../types';
import { TrendingUp, ClipboardList, ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock, Activity, Edit3, Save, Loader2, Eye, PlusCircle, FileText, ArrowRight, Ruler, BarChart3, History } from 'lucide-react';

interface Props {
  currentProtocol: ProtocolData;
  history: ProtocolData[];
  onNotesChange: (notes: string) => void;
  onUpdateData?: (newData: ProtocolData, createHistory?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onOpenEditor?: () => void;
}

const EvolutionTracker: React.FC<Props> = ({ currentProtocol, history, onNotesChange, onUpdateData, onSelectHistory, onOpenEditor }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tempData, setTempData] = useState(currentProtocol.physicalData);
  const [activeChart, setActiveChart] = useState<'weight' | 'bodyFat'>('weight');

  // Sincroniza o estado local
  useEffect(() => {
    setTempData(currentProtocol.physicalData);
  }, [currentProtocol.physicalData]);

  // Prepara dados históricos ordenados por data (Antigo -> Novo) para o gráfico
  const sortedHistoryForChart = useMemo(() => {
    // Inclui o atual e o histórico
    const all = [...history];
    // Garante que o atual esteja na lista se não estiver (por ID)
    if (!all.find(p => p.id === currentProtocol.id)) {
      all.push(currentProtocol);
    }
    
    // Filtra apenas os que tem dados válidos
    const validData = all.filter(p => p.physicalData.weight && !isNaN(parseFloat(p.physicalData.weight)));

    // Ordena: Mais antigo primeiro para o gráfico
    return validData.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  }, [history, currentProtocol]);

  // Prepara histórico para a lista lateral (Novo -> Antigo)
  const historyList = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history]);

  // Encontra o item imediatamente anterior para comparação
  const previous = historyList.find(p => p.id !== currentProtocol.id && new Date(p.updatedAt) < new Date(currentProtocol.updatedAt)) || historyList[1]; // Fallback

  const getDifference = (curr: string | undefined, prev: string | undefined) => {
    if (!curr || !prev) return null;
    const c = parseFloat(curr.replace(',', '.'));
    const p = parseFloat(prev.replace(',', '.'));
    if (isNaN(c) || isNaN(p)) return null;
    return c - p;
  };

  const renderDiff = (diff: number | null, inverse: boolean = false) => {
    if (diff === null) return null;
    if (Math.abs(diff) < 0.1) return <span className="text-white/20 flex items-center gap-0.5 font-bold text-[10px] bg-white/5 px-2 py-1 rounded-full"><Minus size={10}/> Estável</span>;
    
    const isPositive = diff > 0;
    const isGood = inverse ? !isPositive : isPositive;
    
    return (
      <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${isGood ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
        {isPositive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
        {Math.abs(diff).toFixed(1).replace('.', ',')}
      </span>
    );
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setTempData({
        ...tempData,
        measurements: {
            ...tempData.measurements,
            [key]: value
        }
    });
  };

  const handleSaveChanges = () => {
    if (onUpdateData) {
      setIsSaving(true);
      onUpdateData({
        ...currentProtocol,
        physicalData: tempData,
      }, false);
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const handleNewEvolution = () => {
    if (onUpdateData) {
      if(confirm("Confirmar fechamento do ciclo atual? \n\nIsso arquivará os dados atuais no histórico e criará uma nova avaliação com a data de hoje para você preencher os novos dados.")) {
        setIsSaving(true);
        // Atualiza a data para HOJE nos novos dados
        onUpdateData({
          ...currentProtocol,
          clientName: currentProtocol.clientName, 
          physicalData: {
             ...tempData,
             date: new Date().toLocaleDateString('pt-BR') 
          },
          updatedAt: new Date().toISOString()
        }, true); // TRUE = CRIA NOVO ID E ARQUIVA O ANTIGO
        setTimeout(() => setIsSaving(false), 2000);
      }
    }
  };

  // --- CHART COMPONENT (Simples SVG) ---
  const SimpleChart = ({ type }: { type: 'weight' | 'bodyFat' }) => {
    const dataPoints = sortedHistoryForChart.map(p => ({
      val: parseFloat(p.physicalData[type]?.replace(',', '.') || '0'),
      date: new Date(p.updatedAt).toLocaleDateString('pt-BR').slice(0, 5) // DD/MM
    })).filter(d => d.val > 0);

    if (dataPoints.length < 2) return (
      <div className="h-40 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
        Dados insuficientes para gráfico
      </div>
    );

    const max = Math.max(...dataPoints.map(d => d.val)) * 1.02;
    const min = Math.min(...dataPoints.map(d => d.val)) * 0.98;
    const range = max - min;
    
    // SVG Dimensions
    const width = 100; // percentages
    const height = 100;
    
    const points = dataPoints.map((d, i) => {
      const x = (i / (dataPoints.length - 1)) * 100;
      const y = 100 - ((d.val - min) / range) * 80 - 10; // padding top/bottom
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-48 w-full bg-gradient-to-b from-[#d4af37]/5 to-transparent rounded-2xl border border-[#d4af37]/20 p-4 overflow-hidden group">
        <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-[#d4af37] tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-md z-10">
            Evolução de {type === 'weight' ? 'Peso (kg)' : 'Gordura (%)'}
        </div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10">
            <div className="border-t border-white w-full"></div>
            <div className="border-t border-white w-full"></div>
            <div className="border-t border-white w-full"></div>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          {/* Linha Sombra */}
          <polyline 
             fill="none" 
             stroke="black" 
             strokeWidth="2" 
             points={points} 
             className="opacity-50 translate-y-0.5"
          />
          {/* Linha Principal */}
          <polyline 
             fill="none" 
             stroke="#d4af37" 
             strokeWidth="1.5" 
             points={points} 
             vectorEffect="non-scaling-stroke"
             className="drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />
          {/* Dots */}
          {dataPoints.map((d, i) => {
             const x = (i / (dataPoints.length - 1)) * 100;
             const y = 100 - ((d.val - min) / range) * 80 - 10;
             return (
               <g key={i}>
                 <circle cx={x} cy={y} r="1.5" fill="#000" stroke="#d4af37" strokeWidth="0.5" className="hover:r-3 transition-all" />
                 {/* Tooltip simulado (sempre visível no último) */}
                 {(i === dataPoints.length - 1) && (
                    <text x={x} y={y - 5} fontSize="4" fill="white" textAnchor="middle" fontWeight="bold">{d.val}</text>
                 )}
               </g>
             )
          })}
        </svg>

        {/* Labels X Axis */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[8px] text-white/30 font-bold uppercase">
           <span>{dataPoints[0].date}</span>
           <span>{dataPoints[dataPoints.length-1].date}</span>
        </div>
      </div>
    );
  };

  const inputClass = "w-full bg-[#111] border border-white/10 rounded-xl p-3 text-lg font-black text-white outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-center";
  const measureInputClass = "w-full bg-[#111] border border-white/10 rounded-lg p-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-center";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA PRINCIPAL: DADOS ATUAIS + GRÁFICOS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CARD DE GRÁFICOS */}
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <BarChart3 className="text-[#d4af37]" size={18} /> Análise de Tendência
               </h3>
               <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveChart('weight')}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${activeChart === 'weight' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    Peso
                  </button>
                  <button 
                    onClick={() => setActiveChart('bodyFat')}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${activeChart === 'bodyFat' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    Gordura %
                  </button>
               </div>
             </div>
             <SimpleChart type={activeChart} />
          </div>

          {/* CARD DE EDIÇÃO ATUAL */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                     <Activity size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Avaliação Atual</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                       Editando dados de: <span className="text-[#d4af37]">{new Date(currentProtocol.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
               </div>
               
               {previous && (
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                    <History size={14} className="text-white/40" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">Anterior: {new Date(previous.updatedAt).toLocaleDateString('pt-BR')}</span>
                 </div>
               )}
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { key: 'weight', label: 'Peso (kg)', value: currentProtocol.physicalData.weight, prev: previous?.physicalData.weight, inverse: true },
                { key: 'bodyFat', label: 'Gordura (%)', value: currentProtocol.physicalData.bodyFat, prev: previous?.physicalData.bodyFat, inverse: true },
                { key: 'muscleMass', label: 'Massa Musc.', value: currentProtocol.physicalData.muscleMass, prev: previous?.physicalData.muscleMass, inverse: false },
                { key: 'visceralFat', label: 'G. Visceral', value: currentProtocol.physicalData.visceralFat, prev: previous?.physicalData.visceralFat, inverse: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">{item.label}</span>
                  <input 
                    className={inputClass}
                    value={(tempData as any)[item.key]}
                    onChange={(e) => setTempData({...tempData, [item.key]: e.target.value})}
                    placeholder="-"
                  />
                  <div className="mt-2 h-6 flex items-center justify-center">
                    {renderDiff(getDifference(item.value, item.prev), item.inverse)}
                  </div>
                </div>
              ))}
            </div>

            {/* Medidas Detalhadas */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
               <div className="flex items-center gap-2 mb-4">
                 <Ruler size={14} className="text-[#d4af37]" />
                 <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Perímetros (cm)</h4>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                 {[
                    { k: 'thorax', l: 'Tórax' }, { k: 'waist', l: 'Cintura' }, { k: 'abdomen', l: 'Abdômen' }, { k: 'glutes', l: 'Glúteo' },
                    { k: 'rightArmContracted', l: 'Braço Dir.' }, { k: 'leftArmContracted', l: 'Braço Esq.' },
                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' }
                 ].map((m) => (
                   <div key={m.k} className="relative">
                      <label className="text-[8px] uppercase font-bold text-white/30 block mb-1 text-center">{m.l}</label>
                      <input 
                         className={measureInputClass} 
                         value={(tempData.measurements as any)?.[m.k]}
                         onChange={(e) => handleMeasurementChange(m.k, e.target.value)}
                         placeholder="0"
                      />
                      <div className="absolute -right-2 top-6">
                         {renderDiff(getDifference(
                             (currentProtocol.physicalData.measurements as any)?.[m.k], 
                             (previous?.physicalData.measurements as any)?.[m.k]
                         ))}
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Observações Internas */}
            <div className="bg-[#fffbe6]/5 p-6 rounded-2xl border border-[#d4af37]/10 mb-8">
               <div className="flex items-center gap-2 mb-2">
                 <ClipboardList size={14} className="text-[#d4af37]" />
                 <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Notas Privadas do Coach</h4>
               </div>
               <textarea
                className="w-full bg-transparent border-0 text-xs text-white/80 focus:ring-0 outline-none resize-none min-h-[80px] placeholder:text-white/20 leading-relaxed"
                placeholder="Anote aqui feedbacks importantes, ajustes de carga ou sensações relatadas pelo aluno..."
                value={currentProtocol.privateNotes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/5">
               <button 
                 onClick={handleSaveChanges}
                 disabled={isSaving}
                 className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                 {isSaving ? 'Salvando...' : 'Salvar Dados Atuais'}
               </button>

               <button 
                 onClick={handleNewEvolution}
                 disabled={isSaving}
                 className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#b5952f] text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-[#d4af37]/20"
               >
                 <PlusCircle size={14} />
                 Fechar Ciclo & Novo Protocolo
               </button>
            </div>

          </div>
        </div>

        {/* COLUNA LATERAL: HISTÓRICO (TIMELINE) */}
        <div className="lg:col-span-4">
           <div className="bg-[#0f0f0f] p-6 rounded-[2.5rem] border border-white/10 h-full flex flex-col sticky top-24">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14} className="text-[#d4af37]" /> Linha do Tempo
              </h3>
              
              <div className="relative border-l border-white/10 ml-3 space-y-8 pl-8 py-2">
                {historyList.map((p, idx) => {
                  const isSelected = p.id === currentProtocol.id;
                  return (
                    <div key={p.id} className="relative group">
                      {/* Dot Indicator */}
                      <div className={`absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-[#0f0f0f] transition-all ${isSelected ? 'bg-[#d4af37] scale-110 shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'bg-white/20 group-hover:bg-white/40'}`}></div>
                      
                      <button 
                        onClick={() => onSelectHistory && onSelectHistory(p)}
                        className={`w-full text-left transition-all ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                      >
                         <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest block mb-1">
                           {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                         </span>
                         <h4 className="text-sm font-bold text-white mb-2 leading-none">
                           {p.protocolTitle || 'Avaliação'}
                         </h4>
                         
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                               <span className="block text-[8px] text-white/30 uppercase font-bold">Peso</span>
                               <span className="text-xs font-bold text-white">{p.physicalData.weight}kg</span>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                               <span className="block text-[8px] text-white/30 uppercase font-bold">BF</span>
                               <span className="text-xs font-bold text-white">{p.physicalData.bodyFat}%</span>
                            </div>
                         </div>
                      </button>

                      {isSelected && onOpenEditor && (
                        <button 
                           onClick={onOpenEditor}
                           className="mt-4 w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-black bg-[#d4af37] py-2 rounded-lg hover:bg-white transition-colors"
                        >
                           <Edit3 size={10} /> Editar Protocolo Completo
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default EvolutionTracker;
