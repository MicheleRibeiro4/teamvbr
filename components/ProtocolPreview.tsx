
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
import { Printer, ChevronLeft } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  // Classes para controle de página A4 rigoroso - Altura reduzida para 296mm para evitar transbordo por margem de erro
  const fixedPageClass = "bg-white w-[210mm] h-[296mm] min-h-[296mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden select-none";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[296mm] mx-auto flex flex-col page-break-dynamic text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden";

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
            <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-64 h-auto" />
          </div>
          <div className="text-center space-y-6 w-full">
            <h1 className="text-6xl md:text-7xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.85]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'ESTRATÉGICO'}</span>
            </h1>
          </div>
          <div className="mt-[3cm] text-center w-full max-w-2xl">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-10 opacity-50"></div>
            <h2 className="text-5xl font-montserrat font-black text-white uppercase tracking-tight mb-4">{data.clientName || 'NOME DO ALUNO'}</h2>
            <div className="inline-block px-10 py-3 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-[0.3em] text-[12px]">
              Vigência: {data.totalPeriod || 'A definir'}
            </div>
          </div>
        </div>
        <div className="w-full text-center pb-12 relative z-10">
          <p className="text-white/40 font-black text-xs tracking-[0.4em] uppercase mb-2">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[10px] uppercase tracking-[0.6em] font-black">TEAM VBR • SEM DESCULPAS</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO */}
      <div className={`${fixedPageClass} p-[1.2cm]`}>
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-10">
          <div>
            <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 01</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Avaliação Física</h2>
          </div>
          <div className="text-right"><span className="text-xl font-black text-gray-300">{new Date().toLocaleDateString('pt-BR')}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{ label: 'Peso', value: data.physicalData.weight, unit: 'kg' }, { label: 'Altura', value: data.physicalData.height, unit: 'm' }, { label: 'Idade', value: data.physicalData.age, unit: 'anos' }, { label: 'BF%', value: data.physicalData.bodyFat, unit: '%' }].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-[1.5rem] text-center border border-gray-100 shadow-sm">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 block">{item.label}</span>
              <div className="text-3xl font-black text-black leading-none">{item.value || '--'}<span className="text-[10px] ml-1 text-[#d4af37]">{item.unit}</span></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8 flex-1">
          <div className="space-y-6">
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4af37] border-l-[6px] border-[#d4af37] pl-4">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-4">
                {[{ label: 'Massa Musc.', value: data.physicalData.muscleMass, unit: 'kg' }, { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'nv' }, { label: 'IMC', value: data.physicalData.imc, unit: '' }, { label: 'Perfil', value: 'Elite', unit: '' }].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-xl font-black text-black">{item.value || '--'}<span className="text-[9px] ml-1 text-[#d4af37]">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-8 rounded-[2.5rem] flex flex-col justify-center border-r-[8px] border-[#d4af37]">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-6">Estratégia do Coach</h3>
            <p className="text-[16px] leading-relaxed italic text-white/95 font-medium">"{data.physicalData.observations || "Foco absoluto em performance."}"</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] text-white flex flex-col items-center border-b-4 border-[#d4af37] mt-auto">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-2">OBJETIVO CENTRAL</span>
          <div className="text-3xl font-black font-montserrat uppercase text-center">{data.protocolTitle || 'ALTA PERFORMANCE'}</div>
        </div>
      </div>

      {/* PÁGINA 3: NUTRIÇÃO */}
      <div className={`${fixedPageClass} p-[1.2cm]`}>
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-10">
          <div>
            <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 02</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Plano Nutricional</h2>
          </div>
        </div>
        <div className="bg-[#0a0a0a] text-white p-10 rounded-[3rem] flex flex-col items-center mb-8 shadow-xl border-b-[8px] border-[#d4af37]">
          <span className="text-[12px] font-black text-[#d4af37] mb-4 tracking-[0.8em] uppercase">Meta Calórica Diária</span>
          <div className="text-[70px] font-black font-montserrat leading-none">{data.kcalGoal || '0000'} <span className="text-2xl text-[#d4af37]">KCAL</span></div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[{ label: 'Proteínas', val: data.macros.protein.value, color: 'bg-red-600' }, { label: 'Carbos', val: data.macros.carbs.value, color: 'bg-blue-600' }, { label: 'Gorduras', val: data.macros.fats.value, color: 'bg-amber-600' }].map((macro, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-md text-center">
              <div className={`w-3 h-3 rounded-full ${macro.color} mx-auto mb-4`}></div>
              <span className="text-gray-400 font-black uppercase text-[10px] mb-2 block">{macro.label}</span>
              <div className="text-3xl font-black mb-1">{macro.val || '0'}g</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-10 rounded-[2.5rem] border-l-[10px] border-[#d4af37] mt-auto">
          <h4 className="font-black uppercase text-[10px] text-[#d4af37] mb-4">Metodologia Nutricional</h4>
          <p className="text-[18px] leading-relaxed text-gray-800 italic font-bold">"{data.nutritionalStrategy || "Estratégia personalizada para seu biotipo."}"</p>
        </div>
      </div>

      {/* PÁGINA 4: REFEIÇÕES */}
      <div className={`${dynamicPageClass} p-[1.2cm]`}>
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-10">
          <div>
             <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 03</span>
             <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Rotina Diária</h2>
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl mb-10">
          <table className="w-full border-collapse">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-6 text-left font-black uppercase text-[11px] tracking-[0.3em] text-[#d4af37] w-36 border-r border-white/10">Hora</th>
                <th className="p-6 text-left font-black uppercase text-[11px] tracking-[0.3em]">Composição da Refeição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="avoid-break">
                  <td className="p-8 font-black text-[#d4af37] text-4xl align-top bg-gray-50/50 border-r border-gray-100">{meal.time}</td>
                  <td className="p-8">
                    <div className="font-black text-2xl text-black mb-3 uppercase tracking-tight">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-bold text-[16px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PÁGINA 5: TREINO */}
      <div className={`${dynamicPageClass} p-[1.2cm]`}>
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-10">
          <div>
            <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 04</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Treinamento</h2>
          </div>
        </div>
        <div className="space-y-8 pb-10">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-md avoid-break">
               <div className="bg-[#0a0a0a] text-white p-6 flex justify-between items-center border-b-[6px] border-[#d4af37]">
                  <h3 className="text-2xl font-black text-[#d4af37] uppercase font-montserrat">{day.title}</h3>
                  <span className="bg-[#d4af37] text-black px-6 py-1.5 rounded-xl text-[10px] font-black uppercase">{day.focus}</span>
               </div>
               <table className="w-full">
                 <tbody className="divide-y divide-gray-100">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id}>
                         <td className="p-6 text-black font-black text-lg pl-10 uppercase tracking-tight">{ex.name}</td>
                         <td className="p-6 text-[#d4af37] font-black text-2xl text-right pr-10">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 6: CONCLUSÃO */}
      <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white justify-center p-[1.5cm] border-t-[20px] border-[#d4af37]`}>
        <div className="max-w-2xl text-center space-y-16 relative z-10 mx-auto">
           <div className="bg-white/5 border-2 border-[#d4af37]/30 p-16 rounded-[4rem] shadow-[0_0_80px_rgba(212,175,55,0.1)]">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-10 py-2.5 rounded-full font-black uppercase text-[12px]">FECHAMENTO DO COACH</div>
              <p className="text-3xl leading-tight font-black italic text-white/95 uppercase font-montserrat tracking-tighter">
                "{data.generalObservations || "CONSTÂNCIA É O SEGREDO DOS CAMPEÕES."}"
              </p>
           </div>
           <div className="pt-16 flex flex-col items-center">
             <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-64 mx-auto mb-12" />
             <p className="text-4xl font-black tracking-[0.6em] uppercase font-montserrat">TEAM VBR</p>
             <div className="w-48 h-1 bg-[#d4af37] my-8 opacity-80"></div>
             <p className="text-[13px] font-black text-white/40 tracking-[1.5em] uppercase">SEM DESCULPAS</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPreview;
