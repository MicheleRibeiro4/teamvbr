
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

  const renderContractText = () => {
    let text = data.contract.contractBody;
    
    if (!text || text.trim() === '') {
       text = EMPTY_DATA.contract.contractBody || '';
    }

    // Formata o método de pagamento para exibição
    const paymentMethodDisplay = data.contract.paymentMethod === 'Pix' 
      ? 'Pix (à vista)' 
      : data.contract.paymentMethod;

    const map = {
      '[START_DATE]': data.contract.startDate,
      '[END_DATE]': data.contract.endDate,
      '[VALUE]': data.contract.planValue,
      '[VALUE_WORDS]': data.contract.planValueWords,
      '[DURATION]': data.contract.durationDays,
      '[PAYMENT_METHOD]': paymentMethodDisplay, // Substitui diretamente pelo valor
      '[PAYMENT_OPTIONS_PLACEHOLDER]': paymentMethodDisplay // Mantém compatibilidade com templates antigos
    };

    Object.entries(map).forEach(([key, val]) => {
      text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || '__________');
    });

    // --- LIMPEZA DE ARTEFATOS ANTIGOS (Boleto/Outro) ---
    // Remove linhas específicas que podem ter ficado salvas em contratos antigos
    text = text.replace(/\(\s*\)\s*Boleto bancário/gi, "");
    text = text.replace(/\(\s*\)\s*Outro:[\s_]*/gi, "");
    
    // Remove quebras de linha excessivas geradas pela remoção acima
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

    return text;
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsGenerating(true);
    
    const opt = {
      margin: [15, 15, 15, 15], // Margens [Topo, Esq, Inf, Dir] para evitar corte
      filename: `Contrato_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollY: 0, 
        // windowWidth removido para deixar o html2canvas calcular a largura baseada no elemento
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Configuração inteligente de quebra de página para evitar cortes no meio do texto
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(contractRef.current).save();
    } catch (err) {
      alert("Erro ao gerar PDF.");
      console.error(err);
    } finally { 
      setIsGenerating(false); 
    }
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

      {/* Container com largura fixa para preview, mas altura automática para não cortar */}
      <div ref={contractRef} className="bg-white text-black p-[15mm] w-[210mm] mx-auto font-sans leading-[1.6] text-[10pt] shadow-2xl print:shadow-none print:w-full h-auto min-h-[297mm]">
        <div className="mb-8">
          <h1 className="font-bold text-center text-sm mb-6 uppercase">CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL</h1>
          
          <div className="mb-4 text-justify">
            <p className="font-bold mb-1">CONTRATANTE:</p>
            <p>Nome: {data.clientName || '____________________'}</p>
            <p>CPF: {data.contract.cpf || '____________________'}</p>
            <p>Telefone: {data.contract.phone || '____________________'}</p>
            <p>Endereço: {fullAddress}</p>
          </div>

          <div className="mb-6 text-justify">
            <p className="font-bold mb-1">CONTRATADO:</p>
            <p>Nome: {CONSULTANT_DEFAULT.consultantName}</p>
            <p>CPF: {CONSULTANT_DEFAULT.consultantCpf}</p>
            <p>E-mail: {CONSULTANT_DEFAULT.consultantEmail}</p>
            <p>Endereço: {CONSULTANT_DEFAULT.consultantAddress}</p>
          </div>

          <p className="mb-6 text-justify">As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:</p>
        </div>

        {/* whitespace-pre-wrap mantém a formatação, mas permite quebra de linha */}
        <div className="whitespace-pre-wrap mb-10 text-justify">
          {renderContractText()}
        </div>

        <div className="html2pdf__page-break"></div>

        <p className="mb-12 text-justify">
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
