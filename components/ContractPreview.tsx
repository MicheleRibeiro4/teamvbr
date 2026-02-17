
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ProtocolData } from '../types';
import { CONSULTANT_DEFAULT, EMPTY_DATA } from '../constants';
import { Download, Loader2, FileText, Maximize2, X, FileDown, ShieldCheck } from 'lucide-react';

export interface ContractPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  onBack?: () => void;
  hideFloatingButton?: boolean;
}

const ContractPreview = forwardRef<ContractPreviewHandle, Props>(({ data, onBack, hideFloatingButton }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const getCleanContractText = () => {
    let text = data.contract.contractBody;
    
    if (!text || text.trim() === '') {
       text = EMPTY_DATA.contract.contractBody || '';
    }

    const paymentMethodDisplay = data.contract.paymentMethod === 'Pix' ? 'Pix (à vista)' : data.contract.paymentMethod;

    const map = {
      '[START_DATE]': data.contract.startDate,
      '[END_DATE]': data.contract.endDate,
      '[VALUE]': data.contract.planValue,
      '[VALUE_WORDS]': data.contract.planValueWords,
      '[DURATION]': data.contract.durationDays,
      '[PAYMENT_METHOD]': paymentMethodDisplay,
      '[PAYMENT_OPTIONS_PLACEHOLDER]': paymentMethodDisplay
    };

    Object.entries(map).forEach(([key, val]) => {
      text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || '__________');
    });

    text = text.replace(/\(\s*\)\s*Boleto bancário/gi, "");
    text = text.replace(/\(\s*\)\s*Outro:[\s_]*/gi, "");
    text = text.replace(/1\.3\. NÃO constitui objeto deste contrato:\s*[\r\n]+/g, "1.3. NÃO constitui objeto deste contrato:\n");
    text = text.replace(/3\.2\. Forma de pagamento:\s*[\r\n]+\s*/g, "3.2. Forma de pagamento: ");
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

    return text;
  };

  const handleDownloadPDF = async () => {
    const targetRef = contractRef.current;
    if (!targetRef) return;
    
    setIsGenerating(true);
    
    const opt = {
      margin: [15, 15, 15, 15], 
      filename: `Contrato_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollY: 0, 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(targetRef).save();
    } catch (err) {
      alert("Erro ao gerar PDF.");
      console.error(err);
    } finally { 
      setIsGenerating(false); 
    }
  };

  useImperativeHandle(ref, () => ({
    download: handleDownloadPDF
  }));

  const renderContent = () => {
      const street = data.contract.street || '';
      const number = data.contract.number || 'SN';
      const neighbor = data.contract.neighborhood || '';
      const city = data.contract.city || '';
      const state = data.contract.state || '';
      
      const detailedAddress = `${street}, ${number} - ${neighbor}, ${city}/${state}`;
      const fullAddress = street ? detailedAddress : (data.contract.address || '__________________________________________________');

      return (
        <div className="bg-white text-black px-[15mm] py-[10mm] w-[210mm] mx-auto font-sans leading-[1.5] text-[10pt] shadow-2xl print:shadow-none print:w-full h-auto">
            <div className="mb-6">
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

            <p className="mb-4 text-justify">As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:</p>
            </div>

            <div className="mb-8 text-justify">
            {getCleanContractText().split('\n').map((line, i) => {
                if (line.trim() === '') return <div key={i} className="h-3"></div>;
                
                const upperLine = line.toUpperCase();
                const isTitle = upperLine.startsWith('CLÁUSULA') || upperLine.startsWith('CLAUSULA');
                
                const shouldBreak = upperLine.includes('CLÁUSULA 3') || 
                                upperLine.includes('CLÁUSULA 7') || 
                                upperLine.includes('CLÁUSULA 11');

                return (
                <React.Fragment key={i}>
                    {shouldBreak && <div className="html2pdf__page-break"></div>}
                    <p 
                    className={`mb-1 break-inside-avoid ${isTitle ? 'font-bold' : ''}`}
                    style={isTitle ? { pageBreakAfter: 'avoid' } : {}}
                    >
                    {line}
                    </p>
                </React.Fragment>
                );
            })}
            </div>

            <p className="mb-8 text-justify">
            E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus jurídicos e legais efeitos.
            </p>

            <div className="mb-8">
            <p>Vespasiano, Minas Gerais</p>
            <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="mt-8 space-y-10">
            <div className="break-inside-avoid">
                <p className="font-bold mb-4">CONTRATANTE:</p>
                <div className="border-b border-black w-2/3 mb-1"></div>
                <p>Assinatura</p>
                <p>Nome completo: {data.clientName}</p>
                <p>CPF: {data.contract.cpf}</p>
            </div>
            
            <div className="break-inside-avoid">
                <p className="font-bold mb-4">CONTRATADO:</p>
                <div className="border-b border-black w-2/3 mb-1"></div>
                <p>Assinatura</p>
                <p>{CONSULTANT_DEFAULT.consultantName}</p>
            </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
        
        {/* CARD DE AÇÃO COMPACTO */}
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[#d4af37]/30 transition-all shadow-lg relative overflow-hidden">
             
             {/* Background Decoration */}
             <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                 <ShieldCheck size={150} />
             </div>

             {/* Left Info */}
             <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                 <div className="w-12 h-12 bg-[#d4af37]/10 text-[#d4af37] rounded-xl flex items-center justify-center border border-[#d4af37]/20 shrink-0">
                     <ShieldCheck size={20} />
                 </div>
                 <div className="min-w-0">
                     <h3 className="font-bold text-white text-sm uppercase tracking-wide truncate">Contrato de Prestação</h3>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">Visualizar e Exportar</p>
                 </div>
             </div>

             {/* Right Actions */}
             <div className="flex items-center gap-2 relative z-10 w-full md:w-auto">
                 <button 
                     onClick={() => setShowModal(true)} 
                     className="flex-1 md:flex-none py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2" 
                     title="Visualizar em Tela Cheia"
                 >
                     <Maximize2 size={16} /> <span className="md:hidden text-xs font-bold uppercase">Visualizar</span>
                 </button>
                 <button 
                     onClick={handleDownloadPDF} 
                     disabled={isGenerating}
                     className="flex-[2] md:flex-none px-6 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
                 >
                     {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                     Baixar PDF
                 </button>
             </div>
        </div>

        {/* MODAL */}
        {showModal && (
            <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200">
                        <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                            <ShieldCheck size={20} className="text-[#d4af37]" /> Contrato de Prestação de Serviço
                        </h2>
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar-light flex justify-center">
                        {renderContent()}
                    </div>

                    <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Fechar
                        </button>
                        <button 
                            onClick={handleDownloadPDF} 
                            disabled={isGenerating}
                            className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                            Baixar PDF
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* PDF HIDDEN */}
        <div className="fixed left-[-9999px]">
            <div ref={contractRef} className="bg-white">
                {renderContent()}
            </div>
        </div>

    </div>
  );
});

export default ContractPreview;
