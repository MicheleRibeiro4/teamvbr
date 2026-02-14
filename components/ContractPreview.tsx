
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { CONSULTANT_DEFAULT, EMPTY_DATA } from '../constants';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ContractPreview: React.FC<Props> = ({ data, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const renderPaymentOptions = () => {
    const method = data.contract.paymentMethod;
    const installments = data.contract.installments;
    
    return `
(${method === 'Pix' ? 'x' : ' '}) Pix (à vista)
(${method === 'Cartão de Crédito' ? 'x' : ' '}) Cartão de crédito – parcelado em ${method === 'Cartão de Crédito' ? installments : '__'}x`;
  };

  const renderContractText = () => {
    // IMPORTANTE: Fallback para o template padrão caso contractBody esteja vazio (ex: dados antigos)
    let text = data.contract.contractBody;
    
    if (!text || text.trim() === '') {
       // Pega o template do objeto vazio padrão para usar como base se não houver texto salvo
       text = EMPTY_DATA.contract.contractBody || '';
    }

    const map = {
      '[START_DATE]': data.contract.startDate,
      '[END_DATE]': data.contract.endDate,
      '[VALUE]': data.contract.planValue,
      '[VALUE_WORDS]': data.contract.planValueWords,
      '[DURATION]': data.contract.durationDays,
      '[PAYMENT_OPTIONS_PLACEHOLDER]': renderPaymentOptions()
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
      image: { type: 'jpeg', quality: 1.0 },
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

  const street = data.contract.street || '';
  const number = data.contract.number || 'SN';
  const neighbor = data.contract.neighborhood || '';
  const city = data.contract.city || '';
  const state = data.contract.state || '';
  
  const detailedAddress = `${street}, ${number} - ${neighbor}, ${city}/${state}`;
  const fullAddress = street ? detailedAddress : (data.contract.address || '__________________________________________________');

  return (
    <div className="flex flex-col items-center w-full bg-transparent pb-20 print:pb-0">
      <div className="no-print fixed bottom-8 right-8 z-[100]">
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95">
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} 
          {isGenerating ? 'Processando...' : 'Baixar Contrato'}
        </button>
      </div>

      <div ref={contractRef} className="bg-white p-[20mm] w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-[1.5] text-[10pt] shadow-2xl print:shadow-none overflow-hidden text-justify">
        <div className="mb-8">
          <h1 className="font-bold text-center text-sm mb-6 uppercase">CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL</h1>
          
          <div className="mb-4">
            <p className="font-bold mb-1">CONTRATANTE:</p>
            <p>Nome: {data.clientName || '____________________'}</p>
            <p>CPF: {data.contract.cpf || '____________________'}</p>
            <p>Telefone: {data.contract.phone || '____________________'}</p>
            <p>Endereço: {fullAddress}</p>
          </div>

          <div className="mb-6">
            <p className="font-bold mb-1">CONTRATADO:</p>
            <p>Nome: {CONSULTANT_DEFAULT.consultantName}</p>
            <p>CPF: {CONSULTANT_DEFAULT.consultantCpf}</p>
            <p>E-mail: {CONSULTANT_DEFAULT.consultantEmail}</p>
            <p>Endereço: {CONSULTANT_DEFAULT.consultantAddress}</p>
          </div>

          <p className="mb-6">As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:</p>
        </div>

        <div className="whitespace-pre-wrap mb-10">
          {renderContractText()}
        </div>

        <p className="mb-12">
          E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus jurídicos e legais efeitos.
        </p>

        <div className="mb-12">
           <p>Cidade: {data.contract.city || 'Vespasiano'} - {data.contract.state || 'MG'}</p>
           <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="mt-8 space-y-12">
          <div>
            <p className="font-bold mb-4">CONTRATANTE:</p>
            <div className="border-b border-black w-2/3 mb-1"></div>
            <p>Assinatura</p>
            <p>Nome completo: {data.clientName}</p>
            <p>CPF: {data.contract.cpf}</p>
          </div>
          
          <div>
            <p className="font-bold mb-4">CONTRATADO:</p>
            <div className="border-b border-black w-2/3 mb-1"></div>
            <p>Assinatura</p>
            <p>{CONSULTANT_DEFAULT.consultantName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
