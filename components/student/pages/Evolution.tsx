import React from 'react';
import { ProtocolData } from '../../../types';
import { TrendingUp, Scale, Ruler } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const StudentEvolution: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Minha Evolução
        </h1>
        <p className="text-white/40 text-sm font-medium">
          Acompanhe seu progresso físico e métricas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Scale size={20} /></div>
            <p className="text-xs font-bold text-white/40 uppercase">Peso Atual</p>
          </div>
          <p className="text-3xl font-black text-white">{data.physicalData.weight || '-'} <span className="text-sm font-medium text-white/30">kg</span></p>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><TrendingUp size={20} /></div>
            <p className="text-xs font-bold text-white/40 uppercase">Gordura Corporal</p>
          </div>
          <p className="text-3xl font-black text-white">{data.physicalData.bodyFat || '-'} <span className="text-sm font-medium text-white/30">%</span></p>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><DumbbellIcon size={20} /></div>
            <p className="text-xs font-bold text-white/40 uppercase">Massa Muscular</p>
          </div>
          <p className="text-3xl font-black text-white">{data.physicalData.muscleMass || '-'} <span className="text-sm font-medium text-white/30">kg</span></p>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Ruler size={20} /></div>
            <p className="text-xs font-bold text-white/40 uppercase">IMC</p>
          </div>
          <p className="text-3xl font-black text-white">{data.physicalData.imc || '-'}</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl p-8 text-center py-20">
        <p className="text-white/30 text-sm font-medium">Gráficos de evolução em breve...</p>
      </div>
    </div>
  );
};

function DumbbellIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  )
}

export default StudentEvolution;
