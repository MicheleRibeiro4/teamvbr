
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
  onBack?: () => void;
  hideFloatingButton?: boolean;
  customTrigger?: React.ReactNode; 
}

const ProtocolPreview = React.memo(forwardRef<ProtocolPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
    const targetRef = pdfRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    const clientName = data?.clientName || "Aluno";
    
    // A4 Dimensions in Pixels (96 DPI)
    // 210mm = 793.7px (approx 793px)
    // 297mm = 1122.5px (approx 1122px)
    const A4_WIDTH_PX = 793; 

    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0,
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
    const physical = safeData.physicalData || EMPTY_DATA.physicalData;
    const contract = safeData.contract || EMPTY_DATA.contract;
    const macros = safeData.macros || { protein: { value: '0', ratio: '' }, carbs: { value: '0', ratio: '' }, fats: { value: '0', ratio: '' } };
    const meals = (safeData.meals || []).filter(m => m.name || m.details || m.time);
    const supplements = (safeData.supplements || []).filter(s => s.name || s.dosage || s.timing);
    const trainingDays = (safeData.trainingDays || []).filter(d => d.title || d.focus || (d.exercises && d.exercises.length > 0));
    const tips = (safeData.tips || []).filter(t => t.trim() !== '');
    
    const protocolTitle = safeData.protocolTitle || "HIPERTROFIA";
    const clientName = safeData.clientName || "ALUNO";
    const firstName = clientName.split(' ')[0];

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '...';
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateStr;
      }
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return dateStr;
      }
    };

    // Configuração de Estilo para Página A4
    const pageStyle = (isFirst: boolean = false): React.CSSProperties => ({
        width: '794px', 
        minHeight: 'auto', 
        backgroundColor: 'white',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        margin: '0', 
        padding: '10mm 15mm',
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        color: 'black',
        pageBreakAfter: 'auto'
    });

    const contentWrapperStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box'
    };

    const coverPageStyle: React.CSSProperties = {
        ...pageStyle(true),
        backgroundColor: '#050505',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        position: 'relative',
        height: '1122px', 
        overflow: 'hidden',
        pageBreakInside: 'avoid',
        pageBreakAfter: 'always'
    };

    const endPageStyle: React.CSSProperties = {
        ...pageStyle(false),
        backgroundColor: '#050505',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10mm',
        position: 'relative',
        minHeight: '1120px', // Slightly less than 1123 to avoid spillover
        overflow: 'hidden',
        pageBreakInside: 'avoid',
        pageBreakBefore: 'always',
        pageBreakAfter: 'auto'
    };

    // Estilos utilitários baseados no modelo
    const sectionTitleStyle = "text-[#d4af37] font-black uppercase text-lg border-b-2 border-[#d4af37] pb-1 mb-6 flex items-center gap-2 mt-8 avoid-page-break";
    const cardDataStyle = "bg-[#f8f9fa] rounded-lg p-3 border border-gray-100 flex flex-col avoid-page-break";
    const labelStyle = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1";
    const valueStyle = "text-xl font-black text-gray-900 leading-none";

    const kcalValue = (safeData.kcalGoal || "0").toString().replace(/kcal/gi, '').trim();

    const renderHeader = (title: string) => (
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 avoid-page-break">
            <div className="flex flex-col">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Team VBR • {clientName}</p>
            </div>
            <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-16 h-auto opacity-80" />
        </div>
    );

    return (
        <>
            {/* CAPA (Page 1) */}
            <div className="pdf-page" style={{ ...coverPageStyle }}>
                <div style={{ ...contentWrapperStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-64 h-auto mb-12" />
                    
                    <h1 className="text-3xl font-black text-[#d4af37] uppercase tracking-widest text-center leading-tight mb-12">
                        PROTOCOLO<br/>COMPLETO DE<br/>{protocolTitle}
                    </h1>

                    <div className="w-2/3 border-t border-white/20 my-8"></div>

                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter text-center">
                        {clientName}
                    </h2>

                    <div className="w-2/3 border-b border-white/20 my-8"></div>

                    <div className="mt-12 px-10 py-4 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10">
                        <p className="text-xl font-bold text-[#d4af37] uppercase tracking-widest">
                            PERÍODO: {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                        </p>
                    </div>
                </div>
            </div>

            {/* CONTENT CONTAINER (Continuous Flow) */}
            <div className="pdf-page" style={pageStyle(false)}>
                <div style={contentWrapperStyle}>
                    
                    {/* DADOS E ESTRATÉGIA */}
                    <div className="mb-8">
                        {renderHeader("Dados Físicos & Estratégia")}
                        
                        <div className="flex justify-between items-center mb-6 avoid-page-break">
                            <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">DATA DA AVALIAÇÃO:</span>
                                <span className="text-sm font-black text-gray-900">
                              {physical.date ? (() => {
                                if (physical.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                  const [year, month, day] = physical.date.split('-');
                                  return `${day}/${month}/${year}`;
                                }
                                if (physical.date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                                  return physical.date;
                                }
                                try {
                                  return new Date(physical.date).toLocaleDateString('pt-BR');
                                } catch (e) {
                                  return physical.date;
                                }
                              })() : 'N/A'}
                            </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>PESO ATUAL</span>
                            <span className={valueStyle}>{physical.weight || '-'} kg</span>
                        </div>
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>ALTURA</span>
                            <span className={valueStyle}>{physical.height || '-'} m</span>
                        </div>
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>IDADE</span>
                            <span className={valueStyle}>{physical.age || '-'} anos</span>
                        </div>
                    </div>
                </div>

                    <h4 className="text-xs font-black uppercase text-gray-900 mb-2 avoid-page-break">BIOIMPEDÂNCIA</h4>
                    <div className="grid grid-cols-4 gap-4 mb-10">
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>MASSA MUSC.</span>
                            <span className="text-lg font-black text-gray-900">{physical.muscleMass || '-'} kg</span>
                        </div>
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>GORDURA</span>
                            <span className="text-lg font-black text-gray-900">{physical.bodyFat || '-'}%</span>
                        </div>
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>G. VISCERAL</span>
                            <span className="text-lg font-black text-gray-900">{physical.visceralFat || '-'}</span>
                        </div>
                        <div className={cardDataStyle}>
                            <span className={labelStyle}>IMC</span>
                            <span className="text-lg font-black text-gray-900">{physical.imc || '-'}</span>
                        </div>
                    </div>

                    <div className={sectionTitleStyle}>ESTRATÉGIA NUTRICIONAL</div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-300 mb-8 avoid-page-break">
                        <span className="font-bold text-gray-900 text-xs uppercase block mb-2">Observação:</span>
                        <p className="text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
                            {safeData.nutritionalStrategy || "Estratégia personalizada de acordo com anamnese e objetivos."}
                        </p>
                    </div>


                    <div className="bg-[#111] text-center p-8 rounded-xl mb-10 mx-auto w-full avoid-page-break">
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">META DIÁRIA (FOCO EM {protocolTitle})</p>
                        <p className="text-5xl font-black text-[#d4af37] whitespace-nowrap leading-none">
                            {kcalValue} <span className="text-xl text-white/50 ml-1">kcal</span>
                        </p>
                    </div>

                    <h4 className="text-sm font-black text-gray-900 mb-4 uppercase avoid-page-break">Distribuição de Macronutrientes</h4>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm avoid-page-break">
                            <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">PROTEÍNAS</p>
                            <p className="text-3xl font-black text-gray-900">{(macros.protein?.value || '0').replace(/g/gi, '')}g</p>
                            <p className="text-[9px] text-gray-400 font-bold">{(macros.protein?.ratio || '0').replace(/g\/kg/gi, '')}g/kg</p>
                        </div>
                        <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm avoid-page-break">
                            <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">CARBOIDRATOS</p>
                            <p className="text-3xl font-black text-gray-900">{(macros.carbs?.value || '0').replace(/g/gi, '')}g</p>
                            <p className="text-[9px] text-gray-400 font-bold">{(macros.carbs?.ratio || '0').replace(/g\/kg/gi, '')}g/kg</p>
                        </div>
                        <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm avoid-page-break">
                            <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">GORDURAS</p>
                            <p className="text-3xl font-black text-gray-900">{(macros.fats?.value || '0').replace(/g/gi, '')}g</p>
                            <p className="text-[9px] text-gray-400 font-bold">{(macros.fats?.ratio || '0').replace(/g\/kg/gi, '')}g/kg</p>
                        </div>
                    </div>
                    
                    <div className="mt-8 bg-[#fffbe6] border border-[#d4af37]/20 p-3 rounded text-center avoid-page-break">
                        <p className="text-xs font-bold text-[#8c701c]">Nota Importante: Manter a consistência na pesagem dos alimentos.</p>
                    </div>

                    {/* PLANO ALIMENTAR */}
                    {meals.length > 0 && (
                        <div style={{ pageBreakBefore: 'always', paddingTop: '20mm' }}>
                            {renderHeader("Plano Alimentar Diário")}
                            {/* <div className={sectionTitleStyle.replace('mt-8', '')}>PLANO ALIMENTAR DIÁRIO</div> */}
                            
                            {/* Header Tabela */}
                            <div className="grid grid-cols-12 bg-[#d4af37] text-white font-bold text-xs uppercase py-2 px-3 rounded-t-lg mb-0 avoid-page-break">
                                <div className="col-span-2">Horário</div>
                                <div className="col-span-10">Refeição & Detalhes</div>
                            </div>

                            <div className="flex flex-col gap-0 divide-y divide-gray-100 border border-gray-100 rounded-b-lg mb-8">
                                {meals.map((meal, index) => (
                                    <div key={index} className="grid grid-cols-12 p-4 items-start odd:bg-white even:bg-gray-50 avoid-page-break" style={{ pageBreakInside: 'avoid' }}>
                                        <div className="col-span-2 text-[#d4af37] font-black text-sm pt-0.5">
                                            {meal.time}
                                        </div>
                                        <div className="col-span-10">
                                            <p className="font-bold text-gray-900 text-sm mb-1 uppercase">{meal.name}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{meal.details}</p>
                                            {meal.substitutions && (
                                                <div className="mt-2 pt-2 border-t border-gray-200/50">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Opções de Substituição:</p>
                                                    <p className="text-xs text-gray-500 italic leading-relaxed whitespace-pre-wrap">{meal.substitutions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SUPLEMENTAÇÃO E DICAS */}
                    {(supplements.length > 0 || tips.length > 0) && (
                        <div style={{ pageBreakBefore: 'always', paddingTop: '20mm' }}>
                            {renderHeader("Suplementação & Recomendações")}
                            {/* <div className={sectionTitleStyle.replace('mt-8', '')}>SUPLEMENTAÇÃO E RECOMENDAÇÕES</div> */}
                            
                            <div className="space-y-4 mb-10">
                                {supplements.map((s, idx) => {
                                    // Cores alternadas baseadas no modelo (Dourado, Azul, Escuro)
                                    let bgClass = "bg-[#111]";
                                    let textClass = "text-white";
                                    if (idx % 3 === 0) { bgClass = "bg-[#d4af37]"; textClass = "text-white"; }
                                    else if (idx % 3 === 1) { bgClass = "bg-[#2563eb]"; textClass = "text-white"; }

                                    return (
                                        <div key={idx} className={`${bgClass} ${textClass} p-4 rounded-xl flex items-center justify-between shadow-sm avoid-page-break`} style={{ pageBreakInside: 'avoid' }}>
                                            <div>
                                                <p className="font-black text-lg uppercase leading-none mb-1">{s.name}</p>
                                                <p className="text-xs font-medium opacity-90">{s.dosage}</p>
                                            </div>
                                            <div className="text-right bg-black/20 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider min-w-[120px]">
                                                {s.timing}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <h4 className="text-lg font-black text-gray-900 mb-6 uppercase avoid-page-break">Dicas:</h4>
                            <div className="space-y-3">
                                {tips.map((tip, index) => (
                                    <div key={index} className="flex gap-3 items-start avoid-page-break">
                                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></div>
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TREINO */}
                    {trainingDays.length > 0 && (
                        <div style={{ pageBreakBefore: 'always', paddingTop: '20mm' }}>
                            {renderHeader("Divisão de Treino")}
                            {/* <div className={sectionTitleStyle.replace('mt-8', '')}>DIVISÃO DE TREINO</div> */}
                            <p className="text-xs text-gray-500 mb-6 uppercase font-bold avoid-page-break mt-2">Frequência: {safeData.trainingFrequency || '5x na semana'}</p>

                            <div className="space-y-8">
                                {trainingDays.map((day, dIdx) => (
                                    <div key={dIdx} className="avoid-page-break" style={{ pageBreakInside: 'avoid' }}>
                                        {/* Header Treino Preto/Dourado */}
                                        <div className="bg-[#0a0a0a] text-white p-3 flex justify-between items-center rounded-t-lg">
                                            <h4 className="font-black uppercase text-[#d4af37] tracking-wider">{day.title}</h4>
                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">FOCO: {day.focus}</span>
                                        </div>
                                        
                                        <div className="border border-gray-200 border-t-0 rounded-b-lg overflow-hidden bg-white">
                                            <table className="w-full text-left text-xs">
                                                <tbody className="divide-y divide-gray-100">
                                                    {(day.exercises || []).map((ex, eIdx) => (
                                                        <tr key={eIdx} className="hover:bg-gray-50">
                                                            <td className="p-3 font-bold text-gray-800 uppercase">{ex.name}</td>
                                                            <td className="p-3 text-right font-black text-gray-900 w-24">{ex.sets}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PAGE FINAL (Atenção) */}
            <div className="pdf-page" style={{ 
                ...endPageStyle,
                pageBreakBefore: 'always', // Force break before this page
                height: 'auto', // Allow expansion
                minHeight: '1122px', // Maintain full page look
                overflow: 'visible' // Allow content to show
            }}>
                 <div style={{ border: '4px solid #d4af37', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRadius: '40px', position: 'relative', width: '100%', flex: 1, padding: '20mm' }}>
                    <AlertTriangle size={80} className="text-[#d4af37] mb-8" strokeWidth={1.5} />
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">Atenção</h2>
                    <div className="w-24 h-2 bg-[#d4af37] mb-12"></div>
                    
                    <p className="text-xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-16 font-medium px-8">
                        Este protocolo foi desenhado especificamente para você, {firstName}. 
                        Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedbacks.
                    </p>
                    
                    <p className="text-[#d4af37] text-2xl font-black italic uppercase tracking-widest">
                        "A consistência vence a intensidade."
                    </p>
                    
                    <div className="mt-12">
                         <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-32 h-auto opacity-50" />
                    </div>

                    <div className="absolute bottom-8 text-[10px] font-black uppercase text-gray-600 tracking-[0.5em]">
                        TEAM VBR © 2026
                    </div>
                </div>
            </div>
        </>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <div className="bg-gray-50 p-5 px-8 flex justify-between items-center border-b border-gray-200 shrink-0">
                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-3"><FileText size={22} className="text-[#d4af37]" /> Visualizar Protocolo Completo</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:rotate-90"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-[#333] custom-scrollbar flex">
                <div className="m-auto p-8 flex flex-col gap-8">
                    {renderContent(false)}
                </div>
            </div>
            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-4 shrink-0">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-black uppercase text-[10px] text-gray-400 hover:bg-gray-100 transition-all tracking-widest">Fechar</button>
                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-10 py-4 bg-[#d4af37] hover:bg-black hover:text-[#d4af37] text-black rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center gap-2 transition-all active:scale-95 group">
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {isGenerating ? "Processando..." : "Baixar Protocolo PDF"}
                </button>
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
        
        {/* 
           AJUSTE CRÍTICO DE CORTE LATERAL:
           Posicionamento fixed com z-index negativo at top 0 left 0.
           Fixed Width 210mm to ensure A4 proportions at 96 DPI.
           Always render this to allow ref.current.download() to work even without customTrigger
        */}
        <div style={{ position: 'fixed', left: 0, top: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
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

export default ProtocolPreview;
