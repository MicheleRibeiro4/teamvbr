
import React from 'react';
import { ProtocolData } from '../types';

interface Props {
  data: ProtocolData;
}

const ContractPreview: React.FC<Props> = ({ data }) => {
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

  return (
    <div className="flex flex-col items-center bg-white p-[2cm] shadow-2xl w-[210mm] min-h-[297mm] h-auto mx-auto text-black leading-[1.6] font-sans text-[12px] print:shadow-none print:m-0 print:w-[210mm] print:h-auto overflow-hidden">
      
      {/* TÍTULO */}
      <div className="w-full flex flex-col items-center mb-12">
        <h1 className="text-center font-bold text-[16px] uppercase tracking-tight mb-8">
          CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
        </h1>
      </div>

      <div className="w-full space-y-8">
        {/* QUALIFICAÇÃO CONTRATANTE */}
        <section className="avoid-break bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="font-bold uppercase border-b border-gray-200 pb-2 mb-4 text-[#d4af37]">CONTRATANTE (ALUNO):</h2>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            <p><span className="font-bold">Nome:</span> {data.clientName || "_________________________"}</p>
            <p><span className="font-bold">CPF:</span> {data.contract.cpf || "_________________________"}</p>
            <p><span className="font-bold">Telefone:</span> {data.contract.phone || "_________________________"}</p>
            <p><span className="font-bold">E-mail:</span> {data.contract.email || "_________________________"}</p>
            <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.contract.address || "_________________________"}</p>
          </div>
        </section>

        {/* QUALIFICAÇÃO CONTRATADO */}
        <section className="avoid-break bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="font-bold uppercase border-b border-gray-200 pb-2 mb-4 text-[#d4af37]">CONTRATADO (CONSULTOR):</h2>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            <p><span className="font-bold">Nome:</span> {data.consultantName}</p>
            <p><span className="font-bold">CPF:</span> {data.consultantCpf}</p>
            <p><span className="font-bold">E-mail:</span> {data.consultantEmail}</p>
            <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.consultantAddress}</p>
          </div>
        </section>

        <p className="mt-4 text-justify avoid-break italic font-medium">
          As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:
        </p>

        {/* CORPO DAS CLÁUSULAS */}
        <div className="whitespace-pre-line text-justify space-y-6 text-[11px]">
          {renderContractText()}
        </div>

        {/* ASSINATURAS FINAIS */}
        <div className="pt-16 space-y-12 avoid-break">
          <div className="flex justify-between items-center border-t border-b border-gray-100 py-4">
            <p><span className="font-bold">Local:</span> {data.contract.city}</p>
            <p><span className="font-bold">Data:</span> {data.contract.contractDate}</p>
          </div>

          <div className="grid grid-cols-2 gap-24 pt-12">
            <div className="text-center">
              <div className="border-t-2 border-black pt-4">
                <p className="font-bold uppercase text-[10px]">CONTRATANTE</p>
                <p className="text-[12px] mt-1 font-black">{data.clientName}</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="border-t-2 border-black pt-4">
                <p className="font-bold uppercase text-[10px]">CONTRATADO</p>
                <p className="text-[12px] mt-1 font-black">{data.consultantName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
