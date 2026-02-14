
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
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
    const element = pdfContainerRef.current;
    
    const opt = {
      margin: 0,
      filename: `Protocolo_VBR_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
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
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro ao gerar o PDF HD. Tente a opção 'Imprimir'.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fixedPageClass = "bg-white w-[210mm] h-[297mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 mb-10 print:mb-0 overflow-hidden select-none";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[297mm] mx-auto flex flex-col text-black relative shadow-2xl print:shadow-none print:m-0 mb-10 print:mb-0 overflow-hidden";

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:gap-0 print-container pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          {isGenerating ? 'Gerando...' : 'Baixar PDF HD'}
        </button>

        <button 
          onClick={handlePrint}
          className="bg-white text-black px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] flex items-center gap-3 border border-gray-200"
        >
          <Printer size={18} /> Imprimir Rápido
        </button>
      </div>

      <div ref={pdfContainerRef} className="print:m-0">
        
        {/* PÁGINA 1: CAPA (LIMPA) */}
        <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white border-b-[20px] border-[#d4af37] justify-center items-center p-[2cm]`}>
          <div className="flex flex-col items-center w-full text-center">
            <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-80 h-auto mb-20" />
            
            <div className="space-y-4 mb-24">
              <h1 className="text-5xl font-montserrat font-black text-[#d4af37] uppercase tracking-tighter leading-none">
                PROTOCOLO <br/>
                COMPLETO DE <br/>
                <span className="text-white">{data.protocolTitle || 'OBJETIVO'}</span>
              </h1>
            </div>

            <div className="mb-20">
              <h2 className="text-7xl font-montserrat font-black text-white uppercase tracking-tight mb-6 leading-tight">
                {data.clientName || 'NOME DO ALUNO'}
              </h2>
              <div className="h-1 w-32 bg-[#d4af37] mx-auto mb-6"></div>
              <p className="text-xl font-bold text-white/40 uppercase tracking-[0.3em]">
                {data.contract.startDate} — {data.contract.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* PÁGINA 2: DADOS FÍSICOS E ESTRATÉGIA */}
        <div className={`${fixedPageClass} p-[1.5cm]`}>
          <div className="space-y-10">
            <section>
              <h2 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-6 uppercase tracking-tighter">1. Dados Físicos</h2>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[{ label: 'Peso Atual', val: data.physicalData.weight, unit: 'kg' }, { label: 'Altura', val: data.physicalData.height, unit: 'm' }, { label: 'Idade', val: data.physicalData.age, unit: 'anos' }].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                    <span className="text-sm text-gray-400 font-bold block mb-2 uppercase tracking-widest">{item.label}</span>
                    <div className="text-3xl font-black">{item.val || '--'} <span className="text-lg font-bold">{item.unit}</span></div>
                  </div>
                ))}
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bioimpedância Detalhada</h3>
              <div className="grid grid-cols-4 gap-4">
                {[{ label: 'Massa Musc.', val: data.physicalData.muscleMass, unit: 'kg' }, { label: 'Gordura', val: data.physicalData.bodyFat, unit: '%' }, { label: 'G. Visceral', val: data.physicalData.visceralFat, unit: '' }, { label: 'IMC', val: data.physicalData.imc, unit: '' }].map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border-l-4 border-[#d4af37] shadow-lg">
                    <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">{item.label}</span>
                    <div className="text-xl font-black">{item.val || '--'}<span className="text-sm ml-1">{item.unit}</span></div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-6 uppercase tracking-tighter">2. Estratégia Nutricional</h2>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic font-medium leading-relaxed text-gray-700 mb-8">
                <span className="font-black not-italic text-black mr-2">Observação do Coach:</span> {data.nutritionalStrategy}
              </div>
              <div className="bg-[#1a1a1a] text-white p-8 rounded-3xl text-center shadow-xl mb-10 border-b-8 border-[#d4af37]">
                 <span className="text-sm font-black uppercase tracking-[0.3em] mb-4 block">META CALÓRICA DIÁRIA {data.kcalSubtext}</span>
                 <div className="text-6xl font-black text-[#d4af37] font-montserrat">{data.kcalGoal || '0.000'} <span className="text-2xl">kcal</span></div>
              </div>
            </section>
          </div>
          <div className="mt-auto bg-amber-50 p-4 rounded-xl border-l-4 border-[#d4af37]">
            <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">
              Documento Confidencial — Protegido por Direitos Autorais Team VBR Rhino.
            </p>
          </div>
        </div>

        {/* PÁGINA 3: PLANO ALIMENTAR */}
        <div className={`${dynamicPageClass} p-[1.5cm]`}>
          <h2 className="text-4xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-4 mb-8 uppercase tracking-tighter">3. Plano Alimentar</h2>
          <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl mb-10">
            <table className="w-full">
              <thead className="bg-[#d4af37] text-white">
                <tr>
                  <th className="p-6 text-left text-2xl font-black w-32 uppercase tracking-tighter">Hora</th>
                  <th className="p-6 text-left text-2xl font-black uppercase tracking-tighter">Refeição & Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.meals.map((meal) => (
                  <tr key={meal.id} className="avoid-break hover:bg-gray-50 transition-colors">
                    <td className="p-6 font-black text-[#d4af37] text-3xl align-top leading-none">{meal.time}</td>
                    <td className="p-6">
                      <div className="font-black text-xl text-black mb-2 uppercase tracking-tight">{meal.name}</div>
                      <div className="text-gray-600 leading-relaxed font-bold text-lg whitespace-pre-line">{meal.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PÁGINA 4: TREINO */}
        <div className={`${dynamicPageClass} p-[1.5cm]`}>
          <h2 className="text-4xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-4 mb-4 uppercase tracking-tighter">4. Divisão de Treino</h2>
          <div className="mb-8 font-black text-gray-400 uppercase tracking-widest text-xl">Frequência Semanal Sugerida: {data.trainingFrequency}</div>
          <div className="space-y-10">
            {data.trainingDays.map((day) => (
              <div key={day.id} className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl avoid-break">
                 <div className="bg-[#1a1a1a] text-white p-6 flex justify-between items-center border-b-4 border-[#d4af37]">
                    <h3 className="text-2xl font-black text-[#d4af37] uppercase font-montserrat tracking-tighter">{day.title}</h3>
                    <span className="bg-[#d4af37] text-black px-6 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">{day.focus}</span>
                 </div>
                 <table className="w-full">
                   <tbody className="divide-y divide-gray-100">
                      {day.exercises.map((ex) => (
                        <tr key={ex.id}>
                           <td className="p-5 text-black font-black text-xl pl-10 uppercase tracking-tight">{ex.name}</td>
                           <td className="p-5 text-[#d4af37] font-black text-2xl text-right pr-10">{ex.sets}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProtocolPreview;
