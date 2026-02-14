
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
import { Printer, ChevronLeft } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  // Altura rigorosa de 293mm para garantir que o Safari não crie páginas extras
  const fixedPageClass = "bg-white w-[210mm] h-[293mm] min-h-[293mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden select-none";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[293mm] mx-auto flex flex-col page-break-dynamic text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:gap-0 print-container pb-20 print:pb-0">
      
      <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all font-black uppercase text-[9px] flex items-center justify-center gap-2"
          >
            <ChevronLeft size={14} /> Voltar ao Painel
          </button>
        )}
        <button 
          onClick={handlePrint}
          className="bg-[#d4af37] text-black px-6 py-4 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] flex items-center gap-2 border border-black/10"
        >
          <Printer size={18} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* PÁGINA 1: CAPA */}
      <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white border-b-[15px] border-[#d4af37] justify-between p-[1.2cm]`}>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1)_0%,_transparent_50%)]"></div>
        <div className="flex flex-col items-center pt-[1.5cm] w-full relative z-10">
          <div className="p-4 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mb-12">
            <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-48 h-auto" />
          </div>
          <div className="text-center space-y-4 w-full">
            <h1 className="text-4xl md:text-5xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.85]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'ESTRATÉGICO'}</span>
            </h1>
          </div>
          <div className="mt-[2.5cm] text-center w-full max-w-xl">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-8 opacity-40"></div>
            <h2 className="text-3xl font-montserrat font-black text-white uppercase tracking-tight mb-3">{data.clientName || 'NOME DO ALUNO'}</h2>
            <div className="inline-block px-8 py-2.5 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-[0.3em] text-[9px]">
              Vigência: {data.totalPeriod || 'A definir'}
            </div>
          </div>
        </div>
        <div className="w-full text-center pb-8 relative z-10">
          <p className="text-white/40 font-black text-[8px] tracking-[0.4em] uppercase mb-1.5">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[8px] uppercase tracking-[0.6em] font-black">TEAM VBR • SEM DESCULPAS</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO */}
      <div className={`${fixedPageClass} p-[1cm]`}>
        <div className="flex justify-between items-end border-b-2 border-[#d4af37] pb-3 mb-6">
          <div>
            <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 01</span>
            <h2 className="text-2xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Avaliação Física</h2>
          </div>
          <div className="text-right"><span className="text-base font-black text-gray-300">{new Date().toLocaleDateString('pt-BR')}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{ label: 'Peso', value: data.physicalData.weight, unit: 'kg' }, { label: 'Altura', value: data.physicalData.height, unit: 'm' }, { label: 'Idade', value: data.physicalData.age, unit: 'anos' }, { label: 'BF%', value: data.physicalData.bodyFat, unit: '%' }].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              <span className="text-[7px] text-gray-400 font-black uppercase tracking-widest mb-1 block">{item.label}</span>
              <div className="text-xl font-black text-black leading-none">{item.value || '--'}<span className="text-[8px] ml-0.5 text-[#d4af37]">{item.unit}</span></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5 flex-1 overflow-hidden">
          <div className="space-y-3">
             <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#d4af37] border-l-4 border-[#d4af37] pl-3">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-2">
                {[{ label: 'Massa Musc.', value: data.physicalData.muscleMass, unit: 'kg' }, { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'nv' }, { label: 'IMC', value: data.physicalData.imc, unit: '' }, { label: 'Perfil', value: 'Elite', unit: '' }].map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[7px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-base font-black text-black">{item.value || '--'}<span className="text-[7px] ml-0.5 text-[#d4af37]">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-5 rounded-[1.5rem] flex flex-col justify-center border-r-4 border-[#d4af37]">
            <h3 className="text-[7px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-3">Estratégia do Coach</h3>
            <p className="text-[12px] leading-snug italic text-white/95 font-medium">"{data.physicalData.observations || "Foco absoluto em performance."}"</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-5 rounded-[1.5rem] text-white flex flex-col items-center border-b-2 border-[#d4af37] mt-auto">
          <span className="text-[7px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-1">OBJETIVO CENTRAL</span>
          <div className="text-xl font-black font-montserrat uppercase text-center">{data.protocolTitle || 'ALTA PERFORMANCE'}</div>
        </div>
      </div>
      
      {/* PÁGINA 3: NUTRIÇÃO */}
      <div className={`${fixedPageClass} p-[1cm]`}>
        <div className="flex justify-between items-end border-b-2 border-[#d4af37] pb-3 mb-6">
          <div>
            <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 02</span>
            <h2 className="text-2xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Plano Nutricional</h2>
          </div>
        </div>
        <div className="bg-[#0a0a0a] text-white p-8 rounded-[2rem] flex flex-col items-center mb-6 border-b-4 border-[#d4af37]">
          <span className="text-[10px] font-black text-[#d4af37] mb-3 tracking-[0.6em] uppercase">Meta Calórica Diária</span>
          <div className="text-[50px] font-black font-montserrat leading-none">{data.kcalGoal || '0000'} <span className="text-xl text-[#d4af37]">KCAL</span></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: 'Proteínas', val: data.macros.protein.value, color: 'bg-red-600' }, { label: 'Carbos', val: data.macros.carbs.value, color: 'bg-blue-600' }, { label: 'Gorduras', val: data.macros.fats.value, color: 'bg-amber-600' }].map((macro, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md text-center">
              <div className={`w-2 h-2 rounded-full ${macro.color} mx-auto mb-3`}></div>
              <span className="text-gray-400 font-black uppercase text-[8px] mb-1 block">{macro.label}</span>
              <div className="text-2xl font-black">{macro.val || '0'}g</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-6 rounded-[1.5rem] border-l-4 border-[#d4af37] mt-auto">
          <h4 className="font-black uppercase text-[8px] text-[#d4af37] mb-3">Metodologia Nutricional</h4>
          <p className="text-[14px] leading-snug text-gray-800 italic font-bold">"{data.nutritionalStrategy || "Estratégia personalizada para seu biotipo."}"</p>
        </div>
      </div>
      
      {/* PÁGINA 4: REFEIÇÕES */}
      <div className={`${dynamicPageClass} p-[1cm]`}>
        <div className="flex justify-between items-end border-b-2 border-[#d4af37] pb-3 mb-6">
          <div>
             <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 03</span>
             <h2 className="text-2xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Rotina Diária</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-4 text-left font-black uppercase text-[9px] tracking-[0.2em] text-[#d4af37] w-28 border-r border-white/10">Hora</th>
                <th className="p-4 text-left font-black uppercase text-[9px] tracking-[0.2em]">Composição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="avoid-break">
                  <td className="p-5 font-black text-[#d4af37] text-2xl align-top bg-gray-50/30 border-r border-gray-100">{meal.time}</td>
                  <td className="p-5">
                    <div className="font-black text-xl text-black mb-1 uppercase tracking-tight leading-none">{meal.name}</div>
                    <div className="text-gray-600 leading-tight font-bold text-[13px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPreview;
