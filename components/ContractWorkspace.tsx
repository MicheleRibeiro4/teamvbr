
import React from 'react';
import { ProtocolData } from '../types';
import ContractPreview from './ContractPreview';
import { DollarSign, UserCheck, UserCircle, ChevronLeft } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
  onBack?: () => void;
}

const ContractWorkspace: React.FC<Props> = ({ data, onChange, onBack }) => {
  const handleChange = (path: string, value: any) => {
    const newData = { ...data };
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const sectionClass = "bg-white/5 p-4 rounded-2xl border border-white/10";
  const labelClass = "block text-[8px] font-black text-white/30 mb-1 uppercase tracking-widest";
  const inputClass = "w-full p-2 bg-white/5 border border-white/10 rounded-lg focus:ring-1 focus:ring-[#d4af37] outline-none font-bold text-white text-xs transition-all";

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors no-print"
        >
          <ChevronLeft size={14} /> Voltar ao Painel
        </button>
      )}
      
      {/* FORMULÁRIOS NO TOPO - GRID COMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 no-print">
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <UserCircle className="text-[#d4af37]" size={16} />
            <h2 className="text-xs font-black text-white uppercase tracking-tighter">Consultor</h2>
          </div>
          <div className="space-y-2">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} value={data.consultantName} onChange={(e) => handleChange('consultantName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={data.consultantCpf} onChange={(e) => handleChange('consultantCpf', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Cidade</label>
                <input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="text-[#d4af37]" size={16} />
            <h2 className="text-xs font-black text-white uppercase tracking-tighter">Aluno</h2>
          </div>
          <div className="space-y-2">
            <div>
              <label className={labelClass}>Nome do Aluno</label>
              <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Fone</label>
                <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-[#d4af37]" size={16} />
            <h2 className="text-xs font-black text-white uppercase tracking-tighter">Financeiro</h2>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Início</label>
                <input className={inputClass} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Método</label>
              <input className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZAÇÃO EMBAIXO - AJUSTADA PARA ESCALA */}
      <div className="w-full flex justify-center bg-white/5 p-4 rounded-[2rem] border-2 border-dashed border-white/5 overflow-x-auto">
        <div className="origin-top scale-[0.55] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-[1.0] transition-transform">
          <ContractPreview data={data} onBack={onBack} />
        </div>
      </div>
    </div>
  );
};

export default ContractWorkspace;
