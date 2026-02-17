
import React, { useState, useRef } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ProtocolPreview, { ProtocolPreviewHandle } from './ProtocolPreview';
import ContractPreview, { ContractPreviewHandle } from './ContractPreview';
import AnamnesisPreview, { AnamnesisPreviewHandle } from './AnamnesisPreview';
import EvolutionTracker from './EvolutionTracker'; // Importando EvolutionTracker
import { ChevronLeft, Settings2, Download, FileText, Activity, Dumbbell, TrendingUp } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
  // Novas props para suportar Evolução
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
  // Estado elevado para controlar qual aba está ativa no formulário
  const [activeTab, setActiveTab] = useState<'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'obs' | 'evolucao'>('identificacao');
  
  // Estado para controlar qual visualização está ativa
  const [viewMode, setViewMode] = useState<PreviewMode>('contract');

  // Refs para acionar os downloads
  const protocolRef = useRef<ProtocolPreviewHandle>(null);
  const contractRef = useRef<ContractPreviewHandle>(null);
  const anamnesisRef = useRef<AnamnesisPreviewHandle>(null);

  // Sincroniza a visualização com a aba do formulário seguindo as regras estritas
  React.useEffect(() => {
    switch (activeTab) {
        case 'identificacao':
            setViewMode('contract');
            break;
        case 'anamnese':
            setViewMode('anamnesis');
            break;
        case 'medidas':
            // Medidas compõem a avaliação física/anamnese
            setViewMode('anamnesis');
            break;
        case 'nutricao':
        case 'treino':
        case 'obs':
            setViewMode('protocol');
            break;
        case 'evolucao':
            // Quando em evolução, o preview pode ser o protocolo ou anamnese,
            // mas o foco visual é o gráfico. Mantemos o preview atual ou default protocol.
            setViewMode('protocol');
            break;
        default:
            setViewMode('protocol');
    }
  }, [activeTab]);

  const handleDownloadCurrent = () => {
    if (viewMode === 'protocol' && protocolRef.current) {
      protocolRef.current.download();
    } else if (viewMode === 'contract' && contractRef.current) {
      contractRef.current.download();
    } else if (viewMode === 'anamnesis' && anamnesisRef.current) {
      anamnesisRef.current.download();
    }
  };

  const getDownloadLabel = () => {
     switch(viewMode) {
         case 'protocol': return 'Salvar Protocolo PDF';
         case 'contract': return 'Salvar Contrato PDF';
         case 'anamnesis': return 'Salvar Anamnese PDF';
     }
  };

  // Função para permitir que o EvolutionTracker mude a aba para visualizar o protocolo
  const handleViewProtocolFromHistory = () => {
      setActiveTab('treino'); // Muda para aba de treino para ver o protocolo
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
        {/* LADO DO FORMULÁRIO ÚNICO (INTEGRADO) */}
        {/* Se a aba for evolução, ocupamos a largura total */}
        <div className={`no-print ${activeTab === 'evolucao' ? 'w-full' : 'w-full xl:w-2/5'}`}>
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl w-full">
            
            {/* Navegação de Abas COMPACTA E CENTRALIZADA - FONTES AUMENTADAS */}
            <div className="flex flex-nowrap md:justify-center overflow-x-auto pb-2 scrollbar-hide w-full mb-6 gap-2">
                {[
                    { id: 'identificacao', label: 'ID', fullLabel: 'Identificação', icon: FileText },
                    { id: 'anamnese', label: 'Anamnese', fullLabel: 'Anamnese', icon: Activity },
                    { id: 'medidas', label: 'Medidas', fullLabel: 'Medidas', icon: Dumbbell },
                    { id: 'nutricao', label: 'Dieta', fullLabel: 'Nutrição', icon: Activity },
                    { id: 'treino', label: 'Treino', fullLabel: 'Treino', icon: Dumbbell },
                    { id: 'obs', label: 'Obs', fullLabel: 'Observações', icon: FileText },
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
                    onOpenEditor={handleViewProtocolFromHistory} // Passa a função para trocar aba
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

        {/* LADO DO PREVIEW E BOTÕES DE AÇÃO - ESCONDIDO SE ABA FOR EVOLUÇÃO */}
        {activeTab !== 'evolucao' && (
            <div className="w-full xl:w-3/5 flex flex-col items-center gap-4">
            
            {/* BARRA DE FERRAMENTAS DO PREVIEW */}
            <div className="no-print w-full bg-[#111] p-3 rounded-2xl border border-white/10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-3">
                
                {/* Seletor de Visualização (Manual override) */}
                <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-white/5 w-full lg:w-auto overflow-x-auto">
                    <button 
                        onClick={() => setViewMode('contract')}
                        className={`px-3 py-2 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'contract' ? 'bg-[#d4af37] text-black shadow' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <FileText size={12}/> Contrato
                    </button>
                    <button 
                        onClick={() => setViewMode('anamnesis')}
                        className={`px-3 py-2 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'anamnesis' ? 'bg-[#d4af37] text-black shadow' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Activity size={12}/> Anamnese
                    </button>
                    <button 
                        onClick={() => setViewMode('protocol')}
                        className={`px-3 py-2 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'protocol' ? 'bg-[#d4af37] text-black shadow' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Dumbbell size={12}/> Protocolo
                    </button>
                </div>

                {/* Botão de Salvar/Download */}
                <button 
                    onClick={handleDownloadCurrent}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-[#d4af37] hover:text-black text-white border border-white/10 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all shadow active:scale-95 group whitespace-nowrap"
                >
                    <Download size={14} className="group-hover:animate-bounce" />
                    {getDownloadLabel()}
                </button>
            </div>
            
            {/* ÁREA DE PREVIEW */}
            <div className="w-full flex justify-center bg-white/5 p-4 rounded-[2rem] border-2 border-dashed border-white/10 relative overflow-hidden min-h-[500px] md:min-h-[900px]">
                <div className="transform scale-[0.45] md:scale-[0.7] xl:scale-[0.75] origin-top">
                    
                    {viewMode === 'protocol' && (
                    <ProtocolPreview ref={protocolRef} data={data} hideFloatingButton={true} />
                    )}
                    
                    {viewMode === 'contract' && (
                    <ContractPreview ref={contractRef} data={data} hideFloatingButton={true} />
                    )}

                    {viewMode === 'anamnesis' && (
                    <AnamnesisPreview ref={anamnesisRef} data={data} hideFloatingButton={true} />
                    )}

                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedEditor;
