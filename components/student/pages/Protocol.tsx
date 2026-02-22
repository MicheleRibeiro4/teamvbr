import React, { useState } from 'react';
import { ProtocolData } from '../../../types';
import { FileDown, ChevronDown, ChevronUp, Droplets, AlertCircle } from 'lucide-react';
import ProtocolPreview from '../../ProtocolPreview';

interface Props {
  data: ProtocolData;
}

const StudentProtocol: React.FC<Props> = ({ data }) => {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const previewRef = React.useRef<any>(null);

  const toggleMeal = (id: string) => {
    setExpandedMeal(expandedMeal === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Meu Protocolo
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Siga o plano alimentar para alcançar seus objetivos.
          </p>
        </div>
        <button 
          onClick={() => previewRef.current?.download()}
          className="bg-[#d4af37] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#b5952f] transition-all flex items-center gap-2 shadow-lg active:scale-95"
        >
          <FileDown size={18} />
          Baixar PDF
        </button>
      </header>

      {/* Hidden Preview Component for PDF Generation */}
      <div className="hidden">
        <ProtocolPreview ref={previewRef} data={data} />
      </div>

      {/* Water Goal */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-center gap-6 mb-8">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Droplets size={24} />
        </div>
        <div>
          <h3 className="text-blue-400 font-black uppercase text-sm tracking-wide mb-1">Meta de Hidratação</h3>
          <p className="text-white text-lg font-medium">
            Consumir no mínimo <span className="font-bold text-2xl">{data.waterGoal || '3.0'} Litros</span> de água por dia.
          </p>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {data.meals.map((meal, index) => (
          <div 
            key={index}
            className={`
              bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300
              ${expandedMeal === index.toString() ? 'border-[#d4af37]/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : 'border-white/5 hover:border-white/10'}
            `}
          >
            <button 
              onClick={() => toggleMeal(index.toString())}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-6">
                <div className={`
                  w-16 h-16 rounded-xl flex flex-col items-center justify-center border
                  ${expandedMeal === index.toString() ? 'bg-[#d4af37] border-[#d4af37] text-black' : 'bg-black border-white/10 text-white'}
                `}>
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Horário</span>
                  <span className="text-lg font-bold">{meal.time}</span>
                </div>
                <div>
                  <h3 className={`text-lg font-bold uppercase mb-1 ${expandedMeal === index.toString() ? 'text-[#d4af37]' : 'text-white'}`}>
                    {meal.name}
                  </h3>
                  <p className="text-white/40 text-xs font-medium line-clamp-1">
                    {meal.details.split('\n')[0]}
                  </p>
                </div>
              </div>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${expandedMeal === index.toString() ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-white/5 text-white/40'}
              `}>
                {expandedMeal === index.toString() ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {expandedMeal === index.toString() && (
              <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                <div className="w-full h-px bg-white/5 mb-6"></div>
                <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                  <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
                    {meal.details}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Supplements */}
      {data.supplements && data.supplements.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-[#d4af37] rounded-full"></span>
            Suplementação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.supplements.map((supp, idx) => (
              <div key={idx} className="bg-[#111] p-5 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white uppercase text-sm mb-1">{supp.name}</h4>
                  <p className="text-white/40 text-xs">{supp.dosage}</p>
                </div>
                <div className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {supp.timing}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProtocol;
