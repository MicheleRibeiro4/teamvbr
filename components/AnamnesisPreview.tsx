
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ProtocolData } from '../types';
import { ChevronLeft, Download, Loader2, Activity, Maximize2, X, FileDown, ClipboardList } from 'lucide-react';

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

const AnamnesisPreview = forwardRef<AnamnesisPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const targetRef = pdfRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Anamnese_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
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

  const renderContent = (isPdfMode = false) => {
    const pageStyle: React.CSSProperties = { 
        width: '210mm', 
        minHeight: '296mm', 
        padding: '15mm', 
        backgroundColor: '#ffffff', 
        color: 'black', 
        position: 'relative', 
        boxSizing: 'border-box', 
        display: 'block',
        margin: isPdfMode ? '0' : '0 auto',
        boxShadow: isPdfMode ? 'none' : '0 10px 30px rgba(0,0,0,0.1)'
    };
    
    const sectionTitle = "text-lg font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-4 uppercase mt-6";
    const labelStyle = "text-xs font-bold text-gray-500 uppercase block mb-1";
    const valueStyle = "text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 block";
    const gridItemStyle = "break-inside-avoid";

    const measurements = data.physicalData?.measurements || {
        thorax: "-", waist: "-", abdomen: "-", glutes: "-",
        rightArmRelaxed: "-", leftArmRelaxed: "-",
        rightArmContracted: "-", leftArmContracted: "-",
        rightThigh: "-", leftThigh: "-",
        rightCalf: "-", leftCalf: "-"
    };

    const anamnesis = data.anamnesis || {
        mainObjective: "", routine: "", trainingHistory: "", 
        foodPreferences: "", ergogenics: ""
    };

    const registrationDate = new Date(data.createdAt || data.updatedAt || Date.now()).toLocaleDateString('pt-BR');

    return (
        <div className="bg-white flex flex-col items-center print:bg-transparent w-full">
            <div style={pageStyle}>
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Ficha de Anamnese</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Team VBR</p>
                    </div>
                    <img src={LOGO_ANAMNESIS} alt="Team VBR" className="w-32 h-auto" />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Aluno</span>
                        <h2 className="text-2xl font-black text-gray-900 uppercase">{data.clientName}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase">Data do Cadastro</span>
                        <p className="text-sm font-bold text-gray-900">{registrationDate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="col-span-1">
                        <span className={labelStyle}>Idade</span>
                        <span className={valueStyle}>{data.physicalData?.age || '-'} anos</span>
                    </div>
                    <div className="col-span-1">
                        <span className={labelStyle}>Gênero</span>
                        <span className={valueStyle}>{data.physicalData?.gender || '-'}</span>
                    </div>
                    <div className="col-span-1">
                        <span className={labelStyle}>Peso</span>
                        <span className={valueStyle}>{data.physicalData?.weight || '-'} kg</span>
                    </div>
                    <div className="col-span-1">
                        <span className={labelStyle}>Altura</span>
                        <span className={valueStyle}>{data.physicalData?.height || '-'} m</span>
                    </div>
                </div>

                <h3 className={sectionTitle}>Histórico & Objetivos</h3>
                <div className="space-y-4">
                    <div className={gridItemStyle}>
                        <span className={labelStyle}>Objetivo Principal</span>
                        <p className={valueStyle}>{anamnesis.mainObjective || 'Não informado'}</p>
                    </div>
                    <div className={gridItemStyle}>
                        <span className={labelStyle}>Rotina Diária</span>
                        <p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.routine || 'Não informado'}</p>
                    </div>
                    <div className={gridItemStyle}>
                        <span className={labelStyle}>Histórico de Treino / Lesões</span>
                        <p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.trainingHistory || 'Não informado'}</p>
                    </div>
                    <div className={gridItemStyle}>
                        <span className={labelStyle}>Preferências Alimentares / Alergias</span>
                        <p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.foodPreferences || 'Não informado'}</p>
                    </div>
                    <div className={gridItemStyle}>
                        <span className={labelStyle}>Medicamentos / Ergogênicos</span>
                        <p className={`${valueStyle} whitespace-pre-wrap`}>{anamnesis.ergogenics || 'Não informado'}</p>
                    </div>
                </div>

                <div className="html2pdf__page-break"></div>

                <h3 className={sectionTitle}>Medidas Corporais</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className={gridItemStyle}><span className={labelStyle}>Gordura (BF)</span><span className={valueStyle}>{data.physicalData?.bodyFat || '-'} %</span></div>
                    <div className={gridItemStyle}><span className={labelStyle}>Massa Muscular</span><span className={valueStyle}>{data.physicalData?.muscleMass || '-'} kg</span></div>
                    <div className={gridItemStyle}><span className={labelStyle}>G. Visceral</span><span className={valueStyle}>{data.physicalData?.visceralFat || '-'}</span></div>
                    <div className={gridItemStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{data.physicalData?.imc || '-'}</span></div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 text-center text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-200">
                        Circunferências (cm)
                    </div>
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

                <div className="mt-12 text-center border-t border-gray-100 pt-8">
                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">Team VBR System © 2026</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
        
        {customTrigger ? (
            <>
                <div onClick={() => setShowModal(true)} className="cursor-pointer">
                    {customTrigger}
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                                    <Activity size={20} className="text-[#d4af37]" /> Ficha de Anamnese
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar-light flex justify-center">
                                {renderContent(false)}
                            </div>
                            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors">Fechar</button>
                                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95">
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Baixar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="fixed left-[-9999px]">
                    <div ref={pdfRef} className="bg-white">
                        {renderContent(true)}
                    </div>
                </div>
            </>
        ) : (
            // Default
            <>
                <div className="bg-[#111] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[#d4af37]/30 transition-all shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                        <ClipboardList size={150} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <div className="w-12 h-12 bg-[#d4af37]/10 text-[#d4af37] rounded-xl flex items-center justify-center border border-[#d4af37]/20 shrink-0">
                            <Activity size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wide truncate">Anamnese Completa</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">Visualizar e Exportar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10 w-full md:w-auto">
                        <button onClick={() => setShowModal(true)} className="flex-1 md:flex-none py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2" title="Visualizar em Tela Cheia">
                            <Maximize2 size={16} /> <span className="md:hidden text-xs font-bold uppercase">Visualizar</span>
                        </button>
                        <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex-[2] md:flex-none px-6 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Baixar PDF
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                                    <Activity size={20} className="text-[#d4af37]" /> Ficha de Anamnese
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar-light flex justify-center">
                                {renderContent(false)}
                            </div>
                            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors">Fechar</button>
                                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95">
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Baixar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="fixed left-[-9999px]">
                    <div ref={pdfRef} className="bg-white">
                        {renderContent(true)}
                    </div>
                </div>
            </>
        )}

    </div>
  );
});

export default AnamnesisPreview;
