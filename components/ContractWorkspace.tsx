
import React from 'react';
import { ProtocolData } from '../types';
import ContractPreview from './ContractPreview';
import { ScrollText, DollarSign, Calendar, MapPin, UserCheck, Briefcase, UserCircle, CreditCard } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
}

const ContractWorkspace: React.FC<Props> = ({ data, onChange }) => {
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
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">
      
      <div className="w-full lg:w-1/2 no-print">
        
        {/* DADOS DO CONSULTOR (CONTRATADO) */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <UserCircle className="text-[#d4af37]" size={18} />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Dados do Consultor (Contratado)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Nome do Consultor</label>
              <input className={inputClass} value={data.consultantName} onChange={(e) => handleChange('consultantName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>CPF do Consultor</label>
              <input className={inputClass} value={data.consultantCpf} onChange={(e) => handleChange('consultantCpf', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>E-mail do Consultor</label>
              <input className={inputClass} value={data.consultantEmail} onChange={(e) => handleChange('consultantEmail', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Endereço do Consultor</label>
              <input className={inputClass} value={data.consultantAddress} onChange={(e) => handleChange('consultantAddress', e.target.value)} />
            </div>
          </div>
        </div>

        {/* DADOS DO ALUNO (CONTRATANTE) */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <UserCheck className="text-[#d4af37]" size={18} />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Dados do Contratante</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Nome Completo do Aluno (Sincronizado)</label>
              <input 
                className={inputClass + " bg-[#d4af37]/5"} 
                value={data.clientName} 
                onChange={(e) => handleChange('clientName', e.target.value)} 
              />
            </div>
            <div>
              <label className={labelClass}>CPF Aluno</label>
              <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp</label>
              <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Endereço Completo</label>
              <input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* VIGÊNCIA E PRAZOS */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <Calendar className="text-[#d4af37]" size={18} />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Vigência e Prazos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Duração (Dias)</label>
              <input className={inputClass} value={data.contract.durationDays} onChange={(e) => handleChange('contract.durationDays', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Início</label>
              <input className={inputClass} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelClass}>Término</label>
              <input className={inputClass} value={data.contract.endDate} onChange={(e) => handleChange('contract.endDate', e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
          </div>
        </div>

        {/* FINANCEIRO */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <DollarSign className="text-[#d4af37]" size={18} />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Financeiro</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Valor Total (R$)</label>
              <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Valor por Extenso</label>
              <input className={inputClass} value={data.contract.planValueWords} onChange={(e) => handleChange('contract.planValueWords', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Método Pagamento</label>
              <select className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
                <option value="Pix">Pix (à vista)</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Parcelas (n° de vezes)</label>
              <input className={inputClass} value={data.contract.installments} onChange={(e) => handleChange('contract.installments', e.target.value)} />
            </div>
          </div>
        </div>

        {/* LOCALIZAÇÃO E DATA */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
            <MapPin className="text-[#d4af37]" size={18} />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Localização e Data de Assinatura</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Data do Contrato</label>
              <input className={inputClass} value={data.contract.contractDate} onChange={(e) => handleChange('contract.contractDate', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="w-full lg:w-1/2 flex justify-center bg-gray-200/20 p-4 md:p-10 rounded-3xl border-2 border-dashed border-gray-200">
         <div className="relative">
            <ContractPreview data={data} />
         </div>
      </div>

    </div>
  );
};

export default ContractWorkspace;
