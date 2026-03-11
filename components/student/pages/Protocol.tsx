import React from 'react';
import { ProtocolData } from '../../../types';
import { FileDown, Droplets, AlertCircle } from 'lucide-react';
import ProtocolPreview from '../../ProtocolPreview';

interface Props {
  data: ProtocolData;
}

const StudentProtocol: React.FC<Props> = ({ data }) => {
  const previewRef = React.useRef<any>(null);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Minha Dieta
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
      <div className="space-y-6">
        {data.meals.map((meal, index) => (
          <div 
            key={index}
            className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border bg-black border-white/10 text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Horário</span>
                  <span className="text-lg font-bold">{meal.time}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase text-[#d4af37]">
                    {meal.name}
                  </h3>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
                  {meal.details}
                </p>
              </div>

              {meal.substitutions && (
                <div className="mt-4 bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Substituições Disponíveis</span>
                  </div>
                  <p className="text-white/60 text-xs whitespace-pre-wrap leading-relaxed italic">
                    {meal.substitutions}
                  </p>
                </div>
              )}
            </div>
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
