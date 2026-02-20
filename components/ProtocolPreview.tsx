
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

const ProtocolPreview = forwardRef<ProtocolPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const targetRef = pdfRef.current;
    if (!targetRef) return;
    setIsGenerating(true);
    const clientName = data?.clientName || "Aluno";
    
    // Configurações exatas para A4 evitando cortes
    const opt = {
      margin: 0, // Margem zero para controlar via CSS
      filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        scrollY: 0,
        windowWidth: 794 // Largura exata A4 em pixels a 96DPI
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
    const physical = safeData.physicalData || EMPTY_DATA.physicalData;
    const contract = safeData.contract || EMPTY_DATA.contract;
    const macros = safeData.macros || { protein: { value: '0', ratio: '' }, carbs: { value: '0', ratio: '' }, fats: { value: '0', ratio: '' } };
    const meals = safeData.meals || [];
    const supplements = safeData.supplements || [];
    const trainingDays = safeData.trainingDays || [];
    const tips = (safeData.tips && safeData.tips.length > 0) ? safeData.tips : EMPTY_DATA.tips;
    
    const protocolTitle = safeData.protocolTitle || "HIPERTROFIA";
    const clientName = safeData.clientName || "ALUNO";
    const firstName = clientName.split(' ')[0];

    // Medidas exatas A4
    const A4_WIDTH = '210mm';
    const A4_HEIGHT = '296.5mm'; // Leve ajuste para evitar página extra
    const CONTENT_PADDING = '15mm'; 

    const pageStyle: React.CSSProperties = {
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        padding: CONTENT_PADDING,
        backgroundColor: 'white',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        pageBreakAfter: 'always'
    };

    const coverPageStyle: React.CSSProperties = {
        ...pageStyle,
        backgroundColor: '#050505',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
    };

    const endPageStyle: React.CSSProperties = {
        ...coverPageStyle,
        padding: '20mm'
    };

    // Estilos utilitários baseados no modelo
    const sectionTitleStyle = "text-[#d4af37] font-black uppercase text-lg border-b-2 border-[#d4af37] pb-1 mb-6 flex items-center gap-2";
    const cardDataStyle = "bg-[#f8f9fa] rounded-lg p-3 border border-gray-100 flex flex-col";
    const labelStyle = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1";
    const valueStyle = "text-xl font-black text-gray-900 leading-none";

    const kcalValue = (safeData.kcalGoal || "0").toString().replace(/kcal/gi, '').trim();

    return (
        <div className="flex flex-col items-center bg-white print:bg-transparent">
            
            {/* CAPA (Page 1) */}
            <div style={coverPageStyle}>
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                    <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-64 h-auto mb-12" />
                    
                    <h1 className="text-3xl font-black text-[#d4af37] uppercase tracking-widest text-center leading-tight mb-12">
                        PROTOCOLO<br/>COMPLETO DE<br/>{protocolTitle}
                    </h1>

                    <div className="w-2/3 border-t border-white/20 my-8"></div>

                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter text-center">
                        {clientName}
                    </h2>

                    <div className="w-2/3 border-b border-white/20 my-8"></div>

                    <div className="mt-8 px-6 py-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10">
                        <p className="text-xs font-bold text-[#d4af37] uppercase tracking-widest">
                            PERÍODO: {contract.startDate || '...'} — {contract.endDate || '...'}
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full h-4 bg-[#d4af37]"></div>
            </div>

            {/* DADOS E ESTRATÉGIA (Page 2) */}
            <div style={pageStyle}>
                <div className={sectionTitleStyle}>1. DADOS FÍSICOS — {physical.date}</div>
                
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

                <h4 className="text-xs font-black uppercase text-gray-900 mb-2">BIOIMPEDÂNCIA</h4>
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

                <div className={sectionTitleStyle}>2. ESTRATÉGIA NUTRICIONAL</div>
                
                <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-300 mb-8">
                    <span className="font-bold text-gray-900 text-xs uppercase block mb-2">Observação:</span>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        {safeData.nutritionalStrategy || "Estratégia personalizada de acordo com anamnese e objetivos."}
                    </p>
                </div>
                
                <div className="bg-[#111] text-center p-8 rounded-xl mb-10 mx-auto w-full">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">META DIÁRIA (FOCO EM {protocolTitle})</p>
                    <p className="text-5xl font-black text-[#d4af37] whitespace-nowrap leading-none">
                        {kcalValue} <span className="text-xl text-white/50 ml-1">kcal</span>
                    </p>
                </div>

                <h4 className="text-sm font-black text-gray-900 mb-4 uppercase">Distribuição de Macronutrientes</h4>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">PROTEÍNAS</p>
                        <p className="text-3xl font-black text-gray-900">{macros.protein?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.protein?.ratio || '0'}g/kg</p>
                    </div>
                    <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">CARBOIDRATOS</p>
                        <p className="text-3xl font-black text-gray-900">{macros.carbs?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.carbs?.ratio || '0'}g/kg</p>
                    </div>
                    <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">GORDURAS</p>
                        <p className="text-3xl font-black text-gray-900">{macros.fats?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.fats?.ratio || '0'}g/kg</p>
                    </div>
                </div>
                
                <div className="mt-8 bg-[#fffbe6] border border-[#d4af37]/20 p-3 rounded text-center">
                    <p className="text-xs font-bold text-[#8c701c]">Nota Importante: Manter a consistência na pesagem dos alimentos.</p>
                </div>
            </div>

            {/* PLANO ALIMENTAR (Page 3) */}
            <div style={pageStyle}>
                <div className={sectionTitleStyle}>3. PLANO ALIMENTAR DIÁRIO</div>
                
                {/* Header Tabela */}
                <div className="grid grid-cols-12 bg-[#d4af37] text-white font-bold text-xs uppercase py-2 px-3 rounded-t-lg mb-0">
                    <div className="col-span-2">Horário</div>
                    <div className="col-span-10">Refeição & Detalhes</div>
                </div>

                <div className="flex flex-col gap-0 divide-y divide-gray-100 border border-gray-100 rounded-b-lg mb-8">
                    {meals.map((meal, index) => (
                        <div key={index} className="grid grid-cols-12 p-4 items-start odd:bg-white even:bg-gray-50 break-inside-avoid">
                            <div className="col-span-2 text-[#d4af37] font-black text-sm pt-0.5">
                                {meal.time}
                            </div>
                            <div className="col-span-10">
                                <p className="font-bold text-gray-900 text-sm mb-1 uppercase">{meal.name}</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{meal.details}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mt-auto mb-4 break-inside-avoid">
                    <p className="text-gray-500 text-sm italic font-medium">Lembre-se de manter a hidratação ao longo do dia (mínimo {safeData.waterGoal || '3.5'}L de água).</p>
                </div>
            </div>

            {/* SUPLEMENTAÇÃO E DICAS (Page 4) */}
            <div style={pageStyle}>
                <div className={sectionTitleStyle}>4. SUPLEMENTAÇÃO E RECOMENDAÇÕES</div>
                
                <div className="space-y-4 mb-10">
                    {supplements.map((s, idx) => {
                        // Cores alternadas baseadas no modelo (Dourado, Azul, Escuro)
                        let bgClass = "bg-[#111]";
                        let textClass = "text-white";
                        if (idx % 3 === 0) { bgClass = "bg-[#d4af37]"; textClass = "text-white"; }
                        else if (idx % 3 === 1) { bgClass = "bg-[#2563eb]"; textClass = "text-white"; }

                        return (
                            <div key={idx} className={`${bgClass} ${textClass} p-4 rounded-xl flex items-center justify-between shadow-sm break-inside-avoid`}>
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

                <h4 className="text-lg font-black text-gray-900 mb-6 uppercase">Dicas:</h4>
                <div className="space-y-3">
                    {tips.map((tip, index) => (
                        <div key={index} className="flex gap-3 items-start break-inside-avoid">
                            <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></div>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* TREINO (Page 5+) */}
            {trainingDays.length > 0 && (
                <div style={pageStyle}>
                    <div className={sectionTitleStyle}>5. DIVISÃO DE TREINO</div>
                    <p className="text-xs text-gray-500 mb-6 uppercase font-bold">Frequência: {safeData.trainingFrequency || '5x na semana'}</p>

                    <div className="space-y-8">
                        {trainingDays.map((day, dIdx) => (
                            <div key={dIdx} className="break-inside-avoid mb-6">
                                {/* Header Treino Preto/Dourado */}
                                <div className="bg-[#0a0a0a] text-white p-3 flex justify-between items-center rounded-t-lg">
                                    <h4 className="font-black uppercase text-[#d4af37] tracking-wider">{day.title}</h4>
                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">FOCO: {day.focus}</span>
                                </div>
                                
                                <div className="border border-gray-200 border-t-0 rounded-b-lg overflow-hidden bg-white">
                                    <table className="w-full text-left text-xs">
                                        <tbody className="divide-y divide-gray-100">
                                            {day.exercises.map((ex, eIdx) => (
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

            {/* PAGE FINAL (Atenção) */}
            <div style={endPageStyle}>
                 <div className="border-[3px] border-[#d4af37] w-full h-full flex flex-col items-center justify-center p-12 text-center rounded-3xl relative">
                    <AlertTriangle size={80} className="text-[#d4af37] mb-8" strokeWidth={1.5} />
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">Atenção</h2>
                    <div className="w-24 h-2 bg-[#d4af37] mb-12"></div>
                    
                    <p className="text-xs text-white/90 leading-relaxed max-w-2xl mx-auto mb-16 font-medium">
                        Este protocolo foi desenhado especificamente para você, {firstName}.<br/><br/>
                        Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedbacks.
                    </p>
                    
                    <p className="text-[#d4af37] text-2xl font-black italic uppercase tracking-widest">
                        "A consistência vence a intensidade."
                    </p>

                    <div className="absolute bottom-8 text-[10px] font-black uppercase text-gray-600 tracking-[0.5em]">
                        TEAM VBR © 2026
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
