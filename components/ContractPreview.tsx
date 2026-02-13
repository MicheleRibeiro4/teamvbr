
import React from 'react';
import { ProtocolData } from '../types';

interface Props {
  data: ProtocolData;
}

const ContractPreview: React.FC<Props> = ({ data }) => {
  const LOGO_URL = "https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png";

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
    <div className="flex flex-col items-center bg-white p-12 md:p-16 shadow-2xl max-w-[850px] w-full text-black leading-[1.4] font-sans text-[12px] min-h-[1150px]">
      
      {/* TÍTULO */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-center font-bold text-[14px] uppercase tracking-tight mb-8">
          CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL
        </h1>
      </div>

      <div className="w-full space-y-4">
        {/* QUALIFICAÇÃO CONTRATANTE */}
        <section>
          <h2 className="font-bold uppercase">CONTRATANTE:</h2>
          <div className="space-y-0.5">
            <p><span className="font-bold">Nome:</span> {data.clientName || "________________________________"}</p>
            <p><span className="font-bold">CPF:</span> {data.contract.cpf || "________________________________"}</p>
            <p><span className="font-bold">Telefone:</span> {data.contract.phone || "________________________________"}</p>
            <p><span className="font-bold">E-mail:</span> {data.contract.email || "________________________________"}</p>
            <p><span className="font-bold">Endereço:</span> {data.contract.address || "________________________________"}</p>
          </div>
        </section>

        {/* QUALIFICAÇÃO CONTRATADO */}
        <section>
          <h2 className="font-bold uppercase">CONTRATADO:</h2>
          <div className="space-y-0.5">
            <p><span className="font-bold">Nome:</span> {data.consultantName}</p>
            <p><span className="font-bold">CPF:</span> {data.consultantCpf}</p>
            <p><span className="font-bold">E-mail:</span> {data.consultantEmail}</p>
            <p><span className="font-bold">Endereço:</span> {data.consultantAddress}</p>
          </div>
        </section>

        <p className="mt-4 text-justify">
          As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:
        </p>

        {/* CORPO DAS CLÁUSULAS */}
        <div className="whitespace-pre-line text-justify space-y-4">
          {renderContractText()}
        </div>

        {/* ASSINATURAS FINAIS */}
        <div className="pt-8 space-y-8">
          <p className="text-justify">
            E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus jurídicos e legais efeitos.
          </p>
          
          <div className="space-y-1">
            <p><span className="font-bold">Cidade:</span> {data.contract.city}</p>
            <p><span className="font-bold">Data:</span> {data.contract.contractDate}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
            <div className="max-w-xs">
              <p className="font-bold uppercase mb-1">CONTRATANTE:</p>
              <p className="text-[11px] mb-6">Assinatura: ________________________________</p>
              <p className="text-[11px]"><span className="font-bold">Nome completo:</span> {data.clientName}</p>
              <p className="text-[11px]"><span className="font-bold">CPF:</span> {data.contract.cpf}</p>
            </div>
            
            <div className="max-w-xs">
              <p className="font-bold uppercase mb-1">CONTRATADO:</p>
              <p className="text-[11px] mb-6">Assinatura: ________________________________</p>
              <p className="text-[11px] font-bold">{data.consultantName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
