
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
            className="bg-black/50 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/10 hover:bg-black/70 transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar ao Painel
          </button>
        )}
        <button 
          onClick={handlePrint}
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3"
        >
          <Printer size={20} /> Imprimir Contrato
        </button>
      </div>

      <div className="flex flex-col items-center bg-white p-[1.5cm] shadow-2xl w-[210mm] min-h-[297mm] h-auto mx-auto text-black leading-[1.4] font-sans text-[11px] print:shadow-none print:m-0 print:w-[210mm] print:h-auto mb-10 print:mb-0 overflow-hidden">
        
        {/* TÍTULO */}
        <div className="w-full flex flex-col items-center mb-8">
          <h1 className="text-center font-bold text-[14px] uppercase tracking-tight mb-6">
            CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
          </h1>
        </div>

        <div className="w-full space-y-6">
          {/* QUALIFICAÇÕES */}
          <div className="grid grid-cols-1 gap-4">
            <section className="avoid-break bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h2 className="font-bold uppercase border-b border-gray-200 pb-2 mb-3 text-[#d4af37] text-[10px]">CONTRATANTE (ALUNO):</h2>
              <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                <p><span className="font-bold">Nome:</span> {data.clientName || "_________________________"}</p>
                <p><span className="font-bold">CPF:</span> {data.contract.cpf || "_________________________"}</p>
                <p><span className="font-bold">Fone:</span> {data.contract.phone || "_________________________"}</p>
                <p><span className="font-bold">Email:</span> {data.contract.email || "_________________________"}</p>
                <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.contract.address || "_________________________"}</p>
              </div>
            </section>

            <section className="avoid-break bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h2 className="font-bold uppercase border-b border-gray-200 pb-2 mb-3 text-[#d4af37] text-[10px]">CONTRATADO (CONSULTOR):</h2>
              <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                <p><span className="font-bold">Nome:</span> {data.consultantName}</p>
                <p><span className="font-bold">CPF:</span> {data.consultantCpf}</p>
                <p><span className="font-bold">Email:</span> {data.consultantEmail}</p>
                <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.consultantAddress}</p>
              </div>
            </section>
          </div>

          <p className="mt-2 text-justify avoid-break italic font-medium">
            As partes celebram o presente contrato, mediante as seguintes cláusulas:
          </p>

          {/* CORPO DAS CLÁUSULAS - TEXTO REDUZIDO PARA ENCAIXE */}
          <div className="whitespace-pre-line text-justify space-y-4 text-[10px] leading-snug">
            {renderContractText()}
          </div>

          {/* ASSINATURAS */}
          <div className="pt-10 space-y-8 avoid-break">
            <div className="flex justify-between items-center border-t border-b border-gray-100 py-3">
              <p><span className="font-bold">Local:</span> {data.contract.city}</p>
              <p><span className="font-bold">Data:</span> {data.contract.contractDate}</p>
            </div>

            <div className="grid grid-cols-2 gap-20 pt-8">
              <div className="text-center">
                <div className="border-t border-black pt-2">
                  <p className="font-bold uppercase text-[9px]">CONTRATANTE</p>
                  <p className="text-[11px] mt-1 font-black">{data.clientName}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-t border-black pt-2">
                  <p className="font-bold uppercase text-[9px]">CONTRATADO</p>
                  <p className="text-[11px] mt-1 font-black">{data.consultantName}</p>
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
