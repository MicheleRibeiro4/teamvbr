
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ProtocolData } from '../types';
import { EMPTY_DATA } from '../constants';
import { Loader2, FileText, X, FileDown, AlertTriangle, Dumbbell, Lightbulb } from 'lucide-react';

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
        windowWidth: 794 // Largura A4 padrão
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
    
    const protocolTitle = safeData.protocolTitle || "Geral";
    const clientName = safeData.clientName || "Aluno";

    const A4_HEIGHT = '296mm'; 
    const A4_WIDTH = '210mm';
    const CONTENT_PADDING = '15mm'; 

    const contentPageStyle: React.CSSProperties = {
        minHeight: A4_HEIGHT,
        width: A4_WIDTH,
        padding: CONTENT_PADDING,
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        overflow: 'hidden',
        color: 'black',
        fontFamily: 'Inter, sans-serif'
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

    // Estilos baseados no modelo enviado (Blocos amarelos e fundo branco)
    const sectionHeaderStyle = "bg-[#d4af37] text-white font-black uppercase text-sm tracking-widest p-2 px-4 mb-0 break-after-avoid";
    const subHeaderStyle = "bg-[#e5b83b] text-black font-bold uppercase text-[10px] tracking-wider p-1 px-4 mb-2 break-after-avoid w-full";
    const contentBoxStyle = "bg-gray-50 border border-gray-100 p-4 text-sm text-gray-800 leading-relaxed font-medium mb-6 rounded-b-lg break-inside-avoid";
    
    const labelStyle = "text-[9px] font-bold text-gray-400 uppercase block mb-1 tracking-widest";
    const valueStyle = "text-xl font-black text-gray-900 leading-none";
    const cardStyle = "bg-white border border-gray-100 p-4 rounded-xl shadow-sm h-full flex flex-col justify-center break-inside-avoid text-center";

    const kcalValue = (safeData.kcalGoal || "0").toString().replace(/kcal/gi, '').trim();

    return (
        <div className="bg-gray-100 text-black flex flex-col items-center print:bg-transparent w-full">
            
            {/* CAPA */}
            <div style={coverPageStyle}>
                <div className="flex-1 flex flex-col items-center justify-center w-full px-12 relative z-10">
                    <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-64 h-auto mb-16 relative z-10" />
                    <h1 className="text-4xl font-black text-[#d4af37] uppercase tracking-wider leading-tight mb-20 max-w-2xl mx-auto text-center">
                        PROTOCOLO<br/>PERSONALIZADO<br/>{protocolTitle.toUpperCase()}
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

            {/* PÁGINA 1: DADOS E ESTRATÉGIA */}
            <div style={contentPageStyle}>
                <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b-2 border-[#d4af37] pb-2 inline-block">1. Avaliação Física</h3>
                <p className="text-xs font-bold text-gray-400 mb-4 uppercase">Data: {physical.date || new Date().toLocaleDateString('pt-BR')}</p>
                
                <div className="grid grid-cols-4 gap-3 mb-10">
                    <div className={cardStyle}><span className={labelStyle}>PESO ATUAL</span><span className={valueStyle}>{physical.weight || '-'} kg</span></div>
                    <div className={cardStyle}><span className={labelStyle}>ALTURA</span><span className={valueStyle}>{physical.height || '-'} m</span></div>
                    <div className={cardStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{physical.imc || '-'}</span></div>
                    <div className={cardStyle}><span className={labelStyle}>IDADE</span><span className={valueStyle}>{physical.age || '-'} anos</span></div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-10">
                    <div className={cardStyle}><span className={labelStyle}>MASSA MUSC.</span><span className="text-lg font-black text-gray-900">{physical.muscleMass || '-'} kg</span></div>
                    <div className={cardStyle}><span className={labelStyle}>GORDURA</span><span className="text-lg font-black text-gray-900">{physical.bodyFat || '-'}%</span></div>
                    <div className={cardStyle}><span className={labelStyle}>G. VISCERAL</span><span className="text-lg font-black text-gray-900">{physical.visceralFat || '-'}</span></div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b-2 border-[#d4af37] pb-2 inline-block">2. Estratégia Nutricional</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#d4af37] mb-8 shadow-sm break-inside-avoid">
                    <span className="font-black uppercase text-xs text-[#d4af37] block mb-2 tracking-widest">Resumo da Estratégia</span>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium text-justify">
                        {safeData.nutritionalStrategy || "Estratégia personalizada de acordo com anamnese e objetivos."}
                    </p>
                </div>
                
                <div className="bg-[#111] text-center p-6 rounded-xl mb-8 shadow-md break-inside-avoid mx-auto w-full max-w-lg flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">META CALÓRICA DIÁRIA</p>
                    <p className="text-5xl font-black text-[#d4af37] whitespace-nowrap leading-none">
                        {kcalValue} <span className="text-lg text-white/50 ml-1">kcal</span>
                    </p>
                </div>

                <h4 className="text-xs font-black text-gray-900 mb-4 uppercase tracking-widest text-center">Distribuição de Macros</h4>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border-2 border-gray-100 p-4 text-center rounded-xl break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">PROTEÍNAS</p>
                        <p className="text-2xl font-black text-gray-900">{macros.protein?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.protein?.ratio || '0'}g/kg</p>
                    </div>
                    <div className="bg-white border-2 border-gray-100 p-4 text-center rounded-xl break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">CARBOIDRATOS</p>
                        <p className="text-2xl font-black text-gray-900">{macros.carbs?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.carbs?.ratio || '0'}g/kg</p>
                    </div>
                    <div className="bg-white border-2 border-gray-100 p-4 text-center rounded-xl break-inside-avoid">
                        <p className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-1">GORDURAS</p>
                        <p className="text-2xl font-black text-gray-900">{macros.fats?.value || '0'}g</p>
                        <p className="text-[9px] text-gray-400 font-bold">{macros.fats?.ratio || '0'}g/kg</p>
                    </div>
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 2: PLANO ALIMENTAR (LAYOUT EM LISTA LIMPA CONFORME MODELO) */}
            <div style={contentPageStyle}>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight border-b-2 border-[#d4af37] pb-2 inline-block">3. Plano Alimentar Diário</h3>
                
                <div className="flex flex-col gap-1">
                    {meals.map((meal, index) => (
                        <div key={meal.id || index} className="break-inside-avoid mb-6">
                            {/* Cabeçalho Dourado */}
                            <div className={sectionHeaderStyle}>
                                {meal.time ? `${meal.time} - ` : ''}{meal.name}
                            </div>
                            
                            {/* Sub-cabeçalho Dourado Claro */}
                            <div className={subHeaderStyle}>
                                DETALHES DA REFEIÇÃO
                            </div>

                            {/* Conteúdo Limpo */}
                            <div className="bg-white text-sm text-gray-800 leading-relaxed p-2 font-medium whitespace-pre-wrap">
                                {meal.details}
                            </div>
                        </div>
                    ))}
                </div>

                {supplements.length > 0 && (
                    <div className="mt-8 break-inside-avoid">
                        <div className={sectionHeaderStyle}>SUPLEMENTAÇÃO ESTRATÉGICA</div>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {supplements.map((s, idx) => (
                                <div key={s.id || idx} className="bg-gray-50 p-3 rounded border-l-4 border-[#d4af37] flex justify-between items-center">
                                    <p className="font-black text-xs text-gray-900 uppercase">{s.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.dosage} • {s.timing}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 3: TREINO */}
            {trainingDays.length > 0 && (
                <div style={contentPageStyle}>
                    <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight border-b-2 border-[#d4af37] pb-2 inline-block">4. Programação de Treinos</h3>
                    <div className="space-y-8">
                        {trainingDays.map((day, dIdx) => (
                            <div key={day.id || dIdx} className="break-inside-avoid">
                                <div className="flex items-center gap-3 mb-2 bg-[#d4af37] p-3">
                                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-[#d4af37]">
                                        <Dumbbell size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase tracking-tighter leading-none">{day.title}</h4>
                                        <p className="text-[9px] font-bold text-black uppercase tracking-widest mt-0.5">{day.focus}</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 bg-white">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-500 uppercase font-black tracking-widest text-[9px]">
                                                <th className="p-3 border-b border-gray-200">Exercício</th>
                                                <th className="p-3 border-b border-gray-200 text-center w-24">Séries / Reps</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {day.exercises.map((ex, eIdx) => (
                                                <tr key={ex.id || eIdx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-bold text-gray-800 uppercase text-[10px]">{ex.name}</td>
                                                    <td className="p-3 text-center font-black text-[#d4af37] text-xs">{ex.sets}</td>
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

             <div className="html2pdf__page-break"></div>

            {/* PÁGINA FINAL: DICAS E ATENÇÃO */}
            <div style={contentPageStyle}>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight border-b-2 border-[#d4af37] pb-2 inline-block">5. Recomendações Gerais</h3>
                
                <div className="space-y-4 mb-12">
                    {tips.map((tip, index) => (
                        <div key={index} className="flex gap-4 items-start break-inside-avoid">
                            <div className="w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-black text-sm shrink-0 mt-1">
                                {index + 1}
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex-1">
                                <p className="text-sm font-medium text-gray-800 leading-relaxed">{tip}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black text-white p-10 rounded-xl text-center break-inside-avoid mt-auto">
                     <AlertTriangle size={40} className="text-[#d4af37] mx-auto mb-6" />
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Atenção</h2>
                     <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-6"></div>
                     <p className="text-sm text-white/70 leading-relaxed max-w-lg mx-auto mb-8">
                        Este protocolo é individual e intransferível. Siga as orientações com disciplina. 
                        Ajustes serão feitos conforme sua evolução e feedbacks quinzenais.
                     </p>
                     <p className="text-[#d4af37] text-xl font-black italic uppercase">
                        "A consistência vence a intensidade."
                     </p>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">TEAM VBR © 2026</p>
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
