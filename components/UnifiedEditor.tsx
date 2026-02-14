
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ProtocolPreview from './ProtocolPreview';
import ContractPreview from './ContractPreview';
import { FileText, ScrollText, ChevronLeft, Settings2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
}

const UnifiedEditor: React.FC<Props> = ({ data, onChange, onBack }) => {
  const [previewMode, setPreviewMode] = useState<'protocol' | 'contract'>('protocol');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>

        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <Settings2 size={16} className="text-[#d4af37]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Editor de Protocolo & Contrato</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 items-start w-full">
        {/* LADO DO FORMULÁRIO ÚNICO (INTEGRADO) */}
        <div className="w-full xl:w-2/5 no-print">
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <ProtocolForm data={data} onChange={onChange} />
          </div>
        </div>

        {/* LADO DO PREVIEW (DUPLO) - ESCALA REDUZIDA */}
        <div className="w-full xl:w-3/5 flex flex-col items-center gap-6">
           <div className="no-print flex gap-4 bg-black p-2 rounded-[1.5rem] border border-white/10 shadow-2xl">
              <button 
                onClick={() => setPreviewMode('protocol')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'protocol' ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'text-white/40 hover:text-white'}`}
              >
                <FileText size={16} /> Ver Protocolo
              </button>
              <button 
                onClick={() => setPreviewMode('contract')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'contract' ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'text-white/40 hover:text-white'}`}
              >
                <ScrollText size={16} /> Ver Contrato
              </button>
           </div>
           
           <div className="w-full flex justify-center bg-white/5 p-4 md:p-10 rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden min-h-[900px]">
              <div className="transform scale-[0.65] md:scale-[0.7] xl:scale-[0.75] origin-top">
                {previewMode === 'protocol' ? (
                  <ProtocolPreview data={data} />
                ) : (
                  <ContractPreview data={data} />
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedEditor;
