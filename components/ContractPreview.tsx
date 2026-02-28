import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ProtocolData } from '../types';
import { CONSULTANT_DEFAULT, EMPTY_DATA } from '../constants';
import { Loader2, FileText, X, FileDown, ShieldCheck } from 'lucide-react';

export interface ContractPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  onBack?: () => void;
  hideFloatingButton?: boolean;
  customTrigger?: React.ReactNode;
}

const ContractPreview = React.memo(forwardRef<ContractPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  // SAFEGUARDS
  const safeData = data || EMPTY_DATA;
  // Fix: Use EMPTY_DATA.contract as fallback to avoid property access errors on empty object
  const contract = safeData.contract || EMPTY_DATA.contract;
  const clientName = safeData.clientName || '____________________';

  const getCleanContractText = () => {
    let text = contract.contractBody;
    
    if (!text || text.trim() === '') {
       text = EMPTY_DATA.contract.contractBody || '';
    }

    const paymentMethodDisplay = contract.paymentMethod === 'Pix' ? 'Pix (à vista)' : (contract.paymentMethod || '__________');

    const map = {
      '[START_DATE]': contract.startDate || '__________',
      '[END_DATE]': contract.endDate || '__________',
      '[VALUE]': contract.planValue || '0,00',
      '[VALUE_WORDS]': contract.planValueWords || '__________',
      '[DURATION]': contract.durationDays || '0',
      '[PAYMENT_METHOD]': paymentMethodDisplay,
      '[PAYMENT_OPTIONS_PLACEHOLDER]': paymentMethodDisplay
    };

    Object.entries(map).forEach(([key, val]) => {
      text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || '__________');
    });

    text = text.replace(/\(\s*\)\s*Boleto bancário/gi, "");
    text = text.replace(/\(\s*\)\s*Outro:[\s_]*/gi, "");
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

    return text;
  };

  const handleDownloadPDF = async () => {
    const targetRef = contractRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    
    // Configuração OTIMIZADA para A4 sem cortes
    const opt = {
      margin: 0,
      filename: `Contrato_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'css' }
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // @ts-ignore
      await html2pdf().set(opt).from(targetRef).save();
    } catch (err) { alert("Erro ao gerar PDF."); console.error(err); } 
    finally { setIsGenerating(false); }
  };

  useImperativeHandle(ref, () => ({ download: handleDownloadPDF }));

  const renderContent = () => {
      const street = contract.street || '';
      const number = contract.number || 'SN';
      const neighbor = contract.neighborhood || '';
      const city = contract.city || '';
      const state = contract.state || '';
      const detailedAddress = `${street}, ${number} - ${neighbor}, ${city}/${state}`;
      const fullAddress = street ? detailedAddress : (contract.address || '__________________________________________________');

      const content = (
        <>
            <div className="pdf-page">
                <div className="mb-6 clause-text" style={{ color: 'black', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify', flex: 1 }}>
                    <h1 className="font-bold text-center text-[12pt] mb-6 uppercase pdf-title clause-title">CONTRATO DE ASSESSORIA EM ESTILO DE VIDA SAUDÁVEL</h1>
                    <div className="mb-4 text-justify clause-text"><p className="font-bold mb-1 clause-title">CONTRATANTE:</p><p className="clause-text">Nome: {clientName}</p><p className="clause-text">CPF: {contract.cpf || '__________'}</p><p className="clause-text">Telefone: {contract.phone || '__________'}</p><p className="clause-text">Endereço: {fullAddress}</p></div>
                    <div className="mb-6 text-justify clause-text"><p className="font-bold mb-1 clause-title">CONTRATADO:</p><p className="clause-text">Nome: {CONSULTANT_DEFAULT.consultantName}</p><p className="clause-text">CPF: {CONSULTANT_DEFAULT.consultantCpf}</p><p className="clause-text">E-mail: {CONSULTANT_DEFAULT.consultantEmail}</p><p className="clause-text">Endereço: {CONSULTANT_DEFAULT.consultantAddress}</p></div>
                    <p className="mb-4 text-justify clause-text">As partes acima identificadas celebram o presente contrato, mediante as seguintes cláusulas e condições:</p>
                </div>

                <div className="mb-8 text-justify leading-[1.5] clause-text" style={{ color: 'black', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify' }}>
                {getCleanContractText().split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed === '') return null;
                    
                    const upperLine = trimmed.toUpperCase();
                    const isTitle = upperLine.startsWith('CLÁUSULA') || upperLine.startsWith('CLAUSULA');

                    return (
                        <p 
                            key={i} 
                            className={`${isTitle ? 'font-bold pdf-title clause-title' : 'clause-text'}`}
                            style={{ 
                                textAlign: 'justify',
                                marginBottom: '1rem'
                            }}
                        >
                            {line}
                        </p>
                    );
                })}
                </div>

                <div className="signature-block clause-text" style={{ color: 'black', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify' }}>
                    <p className="mb-8 text-justify clause-text">E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.</p>
                    <div className="mb-8 clause-text"><p className="clause-text">Vespasiano, Minas Gerais</p><p className="clause-text">Data: {new Date().toLocaleDateString('pt-BR')}</p></div>
                    <div className="mt-8 space-y-10 clause-text">
                        <div className="clause-text"><p className="font-bold mb-4 clause-title">CONTRATANTE:</p><div className="border-b border-black w-2/3 mb-1"></div><p className="clause-text">Assinatura</p><p className="clause-text">Nome: {clientName}</p><p className="clause-text">CPF: {contract.cpf}</p></div>
                        <div className="clause-text"><p className="font-bold mb-4 clause-title">CONTRATADO:</p><div className="border-b border-black w-2/3 mb-1"></div><p className="clause-text">Assinatura</p><p className="clause-text">{CONSULTANT_DEFAULT.consultantName}</p></div>
                    </div>
                </div>
            </div>
        </>
      );

      return content;
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
        {customTrigger && (
            <>
                <div onClick={() => setShowModal(true)} className="cursor-pointer">{customTrigger}</div>
                {showModal && (
                    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200 shrink-0">
                                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2"><ShieldCheck size={20} className="text-[#d4af37]" /> Contrato</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-auto bg-gray-500/20 p-8 custom-scrollbar-light flex justify-center items-start">
                                {renderContent()}
                            </div>
                            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4 shrink-0">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors">Fechar</button>
                                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Baixar PDF</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}
        <div style={{ position: 'absolute', left: 0, top: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
            <div 
                ref={contractRef} 
                className="bg-white"
                style={{
                    width: '210mm',
                    padding: '15mm' // Add padding for the HTML view
                }}
            >
                {renderContent()}
            </div>
        </div>
    </div>
  );
}));

export default ContractPreview;