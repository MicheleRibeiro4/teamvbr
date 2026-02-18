import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';
import { Loader2, FileText, X, FileDown, AlertTriangle } from 'lucide-react';

const LOGO_VBR_GOLD = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/DOURADO.png";

const DEFAULT_TIPS = [
  "Organize suas marmitas no dia anterior para evitar furos na dieta.",
  "A Creatina não tem efeito imediato, seu efeito é crônico. Tome mesmo nos dias que não treinar.",
  "Mantenha a hidratação constante.",
  "Priorize o sono reparador.",
  "A consistência é o segredo do resultado."
];

export interface ProtocolPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  onBack?: () => void;
  hideFloatingButton?: boolean;
  customTrigger?: React.ReactNode; 
}

const ProtocolPreview = forwardRef<ProtocolPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const targetRef = pdfRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    const clientName = data?.clientName || "Aluno";
    
    const opt = {
      margin: 0, 
      filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        scrollY: 0,
        windowWidth: 794 // 794px é a largura A4 @ 96 DPI
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(targetRef).save();
    } catch (err) { alert("Erro ao gerar PDF."); console.error(err); } 
    finally { setIsGenerating(false); }
  };

  useImperativeHandle(ref, () => ({ download: handleDownloadPDF }));

  const renderContent = (isPdfMode = false) => {
    const safeData = data || EMPTY_DATA;
    // Fix: Use EMPTY_DATA properties as fallback to avoid property access errors on empty object
    const physical = safeData.physicalData || EMPTY_DATA.physicalData;
    const contract = safeData.contract || EMPTY_DATA.contract;
    const macros = safeData.macros || { protein: { value: '0', ratio: '' }, carbs: { value: '0', ratio: '' }, fats: { value: '0', ratio: '' } };
    const meals = safeData.meals || [];
    const supplements = safeData.supplements || [];
    
    const rawTips = safeData.tips || [];
    const hasCustomTips = rawTips.some(t => t && t.trim() !== "");
    const tips = hasCustomTips ? rawTips.filter(t => t && t.trim() !== "") : DEFAULT_TIPS;
    
    const trainingDays = safeData.trainingDays || [];
    
    const trainingChunks = [];
    if (trainingDays.length === 0) {
        trainingChunks.push([]);
    } else {
        for (let i = 0; i < trainingDays.length; i += 2) {
            trainingChunks.push(trainingDays.slice(i, i + 2));
        }
    }
    
    const protocolTitle = safeData.protocolTitle || "Geral";
    const clientName = safeData.clientName || "Aluno";

    const A4_HEIGHT = '296mm'; 
    const A4_WIDTH = '210mm';
    const CONTENT_PADDING = '12mm'; 

    const contentPageStyle: React.CSSProperties = {
        minHeight: A4_HEIGHT,
        width: A4_WIDTH,
        padding: CONTENT_PADDING,
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        overflow: 'hidden'
    };

    const coverPageStyle: React.CSSProperties = {
        minHeight: A4_HEIGHT,
        width: A4_WIDTH,
        padding: '0',
        position: 'relative',
        backgroundColor: '#050505',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const sectionTitle = "text-lg font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-6 uppercase tracking-tight break-after-avoid";
    const labelStyle = "text-[9px] font-bold text-gray-400 uppercase block mb-1 tracking-widest";
    const valueStyle = "text-xl font-black text-gray-900 leading-none";
    const cardStyle = "bg-white border border-gray-100 p-4 rounded-xl shadow-sm h-full flex flex-col justify-center break-inside-avoid";

    const kcalValue = (safeData.kcalGoal || "0").toString().replace(/kcal/gi, '').trim();

    return (
        <div className="bg-gray-100 text-black flex flex-col items-center print:bg-transparent w-full">
            
            <div style={coverPageStyle}>
                <div className="flex-1 flex flex-col items-center justify-center w-full px-12 relative z-10">
                    <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-64 h-auto mb-16 relative z-10" />
                    <h1 className="text-4xl font-black text-[#d4af37] uppercase tracking-wider leading-tight mb-20 max-w-2xl mx-auto text-center">
                        PROTOCOLO<br/>COMPLETO DE<br/>{protocolTitle.toUpperCase()}
                    </h1>
                    <div className="border-t border-b border-white/20 py-10 w-full max-w-3xl">
                        <h2 className="text-5xl font-black uppercase tracking-tight text-white leading-none text-center">
                            {clientName}
                        </h2>
                    </div>
                    <div className="mt-20 px-8 py-3 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 inline-block mx-auto">
                        <p className="text-sm font-bold text-[#d4af37] uppercase tracking-widest whitespace-nowrap">
                            PERÍODO: {contract.startDate || '...'} — {contract.endDate || '...'}
                        </p>
                    </div>
                </div>
                <div className="h-6 bg-[#d4af37] w-full shrink-0"></div>
            </div>

            <div className="html2pdf__page-break"></div>

            <div style={contentPageStyle}>
                <h3 className={sectionTitle}>1. DADOS FÍSICOS - {physical.date || new Date().toLocaleDateString('pt-BR')}</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#f9fafb] p-4 rounded-lg break-inside-avoid"><span className={labelStyle}>PESO ATUAL</span><span className={valueStyle}>{physical.weight || '-'} kg</span></div>
                    <div className="bg-[#f9fafb] p-4 rounded-lg break-inside-avoid"><span className={labelStyle}>ALTURA</span><span className={valueStyle}>{physical.height || '-'} m</span></div>
                    <div className="bg-[#f9fafb] p-4 rounded-lg break-inside-avoid"><span className={labelStyle}>IDADE</span><span className={valueStyle}>{physical.age || '-'} anos</span></div>
                </div>
                
                <h4 className="text-[10px] font-black uppercase text-black mb-3 tracking-widest break-after-avoid">BIOIMPEDÂNCIA</h4>
                <div className="grid grid-cols-4 gap-3 mb-10">
                    <div className={cardStyle}><span className={labelStyle}>MASSA MUSC.</span><span className="text-lg font-black text-gray-900">{physical.muscleMass || '-'} kg</span></div>
                    <div className={cardStyle}><span className={labelStyle}>GORDURA</span><span className="text-lg font-black text-gray-900">{physical.bodyFat || '-'}%</span></div>
                    <div className={cardStyle}><span className={labelStyle}>G. VISCERAL</span><span className="text-lg font-black text-gray-900">{physical.visceralFat || '-'}</span></div>
                    <div className={cardStyle}><span className={labelStyle}>IMC</span><span className="text-lg font-black text-gray-900">{physical.imc || '-'}</span></div>
                </div>

                <h3 className={sectionTitle}>2. ESTRATÉGIA NUTRICIONAL</h3>
                <div className="bg-[#eff0f2] p-6 rounded-sm border-l-[6px] border-[#9ca3af] mb-8 shadow-sm break-inside-avoid">
                    <span className="font-black uppercase text-[10px] text-black block mb-2 tracking-widest">Observação:</span>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium text-justify">
                        {safeData.nutritionalStrategy || "Estratégia personalizada de acordo com anamnese e objetivos."}
                    </p>
                </div>
                
                <div className="bg-[#111] text-center p-8 rounded-xl mb-8 shadow-md break-inside-avoid mx-auto w-full max-w-lg flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">META DIÁRIA</p>
                    <p className="text-6xl font-black text-[#d4af37] whitespace-nowrap leading-none">
                        {kcalValue} <span className="text-xl text-white/50 ml-1">kcal</span>
                    </p>
                </div>

                <h4 className="text-[11px] font-black text-black mb-4 uppercase tracking-widest break-after-avoid">DISTRIBUIÇÃO DE MACRONUTRIENTES</h4>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-100 p-5 text-center rounded-xl shadow-sm break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-2">PROTEÍNAS</p>
                        <p className="text-3xl font-black text-gray-900 mb-1">{macros.protein?.value || '0'}g</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 text-center rounded-xl shadow-sm break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-2">CARBOIDRATOS</p>
                        <p className="text-3xl font-black text-gray-900 mb-1">{macros.carbs?.value || '0'}g</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 text-center rounded-xl shadow-sm break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-2">GORDURAS</p>
                        <p className="text-3xl font-black text-gray-900 mb-1">{macros.fats?.value || '0'}g</p>
                    </div>
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            <div style={contentPageStyle}>
                <h3 className={sectionTitle}>3. PLANO ALIMENTAR DIÁRIO</h3>
                <table className="w-full text-left text-sm border-collapse mb-10 shadow-sm rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#d4af37] text-white break-inside-avoid">
                            <th className="p-4 font-black uppercase text-xs tracking-widest w-24">Horário</th>
                            <th className="p-4 font-black uppercase text-xs tracking-widest">Refeição & Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {meals.map((meal, index) => (
                            <tr key={meal.id || index} className={`${index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"} break-inside-avoid`}>
                                <td className="p-5 font-black text-[#d4af37] align-top text-base">{meal.time}</td>
                                <td className="p-5">
                                    <p className="font-black text-gray-900 mb-2 uppercase tracking-tight text-sm">{meal.name}</p>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">{meal.details}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="html2pdf__page-break"></div>

            <div style={coverPageStyle}>
                <div className="flex-none h-24"></div>
                <div className="flex flex-col items-center justify-center space-y-10 px-10 relative z-10 flex-1">
                    <AlertTriangle size={80} className="text-[#d4af37]" />
                    <div className="flex flex-col items-center">
                        <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">ATENÇÃO</h2>
                        <div className="w-24 h-2 bg-[#d4af37] mt-6"></div>
                    </div>
                    <div className="max-w-3xl space-y-6 text-white/90 leading-relaxed text-center">
                        <p className="text-xl font-bold">Este protocolo foi desenhado especificamente para você, {clientName.split(' ')[0]}.</p>
                        <p className="text-[#d4af37] text-xl font-black mt-12 italic tracking-tight whitespace-nowrap">A consistência vence a intensidade.</p>
                    </div>
                </div>
                <div className="flex-none pb-12 relative z-10 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">TEAM VBR © 2026</p>
                </div>
            </div>
        </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <div className="bg-gray-50 p-5 px-8 flex justify-between items-center border-b border-gray-200 shrink-0">
                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-3"><FileText size={22} className="text-[#d4af37]" /> Visualizar Protocolo Completo</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:rotate-90"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-[#333] p-8 custom-scrollbar flex justify-center items-start">
                {renderContent(false)}
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
        {customTrigger ? (
            <>
                <div onClick={() => setShowModal(true)} className="cursor-pointer">{customTrigger}</div>
                {showModal && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
                <div className="fixed left-[-9999px] top-0"><div ref={pdfRef} className="bg-white">{renderContent(true)}</div></div>
            </>
        ) : null}
    </div>
  );
});

export default ProtocolPreview;