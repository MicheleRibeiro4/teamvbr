import React from 'react';
import { ProtocolData } from '../../../types';
import { Pill, AlertCircle, Info } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const StudentErgogenics: React.FC<Props> = ({ data }) => {
  const ergogenics = data.ergogenics || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Ergogênicos
        </h1>
        <p className="text-white/40 text-sm font-medium">
          Acompanhamento de recursos ergogênicos e posologia.
        </p>
      </header>

      {ergogenics.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
          <Pill size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 text-sm font-medium">Nenhum item registrado neste protocolo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ergogenics.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#d4af37]/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-xl group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  <Pill size={24} />
                </div>
                <div className="bg-white/5 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white uppercase mb-2 group-hover:text-[#d4af37] transition-all">
                {item.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Info size={14} className="text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Dosagem</p>
                    <p className="text-sm font-medium">{item.dosage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <AlertCircle size={14} className="text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Posologia / Horário</p>
                    <p className="text-sm font-medium">{item.timing}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl mt-12">
        <div className="flex items-center gap-3 mb-3 text-red-500">
          <AlertCircle size={20} />
          <h4 className="font-black uppercase text-xs tracking-widest">Aviso Importante</h4>
        </div>
        <p className="text-white/40 text-xs leading-relaxed italic">
          O uso de substâncias ergogênicas deve ser feito sob estrita orientação e acompanhamento. 
          Não altere dosagens ou horários sem consultar seu preparador. 
          Em caso de colaterais, suspenda o uso e informe imediatamente.
        </p>
      </div>
    </div>
  );
};

export default StudentErgogenics;
