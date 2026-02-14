
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

  const sectionClass = "bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8";
  const labelClass = "block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-gray-800 text-sm transition-all";

  return (
    <div className="w-full flex flex-col gap-6">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors no-print px-4 self-start"
        >
          <ChevronLeft size={16} /> Voltar ao Painel do Aluno
        </button>
      )}
      
      <div className="flex flex-col xl:flex-row gap-10 items-start w-full">
        {/* FORMULÁRIO (ESQUERDA) */}
        <div className="w-full xl:w-[450px] shrink-0 no-print order-2 xl:order-1">
          
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <UserCircle className="text-[#d4af37]" size={22} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Dados do Consultor</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome Completo</label>
                <input className={inputClass} value={data.consultantName} onChange={(e) => handleChange('consultantName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CPF</label>
                  <input className={inputClass} value={data.consultantCpf} onChange={(e) => handleChange('consultantCpf', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Endereço Comercial</label>
                <input className={inputClass} value={data.consultantAddress} onChange={(e) => handleChange('consultantAddress', e.target.value)} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <UserCheck className="text-[#d4af37]" size={22} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Dados do Contratante</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome do Aluno</label>
                <input className={inputClass + " bg-[#d4af37]/5"} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CPF do Aluno</label>
                  <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Endereço Completo</label>
                <input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <DollarSign className="text-[#d4af37]" size={22} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Financeiro e Datas</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Valor (R$)</label>
                  <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Início</label>
                  <input className={inputClass} type="text" placeholder="DD/MM/AAAA" value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duração (Dias)</label>
                  <input className={inputClass} value={data.contract.durationDays} onChange={(e) => handleChange('contract.durationDays', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Término</label>
                  <input className={inputClass} type="text" placeholder="DD/MM/AAAA" value={data.contract.endDate} onChange={(e) => handleChange('contract.endDate', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Método de Pagamento</label>
                <input className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW (DIREITA) */}
        <div className="flex-1 w-full order-1 xl:order-2 flex flex-col items-center">
          <div className="sticky top-28 w-full flex flex-col items-center">
            <div className="bg-gray-200/20 p-6 md:p-12 rounded-[3rem] border-2 border-dashed border-gray-200/30 w-full flex justify-center overflow-hidden">
               {/* Container que escala o preview para caber na tela sem quebrar o layout */}
               <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-[0.9] xl:scale-[0.75] 2xl:scale-[1.0] transition-transform">
                  <ContractPreview data={data} onBack={onBack} />
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContractWorkspace;
