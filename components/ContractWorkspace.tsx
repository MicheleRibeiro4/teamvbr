
import React from 'react';
import { ProtocolData } from '../types';
import ContractPreview from './ContractPreview';
import { ScrollText, DollarSign, Calendar, MapPin, UserCheck, Briefcase, UserCircle, CreditCard, ChevronLeft } from 'lucide-react';

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

  const sectionClass = "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6";
  const labelClass = "block text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-gray-800 text-sm transition-all";

  return (
    <div className="flex flex-col gap-8 w-full">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors no-print px-4"
        >
          <ChevronLeft size={16} /> Voltar ao Painel do Aluno
        </button>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto w-full">
        <div className="w-full lg:w-1/2 no-print">
          {/* ... campos de input iguais ao anterior ... */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
              <UserCircle className="text-[#d4af37]" size={18} />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Dados do Consultor</h2>
            </div>
            {/* Mantendo os campos mas de forma compacta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome</label>
                <input className={inputClass} value={data.consultantName} onChange={(e) => handleChange('consultantName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={data.consultantCpf} onChange={(e) => handleChange('consultantCpf', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={data.consultantEmail} onChange={(e) => handleChange('consultantEmail', e.target.value)} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
              <UserCheck className="text-[#d4af37]" size={18} />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Dados do Contratante</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome Aluno</label>
                <input className={inputClass + " bg-[#d4af37]/5"} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
              <DollarSign className="text-[#d4af37]" size={18} />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Financeiro</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Método</label>
                <input className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="w-full lg:w-1/2 flex justify-center bg-gray-200/20 p-4 md:p-10 rounded-3xl border-2 border-dashed border-gray-200">
           <div className="relative">
              <ContractPreview data={data} onBack={onBack} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractWorkspace;
