
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    const opt = {
      margin: 0,
      filename: `Protocolo_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(pdfRef.current).save();
    } catch (err) { alert("Erro ao gerar PDF."); } finally { setIsGenerating(false); }
  };

  const pageStyle = { width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: 'white', color: 'black', position: 'relative' as const, boxSizing: 'border-box' as const, display: 'block' };
  const sectionTitle = "text-xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-6 uppercase";

  // Card style for Page 2
  const dataCardStyle = "bg-gray-50 border border-gray-100 p-4 rounded-lg";
  const labelStyle = "text-xs font-bold text-gray-500 uppercase block mb-1";
  const valueStyle = "text-xl font-bold text-gray-900";

  // Safely access macros to prevent crashes
  const safeMacros = data.macros || { 
    protein: { value: '0', ratio: '' }, 
    carbs: { value: '0', ratio: '' }, 
    fats: { value: '0', ratio: '' } 
  };

  return (
    <div className="flex flex-col items-center w-full pb-20 print:pb-0">
      <div className="no-print fixed bottom-8 right-8 z-[100] flex gap-3">
        {onBack && <button onClick={onBack} className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center gap-2"><ChevronLeft size={16} /> Voltar</button>}
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95">{isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}{isGenerating ? 'Processando...' : 'Exportar Protocolo PDF'}</button>
      </div>

      <div ref={pdfRef} className="bg-gray-200 shadow-inner flex flex-col items-center gap-4 print:bg-transparent">
        
        {/* PÁGINA 1: CAPA */}
        <div style={{ ...pageStyle, padding: 0, backgroundColor: '#111' }} className="flex flex-col items-center justify-center text-white text-center relative overflow-hidden bg-[#111]">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <img src={LOGO_VBR_BLACK} alt="Team VBR" className="w-64 h-auto mb-16 relative z-10" />
            
            <h1 className="text-4xl font-black text-[#d4af37] uppercase tracking-wider leading-tight mb-20">
              PROTOCOLO<br/>
              COMPLETO DE<br/>
              {data.protocolTitle || 'HIPERTROFIA'}
            </h1>

            <h2 className="text-5xl font-bold uppercase tracking-tight mb-4">{data.clientName || 'NOME DO ALUNO'}</h2>
            
            <p className="text-sm font-medium text-white/80 mt-8">
              Período Consultoria: {data.contract.startDate} a {data.contract.endDate}
            </p>

            <div className="mt-20">
               <p className="text-white text-sm">Vinicius Brasil</p>
               <p className="text-white text-sm">Consultoria Personalizada</p>
            </div>
          </div>
          <div className="w-full h-3 bg-[#d4af37]"></div>
        </div>

        {/* PÁGINA 2: DADOS & ESTRATÉGIA */}
        <div style={pageStyle}>
          <h3 className={sectionTitle}>1. Dados Físicos - {data.physicalData.date}</h3>
          
          {/* Dados Gerais */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={dataCardStyle}><span className={labelStyle}>Peso Atual</span><span className={valueStyle}>{data.physicalData.weight} kg</span></div>
            <div className={dataCardStyle}><span className={labelStyle}>Altura</span><span className={valueStyle}>{data.physicalData.height} m</span></div>
            <div className={dataCardStyle}><span className={labelStyle}>Idade</span><span className={valueStyle}>{data.physicalData.age} anos</span></div>
          </div>

          <h4 className="text-sm font-bold uppercase text-black mb-3">Bioimpedância</h4>
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div className={dataCardStyle}><span className={labelStyle}>Massa Musc.</span><span className={valueStyle}>{data.physicalData.muscleMass} kg</span></div>
            <div className={dataCardStyle}><span className={labelStyle}>Gordura</span><span className={valueStyle}>{data.physicalData.bodyFat}%</span></div>
            <div className={dataCardStyle}><span className={labelStyle}>G. Visceral</span><span className={valueStyle}>{data.physicalData.visceralFat}</span></div>
            <div className={dataCardStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{data.physicalData.imc}</span></div>
          </div>

          <h3 className={sectionTitle}>2. Estratégia Nutricional</h3>
          
          <div className="bg-gray-100 p-6 rounded-none border-l-4 border-gray-400 mb-8 text-sm text-gray-800 leading-relaxed">
            <span className="font-bold block mb-1">Observação:</span>
            {data.nutritionalStrategy}
          </div>

          <div className="bg-[#1a1a1a] text-center p-8 rounded-lg mb-8">
             <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">META DIÁRIA ({data.kcalSubtext.toUpperCase()})</p>
             <p className="text-4xl font-bold text-[#d4af37]">{data.kcalGoal} kcal</p>
          </div>

          <h4 className="text-lg font-bold text-black mb-4">Distribuição de Macronutrientes</h4>
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm">
                <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Proteínas</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{safeMacros.protein?.value || '0'}g</p>
                <p className="text-xs text-gray-400">{safeMacros.protein?.ratio || ''}</p>
             </div>
             <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm">
                <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Carboidratos</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{safeMacros.carbs?.value || '0'}g</p>
                <p className="text-xs text-gray-400">{safeMacros.carbs?.ratio || ''}</p>
             </div>
             <div className="bg-white border border-gray-200 p-6 text-center rounded-lg shadow-sm">
                <p className="text-[#d4af37] font-bold text-sm uppercase mb-2">Gorduras</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{safeMacros.fats?.value || '0'}g</p>
                <p className="text-xs text-gray-400">{safeMacros.fats?.ratio || ''}</p>
             </div>
          </div>

          <div className="mt-8 bg-[#fffbe6] p-4 rounded border border-[#ffe58f] text-sm text-[#876800]">
            <strong>Nota Importante:</strong> Manter a consistência na pesagem dos alimentos.
          </div>
        </div>

        {/* PÁGINA 3: PLANO ALIMENTAR */}
        <div style={pageStyle} className="html2pdf__page-break">
          <h3 className={sectionTitle}>3. Plano Alimentar Diário</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#d4af37] text-white">
                <th className="p-3 font-bold w-24">Horário</th>
                <th className="p-3 font-bold">Refeição & Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal, index) => (
                <tr key={meal.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4 font-bold text-[#d4af37] align-top">{meal.time}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 mb-1">{meal.name}</p>
                    <p className="text-gray-600 leading-relaxed">{meal.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 border-2 border-dashed border-gray-300 p-6 text-center text-gray-500 italic text-sm rounded-xl">
             Lembre-se de manter a hidratação ao longo do dia (mínimo 3.5L de água).
          </div>
        </div>

        {/* PÁGINA 4: SUPLEMENTAÇÃO */}
        <div style={pageStyle} className="html2pdf__page-break">
          <h3 className={sectionTitle}>4. Suplementação e Recomendações</h3>
          <div className="space-y-4 mb-12">
            {data.supplements.map((supp) => {
              // Specific colors based on screenshots
              let bgColor = "bg-gray-800";
              const nameLower = supp.name.toLowerCase();
              if (nameLower.includes('creatina')) bgColor = "bg-[#d4af37]"; // Gold
              else if (nameLower.includes('whey')) bgColor = "bg-[#2563eb]"; // Blue
              else if (nameLower.includes('cafeína') || nameLower.includes('cafeina') || nameLower.includes('café')) bgColor = "bg-[#5d4037]"; // Brown/Coffee

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
          </div>

          <h4 className="text-lg font-bold text-black mb-4">Dicas:</h4>
          <ul className="space-y-3">
            {data.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-black mt-1.5 shrink-0"></div>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* PÁGINA 5: TREINO PARTE 1 */}
        <div style={pageStyle} className="html2pdf__page-break">
          <h3 className={sectionTitle}>5. Divisão de Treino (Parte 1)</h3>
          <p className="text-sm text-gray-600 mb-6">Frequência: {data.trainingFrequency}</p>
          
          <div className="space-y-8">
            {data.trainingDays.slice(0, 2).map((day) => (
              <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm">
                <div className="bg-[#111] text-white p-3 flex justify-between items-center">
                  <span className="font-bold uppercase text-[#d4af37]">{day.title}</span>
                  <span className="text-xs font-bold text-[#d4af37] uppercase">Foco: {day.focus}</span>
                </div>
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-gray-100">
                    {day.exercises.map((ex, idx) => (
                      <tr key={ex.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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

        {/* PÁGINA 6: TREINO PARTE 2 */}
        <div style={pageStyle} className="html2pdf__page-break">
          <h3 className={sectionTitle}>5. Divisão de Treino (Parte 2)</h3>
          
          <div className="space-y-8 mt-6">
            {data.trainingDays.slice(2).map((day) => (
              <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm">
                <div className="bg-[#111] text-white p-3 flex justify-between items-center">
                  <span className="font-bold uppercase text-[#d4af37]">{day.title}</span>
                  <span className="text-xs font-bold text-[#d4af37] uppercase">Foco: {day.focus}</span>
                </div>
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-gray-100">
                    {day.exercises.map((ex, idx) => (
                      <tr key={ex.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
        <div style={pageStyle} className="html2pdf__page-break flex flex-col items-center justify-center text-center">
           <div className="bg-[#111] text-white p-6 rounded w-full max-w-lg mb-12 shadow-lg">
             <div className="flex items-center justify-center gap-2 text-[#d4af37] font-bold uppercase mb-2">
               <span>⚠</span> <span>ATENÇÃO:</span>
             </div>
             <p className="text-sm">
               Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedback.
             </p>
           </div>
           
           <p className="text-gray-500 text-sm mb-20">
             Documento gerado para uso exclusivo de {data.clientName}.
           </p>

           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">TEAM VBR © 2026</p>
        </div>

      </div>
    </div>
  );
};

export default ProtocolPreview;
