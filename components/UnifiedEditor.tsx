
import React, { useState } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import ContractForm from './ContractForm';
import ProtocolPreview from './ProtocolPreview';
import ContractPreview from './ContractPreview';
import { FileText, ScrollText, ChevronLeft } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
}

const UnifiedEditor: React.FC<Props> = ({ data, onChange, onBack }) => {
  const [activeTab, setActiveTab] = useState<'protocol' | 'contract'>('protocol');
  const [previewMode, setPreviewMode] = useState<'protocol' | 'contract'>('protocol');

  const tabClass = (active: boolean) => 
    `flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
      active 
      ? "bg-[#d4af37] text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]" 
      : "bg-white/5 text-white/40 hover:bg-white/10"
    }`;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>

        <div className="flex bg-black p-2 rounded-[1.5rem] border border-white/5 shadow-2xl">
          <button 
            onClick={() => { setActiveTab('protocol'); setPreviewMode('protocol'); }}
            className={tabClass(activeTab === 'protocol')}
          >
            <FileText size={18} /> Protocolo
          </button>
          <button 
            onClick={() => { setActiveTab('contract'); setPreviewMode('contract'); }}
            className={tabClass(activeTab === 'contract')}
          >
            <ScrollText size={18} /> Contrato
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 items-start w-full">
        {/* LADO DO FORMULÁRIO */}
        <div className="w-full xl:w-2/5 no-print">
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            {activeTab === 'protocol' ? (
              <ProtocolForm data={data} onChange={onChange} />
            ) : (
              <ContractForm data={data} onChange={onChange} />
            )}
          </div>
        </div>

        {/* LADO DO PREVIEW */}
        <div className="w-full xl:w-3/5 flex flex-col items-center gap-6">
           <div className="no-print flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
              <button 
                onClick={() => setPreviewMode('protocol')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'protocol' ? 'bg-[#d4af37] text-black' : 'text-white/40'}`}
              >
                Preview Protocolo
              </button>
              <button 
                onClick={() => setPreviewMode('contract')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'contract' ? 'bg-[#d4af37] text-black' : 'text-white/40'}`}
              >
                Preview Contrato
              </button>
           </div>
           
           <div className="w-full flex justify-center bg-white/5 p-4 md:p-10 rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden">
              <div className="transform scale-90 md:scale-95 xl:scale-100 origin-top">
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
