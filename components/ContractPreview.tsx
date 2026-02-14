
import React from 'react';
import { ProtocolData } from '../types';
import { ChevronLeft, Printer } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ContractPreview: React.FC<Props> = ({ data, onBack }) => {
  const renderContractText = () => {
    let text = data.contract.contractBody || '';
    text = text.replace('[DURATION]', data.contract.durationDays);
    text = text.replace('[START_DATE]', data.contract.startDate);
    text = text.replace('[END_DATE]', data.contract.endDate);
    text = text.replace('[VALUE]', data.contract.planValue);
    text = text.replace('[VALUE_WORDS]', data.contract.planValueWords);
    text = text.replace('[PAYMENT_METHOD]', data.contract.paymentMethod);
    text = text.replace('[INSTALLMENTS]', data.contract.installments);
    return text;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:p-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/10 hover:bg-black/70 transition-all font-black uppercase text-[9px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={14} /> Voltar ao Painel
          </button>
        )}
        <button 
          onClick={handlePrint}
          className="bg-[#d4af37] text-black px-6 py-4 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] flex items-center gap-2"
        >
          <Printer size={18} /> Imprimir Contrato
        </button>
      </div>

      <div className="flex flex-col items-center bg-white p-[1cm] shadow-2xl w-[210mm] min-h-[293mm] h-auto mx-auto text-black leading-[1.2] font-sans text-[9.5px] print:shadow-none print:m-0 print:w-[210mm] print:h-auto mb-0 print:mb-0 overflow-hidden">
        
        {/* TÍTULO */}
        <div className="w-full flex flex-col items-center mb-4">
          <h1 className="text-center font-bold text-[12px] uppercase tracking-tight mb-3">
            CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
          </h1>
        </div>

        <div className="w-full space-y-4">
          {/* QUALIFICAÇÕES */}
          <div className="grid grid-cols-1 gap-2">
            <section className="avoid-break bg-gray-50 p-3 rounded-xl border border-gray-100">
              <h2 className="font-bold uppercase border-b border-gray-200 pb-1 mb-1.5 text-[#d4af37] text-[9px]">CONTRATANTE (ALUNO):</h2>
              <div className="grid grid-cols-2 gap-y-0.5 gap-x-4">
                <p><span className="font-bold">Nome:</span> {data.clientName || "_________________________"}</p>
                <p><span className="font-bold">CPF:</span> {data.contract.cpf || "_________________________"}</p>
                <p><span className="font-bold">Fone:</span> {data.contract.phone || "_________________________"}</p>
                <p><span className="font-bold">Email:</span> {data.contract.email || "_________________________"}</p>
              </div>
            </section>

            <section className="avoid-break bg-gray-50 p-3 rounded-xl border border-gray-100">
              <h2 className="font-bold uppercase border-b border-gray-200 pb-1 mb-1.5 text-[#d4af37] text-[9px]">CONTRATADO (CONSULTOR):</h2>
              <div className="grid grid-cols-2 gap-y-0.5 gap-x-4">
                <p><span className="font-bold">Nome:</span> {data.consultantName}</p>
                <p><span className="font-bold">CPF:</span> {data.consultantCpf}</p>
                <p><span className="font-bold">Cidade:</span> {data.contract.city}</p>
              </div>
            </section>
          </div>

          {/* CORPO DAS CLÁUSULAS */}
          <div className="whitespace-pre-line text-justify space-y-2 text-[8.5px] leading-tight opacity-90">
            {renderContractText()}
          </div>

          {/* ASSINATURAS */}
          <div className="pt-6 space-y-6 avoid-break">
            <div className="flex justify-between items-center border-t border-b border-gray-100 py-2">
              <p><span className="font-bold">Local/Data:</span> {data.contract.city}, {data.contract.contractDate}</p>
            </div>

            <div className="grid grid-cols-2 gap-16 pt-4">
              <div className="text-center">
                <div className="border-t border-black pt-1.5">
                  <p className="font-bold uppercase text-[8px]">CONTRATANTE</p>
                  <p className="text-[9px] mt-0.5 font-black">{data.clientName}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-t border-black pt-1.5">
                  <p className="font-bold uppercase text-[8px]">CONTRATADO</p>
                  <p className="text-[9px] mt-0.5 font-black">{data.consultantName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
