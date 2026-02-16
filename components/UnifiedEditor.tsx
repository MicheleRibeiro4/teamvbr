
import React, { useState, useRef } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ProtocolPreview, { ProtocolPreviewHandle } from './ProtocolPreview';
import ContractPreview, { ContractPreviewHandle } from './ContractPreview';
import { ChevronLeft, Settings2, Download } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
}

const UnifiedEditor: React.FC<Props> = ({ data, onChange, onBack }) => {
  // Estado elevado para controlar qual aba está ativa no formulário
  const [activeTab, setActiveTab] = useState<'identificacao' | 'medidas' | 'nutricao' | 'treino' | 'obs'>('identificacao');
  
  // Refs para acionar os downloads dentro dos componentes filhos
  const protocolRef = useRef<ProtocolPreviewHandle>(null);
  const contractRef = useRef<ContractPreviewHandle>(null);

  // Determina qual modo de visualização usar baseado na aba ativa
  const isContractView = activeTab === 'identificacao';

  const handleDownloadCurrent = () => {
    if (!isContractView && protocolRef.current) {
      protocolRef.current.download();
    } else if (isContractView && contractRef.current) {
      contractRef.current.download();
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
           <div className="no-print w-full bg-[#111] p-4 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Indicador do que está sendo visualizado */}
              <div className="flex gap-2 bg-black/50 p-3 px-6 rounded-xl border border-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest w-full md:w-auto justify-center">
                Visualizando: <span className="text-[#d4af37]">{isContractView ? 'Contrato' : 'Protocolo Completo'}</span>
              </div>

              {/* Botão de Salvar/Download */}
              <button 
                onClick={handleDownloadCurrent}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-[#d4af37] hover:text-black text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 group whitespace-nowrap"
              >
                <Download size={16} className="group-hover:animate-bounce" />
                Salvar PDF {!isContractView ? 'do Protocolo' : 'do Contrato'}
              </button>
           </div>
           
           {/* ÁREA DE PREVIEW */}
           <div className="w-full flex justify-center bg-white/5 p-4 md:p-10 rounded-[2rem] md:rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden min-h-[500px] md:min-h-[900px]">
              <div className="transform scale-[0.45] md:scale-[0.7] xl:scale-[0.75] origin-top">
                {/* Renderização Condicional Baseada na Aba */}
                <div style={{ display: !isContractView ? 'block' : 'none' }}>
                  <ProtocolPreview ref={protocolRef} data={data} hideFloatingButton={true} />
                </div>
                <div style={{ display: isContractView ? 'block' : 'none' }}>
                  <ContractPreview ref={contractRef} data={data} hideFloatingButton={true} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedEditor;
