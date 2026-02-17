
import React, { useState, useRef } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ProtocolPreview, { ProtocolPreviewHandle } from './ProtocolPreview';
import ContractPreview, { ContractPreviewHandle } from './ContractPreview';
import AnamnesisPreview, { AnamnesisPreviewHandle } from './AnamnesisPreview';
import { ChevronLeft, Settings2, Download, FileText, Activity, Dumbbell } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
}

type PreviewMode = 'protocol' | 'contract' | 'anamnesis';

const UnifiedEditor: React.FC<Props> = ({ data, onChange, onBack }) => {
  // Estado elevado para controlar qual aba está ativa no formulário
  const [activeTab, setActiveTab] = useState<'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino' | 'obs'>('identificacao');
  
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>

        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
          <Settings2 size={16} className="text-[#d4af37]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Editor de Protocolo & Contrato</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start w-full">
        {/* LADO DO FORMULÁRIO ÚNICO (INTEGRADO) */}
        <div className="w-full xl:w-2/5 no-print">
          <div className="bg-white/5 p-4 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl w-full">
            <ProtocolForm 
              data={data} 
              onChange={onChange} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        {/* LADO DO PREVIEW E BOTÕES DE AÇÃO */}
        <div className="w-full xl:w-3/5 flex flex-col items-center gap-6">
           
           {/* BARRA DE FERRAMENTAS DO PREVIEW */}
           <div className="no-print w-full bg-[#111] p-4 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* Seletor de Visualização (Manual override) */}
              <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/5 w-full lg:w-auto overflow-x-auto">
                 <button 
                    onClick={() => setViewMode('contract')}
                    className={`px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'contract' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                    <FileText size={14}/> Contrato
                 </button>
                 <button 
                    onClick={() => setViewMode('anamnesis')}
                    className={`px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'anamnesis' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                    <Activity size={14}/> Anamnese
                 </button>
                 <button 
                    onClick={() => setViewMode('protocol')}
                    className={`px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'protocol' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                    <Dumbbell size={14}/> Protocolo
                 </button>
              </div>

              {/* Botão de Salvar/Download */}
              <button 
                onClick={handleDownloadCurrent}
                className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-[#d4af37] hover:text-black text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 group whitespace-nowrap"
              >
                <Download size={16} className="group-hover:animate-bounce" />
                {getDownloadLabel()}
              </button>
           </div>
           
           {/* ÁREA DE PREVIEW */}
           <div className="w-full flex justify-center bg-white/5 p-4 md:p-10 rounded-[2rem] md:rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden min-h-[500px] md:min-h-[900px]">
              <div className="transform scale-[0.45] md:scale-[0.7] xl:scale-[0.75] origin-top">
                
                {/* Renderização Condicional Estrita para evitar sobreposição */}
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
      </div>
    </div>
  );
};

export default UnifiedEditor;
