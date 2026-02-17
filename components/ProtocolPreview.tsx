
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { ChevronLeft, Download, Loader2, AlertTriangle, FileText, Maximize2, X, FileDown, Dumbbell, Eye } from 'lucide-react';

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
      margin: [0, 0, 0, 0],
      filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff', scrollY: 0 },
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
    const safeData = data || {};
    const physical = safeData.physicalData || {};
    const contract = safeData.contract || {};
    const measurements = physical.measurements || {
        thorax: "-", waist: "-", abdomen: "-", glutes: "-",
        rightArmRelaxed: "-", leftArmRelaxed: "-",
        rightArmContracted: "-", leftArmContracted: "-",
        rightThigh: "-", leftThigh: "-",
        rightCalf: "-", leftCalf: "-"
    };
    const macros = safeData.macros || { protein: { value: '0', ratio: '' }, carbs: { value: '0', ratio: '' }, fats: { value: '0', ratio: '' } };
    const meals = safeData.meals || [];
    const supplements = safeData.supplements || [];
    const tips = safeData.tips || [];
    const trainingDays = safeData.trainingDays || [];
    
    // Chunk training days into groups of 2 for better page flow
    const trainingChunks = [];
    if (trainingDays.length === 0) {
        trainingChunks.push([]);
    } else {
        for (let i = 0; i < trainingDays.length; i += 2) {
            trainingChunks.push(trainingDays.slice(i, i + 2));
        }
    }
    
    const kcalSubtext = safeData.kcalSubtext || "Manutenção";
    const protocolTitle = safeData.protocolTitle || "Geral";
    const clientName = safeData.clientName || "Aluno";

    const pageStyle: React.CSSProperties = { 
        width: '210mm', 
        minHeight: '296mm', 
        padding: '15mm', 
        backgroundColor: 'white', 
        color: 'black', 
        position: 'relative', 
        boxSizing: 'border-box', 
        display: 'block',
        margin: isPdfMode ? '0' : '0 auto',
        boxShadow: isPdfMode ? 'none' : '0 10px 30px rgba(0,0,0,0.1)'
    };

    const sectionTitle = "text-xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-8 uppercase";
    const dataCardStyle = "bg-white border border-gray-100 p-6 rounded-xl shadow-sm break-inside-avoid text-left";
    const labelStyle = "text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-widest";
    const valueStyle = "text-2xl font-black text-gray-900";

    return (
        <div className="bg-gray-100 text-black flex flex-col items-center print:bg-transparent">
            {/* PÁGINA 1: CAPA (Matching Screenshot 1) */}
            <div style={{ ...pageStyle, padding: 0, backgroundColor: '#0a0a0a' }} className="relative h-[296mm] flex flex-col justify-between text-white text-center bg-[#0a0a0a]">
                <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10">
                    <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-80 h-auto mb-16 relative z-10" />
                    
                    <h1 className="text-4xl font-black text-[#d4af37] uppercase tracking-wider leading-tight mb-20 max-w-2xl mx-auto">
                        PROTOCOLO<br/>COMPLETO DE<br/>{protocolTitle}
                    </h1>
                    
                    <div className="border-t border-b border-white/10 py-10 w-full max-w-2xl bg-white/[0.02]">
                        <h2 className="text-6xl font-black uppercase tracking-tight text-white leading-none">
                            {clientName}
                        </h2>
                    </div>
                    
                    <div className="mt-20 bg-[#d4af37]/10 px-10 py-5 rounded-full border border-[#d4af37]/30">
                        <p className="text-xl font-bold text-white uppercase tracking-widest">
                            Período: {contract.startDate || '...'} — {contract.endDate || '...'}
                        </p>
                    </div>
                </div>
                {/* Gold bar at the very bottom */}
                <div className="h-4 bg-[#d4af37] w-full"></div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 2: DADOS FÍSICOS E ESTRATÉGIA (Matching Screenshot 2) */}
            <div style={pageStyle} className="h-auto">
                <h3 className={sectionTitle}>1. Dados Físicos - {physical.date || new Date().toLocaleDateString('pt-BR')}</h3>
                
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className={dataCardStyle}><span className={labelStyle}>Peso Atual</span><span className={valueStyle}>{physical.weight || '-'} kg</span></div>
                    <div className={dataCardStyle}><span className={labelStyle}>Altura</span><span className={valueStyle}>{physical.height || '-'} m</span></div>
                    <div className={dataCardStyle}><span className={labelStyle}>Idade</span><span className={valueStyle}>{physical.age || '-'} anos</span></div>
                </div>
                
                <h4 className="text-[12px] font-black uppercase text-black mb-6 tracking-widest">Bioimpedância</h4>
                <div className="grid grid-cols-4 gap-4 mb-12">
                    <div className={dataCardStyle}><span className={labelStyle}>Massa Musc.</span><span className="text-xl font-black text-gray-900">{physical.muscleMass || '-'} kg</span></div>
                    <div className={dataCardStyle}><span className={labelStyle}>Gordura</span><span className="text-xl font-black text-gray-900">{physical.bodyFat || '-'}%</span></div>
                    <div className={dataCardStyle}><span className={labelStyle}>G. Visceral</span><span className="text-xl font-black text-gray-900">{physical.visceralFat || '-'}</span></div>
                    <div className={dataCardStyle}><span className={labelStyle}>IMC</span><span className="text-xl font-black text-gray-900">{physical.imc || '-'}</span></div>
                </div>

                <h3 className={sectionTitle}>2. Estratégia Nutricional</h3>
                <div className="bg-[#f8f9fa] p-8 rounded-none border-l-[12px] border-gray-400 mb-10 text-sm text-gray-800 leading-relaxed break-inside-avoid shadow-sm">
                    <span className="font-black uppercase text-[10px] text-black block mb-4 tracking-widest">Observação:</span>
                    <p className="whitespace-pre-wrap font-medium">{safeData.nutritionalStrategy || "Estratégia personalizada de acordo com anamnese e objetivos."}</p>
                </div>
                
                <div className="bg-[#111] text-center p-12 rounded-xl mb-12 break-inside-avoid shadow-xl">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 leading-relaxed px-10">
                        META DIÁRIA (FOCO EM {protocolTitle.toUpperCase()})
                    </p>
                    <p className="text-6xl font-black text-[#d4af37]">{safeData.kcalGoal || "0"} kcal</p>
                </div>

                <h4 className="text-[14px] font-black text-black mb-6 uppercase tracking-widest">Distribuição de Macronutrientes</h4>
                <div className="grid grid-cols-3 gap-6 mb-10 break-inside-avoid">
                    <div className="bg-white border border-gray-100 p-8 text-center rounded-xl shadow-sm">
                        <p className="text-[#d4af37] font-black text-xs uppercase tracking-widest mb-4">Proteínas</p>
                        <p className="text-4xl font-black text-gray-900 mb-2">{macros.protein?.value || '0'}g</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{macros.protein?.ratio || ''}</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-8 text-center rounded-xl shadow-sm">
                        <p className="text-[#d4af37] font-black text-xs uppercase tracking-widest mb-4">Carboidratos</p>
                        <p className="text-4xl font-black text-gray-900 mb-2">{macros.carbs?.value || '0'}g</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{macros.carbs?.ratio || ''}</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-8 text-center rounded-xl shadow-sm">
                        <p className="text-[#d4af37] font-black text-xs uppercase tracking-widest mb-4">Gorduras</p>
                        <p className="text-4xl font-black text-gray-900 mb-2">{macros.fats?.value || '0'}g</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{macros.fats?.ratio || ''}</p>
                    </div>
                </div>
                
                <div className="bg-[#fff9e6] border border-[#ffecb3] p-4 rounded-lg text-center break-inside-avoid">
                    <p className="text-xs font-bold text-gray-700">
                        <span className="text-[#d4af37]">Nota Importante:</span> Manter a consistência na pesagem dos alimentos.
                    </p>
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 3: DIETA (Matching Screenshot 3) */}
            <div style={pageStyle} className="h-auto">
                <h3 className={sectionTitle}>3. Plano Alimentar Diário</h3>
                <table className="w-full text-left text-sm border-collapse mb-10 shadow-sm rounded-xl overflow-hidden">
                    <thead>
                        <tr className="bg-[#d4af37] text-white">
                            <th className="p-5 font-black uppercase text-xs tracking-widest w-32 border-b-2 border-white/20">Horário</th>
                            <th className="p-5 font-black uppercase text-xs tracking-widest border-b-2 border-white/20">Refeição & Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {meals.map((meal, index) => (
                            <tr key={meal.id || index} className={`${index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"} break-inside-avoid`}>
                                <td className="p-6 font-black text-[#d4af37] align-top text-lg">{meal.time}</td>
                                <td className="p-6">
                                    <p className="font-black text-gray-900 mb-3 uppercase tracking-tight text-lg">{meal.name}</p>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{meal.details}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-20 border-2 border-dashed border-gray-200 p-10 text-center text-gray-400 italic text-lg rounded-[2rem] break-inside-avoid">
                    Lembre-se de manter a hidratação ao longo do dia (mínimo {safeData.waterGoal || '3.5'}L de água).
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 4: SUPLEMENTAÇÃO (Matching Screenshot 4) */}
            <div style={pageStyle} className="h-auto">
                <h3 className={sectionTitle}>4. Suplementação e Recomendações</h3>
                <div className="space-y-6 mb-16">
                    {supplements.map((supp) => {
                        let bgColor = "bg-[#1f2937]"; // Default Dark Gray
                        const nameLower = (supp.name || "").toLowerCase();
                        if (nameLower.includes('creatina')) bgColor = "bg-[#d4af37]"; 
                        else if (nameLower.includes('whey')) bgColor = "bg-[#2563eb]"; 
                        else if (nameLower.includes('cafeína') || nameLower.includes('cafeina') || nameLower.includes('café')) bgColor = "bg-[#5d4037]"; 
                        
                        return (
                            <div key={supp.id} className={`${bgColor} text-white p-8 rounded-xl flex justify-between items-center shadow-lg break-inside-avoid relative overflow-hidden group`}>
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-black uppercase mb-2 tracking-tighter">{supp.name}</h4>
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{supp.dosage}</p>
                                </div>
                                <div className="bg-black/20 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-[0.1em] border border-white/10 relative z-10 max-w-[300px] text-right">
                                    {supp.timing}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <h4 className="text-2xl font-black text-black mb-8 uppercase tracking-tighter">Dicas:</h4>
                <div className="space-y-6">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-5 text-lg text-gray-800 break-inside-avoid group">
                            <div className="w-2.5 h-2.5 bg-black mt-2.5 shrink-0 rounded-none rotate-45 group-hover:bg-[#d4af37] transition-colors"></div>
                            <span className="font-bold leading-tight">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINAS DE TREINO (Matching Screenshot 5 & 6) */}
            {trainingChunks.map((chunk, index) => (
                <React.Fragment key={`training-page-${index}`}>
                    <div style={pageStyle} className="h-auto">
                        <h3 className="text-xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-2 uppercase tracking-tight">
                            5. DIVISÃO DE TREINO (PARTE {index + 1})
                        </h3>
                        {index === 0 && (
                            <p className="text-xs font-bold text-gray-500 mb-10 uppercase tracking-widest">
                                Frequência: {safeData.trainingFrequency || '5x na semana'}
                            </p>
                        )}
                        <div className="space-y-12">
                            {chunk.map((day) => (
                                <div key={day.id} className="border-2 border-black rounded-none overflow-hidden break-inside-avoid shadow-lg">
                                    <div className="bg-[#111] p-4 flex justify-between items-center px-6">
                                        <span className="font-black uppercase text-white text-xl tracking-tighter">
                                            {day.title}
                                        </span>
                                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em]">
                                            FOCO: {day.focus}
                                        </span>
                                    </div>
                                    <table className="w-full text-base text-left bg-white border-t border-black">
                                        <tbody className="divide-y divide-gray-100">
                                            {(day.exercises || []).map((ex, idx) => (
                                                <tr key={ex.id || idx} className="bg-white hover:bg-gray-50 transition-colors">
                                                    <td className="p-5 font-black text-gray-900 uppercase tracking-tight leading-none">{ex.name}</td>
                                                    <td className="p-5 font-black text-black text-right whitespace-nowrap w-32 border-l border-gray-50">{ex.sets}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            {chunk.length === 0 && <p className="text-gray-400 italic text-center py-10">Nenhum treino cadastrado.</p>}
                        </div>
                    </div>
                    {/* Page break between training chunks */}
                    {index < trainingChunks.length - 1 && <div className="html2pdf__page-break"></div>}
                </React.Fragment>
            ))}

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA FINAL (Matching Screenshot 7) */}
            <div style={{ ...pageStyle, padding: 0, minHeight: '296mm', height: '296mm' }} className="h-[296mm] page-break-before-always">
                <div className="w-full h-full bg-[#0a0a0a] flex flex-col justify-between p-20 text-center border-[20px] border-white box-border">
                    <div className="flex-none"></div>
                    <div className="flex flex-col items-center justify-center space-y-12">
                        <AlertTriangle size={100} className="text-[#d4af37] animate-pulse" />
                        
                        <div className="flex flex-col items-center">
                            <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">ATENÇÃO</h2>
                            <div className="w-24 h-2 bg-[#d4af37] mt-8"></div>
                        </div>

                        <div className="max-w-4xl space-y-10 text-2xl text-white/90 font-bold leading-relaxed px-10">
                            <p>Este protocolo foi desenhado especificamente para você, {clientName.split(' ')[0]}.</p>
                            <p className="opacity-70">Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedbacks.</p>
                            <p className="text-[#d4af37] text-3xl font-black mt-16 italic tracking-tight">A consistência vence a intensidade.</p>
                        </div>
                    </div>
                    <div className="flex-none pt-20">
                        <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em]">TEAM VBR © 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
        {customTrigger ? (
            <>
                <div onClick={() => setShowModal(true)} className="cursor-pointer">{customTrigger}</div>
                {showModal && (
                    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                            <div className="bg-gray-50 p-6 px-10 flex justify-between items-center border-b border-gray-200 shrink-0">
                                <h2 className="text-black font-black uppercase tracking-tighter text-xl flex items-center gap-3"><FileText size={24} className="text-[#d4af37]" /> Visualizar Protocolo Completo</h2>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:rotate-90"><X size={28} /></button>
                            </div>
                            <div className="flex-1 overflow-auto bg-[#333] p-12 custom-scrollbar flex justify-center items-start">
                                {renderContent(false)}
                            </div>
                            <div className="bg-white p-8 border-t border-gray-200 flex justify-end gap-6 shrink-0">
                                <button onClick={() => setShowModal(false)} className="px-10 py-4 rounded-2xl font-black uppercase text-xs text-gray-400 hover:bg-gray-100 transition-all tracking-widest">Fechar Prévia</button>
                                <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-12 py-5 bg-[#d4af37] hover:bg-black hover:text-[#d4af37] text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center gap-3 transition-all active:scale-95 group">
                                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} className="group-hover:bounce" />}
                                    {isGenerating ? "Processando PDF..." : "Baixar Protocolo PDF"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="fixed left-[-9999px] top-0"><div ref={pdfRef} className="bg-white">{renderContent(true)}</div></div>
            </>
        ) : null}
    </div>
  );
});

export default ProtocolPreview;
