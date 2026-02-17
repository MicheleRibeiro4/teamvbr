
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
      alert("Erro ao gerar PDF. Verifique se as imagens foram carregadas."); 
      console.error(err);
    } finally { 
      setIsGenerating(false); 
    }
  };

  useImperativeHandle(ref, () => ({
    download: handleDownloadPDF
  }));

  const renderContent = (isPdfMode = false) => {
    // --- SAFEGUARDS (Proteção contra dados nulos) ---
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
    const macros = safeData.macros || { 
        protein: { value: '0', ratio: '' }, 
        carbs: { value: '0', ratio: '' }, 
        fats: { value: '0', ratio: '' } 
    };
    const meals = safeData.meals || [];
    const supplements = safeData.supplements || [];
    const tips = safeData.tips || [];
    const trainingDays = safeData.trainingDays || [];
    
    const kcalSubtext = safeData.kcalSubtext || "Manutenção";
    const protocolTitle = safeData.protocolTitle || "Personalizado";
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

    const lastPageStyle: React.CSSProperties = {
        ...pageStyle,
        padding: '0',
        pageBreakBefore: 'always'
    };
    
    const sectionTitle = "text-xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-6 uppercase";
    const dataCardStyle = "bg-gray-50 border border-gray-100 p-4 rounded-lg break-inside-avoid";
    const labelStyle = "text-xs font-bold text-gray-500 uppercase block mb-1";
    const valueStyle = "text-xl font-bold text-gray-900";

    return (
        <div className="bg-gray-100 text-black flex flex-col items-center print:bg-transparent">
            
            {/* PÁGINA 1: CAPA */}
            <div style={{ ...pageStyle, padding: 0, backgroundColor: '#111' }} className="relative h-[296mm] flex flex-col justify-between text-white text-center bg-[#111]">
            <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10 pb-10">
                <img src={LOGO_VBR_GOLD} alt="Team VBR" className="w-80 h-auto mb-12 relative z-10" />
                <h1 className="text-5xl font-black text-[#d4af37] uppercase tracking-wider leading-tight mb-16">
                PROTOCOLO<br/>COMPLETO DE<br/>{protocolTitle}
                </h1>
                <div className="border-t border-b border-white/20 py-8 w-full max-w-2xl">
                <h2 className="text-6xl font-black uppercase tracking-tight text-white">{clientName}</h2>
                </div>
                <div className="mt-16 bg-[#d4af37]/10 px-8 py-4 rounded-full border border-[#d4af37]/30">
                <p className="text-2xl font-bold text-white uppercase tracking-widest">
                    Período: {contract.startDate || '...'} — {contract.endDate || '...'}
                </p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-[#d4af37]"></div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 2: DADOS & ESTRATÉGIA */}
            <div style={pageStyle}>
            <h3 className={sectionTitle}>1. Dados Físicos - {physical.date || new Date().toLocaleDateString('pt-BR')}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className={dataCardStyle}><span className={labelStyle}>Peso Atual</span><span className={valueStyle}>{physical.weight || '-'} kg</span></div>
                <div className={dataCardStyle}><span className={labelStyle}>Altura</span><span className={valueStyle}>{physical.height || '-'} m</span></div>
                <div className={dataCardStyle}><span className={labelStyle}>Idade</span><span className={valueStyle}>{physical.age || '-'} anos</span></div>
            </div>

            <h4 className="text-sm font-bold uppercase text-black mb-3">Bioimpedância</h4>
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className={dataCardStyle}><span className={labelStyle}>Massa Musc.</span><span className={valueStyle}>{physical.muscleMass || '-'} kg</span></div>
                <div className={dataCardStyle}><span className={labelStyle}>Gordura</span><span className={valueStyle}>{physical.bodyFat || '-'}%</span></div>
                <div className={dataCardStyle}><span className={labelStyle}>G. Visceral</span><span className={valueStyle}>{physical.visceralFat || '-'}</span></div>
                <div className={dataCardStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{physical.imc || '-'}</span></div>
            </div>
            
            <h4 className="text-sm font-bold uppercase text-black mb-3">Medidas Corporais</h4>
            <div className="mb-10 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="grid grid-cols-4 gap-4 mb-4 border-b border-gray-200 pb-4">
                    <div className="col-span-4 text-xs font-black text-[#d4af37] uppercase tracking-widest">Superior</div>
                    <div><span className={labelStyle}>Tórax</span><span className="font-bold text-gray-900">{measurements.thorax || '-'}</span></div>
                    <div><span className={labelStyle}>Cintura</span><span className="font-bold text-gray-900">{measurements.waist || '-'}</span></div>
                    <div><span className={labelStyle}>Abdômen</span><span className="font-bold text-gray-900">{measurements.abdomen || '-'}</span></div>
                    <div><span className={labelStyle}>Glúteo</span><span className="font-bold text-gray-900">{measurements.glutes || '-'}</span></div>
                    
                    <div><span className={labelStyle}>Braço Dir (Rel)</span><span className="font-bold text-gray-900">{measurements.rightArmRelaxed || '-'}</span></div>
                    <div><span className={labelStyle}>Braço Esq (Rel)</span><span className="font-bold text-gray-900">{measurements.leftArmRelaxed || '-'}</span></div>
                    <div><span className={labelStyle}>Braço Dir (Cont)</span><span className="font-bold text-gray-900">{measurements.rightArmContracted || '-'}</span></div>
                    <div><span className={labelStyle}>Braço Esq (Cont)</span><span className="font-bold text-gray-900">{measurements.leftArmContracted || '-'}</span></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-4 text-xs font-black text-[#d4af37] uppercase tracking-widest">Inferior</div>
                    <div><span className={labelStyle}>Coxa Dir</span><span className="font-bold text-gray-900">{measurements.rightThigh || '-'}</span></div>
                    <div><span className={labelStyle}>Coxa Esq</span><span className="font-bold text-gray-900">{measurements.leftThigh || '-'}</span></div>
                    <div><span className={labelStyle}>Panturrilha Dir</span><span className="font-bold text-gray-900">{measurements.rightCalf || '-'}</span></div>
                    <div><span className={labelStyle}>Panturrilha Esq</span><span className="font-bold text-gray-900">{measurements.leftCalf || '-'}</span></div>
                </div>
            </div>

            <h3 className={sectionTitle}>2. Estratégia Nutricional</h3>
            
            <div className="bg-gray-100 p-6 rounded-none border-l-4 border-gray-400 mb-8 text-sm text-gray-800 leading-relaxed break-inside-avoid">
                <span className="font-bold block mb-1">Observação:</span>
                {safeData.nutritionalStrategy || "Nenhuma observação definida."}
            </div>

            <div className="bg-[#1a1a1a] text-center p-8 rounded-lg mb-8 break-inside-avoid">
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">META DIÁRIA ({kcalSubtext.toUpperCase()})</p>
                <p className="text-4xl font-bold text-[#d4af37]">{safeData.kcalGoal || "0"} kcal</p>
            </div>

            <h4 className="text-lg font-bold text-black mb-4">Distribuição de Macronutrientes</h4>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm break-inside-avoid">
                    <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Proteínas</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{macros.protein?.value || '0'}g</p>
                    <p className="text-xs text-gray-400">{macros.protein?.ratio || ''}</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm break-inside-avoid">
                    <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Carboidratos</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{macros.carbs?.value || '0'}g</p>
                    <p className="text-xs text-gray-400">{macros.carbs?.ratio || ''}</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm break-inside-avoid">
                    <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Gorduras</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{macros.fats?.value || '0'}g</p>
                    <p className="text-xs text-gray-400">{macros.fats?.ratio || ''}</p>
                </div>
            </div>

            <div className="mt-8 bg-[#fffbe6] p-4 rounded border border-[#ffe58f] text-sm text-[#876800] break-inside-avoid">
                <strong>Nota Importante:</strong> Manter a consistência na pesagem dos alimentos.
            </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 3: PLANO ALIMENTAR */}
            <div style={pageStyle}>
            <h3 className={sectionTitle}>3. Plano Alimentar Diário</h3>
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                <tr className="bg-[#d4af37] text-white">
                    <th className="p-3 font-bold w-24">Horário</th>
                    <th className="p-3 font-bold">Refeição & Detalhes</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {meals.map((meal, index) => (
                    <tr key={meal.id || index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} break-inside-avoid`}>
                    <td className="p-4 font-bold text-[#d4af37] align-top">{meal.time}</td>
                    <td className="p-4">
                        <p className="font-bold text-gray-900 mb-1">{meal.name}</p>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{meal.details}</p>
                    </td>
                    </tr>
                ))}
                {meals.length === 0 && (
                    <tr><td colSpan={2} className="p-8 text-center text-gray-400 italic">Nenhuma refeição cadastrada.</td></tr>
                )}
                </tbody>
            </table>

            <div className="mt-10 border-2 border-dashed border-gray-300 p-6 text-center text-gray-500 italic text-sm rounded-xl break-inside-avoid">
                Lembre-se de manter a hidratação ao longo do dia (mínimo {safeData.waterGoal || '3,5'}L de água).
            </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 4: SUPLEMENTAÇÃO */}
            <div style={pageStyle}>
            <h3 className={sectionTitle}>4. Suplementação e Recomendações</h3>
            <div className="space-y-4 mb-12">
                {supplements.map((supp) => {
                let bgColor = "bg-gray-800";
                const nameLower = (supp.name || "").toLowerCase();
                if (nameLower.includes('creatina')) bgColor = "bg-[#d4af37]"; 
                else if (nameLower.includes('whey')) bgColor = "bg-[#2563eb]"; 
                else if (nameLower.includes('cafeína') || nameLower.includes('cafeina') || nameLower.includes('café')) bgColor = "bg-[#5d4037]"; 

                return (
                    <div key={supp.id} className={`${bgColor} text-white p-6 rounded-xl flex justify-between items-center shadow-md break-inside-avoid`}>
                    <div>
                        <h4 className="text-xl font-bold uppercase mb-1">{supp.name}</h4>
                        <p className="text-sm opacity-90">{supp.dosage}</p>
                    </div>
                    <div className="bg-black/20 px-4 py-2 rounded-full text-xs font-bold uppercase">
                        {supp.timing}
                    </div>
                    </div>
                );
                })}
                {supplements.length === 0 && <p className="text-gray-400 italic">Nenhuma suplementação cadastrada.</p>}
            </div>

            <h4 className="text-lg font-bold text-black mb-4">Dicas:</h4>
            <ul className="space-y-3">
                {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 break-inside-avoid">
                    <div className="w-1.5 h-1.5 bg-black mt-1.5 shrink-0"></div>
                    {tip}
                </li>
                ))}
            </ul>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 5: TREINO PARTE 1 */}
            <div style={pageStyle}>
            <h3 className={sectionTitle}>5. Divisão de Treino (Parte 1)</h3>
            <p className="text-sm text-gray-600 mb-6">Frequência: {safeData.trainingFrequency || 'Não definida'}</p>
            
            <div className="space-y-8">
                {trainingDays.slice(0, 2).map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm break-inside-avoid">
                    <div className="bg-[#111] text-white p-3 flex justify-between items-center">
                    <span className="font-bold uppercase text-[#d4af37]">{day.title}</span>
                    <span className="text-xs font-bold text-[#d4af37] uppercase">Foco: {day.focus}</span>
                    </div>
                    <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-gray-100">
                        {(day.exercises || []).map((ex, idx) => (
                        <tr key={ex.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 font-medium text-gray-800">{ex.name}</td>
                            <td className="p-3 font-bold text-gray-900 text-right">{ex.sets}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ))}
                {trainingDays.length === 0 && <p className="text-gray-400 italic">Nenhum treino cadastrado.</p>}
            </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* PÁGINA 6: TREINO PARTE 2 */}
            <div style={pageStyle}>
            <h3 className={sectionTitle}>5. Divisão de Treino (Parte 2)</h3>
            
            <div className="space-y-8 mt-6">
                {trainingDays.slice(2).map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm break-inside-avoid">
                    <div className="bg-[#111] text-white p-3 flex justify-between items-center">
                    <span className="font-bold uppercase text-[#d4af37]">{day.title}</span>
                    <span className="text-xs font-bold text-[#d4af37] uppercase">Foco: {day.focus}</span>
                    </div>
                    <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-gray-100">
                        {(day.exercises || []).map((ex, idx) => (
                        <tr key={ex.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 font-medium text-gray-800">{ex.name}</td>
                            <td className="p-3 font-bold text-gray-900 text-right">{ex.sets}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ))}
            </div>
            </div>

            {/* PÁGINA 7: ENCERRAMENTO */}
            <div style={lastPageStyle} className="h-[296mm]">
            <div className="w-full h-full bg-[#111] flex flex-col justify-between p-12 text-center border-[20px] border-white box-border">
                <div className="flex-none"></div>
                <div className="flex flex-col items-center justify-center space-y-8">
                <AlertTriangle size={80} className="text-[#d4af37]" />
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Atenção</h2>
                <div className="w-24 h-2 bg-[#d4af37]"></div>
                <div className="max-w-3xl space-y-6 text-xl text-white/80 font-medium leading-relaxed">
                    <p>Este protocolo foi desenhado especificamente para você, {clientName.split(' ')[0]}.</p>
                    <p>Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedbacks.</p>
                    <p className="text-[#d4af37]">A consistência vence a intensidade.</p>
                </div>
                </div>
                <div className="flex-none pt-12">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.3em]">TEAM VBR © 2026</p>
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
                <div onClick={() => setShowModal(true)} className="cursor-pointer">
                    {customTrigger}
                </div>
                
                {showModal && (
                    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-gray-100 p-4 px-8 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-black font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-[#d4af37]" /> Visualização do Protocolo
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
                
                <div className="fixed left-[-9999px] top-0">
                    <div ref={pdfRef} className="bg-white">
                        {renderContent(true)}
                    </div>
                </div>
            </>
        ) : (
            // LAYOUT PADRÃO (CARD DE AÇÃO)
            <>
                <div className="bg-[#111] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[#d4af37]/30 transition-all shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                        <Dumbbell size={150} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <div className="w-12 h-12 bg-[#d4af37]/10 text-[#d4af37] rounded-xl flex items-center justify-center border border-[#d4af37]/20 shrink-0">
                            <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wide truncate">Protocolo de Treino</h3>
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
                                    <FileText size={20} className="text-[#d4af37]" /> Visualização do Protocolo
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

                <div className="fixed left-[-9999px] top-0">
                    <div ref={pdfRef} className="bg-white">
                        {renderContent(true)}
                    </div>
                </div>
            </>
        )}

    </div>
  );
});

export default ProtocolPreview;
