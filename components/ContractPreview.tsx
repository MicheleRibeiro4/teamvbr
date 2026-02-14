
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { CONSULTANT_DEFAULT } from '../constants';
import { ChevronLeft, Printer, Download, Loader2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ContractPreview: React.FC<Props> = ({ data, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const renderContractText = () => {
    let text = data.contract.contractBody || '';
    const map = {
      '[START_DATE]': data.contract.startDate,
      '[END_DATE]': data.contract.endDate,
      '[VALUE]': data.contract.planValue,
      '[VALUE_WORDS]': data.contract.planValueWords,
      '[PAYMENT_METHOD]': data.contract.paymentMethod,
      '[INSTALLMENTS]': data.contract.installments,
    };
    Object.entries(map).forEach(([key, val]) => {
      text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || '__________');
    });
    return text;
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsGenerating(true);
    const opt = {
      margin: 15,
      filename: `Contrato_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      html2canvas: { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(contractRef.current).save();
    } catch (err) {
      alert("Erro ao gerar PDF.");
    } finally { setIsGenerating(false); }
  };

  const lineValue = (val: string) => val ? <span className="font-black border-b border-black/20 pb-0.5">{val}</span> : "____________________";

  return (
    <div className="flex flex-col items-center w-full bg-transparent pb-20 print:pb-0">
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-2xl font-black uppercase text-xs flex items-center gap-3">
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} Baixar Contrato HD
        </button>
      </div>

      <div ref={contractRef} className="bg-white p-[2cm] w-[210mm] min-h-[297mm] mx-auto text-black font-serif leading-[1.6] text-[10.5pt] shadow-2xl print:shadow-none overflow-hidden">
        <div className="text-center mb-12 border-b-2 border-black pb-4">
          <h1 className="font-black text-xl uppercase tracking-tighter">Instrumento Particular de Contratação de Assessoria</h1>
        </div>

        <div className="space-y-6 mb-12">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h2 className="font-black uppercase mb-3 text-xs tracking-widest text-[#d4af37]">I. Contratante (Aluno)</h2>
            <div className="grid grid-cols-1 gap-1">
              <p>Nome: {lineValue(data.clientName)}</p>
              <p>CPF: {lineValue(data.contract.cpf)}</p>
              <p>Endereço: {lineValue(data.contract.address)}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h2 className="font-black uppercase mb-3 text-xs tracking-widest text-[#d4af37]">II. Contratado (Consultor)</h2>
            <div className="grid grid-cols-1 gap-1">
              <p>Nome: {lineValue(CONSULTANT_DEFAULT.consultantName)}</p>
              <p>CPF: {lineValue(CONSULTANT_DEFAULT.consultantCpf)}</p>
              <p>Sede: {lineValue(CONSULTANT_DEFAULT.consultantAddress)}</p>
            </div>
          </div>
        </div>

        <div className="text-justify whitespace-pre-line mb-20 italic">
          {renderContractText()}
        </div>

        <div className="mt-20 space-y-20 avoid-break">
           <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="font-black">Local e Data:</p>
                <p>Vespasiano, {data.contract.contractDate || new Date().toLocaleDateString('pt-BR')}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-20 pt-10">
              <div className="text-center">
                 <div className="border-t border-black mb-2"></div>
                 <p className="font-black text-[9pt] uppercase tracking-widest">Contratante</p>
                 <p className="text-[7pt] text-gray-500">{data.clientName || 'Assinatura Digital'}</p>
              </div>
              <div className="text-center">
                 <div className="border-t border-black mb-2"></div>
                 <p className="font-black text-[9pt] uppercase tracking-widest">Contratado</p>
                 <p className="text-[7pt] text-gray-500">{CONSULTANT_DEFAULT.consultantName}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
