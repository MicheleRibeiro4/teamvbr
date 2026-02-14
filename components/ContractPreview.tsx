
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
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
    text = text.replace('[DURATION]', data.contract.durationDays || '______');
    text = text.replace('[START_DATE]', data.contract.startDate || '___/___/______');
    text = text.replace('[END_DATE]', data.contract.endDate || '___/___/______');
    text = text.replace('[VALUE]', data.contract.planValue || '________');
    text = text.replace('[VALUE_WORDS]', data.contract.planValueWords || '________________');
    text = text.replace('[PAYMENT_METHOD]', data.contract.paymentMethod || '________________');
    text = text.replace('[INSTALLMENTS]', data.contract.installments || '___');
    return text;
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    
    setIsGenerating(true);
    const element = contractRef.current;
    
    const opt = {
      margin: 0,
      filename: `Contrato_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const lineValue = (val: string, placeholder = "___________________________________________________________________") => 
    val ? <span className="font-bold underline decoration-gray-300 underline-offset-4">{val}</span> : placeholder;

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:p-0 pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-black/50 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/10 hover:bg-black/70 transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          {isGenerating ? 'Processando...' : 'Download Contrato PDF'}
        </button>

        <button 
          onClick={handlePrint}
          className="bg-white text-black px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] flex items-center gap-3 border border-gray-200"
        >
          <Printer size={18} /> Imprimir Rápido
        </button>
      </div>

      <div ref={contractRef} className="bg-white p-[2cm] shadow-2xl w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-relaxed text-[10.5pt] print:shadow-none print:m-0 print:w-[210mm] print:h-auto overflow-hidden">
        
        {/* CONTEÚDO DO CONTRATO (REDUZIDO PARA EXEMPLO DE LOGICA DE PDF) */}
        <div className="w-full text-center mb-10">
          <h1 className="font-bold text-[12pt] uppercase tracking-wide">
            CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
          </h1>
        </div>

        <div className="mb-6 space-y-2">
          <h2 className="font-bold uppercase mb-4">CONTRATANTE:</h2>
          <div className="space-y-1">
            <p>Nome: {lineValue(data.clientName)}</p>
            <p>CPF: {lineValue(data.contract.cpf)}</p>
            <p>E-mail: {lineValue(data.contract.email)}</p>
            <p>Endereço: {lineValue(data.contract.address)}</p>
          </div>
        </div>

        <div className="whitespace-pre-line text-justify mb-10 leading-[1.6]">
          {renderContractText()}
        </div>

        <div className="mt-20 space-y-12 avoid-break">
           <div className="flex flex-col gap-4">
              <p><span className="font-bold">Cidade:</span> {lineValue(data.contract.city || "Vespasiano - MG")}</p>
              <p><span className="font-bold">Data:</span> {lineValue(data.contract.contractDate)}</p>
           </div>
           <div className="grid grid-cols-1 gap-16 mt-16">
              <div className="space-y-4">
                 <h2 className="font-bold uppercase">CONTRATANTE:</h2>
                 <div className="w-full border-b border-black pt-12"></div>
                 <p className="font-bold uppercase">{data.clientName}</p>
              </div>
              <div className="space-y-4">
                 <h2 className="font-bold uppercase">CONTRATADO:</h2>
                 <div className="w-full border-b border-black pt-12"></div>
                 <p className="font-bold uppercase">{data.consultantName}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
