
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ProtocolData } from '../types';
import { LOGO_VBR_BLACK } from '../constants';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';

export interface AnamnesisPreviewHandle {
  download: () => Promise<void>;
}

interface Props {
  data: ProtocolData;
  onBack?: () => void;
  hideFloatingButton?: boolean;
}

const AnamnesisPreview = forwardRef<AnamnesisPreviewHandle, Props>(({ data, onBack, hideFloatingButton }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Anamnese_${data.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#111111', // Fundo preto no PDF
        scrollY: 0,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(pdfRef.current).save();
    } catch (err) { 
      alert("Erro ao gerar PDF."); 
      console.error(err);
    } finally { 
      setIsGenerating(false); 
    }
  };

  useImperativeHandle(ref, () => ({
    download: handleDownloadPDF
  }));

  // Estilo Dark Mode para o PDF
  const pageStyle: React.CSSProperties = { 
    width: '210mm', 
    minHeight: '296mm', 
    padding: '15mm', 
    backgroundColor: '#111111', 
    color: 'white', 
    position: 'relative', 
    boxSizing: 'border-box', 
    display: 'block',
  };
  
  const sectionTitle = "text-lg font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-1 mb-4 uppercase mt-6";
  const labelStyle = "text-xs font-bold text-white/40 uppercase block mb-1";
  const valueStyle = "text-sm font-medium text-white bg-[#1a1a1a] p-3 rounded-lg border border-white/10 block";
  const gridItemStyle = "break-inside-avoid";

  const measurements = data.physicalData.measurements || {
      thorax: "-", waist: "-", abdomen: "-", glutes: "-",
      rightArmRelaxed: "-", leftArmRelaxed: "-",
      rightArmContracted: "-", leftArmContracted: "-",
      rightThigh: "-", leftThigh: "-",
      rightCalf: "-", leftCalf: "-"
  };

  return (
    <div className="flex flex-col items-center w-full pb-20 print:pb-0">
      
      {!hideFloatingButton && (
        <div className="no-print fixed bottom-8 right-8 z-[100] flex gap-3">
          {onBack && <button onClick={onBack} className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center gap-2"><ChevronLeft size={16} /> Voltar</button>}
          <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95">{isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}{isGenerating ? 'Processando...' : 'Baixar Anamnese PDF'}</button>
        </div>
      )}

      <div ref={pdfRef} className="bg-[#111] shadow-inner flex flex-col items-center print:bg-transparent print:m-0 print:p-0">
        
        {/* PÁGINA ÚNICA (Ou múltipla se estourar) */}
        <div style={pageStyle}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Ficha de Anamnese</h1>
                    <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">Team VBR</p>
                </div>
                {/* Logo Invertida para Branco */}
                <img src={LOGO_VBR_BLACK} alt="Team VBR" className="w-24 h-auto filter invert brightness-200" />
            </div>

            {/* Identificação */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs font-bold text-white/40 uppercase">Aluno</span>
                    <h2 className="text-2xl font-black text-white uppercase">{data.clientName}</h2>
                </div>
                <div className="text-right">
                     <span className="text-xs font-bold text-white/40 uppercase">Data do Cadastro</span>
                     <p className="text-sm font-bold text-white">{new Date(data.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                 <div className="col-span-1">
                    <span className={labelStyle}>Idade</span>
                    <span className={valueStyle}>{data.physicalData.age || '-'} anos</span>
                 </div>
                 <div className="col-span-1">
                    <span className={labelStyle}>Gênero</span>
                    <span className={valueStyle}>{data.physicalData.gender || '-'}</span>
                 </div>
                 <div className="col-span-1">
                    <span className={labelStyle}>Peso</span>
                    <span className={valueStyle}>{data.physicalData.weight || '-'} kg</span>
                 </div>
                 <div className="col-span-1">
                    <span className={labelStyle}>Altura</span>
                    <span className={valueStyle}>{data.physicalData.height || '-'} m</span>
                 </div>
            </div>

            {/* Anamnese */}
            <h3 className={sectionTitle}>Histórico & Objetivos</h3>
            <div className="space-y-4">
                <div className={gridItemStyle}>
                    <span className={labelStyle}>Objetivo Principal</span>
                    <p className={valueStyle}>{data.anamnesis.mainObjective || 'Não informado'}</p>
                </div>
                <div className={gridItemStyle}>
                    <span className={labelStyle}>Rotina Diária</span>
                    <p className={`${valueStyle} whitespace-pre-wrap`}>{data.anamnesis.routine || 'Não informado'}</p>
                </div>
                <div className={gridItemStyle}>
                    <span className={labelStyle}>Histórico de Treino / Lesões</span>
                    <p className={`${valueStyle} whitespace-pre-wrap`}>{data.anamnesis.trainingHistory || 'Não informado'}</p>
                </div>
                <div className={gridItemStyle}>
                    <span className={labelStyle}>Preferências Alimentares / Alergias</span>
                    <p className={`${valueStyle} whitespace-pre-wrap`}>{data.anamnesis.foodPreferences || 'Não informado'}</p>
                </div>
                <div className={gridItemStyle}>
                    <span className={labelStyle}>Medicamentos / Ergogênicos</span>
                    <p className={`${valueStyle} whitespace-pre-wrap`}>{data.anamnesis.ergogenics || 'Não informado'}</p>
                </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* Medidas */}
            <h3 className={sectionTitle}>Medidas Corporais</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className={gridItemStyle}><span className={labelStyle}>Gordura (BF)</span><span className={valueStyle}>{data.physicalData.bodyFat || '-'} %</span></div>
                <div className={gridItemStyle}><span className={labelStyle}>Massa Muscular</span><span className={valueStyle}>{data.physicalData.muscleMass || '-'} kg</span></div>
                <div className={gridItemStyle}><span className={labelStyle}>G. Visceral</span><span className={valueStyle}>{data.physicalData.visceralFat || '-'}</span></div>
                <div className={gridItemStyle}><span className={labelStyle}>IMC</span><span className={valueStyle}>{data.physicalData.imc || '-'}</span></div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] p-2 text-center text-xs font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                    Circunferências (cm)
                </div>
                <div className="grid grid-cols-4 divide-x divide-y divide-white/10 text-center">
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Tórax</span><span className="font-bold text-white">{measurements.thorax}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Cintura</span><span className="font-bold text-white">{measurements.waist}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Abdômen</span><span className="font-bold text-white">{measurements.abdomen}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Glúteo</span><span className="font-bold text-white">{measurements.glutes}</span></div>
                     
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Braço Dir (R)</span><span className="font-bold text-white">{measurements.rightArmRelaxed}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Braço Esq (R)</span><span className="font-bold text-white">{measurements.leftArmRelaxed}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Braço Dir (C)</span><span className="font-bold text-white">{measurements.rightArmContracted}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Braço Esq (C)</span><span className="font-bold text-white">{measurements.leftArmContracted}</span></div>
                     
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Coxa Dir</span><span className="font-bold text-white">{measurements.rightThigh}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Coxa Esq</span><span className="font-bold text-white">{measurements.leftThigh}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Pantur. Dir</span><span className="font-bold text-white">{measurements.rightCalf}</span></div>
                     <div className="p-3"><span className="block text-[10px] text-white/40 uppercase">Pantur. Esq</span><span className="font-bold text-white">{measurements.leftCalf}</span></div>
                </div>
            </div>

            <div className="mt-12 text-center border-t border-white/5 pt-8">
                 <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Team VBR System © 2026</p>
            </div>
        </div>
      </div>
    </div>
  );
});

export default AnamnesisPreview;
