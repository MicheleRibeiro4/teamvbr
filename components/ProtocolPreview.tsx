
import React, { useRef, useState } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { ChevronLeft, Download, Loader2, User, Activity, Droplets, Gauge } from 'lucide-react';

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
        scale: 2.5,
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
      alert("Erro ao gerar o PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sectionTitle = "text-xl font-black text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-4 uppercase tracking-tighter flex items-center gap-2";
  const bioCard = "bg-gray-50 border border-gray-100 p-4 rounded-xl text-center shadow-sm";

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
          {isGenerating ? 'Processando...' : 'Exportar PDF'}
        </button>
      </div>

      <div ref={pdfRef} className="bg-white text-black w-[210mm] min-h-[297mm] print:shadow-none shadow-2xl relative">
        
        {/* PÁGINA 1: CAPA PREMIUM */}
        <div className="h-[297mm] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-20 border-b-[15px] border-[#d4af37] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[120px]"></div>
          <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="w-64 h-auto mb-16 relative z-10" />
          <h1 className="text-3xl font-black text-[#d4af37] uppercase tracking-widest mb-4 italic text-center">Protocolo de Performance Elite</h1>
          <div className="h-1 w-24 bg-white/20 mb-16"></div>
          <h2 className="text-6xl font-black uppercase tracking-tighter text-center leading-none mb-6">
            {data.clientName || 'ALUNO'}
          </h2>
          <p className="text-xl font-bold text-white/40 uppercase tracking-[0.5em]">{data.protocolTitle || 'STRATEGY'}</p>
          
          <div className="absolute bottom-20 grid grid-cols-2 gap-20 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] w-full px-20 text-center">
            <div>Início: {data.contract.startDate}</div>
            <div>Término: {data.contract.endDate}</div>
          </div>
        </div>

        {/* PÁGINA 2: IDENTIFICAÇÃO E BIOIMPEDÂNCIA */}
        <div className="p-[15mm] min-h-[297mm]">
          <h3 className={sectionTitle}><User size={18}/> 1. Identificação do Atleta</h3>
          <div className="grid grid-cols-2 gap-y-4 mb-10 text-sm">
            <div><span className="font-black uppercase text-[10px] text-gray-400 block">CPF:</span> {data.contract.cpf || 'Não informado'}</div>
            <div><span className="font-black uppercase text-[10px] text-gray-400 block">WhatsApp:</span> {data.contract.phone || 'Não informado'}</div>
            <div className="col-span-2"><span className="font-black uppercase text-[10px] text-gray-400 block">E-mail:</span> {data.contract.email || 'Não informado'}</div>
            <div className="col-span-2"><span className="font-black uppercase text-[10px] text-gray-400 block">Endereço:</span> {data.contract.address || 'Não informado'}</div>
          </div>

          <h3 className={sectionTitle}><Activity size={18}/> 2. Composição Corporal (Bioimpedância)</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Peso</p>
              <p className="text-2xl font-black">{data.physicalData.weight || '0'}<span className="text-xs text-[#d4af37]">kg</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Altura</p>
              <p className="text-2xl font-black">{data.physicalData.height || '0'}<span className="text-xs text-[#d4af37]">m</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">IMC</p>
              <p className="text-2xl font-black">{data.physicalData.imc || '0'}</p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Gordura Corporal</p>
              <p className="text-2xl font-black">{data.physicalData.bodyFat || '0'}<span className="text-xs text-[#d4af37]">%</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Massa Muscular</p>
              <p className="text-2xl font-black">{data.physicalData.muscleMass || '0'}<span className="text-xs text-[#d4af37]">kg</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">G. Visceral</p>
              <p className="text-2xl font-black">{data.physicalData.visceralFat || '0'}</p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Água Corporal</p>
              <p className="text-2xl font-black">{data.physicalData.waterPercentage || '0'}<span className="text-xs text-[#d4af37]">%</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Idade</p>
              <p className="text-2xl font-black">{data.physicalData.age || '0'}<span className="text-xs text-[#d4af37]">anos</span></p>
            </div>
            <div className={bioCard}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Avaliação em:</p>
              <p className="text-sm font-black">{data.physicalData.date || '--/--/----'}</p>
            </div>
          </div>

          <h3 className={sectionTitle}>3. Estratégia Nutricional</h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-gray-700 leading-relaxed text-sm mb-6">
            {data.nutritionalStrategy || 'Planejamento em desenvolvimento...'}
          </div>
        </div>

        {/* PÁGINA 3: PLANO ALIMENTAR */}
        <div className="p-[15mm] min-h-[297mm] page-break">
          <h3 className={sectionTitle}>4. Distribuição Alimentar</h3>
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#0a0a0a] text-white">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase w-28">Horário</th>
                  <th className="p-4 text-[10px] font-black uppercase">Refeição & Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.meals.map((meal) => (
                  <tr key={meal.id} className="break-inside-avoid">
                    <td className="p-4 align-top font-black text-[#d4af37]">{meal.time}</td>
                    <td className="p-4">
                      <p className="font-black text-xs uppercase mb-1">{meal.name}</p>
                      <p className="text-gray-600 text-[11px] whitespace-pre-line leading-relaxed">{meal.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PÁGINA 4: TREINAMENTO */}
        <div className="p-[15mm] min-h-[297mm] page-break">
          <h3 className={sectionTitle}>5. Cronograma de Treino</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Frequência Semanal: {data.trainingFrequency || 'A definir'}</p>
          
          <div className="space-y-6">
            {data.trainingDays.map((day) => (
              <div key={day.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm break-inside-avoid">
                <div className="bg-[#d4af37] p-3 text-black flex justify-between items-center">
                  <span className="font-black text-xs uppercase tracking-tighter">{day.title}</span>
                  <span className="text-[9px] font-black uppercase opacity-60">{day.focus}</span>
                </div>
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id}>
                        <td className="p-3 text-[11px] font-bold text-gray-800">{ex.name}</td>
                        <td className="p-3 text-[11px] font-black text-[#d4af37] text-right">{ex.sets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="mt-20 border-t border-gray-100 pt-8 text-center">
            <img src={LOGO_VBR_BLACK} alt="VBR" className="w-16 mx-auto opacity-10 mb-2 grayscale" />
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Team VBR Rhino • High Performance</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProtocolPreview;
