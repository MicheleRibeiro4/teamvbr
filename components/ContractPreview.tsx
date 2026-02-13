
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
    <div className="flex flex-col items-center bg-white p-12 md:p-16 shadow-2xl w-[210mm] min-h-[297mm] mx-auto text-black leading-[1.6] font-sans text-[12px] print:shadow-none print:m-0">
      
      {/* TÍTULO */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-center font-bold text-[14px] uppercase tracking-tight mb-8">
          CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
        </h1>
      </div>

      <div className="w-full space-y-6">
        {/* QUALIFICAÇÃO CONTRATANTE */}
        <section className="avoid-break">
          <h2 className="font-bold uppercase border-b border-gray-100 pb-1 mb-2">CONTRATANTE:</h2>
          <div className="grid grid-cols-2 gap-y-1">
            <p><span className="font-bold">Nome:</span> {data.clientName || "________________________________"}</p>
            <p><span className="font-bold">CPF:</span> {data.contract.cpf || "________________________________"}</p>
            <p><span className="font-bold">Telefone:</span> {data.contract.phone || "________________________________"}</p>
            <p><span className="font-bold">E-mail:</span> {data.contract.email || "________________________________"}</p>
            <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.contract.address || "________________________________"}</p>
          </div>
        </section>

        {/* QUALIFICAÇÃO CONTRATADO */}
        <section className="avoid-break">
          <h2 className="font-bold uppercase border-b border-gray-100 pb-1 mb-2">CONTRATADO:</h2>
          <div className="grid grid-cols-2 gap-y-1">
            <p><span className="font-bold">Nome:</span> {data.consultantName}</p>
            <p><span className="font-bold">CPF:</span> {data.consultantCpf}</p>
            <p><span className="font-bold">E-mail:</span> {data.consultantEmail}</p>
            <p className="col-span-2"><span className="font-bold">Endereço:</span> {data.consultantAddress}</p>
          </div>
        </section>

        <p className="mt-4 text-justify avoid-break">
          As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:
        </p>

        {/* CORPO DAS CLÁUSULAS - FLUIDO */}
        <div className="whitespace-pre-line text-justify space-y-4">
          {renderContractText()}
        </div>

        {/* ASSINATURAS FINAIS */}
        <div className="pt-12 space-y-10 avoid-break">
          <p className="text-justify">
            E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus jurídicos e legais efeitos.
          </p>
          
          <div className="flex gap-8">
            <p><span className="font-bold">Cidade:</span> {data.contract.city}</p>
            <p><span className="font-bold">Data:</span> {data.contract.contractDate}</p>
          </div>

          <div className="grid grid-cols-2 gap-20 pt-16">
            <div className="text-center">
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[10px]">CONTRATANTE</p>
                <p className="text-[11px] mt-1">{data.clientName}</p>
                <p className="text-[10px] text-gray-500">CPF: {data.contract.cpf}</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[10px]">CONTRATADO</p>
                <p className="text-[11px] mt-1">{data.consultantName}</p>
                <p className="text-[10px] text-gray-500">CPF: {data.consultantCpf}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;