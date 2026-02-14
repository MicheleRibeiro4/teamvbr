
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { Printer, ChevronLeft, Download, Loader2 } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfContainerRef.current) return;
    setIsGenerating(true);
    
    const opt = {
      margin: 10,
      filename: `Protocolo_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'], 
        before: '.page-break',
        avoid: ['table', 'tr', 'h2', 'h3', '.avoid-break']
      }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(pdfContainerRef.current).save();
    } catch (err) {
      console.error(err);
      alert("Erro ao processar PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const pageBaseClass = "bg-white w-[210mm] mx-auto text-black relative shadow-2xl print:shadow-none print:m-0 overflow-hidden font-sans";
  const sectionTitleClass = "text-2xl font-black text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-6 uppercase tracking-tighter";

  return (
    <div className="flex flex-col items-center w-full bg-transparent print-container pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button onClick={onBack} className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center gap-2">
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105 transition-all font-black uppercase text-xs flex items-center gap-3 disabled:opacity-50">
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          {isGenerating ? 'Processando...' : 'Baixar PDF Premium'}
        </button>
      </div>

      <div ref={pdfContainerRef} className="print:m-0 bg-white">
        
        {/* CAPA */}
        <div className={`${pageBaseClass} min-h-[297mm] !bg-[#0a0a0a] !text-white flex flex-col justify-center items-center p-[2cm] border-b-[20px] border-[#d4af37]`}>
          <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="w-72 h-auto mb-20" />
          <h1 className="text-4xl font-black text-[#d4af37] uppercase mb-16 italic tracking-tight text-center">PROTOCOLO DE PERFORMANCE <br/><span className="text-white text-5xl">{data.protocolTitle || 'ELITE'}</span></h1>
          <div className="w-full text-center">
            <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">{data.clientName || 'ALUNO'}</h2>
            <div className="h-1.5 w-32 bg-[#d4af37] mx-auto mb-8"></div>
            <p className="text-xl font-bold text-white/40 uppercase tracking-[0.4em]">{data.contract.startDate} — {data.contract.endDate}</p>
          </div>
        </div>

        {/* PÁGINA 2 */}
        <div className={`${pageBaseClass} min-h-[297mm] p-[1.5cm] page-break`}>
          <h2 className={sectionTitleClass}>1. Análise Corporal</h2>
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Peso', val: data.physicalData.weight, unit: 'kg' },
              { label: 'Altura', val: data.physicalData.height, unit: 'm' },
              { label: 'IMC', val: data.physicalData.imc, unit: '' }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-black block mb-2 uppercase tracking-widest">{item.label}</span>
                <div className="text-3xl font-black">{item.val || '--'} <span className="text-sm font-bold text-[#d4af37]">{item.unit}</span></div>
              </div>
            ))}
          </div>

          <h2 className={sectionTitleClass}>2. Planejamento Nutricional</h2>
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-gray-700 italic leading-relaxed text-lg mb-8 shadow-inner">
            "{data.nutritionalStrategy}"
          </div>
          <div className="bg-black text-white p-8 rounded-[2rem] text-center border-b-8 border-[#d4af37] shadow-xl">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-3 block">META CALÓRICA DIÁRIA</span>
             <div className="text-5xl font-black">{data.kcalGoal || '---'} <span className="text-2xl text-[#d4af37]">kcal</span></div>
          </div>
        </div>

        {/* PÁGINA 3 */}
        <div className={`${pageBaseClass} min-h-[297mm] p-[1.5cm] page-break`}>
          <h2 className={sectionTitleClass}>3. Plano Alimentar</h2>
          <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-[#d4af37] text-white">
                <tr>
                  <th className="p-5 text-left text-xl font-black w-32">HORA</th>
                  <th className="p-5 text-left text-xl font-black">DETALHES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.meals.map((meal) => (
                  <tr key={meal.id} className="avoid-break hover:bg-gray-50">
                    <td className="p-6 font-black text-[#d4af37] text-2xl align-top">{meal.time}</td>
                    <td className="p-6">
                      <div className="font-black text-xl text-black mb-2 uppercase">{meal.name}</div>
                      <div className="text-gray-600 leading-relaxed font-bold text-lg whitespace-pre-line">{meal.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PÁGINA 4 */}
        <div className={`${pageBaseClass} min-h-[297mm] p-[1.5cm] page-break`}>
          <h2 className={sectionTitleClass}>4. Divisão de Treino</h2>
          <div className="mb-8 font-black text-gray-400 uppercase tracking-widest">Frequência: {data.trainingFrequency}</div>
          <div className="space-y-8">
            {data.trainingDays.map((day) => (
              <div key={day.id} className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm avoid-break">
                 <div className="bg-black text-white p-5 flex justify-between items-center border-b-4 border-[#d4af37]">
                    <h3 className="text-2xl font-black text-[#d4af37] uppercase">{day.title}</h3>
                    <span className="bg-[#d4af37] text-black px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{day.focus}</span>
                 </div>
                 <table className="w-full">
                   <tbody className="divide-y divide-gray-100">
                      {day.exercises.map((ex) => (
                        <tr key={ex.id}>
                           <td className="p-4 text-black font-black text-lg pl-8 uppercase">{ex.name}</td>
                           <td className="p-4 text-[#d4af37] font-black text-2xl text-right pr-8">{ex.sets}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>
            ))}
          </div>
          
          <div className="mt-20 border-t-2 border-gray-100 pt-10 text-center italic text-gray-400 text-sm">
            Excelência é um hábito. Team VBR.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPreview;
