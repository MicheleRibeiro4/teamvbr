
import React, { useEffect } from 'react';
import { ProtocolData } from '../types';
import { DollarSign, UserCheck, Clock, FileText } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onChange: (data: ProtocolData) => void;
}

const ContractForm: React.FC<Props> = ({ data, onChange }) => {
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
    
    if (n > 0 || res === "") res += conv(n);
    res += (n === 1 && res === "um") ? " real" : " reais";
    if (c > 0) res += " e " + conv(c) + (c === 1 ? " centavo" : " centavos");

    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  useEffect(() => {
    if (data.contract.startDate && data.contract.endDate) {
      const partsStart = data.contract.startDate.split('/');
      const partsEnd = data.contract.endDate.split('/');
      if (partsStart.length === 3 && partsEnd.length === 3) {
        const d1 = new Date(Number(partsStart[2]), Number(partsStart[1]) - 1, Number(partsStart[0]));
        const d2 = new Date(Number(partsEnd[2]), Number(partsEnd[1]) - 1, Number(partsEnd[0]));
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays) && diffDays > 0 && data.contract.durationDays !== diffDays.toString()) {
          handleChange('contract.durationDays', diffDays.toString());
        }
      }
    }

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
  }, [data.contract.startDate, data.contract.endDate, data.contract.planValue]);

  const labelClass = "block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-widest";
  const inputClass = "w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all";
  const sectionHeaderClass = "flex items-center gap-2 mb-8 border-b border-white/5 pb-4";

  return (
    <div className="space-y-10">
      <section>
        <div className={sectionHeaderClass}>
          <UserCheck className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados Jurídicos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>CPF</label><input className={inputClass} value={data.contract.cpf} onChange={(e) => handleChange('contract.cpf', e.target.value)} /></div>
          <div><label className={labelClass}>Telefone</label><input className={inputClass} value={data.contract.phone} onChange={(e) => handleChange('contract.phone', e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>E-mail</label><input className={inputClass} value={data.contract.email} onChange={(e) => handleChange('contract.email', e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Endereço Completo</label><input className={inputClass} value={data.contract.address} onChange={(e) => handleChange('contract.address', e.target.value)} /></div>
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <Clock className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Vigência</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Início (DD/MM/AAAA)</label><input className={inputClass} value={data.contract.startDate} onChange={(e) => handleChange('contract.startDate', e.target.value)} /></div>
          <div><label className={labelClass}>Fim (DD/MM/AAAA)</label><input className={inputClass} value={data.contract.endDate} onChange={(e) => handleChange('contract.endDate', e.target.value)} /></div>
        </div>
      </section>

      <section>
        <div className={sectionHeaderClass}>
          <DollarSign className="text-[#d4af37]" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Financeiro</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Valor Total (R$)</label><input className={inputClass} value={data.contract.planValue} onChange={(e) => handleChange('contract.planValue', e.target.value)} /></div>
          <div><label className={labelClass}>Método</label><input className={inputClass} value={data.contract.paymentMethod} onChange={(e) => handleChange('contract.paymentMethod', e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Por Extenso</label><input className={inputClass + " italic opacity-50"} value={data.contract.planValueWords} readOnly /></div>
        </div>
      </section>
    </div>
  );
};

export default ContractForm;
