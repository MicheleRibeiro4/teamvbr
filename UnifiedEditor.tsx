
import React, { useState, useRef } from 'react';
import { ProtocolData } from '../types';
import ProtocolForm from './ProtocolForm';
import { ChevronLeft, Settings2, FileText, Activity, Dumbbell } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack: () => void;
  history?: ProtocolData[];
  onUpdateData?: (newData: ProtocolData, createHistory?: boolean, forceNewId?: boolean) => void;
  onSelectHistory?: (data: ProtocolData) => void;
  onDeleteHistory?: (id: string) => void;
}

const UnifiedEditor: React.FC<Props> = ({ 
  data, 
  onChange, 
  onBack,
  history = [],
  onUpdateData = () => {},
  onSelectHistory = () => {},
  onDeleteHistory = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'identificacao' | 'anamnese' | 'medidas' | 'nutricao' | 'treino'>('identificacao');

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
        {/* FORMULÁRIO ÚNICO - FULL WIDTH */}
        <div className="w-full no-print">
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl w-full">
            
            <div className="flex flex-nowrap md:justify-center overflow-x-auto pb-2 scrollbar-hide w-full mb-6 gap-2">
                {[
                    { id: 'identificacao', label: 'ID', fullLabel: 'Identificação', icon: FileText },
                    { id: 'anamnese', label: 'Anamnese', fullLabel: 'Anamnese', icon: Activity },
                    { id: 'medidas', label: 'Medidas', fullLabel: 'Medidas', icon: Dumbbell },
                    { id: 'nutricao', label: 'Dieta', fullLabel: 'Nutrição', icon: Activity },
                    { id: 'treino', label: 'Treino', fullLabel: 'Treino', icon: Dumbbell },
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

            <ProtocolForm 
                data={data} 
                onChange={onChange} 
                activeTab={activeTab as any}
                onTabChange={(t) => setActiveTab(t)}
                hideTabs={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedEditor;
