import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { ChevronLeft, Download, Loader2, Printer } from 'lucide-react';

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
      margin: 10,
      filename: `Protocolo_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2.5, // Alta resolução
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(pdfRef.current).save();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro ao gerar o PDF. Verifique se o navegador é compatível.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sectionTitle = "text-xl font-black text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-4 uppercase tracking-tighter";
  const cardClass = "bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 break-inside-avoid";

  return (
    <div className="flex flex-col items-center w-full pb-20 print:pb-0">
      <div className="no-print fixed bottom-8 right-8 z-[100] flex gap-3">
        {onBack && (
          <button onClick={onBack} className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center gap-2">
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        <button 
          onClick={handleDownloadPDF} 
          disabled={isGenerating} 
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-105 transition-all font-black uppercase text-xs flex items-center gap-3 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          {isGenerating ? 'Gerando PDF HD...' : 'Exportar Protocolo PDF'}
        </button>
      </div>

      <div ref={pdfRef} className="bg-white text-black w-[210mm] min-h-[297mm] print:shadow-none shadow-2xl relative">
        
        {/* PÁGINA 1: CAPA */}
        <div className="h-[297mm] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-20 border-b-[15px] border-[#d4af37] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[120px]"></div>
          <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="w-64 h-auto mb-16 relative z-10" />
          <h1 className="text-3xl font-black text-[#d4af37] uppercase tracking-widest mb-4 italic">Protocolo de Performance</h1>
          <div className="h-1 w-24 bg-white/20 mb-16"></div>
          <h2 className="text-6xl font-black uppercase tracking-tighter text-center leading-none mb-6">
            {data.clientName || 'ALUNO'}
          </h2>
          <p className="text-xl font-bold text-white/40 uppercase tracking-[0.5em]">{data.protocolTitle || 'ELITE'}</p>
          <div className="absolute bottom-10 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            Vigência: {data.contract.startDate} — {data.contract.endDate}
          </div>
        </div>

        {/* PÁGINA 2: NUTRIÇÃO */}
        <div className="p-[15mm] min-h-[297mm]">
          <h3 className={sectionTitle}>1. Estratégia Nutricional</h3>
          <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100 italic text-gray-700 leading-relaxed text-lg">
            {data.nutritionalStrategy || 'Estratégia personalizada em desenvolvimento...'}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Fix: Explicitly type the result of Object.entries(data.macros) to resolve 'unknown' type error for 'macro' */}
            {(Object.entries(data.macros) as [string, { value: string }][]).map(([key, macro]) => (
              <div key={key} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                  {key === 'protein' ? 'Proteína' : key === 'carbs' ? 'Carboidrato' : 'Gordura'}
                </p>
                <p className="text-2xl font-black">{macro.value || '0'}<span className="text-xs text-[#d4af37]">g</span></p>
              </div>
            ))}
          </div>

          <h3 className={sectionTitle}>2. Plano Alimentar</h3>
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#0a0a0a] text-white">
                <tr>
                  <th className="p-4 text-xs font-black uppercase w-28">Horário</th>
                  <th className="p-4 text-xs font-black uppercase">Refeição & Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.meals.map((meal) => (
                  <tr key={meal.id} className="break-inside-avoid">
                    <td className="p-4 align-top font-black text-[#d4af37]">{meal.time}</td>
                    <td className="p-4">
                      <p className="font-black text-sm uppercase mb-1">{meal.name}</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{meal.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PÁGINA 3: TREINAMENTO */}
        <div className="p-[15mm] min-h-[297mm]">
          <h3 className={sectionTitle}>3. Planejamento de Treino</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Frequência Semanal: {data.trainingFrequency || 'Conforme prescrito'}</p>
          
          <div className="space-y-6">
            {data.trainingDays.map((day) => (
              <div key={day.id} className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm break-inside-avoid">
                <div className="bg-[#d4af37] p-3 text-black flex justify-between items-center">
                  <span className="font-black text-sm uppercase">{day.title}</span>
                  <span className="text-[10px] font-black uppercase opacity-60">{day.focus}</span>
                </div>
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id}>
                        <td className="p-3 text-sm font-bold text-gray-800">{ex.name}</td>
                        <td className="p-3 text-sm font-black text-[#d4af37] text-right">{ex.sets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="mt-20 border-t border-gray-100 pt-8 text-center">
            <img src={LOGO_VBR_BLACK} alt="VBR" className="w-20 mx-auto opacity-10 mb-4 grayscale" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Excelência em Performance • Team VBR</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProtocolPreview;