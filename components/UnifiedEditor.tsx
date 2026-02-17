
import React, { useState, useRef } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ProtocolPreview from './ProtocolPreview';
import ContractPreview from './ContractPreview';
import AnamnesisPreview from './AnamnesisPreview';
import EvolutionTracker from './EvolutionTracker';
import { ChevronLeft, Settings2, FileText, Activity, Dumbbell, TrendingUp } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
  history?: ProtocolData[];
  onUpdateData?: (newData: ProtocolData, createHistory?: boolean, forceNewId?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onDeleteHistory?: (id: string) => void;
}

type PreviewMode = 'protocol' | 'contract' | 'anamnesis';

const UnifiedEditor: React.FC<Props> = ({ 
  data, 
  onChange, 
  onBack,
  history = [],
  onUpdateData = () => {},
  onSelectHistory = () => {},
  onDeleteHistory = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'evolucao'>('identificacao');
  const [viewMode, setViewMode] = useState<PreviewMode>('contract');

  // Sincroniza a visualização com a aba do formulário
  React.useEffect(() => {
    switch (activeTab) {
        case 'identificacao':
            setViewMode('contract');
            break;
        case 'anamnese':
            setViewMode('anamnesis');
            break;
        case 'medidas':
            setViewMode('anamnesis');
            break;
        case 'nutricao':
        case 'treino':
            setViewMode('protocol');
            break;
        case 'evolucao':
            setViewMode('protocol');
            break;
        default:
            setViewMode('protocol');
    }
  }, [activeTab]);

  const handleViewProtocolFromHistory = () => {
      setActiveTab('treino'); 
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 self-start md:self-auto">
          <Settings2 size={14} className="text-[#d4af37]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Editor de Protocolo</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* LADO DO FORMULÁRIO ÚNICO */}
        <div className={`no-print ${activeTab === 'evolucao' ? 'w-full' : 'w-full xl:w-2/5'}`}>
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl w-full">
            
            <div className="flex flex-nowrap md:justify-center overflow-x-auto pb-2 scrollbar-hide w-full mb-6 gap-2">
                {[
                    { id: 'identificacao', label: 'ID', fullLabel: 'Identificação', icon: FileText },
                    { id: 'anamnese', label: 'Anamnese', fullLabel: 'Anamnese', icon: Activity },
                    { id: 'medidas', label: 'Medidas', fullLabel: 'Medidas', icon: Dumbbell },
                    { id: 'nutricao', label: 'Dieta', fullLabel: 'Nutrição', icon: Activity },
                    { id: 'treino', label: 'Treino', fullLabel: 'Treino', icon: Dumbbell },
                    { id: 'evolucao', label: 'Evolução', fullLabel: 'Evolução', icon: TrendingUp },
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all border ${activeTab === tab.id ? 'bg-[#d4af37] text-black border-[#d4af37] scale-105 shadow-lg' : 'bg-black/20 text-white/40 border-white/5 hover:bg-white/5 hover:text-white'}`}
                    >
                        <tab.icon size={14} className="hidden md:block" /> 
                        <span className="md:hidden">{tab.label}</span>
                        <span className="hidden md:inline">{tab.fullLabel}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'evolucao' ? (
                <EvolutionTracker 
                    currentProtocol={data}
                    history={history}
                    onNotesChange={(n) => onChange({...data, privateNotes: n})}
                    onUpdateData={onUpdateData}
                    onSelectHistory={onSelectHistory}
                    onDeleteHistory={onDeleteHistory}
                    onOpenEditor={handleViewProtocolFromHistory}
                />
            ) : (
                <ProtocolForm 
                    data={data} 
                    onChange={onChange} 
                    activeTab={activeTab as any}
                    onTabChange={(t) => setActiveTab(t)}
                    hideTabs={true} 
                />
            )}
          </div>
        </div>

        {/* LADO DO PREVIEW - AGORA GERENCIADO PELOS PRÓPRIOS COMPONENTES */}
        {activeTab !== 'evolucao' && (
            <div className="w-full xl:w-3/5 flex flex-col items-center gap-4">
                {viewMode === 'protocol' && (
                    <ProtocolPreview data={data} hideFloatingButton={true} />
                )}
                
                {viewMode === 'contract' && (
                    <ContractPreview data={data} hideFloatingButton={true} />
                )}

                {viewMode === 'anamnesis' && (
                    <AnamnesisPreview data={data} hideFloatingButton={true} />
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedEditor;
