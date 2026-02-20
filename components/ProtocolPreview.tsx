import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';
import { Loader2, FileText, X, FileDown, AlertTriangle } from 'lucide-react';

const LOGO_VBR_GOLD = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/DOURADO.png";

export interface ProtocolPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  customTrigger?: React.ReactNode;
}

const ProtocolPreview = forwardRef<ProtocolPreviewHandle, Props>(
({ data, customTrigger }, ref) => {

  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const target = pdfRef.current;
    if (!target) return;

    setIsGenerating(true);

    const clientName = data?.clientName || "Aluno";

    const opt = {
      margin: 0,
      filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',          // ✅ A4 REAL
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['css'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(target).save();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  useImperativeHandle(ref, () => ({ download: handleDownloadPDF }));

  /* =======================
     ESTILO BASE A4
  ======================== */

  const pageStyle: React.CSSProperties = {
    width: '794px',       // largura A4 em px
    minHeight: '1123px',  // altura mínima A4
    padding: '40px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif"
  };

  const coverStyle: React.CSSProperties = {
    ...pageStyle,
    backgroundColor: '#050505',
    color: 'white',
    pageBreakAfter: 'always'
  };

  const endStyle: React.CSSProperties = {
    ...pageStyle,
    pageBreakBefore: 'always'
  };

  /* =======================
     RENDER PDF CONTENT
  ======================== */

  const renderContent = () => {
    const safeData = data || EMPTY_DATA;
    const clientName = safeData.clientName || "ALUNO";

    return (
      <div className="bg-white">

        {/* CAPA */}
        <div style={coverStyle}>
          <div className="h-full flex flex-col items-center justify-center text-center">
            <img src={LOGO_VBR_GOLD} className="w-60 mb-12" />
            <h1 className="text-3xl font-black text-[#d4af37] uppercase mb-10">
              PROTOCOLO COMPLETO
            </h1>
            <h2 className="text-5xl font-black">{clientName}</h2>
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div style={pageStyle}>
          <h2 className="text-xl font-black mb-6">
            Estratégia Nutricional
          </h2>
          <p className="text-sm leading-relaxed">
            {safeData.nutritionalStrategy || "Estratégia personalizada."}
          </p>
        </div>

        {/* PÁGINA FINAL */}
        <div style={endStyle}>
          <div className="border-4 border-[#d4af37] h-full flex items-center justify-center text-center p-10">
            <div>
              <AlertTriangle size={60} className="text-[#d4af37] mb-6 mx-auto" />
              <h2 className="text-4xl font-black uppercase mb-4">Atenção</h2>
              <p className="text-sm">
                Este protocolo é individual e será ajustado conforme evolução.
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[95vh] rounded-2xl flex flex-col overflow-hidden">

        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="font-black uppercase flex items-center gap-2">
            <FileText size={20}/> Visualizar Protocolo
          </h2>
          <button onClick={() => setShowModal(false)}>
            <X size={24}/>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-200 p-8 flex justify-center">
          {renderContent()}
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-8 py-3 bg-[#d4af37] rounded-lg font-black uppercase text-xs flex items-center gap-2"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16}/>}
            {isGenerating ? "Gerando..." : "Baixar PDF A4"}
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {customTrigger && (
        <>
          <div onClick={() => setShowModal(true)} className="cursor-pointer">
            {customTrigger}
          </div>

          {showModal && createPortal(modal, document.body)}

          {/* Área invisível para gerar PDF */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              pointerEvents: 'none'
            }}
          >
            <div ref={pdfRef}>
              {renderContent()}
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default ProtocolPreview;
