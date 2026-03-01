import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';
import { Loader2, FileText, X, FileDown, Activity } from 'lucide-react';

const LOGO_ANAMNESIS = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/DOURADO.png";

export interface AnamnesisPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  onBack?: () => void;
  hideFloatingButton?: boolean;
  customTrigger?: React.ReactNode;
}

const AnamnesisPreview = React.memo(forwardRef<AnamnesisPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
    const targetRef = pdfRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    const clientName = data?.clientName || "Aluno";
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Anamnese_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-page-break'] }
    };
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // @ts-ignore
      await html2pdf().set(opt).from(targetRef).save();
    } catch (err) { alert("Erro ao gerar PDF."); console.error(err); } 
    finally { setIsGenerating(false); }
  };

  useImperativeHandle(ref, () => ({ download: handleDownloadPDF }));

  const renderContent = (isPdfMode = false) => {
    const safeData = data || EMPTY_DATA;
    // Fix: Use EMPTY_DATA.physicalData as fallback to avoid property access errors on empty object
    const physical = safeData.physicalData || EMPTY_DATA.physicalData;
    const measurements = physical.measurements || {
        thorax: "-", waist: "-", abdomen: "-", glutes: "-",
        rightArmRelaxed: "-", leftArmRelaxed: "-",
        rightArmContracted: "-", leftArmContracted: "-",
        rightThigh: "-", leftThigh: "-",
        rightCalf: "-", leftCalf: "-"
    };
    const anamnesis = safeData.anamnesis || { mainObjective: "", routine: "", trainingHistory: "", foodPreferences: "", ergogenics: "" };
    const registrationDate = new Date(safeData.createdAt || safeData.updatedAt || Date.now()).toLocaleDateString('pt-BR');
    const clientName = safeData.clientName || "Aluno";

    const pageStyle = (isFirst: boolean = false, isLast: boolean = false): React.CSSProperties => ({ 
        width: '794px', 
        minHeight: 'auto', 
        backgroundColor: '#ffffff', 
        boxSizing: 'border-box',
        color: 'black', 
        position: 'relative', 
        display: 'block', 
        padding: '20mm 15mm',
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        overflow: 'visible',
        pageBreakAfter: 'auto'
    });

    const contentWrapperStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box'
    };
    
    const sectionTitle = "text-lg font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-4 uppercase mt-8 avoid-page-break";
    const labelStyle = "text-xs font-bold text-gray-500 uppercase block mb-1";
    const valueStyle = "text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 block";
    const gridItemStyle = "avoid-page-break";

    const renderHeader = (title: string = "Ficha de Anamnese") => (
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4 avoid-page-break">
            <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{title}</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Team VBR • {clientName}</p>
            </div>
            <img src={LOGO_ANAMNESIS} alt="Team VBR" className="w-24 h-auto" />
        </div>
    );

    return (
        <div className="pdf-page" style={pageStyle(true, false)}>
            <div style={{ ...contentWrapperStyle, flex: 1 }}>
                {/* Header Section */}
                {renderHeader()}

                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 avoid-page-break">
                    <div><span className="text-xs font-bold text-gray-400 uppercase">Aluno</span><h2 className="text-2xl font-black text-gray-900 uppercase">{clientName}</h2></div>
                    <div className="text-right"><span className="text-xs font-bold text-gray-400 uppercase">Data do Cadastro</span><p className="text-sm font-bold text-gray-900">{registrationDate}</p></div>
                </div>

                {/* Physical Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6 avoid-page-break">
                    <div className="col-span-1"><span className={labelStyle}>Idade</span><span className={valueStyle}>{physical.age || '-'} anos</span></div>
                    <div className="col-span-1"><span className={labelStyle}>Gênero</span><span className={valueStyle}>{physical.gender || '-'}</span></div>
                    <div className="col-span-1"><span className={labelStyle}>Peso</span><span className={valueStyle}>{physical.weight || '-'} kg</span></div>
                    <div className={gridItemStyle}><span className={labelStyle}>Altura</span><span className={valueStyle}>{physical.height || '-'} m</span></div>
                </div>

                {/* History Section */}
                <h3 className={sectionTitle}>Histórico & Objetivos</h3>
                <div className="space-y-4">
                    <div className={`${gridItemStyle}`}><span className={labelStyle}>Objetivo Principal</span><p className={valueStyle}>{anamnesis.mainObjective || 'Não informado'}</p></div>
                    <div className={`${gridItemStyle}`}><span className={labelStyle}>Rotina Diária</span><p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.routine || 'Não informado'}</p></div>
                    <div className={`${gridItemStyle}`}><span className={labelStyle}>Histórico de Treino / Lesões</span><p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.trainingHistory || 'Não informado'}</p></div>
                    <div className={`${gridItemStyle}`}><span className={labelStyle}>Preferências Alimentares / Alergias</span><p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.foodPreferences || 'Não informado'}</p></div>
                    <div className={`${gridItemStyle}`}><span className={labelStyle}>Medicamentos / Ergogênicos</span><p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.ergogenics || 'Não informado'}</p></div>
                </div>

                {/* Measurements Section - Forces new page */}
                <div style={{ pageBreakBefore: 'always' }}>
                    {renderHeader("Medidas Corporais")}
                    {/* <h3 className={sectionTitle.replace('mt-8', '')}>Medidas Corporais</h3> - Removed redundant title since header covers it, or keep it? Header says "Medidas Corporais" now. */}
                    
                    <div className="grid grid-cols-4 gap-4 mb-8 avoid-page-break mt-6">
                        <div className={gridItemStyle}><span className={labelStyle}>Gordura (BF)</span><span className={valueStyle}>{physical.bodyFat || '-'} %</span></div>
                        <div className={gridItemStyle}><span className={labelStyle}>Massa Muscular</span><span className={valueStyle}>{physical.muscleMass || '-'} kg</span></div>
                        <div className={gridItemStyle}><span className={labelStyle}>G. Visceral</span><span className={valueStyle}>{physical.visceralFat || '-'}</span></div>
                        <div className={gridItemStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{physical.imc || '-'}</span></div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden avoid-page-break mb-8">
                        <div className="bg-gray-100 p-2 text-center text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-200">Circunferências (cm)</div>
                        <div className="grid grid-cols-4 divide-x divide-y divide-gray-200 text-center">
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Tórax</span><span className="font-bold text-gray-900">{measurements.thorax || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Cintura</span><span className="font-bold text-gray-900">{measurements.waist || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Abdômen</span><span className="font-bold text-gray-900">{measurements.abdomen || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Glúteo</span><span className="font-bold text-gray-900">{measurements.glutes || '-'}</span></div>
                            
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Braço Dir (R)</span><span className="font-bold text-gray-900">{measurements.rightArmRelaxed || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Braço Esq (R)</span><span className="font-bold text-gray-900">{measurements.leftArmRelaxed || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Braço Dir (C)</span><span className="font-bold text-gray-900">{measurements.rightArmContracted || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Braço Esq (C)</span><span className="font-bold text-gray-900">{measurements.leftArmContracted || '-'}</span></div>
                            
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Coxa Dir</span><span className="font-bold text-gray-900">{measurements.rightThigh || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Coxa Esq</span><span className="font-bold text-gray-900">{measurements.leftThigh || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Pantur. Dir</span><span className="font-bold text-gray-900">{measurements.rightCalf || '-'}</span></div>
                            <div className="p-3"><span className="block text-[10px] text-gray-400 uppercase">Pantur. Esq</span><span className="font-bold text-gray-900">{measurements.leftCalf || '-'}</span></div>
                        </div>
                    </div>

                    <div className="mt-12 text-center border-t border-gray-100 pt-8 avoid-page-break">
                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">Team VBR System © 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <div className="bg-gray-50 p-5 px-8 flex justify-between items-center border-b border-gray-200 shrink-0">
                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-3"><Activity size={20} className="text-[#d4af37]" /> Anamnese</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:rotate-90"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-[#333] p-8 custom-scrollbar flex justify-center items-start">
                {renderContent(false)}
            </div>
            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4 shrink-0">
                <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors">Fechar</button>
                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Baixar PDF</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full">
        {customTrigger && (
            <>
                <div onClick={() => setShowModal(true)} className="cursor-pointer">{customTrigger}</div>
                {showModal && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
            </>
        )}
        <div style={{ position: 'absolute', left: 0, top: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
            <div 
                ref={pdfRef} 
                className="bg-white"
                style={{
                    width: '794px'
                }}
            >
                {renderContent(true)}
            </div>
        </div>
    </div>
  );
}));

export default AnamnesisPreview;