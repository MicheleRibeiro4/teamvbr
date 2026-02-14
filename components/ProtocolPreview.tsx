
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
import { Printer, ChevronLeft } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  // Altura de 295.5mm é o segredo para não vazar pro rodapé em nenhum navegador
  const fixedPageClass = "bg-white w-[210mm] h-[295.5mm] min-h-[295.5mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden select-none";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[295.5mm] mx-auto flex flex-col page-break-dynamic text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:gap-0 print-container pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar ao Painel
          </button>
        )}
        <button 
          onClick={handlePrint}
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10"
        >
          <Printer size={20} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* PÁGINA 1: CAPA */}
      <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white border-b-[20px] border-[#d4af37] justify-between p-[1.5cm]`}>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_50%)]"></div>
        <div className="flex flex-col items-center pt-[2cm] w-full relative z-10">
          <div className="p-6 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl mb-16">
            <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-56 h-auto" />
          </div>
          <div className="text-center space-y-6 w-full">
            <h1 className="text-5xl md:text-6xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.85]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'ESTRATÉGICO'}</span>
            </h1>
          </div>
          <div className="mt-[3cm] text-center w-full max-w-2xl">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-10 opacity-50"></div>
            <h2 className="text-4xl font-montserrat font-black text-white uppercase tracking-tight mb-4">{data.clientName || 'NOME DO ALUNO'}</h2>
            <div className="inline-block px-10 py-3 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-[0.3em] text-[10px]">
              Vigência: {data.totalPeriod || 'A definir'}
            </div>
          </div>
        </div>
        <div className="w-full text-center pb-12 relative z-10">
          <p className="text-white/40 font-black text-[9px] tracking-[0.4em] uppercase mb-2">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[9px] uppercase tracking-[0.6em] font-black">TEAM VBR • SEM DESCULPAS</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO */}
      <div className={`${fixedPageClass} p-[1.2cm]`}>
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-4 mb-8">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 01</span>
            <h2 className="text-3xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Avaliação Física</h2>
          </div>
          <div className="text-right"><span className="text-lg font-black text-gray-300">{new Date().toLocaleDateString('pt-BR')}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: 'Peso', value: data.physicalData.weight, unit: 'kg' }, { label: 'Altura', value: data.physicalData.height, unit: 'm' }, { label: 'Idade', value: data.physicalData.age, unit: 'anos' }, { label: 'BF%', value: data.physicalData.bodyFat, unit: '%' }].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-5 rounded-[1.2rem] text-center border border-gray-100">
              <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1 block">{item.label}</span>
              <div className="text-2xl font-black text-black leading-none">{item.value || '--'}<span className="text-[9px] ml-1 text-[#d4af37]">{item.unit}</span></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6 flex-1">
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] border-l-[4px] border-[#d4af37] pl-4">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Massa Musc.', value: data.physicalData.muscleMass, unit: 'kg' }, { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'nv' }, { label: 'IMC', value: data.physicalData.imc, unit: '' }, { label: 'Perfil', value: 'Elite', unit: '' }].map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-[1.2rem] border border-gray-100 shadow-sm">
                    <span className="text-[8px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-lg font-black text-black">{item.value || '--'}<span className="text-[8px] ml-1 text-[#d4af37]">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-6 rounded-[2rem] flex flex-col justify-center border-r-[6px] border-[#d4af37]">
            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-4">Estratégia do Coach</h3>
            <p className="text-[14px] leading-relaxed italic text-white/95 font-medium">"{data.physicalData.observations || "Foco absoluto em performance."}"</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-[2rem] text-white flex flex-col items-center border-b-4 border-[#d4af37] mt-auto">
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-1">OBJETIVO CENTRAL</span>
          <div className="text-2xl font-black font-montserrat uppercase text-center">{data.protocolTitle || 'ALTA PERFORMANCE'}</div>
        </div>
      </div>

      {/* REPETIR AJUSTES DE TAMANHO NAS OUTRAS PÁGINAS SE NECESSÁRIO */}
    </div>
  );
};

export default ProtocolPreview;
