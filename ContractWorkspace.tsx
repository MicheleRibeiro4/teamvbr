
import React, { useEffect } from 'react';
import { ProtocolData } from '../types';
import ContractPreview from './ContractPreview';
import { EMPTY_DATA } from '../constants';
import { DollarSign, UserCheck, Clock, FileText, ChevronLeft } from 'lucide-react';

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

  const handleDateInput = (path: string, value: string) => {
    let v = value.replace(/\D/g, ''); 
    if (v.length > 8) v = v.substr(0, 8); 

    if (v.length > 4) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    
    handleChange(path, v);
  };

  // Inicializa o corpo do contrato se estiver vazio
  useEffect(() => {
    if (!data.contract.contractBody || data.contract.contractBody.trim() === '') {
      handleChange('contract.contractBody', EMPTY_DATA.contract.contractBody);
    }
  }, []);

  // Lógica de Valor por Extenso (Português)
  const converterParaExtenso = (num: number): string => {
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    const conv = (n: number): string => {
      if (n === 0) return "";
      if (n === 100) return "cem";
      let s = "";
      if (n >= 100) {
        s += centenas[Math.floor(n / 100)];
        n %= 100;
        if (n > 0) s += " e ";
      }
      if (n >= 20) {
        s += dezenas[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) s += " e ";
      } else if (n >= 10) {
        s += dezenas10[n - 10];
        n = 0;
      }
      if (n > 0) s += unidades[n];
      return s;
    };

    if (num === 0) return "zero reais";
    
    let n = Math.floor(num);
    let c = Math.round((num - n) * 100);
    let res = "";

    if (n >= 1000) {
      const mil = Math.floor(n / 1000);
      res += (mil === 1 ? "" : conv(mil)) + " mil";
      n %= 1000;
      if (n > 0) res += (n < 100 || n % 100 === 0 ? " e " : ", ");
    }
    
    if (n > 0 || res === "") {
      res += conv(n);
    }

    res += (n === 1 && res === "um") ? " real" : " reais";

    if (c > 0) {
      res += " e " + conv(c) + (c === 1 ? " centavo" : " centavos");
    }

    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  // Efeito para calcular dias e extenso automaticamente
  useEffect(() => {
    // Cálculo de Dias
    if (data.contract.startDate && data.contract.endDate) {
      const partsStart = data.contract.startDate.split('/');
      const partsEnd = data.contract.endDate.split('/');
      if (partsStart.length === 3 && partsEnd.length === 3) {
        const d1 = new Date(Number(partsStart[2]), Number(partsStart[1]) - 1, Number(partsStart[0]));
        const d2 = new Date(Number(partsEnd[2]), Number(partsEnd[1]) - 1, Number(partsEnd[0]));
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Ajuste para Avulso (1 dia)
        const displayDays = data.contract.planType === 'Avulso' ? "1" : (isNaN(diffDays) ? "" : diffDays.toString());
        
        if (data.contract.durationDays !== displayDays) {
          handleChange('contract.durationDays', displayDays);
        }
      }
    }

    // Cálculo de Extenso
    if (data.contract.planValue) {
      const valStr = data.contract.planValue.replace(/[^\d,.-]/g, '').replace(',', '.');
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        const text = converterParaExtenso(val);
        if (data.contract.planValueWords !== text) {
          handleChange('contract.planValueWords', text);
        }
      }
    }
  }, [data.contract.startDate, data.contract.endDate, data.contract.planValue, data.contract.planType]);

  const sectionClass = "bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 mb-8";
  const labelClass = "block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-gray-800 text-sm transition-all";

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors no-print px-4"
        >
          <ChevronLeft size={16} /> Voltar ao Painel do Aluno
        </button>
      )}
      
      <div className="flex flex-col xl:flex-row gap-12 items-start w-full">
        <div className="w-full xl:w-2/5 no-print space-y-6">
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <UserCheck className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Dados do Aluno</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome Completo</label>
                <input className={inputClass} value={data.clientName} onChange={(e) => handleChange('clientName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} />
              </div>
              
              {/* Campos de endereço detalhados para corresponder ao ProtocolForm */}
              <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                 <p className="text-[10px] font-black uppercase text-[#d4af37] mb-4">Endereço</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>Rua / Logradouro</label>
                      <input className={inputClass} value={data.contract.street} onChange={(e) => handleChange('contract.street', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Número</label>
                      <input className={inputClass} value={data.contract.number} onChange={(e) => handleChange('contract.number', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Bairro</label>
                      <input className={inputClass} value={data.contract.neighborhood} onChange={(e) => handleChange('contract.neighborhood', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Cidade</label>
                      <input className={inputClass} value={data.contract.city} onChange={(e) => handleChange('contract.city', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>UF</label>
                      <input className={inputClass} value={data.contract.state} onChange={(e) => handleChange('contract.state', e.target.value)} maxLength={2} />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <Clock className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Período (Calculo Automático)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Data de Início (DD/MM/AAAA)</label>
                <input className={inputClass} value={data.contract.startDate} onChange={(e) => handleDateInput('contract.startDate', e.target.value)} placeholder="11/02/2026" maxLength={10} />
              </div>
              <div>
                <label className={labelClass}>Data de Término (DD/MM/AAAA)</label>
                <input className={inputClass} value={data.contract.endDate} onChange={(e) => handleDateInput('contract.endDate', e.target.value)} placeholder="11/05/2026" maxLength={10} />
              </div>
              <div className="md:col-span-2 bg-[#d4af37]/5 p-4 rounded-xl border border-[#d4af37]/20">
                 <p className="text-[10px] font-black uppercase text-[#d4af37] mb-1">Duração Estimada</p>
                 <p className="text-2xl font-black text-[#d4af37]">{data.contract.durationDays} dias</p>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <DollarSign className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Financeiro</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Valor Total (R$)</label>
                <input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} placeholder="289,00" />
              </div>
              <div>
                <label className={labelClass}>Extenso (Gerado)</label>
                <input className={inputClass + " bg-gray-100 italic"} value={data.contract.planValueWords} readOnly />
              </div>
              <div>
                <label className={labelClass}>Método</label>
                <select className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)}>
                   <option value="Pix">Pix</option>
                   <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <FileText className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Texto das Cláusulas</h2>
            </div>
            <textarea
              className="w-full h-80 p-6 bg-gray-50 border border-gray-100 rounded-3xl font-mono text-[10px] focus:ring-2 focus:ring-[#d4af37] outline-none"
              value={data.contract.contractBody}
              onChange={(e) => handleChange('contract.contractBody', e.target.value)}
            />
          </div>
        </div>

        <div className="w-full xl:w-3/5 flex justify-center bg-white/5 p-4 md:p-16 rounded-[4rem] border-2 border-dashed border-white/10 overflow-hidden">
           <div className="relative transform scale-[0.5] md:scale-[0.8] xl:scale-100 origin-top">
              <ContractPreview data={data} onBack={onBack} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractWorkspace;
