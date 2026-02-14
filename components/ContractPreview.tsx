
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
    text = text.replace('[DURATION]', data.contract.durationDays || '90');
    text = text.replace('[START_DATE]', data.contract.startDate || '___/___/______');
    text = text.replace('[END_DATE]', data.contract.endDate || '___/___/______');
    text = text.replace('[VALUE]', data.contract.planValue || '0,00');
    text = text.replace('[VALUE_WORDS]', data.contract.planValueWords || '________________');
    text = text.replace('[PAYMENT_METHOD]', data.contract.paymentMethod || 'Pix');
    text = text.replace('[INSTALLMENTS]', data.contract.installments || '1');
    return text;
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsGenerating(true);
    
    // Configurações para evitar branco e escala errada
    const opt = {
      margin: 0,
      filename: `Contrato_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        backgroundColor: '#ffffff',
        windowWidth: 1000 // Garante largura fixa para renderização correta
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(contractRef.current).save();
    } catch (err) {
      console.error("Erro PDF:", err);
      alert("Houve um erro ao processar o contrato.");
    } finally {
      setIsGenerating(false);
    }
  };

  const lineValue = (val: string, placeholder = "________________________________________________") => 
    val ? <span className="font-bold underline decoration-gray-300 underline-offset-4">{val}</span> : placeholder;

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:p-0 pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button onClick={onBack} className="bg-black/50 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/10 hover:bg-black/70 transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10 disabled:opacity-50">
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          {isGenerating ? 'Gerando...' : 'Download Contrato PDF'}
        </button>
        <button onClick={() => window.print()} className="bg-white text-black px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] flex items-center gap-3 border border-gray-200">
          <Printer size={18} /> Imprimir Rápido
        </button>
      </div>

      <div ref={contractRef} className="bg-white p-[2cm] shadow-2xl w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-relaxed text-[10pt] print:shadow-none print:m-0 print:w-[210mm] overflow-hidden">
        
        {/* TÍTULO CENTRALIZADO */}
        <div className="w-full text-center mb-10">
          <h1 className="font-bold text-[13pt] uppercase tracking-wide border-b-2 border-black pb-2 inline-block">
            CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
          </h1>
        </div>

        <div className="mb-10 space-y-6">
          <div>
            <h2 className="font-bold uppercase mb-2">CONTRATANTE (ALUNO):</h2>
            <div className="space-y-1 pl-4 border-l-2 border-gray-200">
              <p><span className="font-bold">Nome:</span> {lineValue(data.clientName)}</p>
              <p><span className="font-bold">CPF:</span> {lineValue(data.contract.cpf)}</p>
              <p><span className="font-bold">E-mail:</span> {lineValue(data.contract.email)}</p>
              <p><span className="font-bold">Endereço:</span> {lineValue(data.contract.address)}</p>
            </div>
          </div>

          <div>
            <h2 className="font-bold uppercase mb-2">CONTRATADO (COACH):</h2>
            <div className="space-y-1 pl-4 border-l-2 border-gray-200">
              <p><span className="font-bold">Nome:</span> {CONSULTANT_DEFAULT.consultantName}</p>
              <p><span className="font-bold">CPF:</span> {CONSULTANT_DEFAULT.consultantCpf}</p>
              <p><span className="font-bold">E-mail:</span> {CONSULTANT_DEFAULT.consultantEmail}</p>
              <p><span className="font-bold">Endereço:</span> {CONSULTANT_DEFAULT.consultantAddress}</p>
            </div>
          </div>
        </div>

        {/* CORPO DO TEXTO JUSTIFICADO */}
        <div className="whitespace-pre-line text-justify mb-16 leading-[1.8] text-[9.5pt]">
          {renderContractText()}
        </div>

        {/* CAMPOS DE ASSINATURA AO FINAL */}
        <div className="mt-12 space-y-10 avoid-break pt-8 border-t border-gray-100">
           <div className="flex flex-col gap-1">
              <p><span className="font-bold">Local:</span> Vespasiano, Minas Gerais</p>
              <p><span className="font-bold">Data:</span> {data.contract.contractDate || new Date().toLocaleDateString('pt-BR')}</p>
           </div>

           <div className="grid grid-cols-2 gap-16 mt-20 pt-10">
              <div className="text-center">
                 <div className="border-t-2 border-black mb-2"></div>
                 <p className="font-black uppercase text-[8pt] tracking-widest">Contratante (Aluno)</p>
                 <p className="text-[7pt] text-gray-400 mt-1">{data.clientName || 'Assinatura do Aluno'}</p>
              </div>
              <div className="text-center">
                 <div className="border-t-2 border-black mb-2"></div>
                 <p className="font-black uppercase text-[8pt] tracking-widest">Contratado (Coach)</p>
                 <p className="text-[7pt] text-gray-400 mt-1">{CONSULTANT_DEFAULT.consultantName}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
