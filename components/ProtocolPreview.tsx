
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK, LOGO_RHINO_WHITE } from '../constants';
import { Printer } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const ProtocolPreview: React.FC<Props> = ({ data }) => {
  // Classes para controle de página A4
  const fixedPageClass = "bg-white w-[210mm] h-[297mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[297mm] mx-auto flex flex-col page-break-dynamic text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:gap-0 print-container pb-20 print:pb-0">
      
      {/* Botão de Impressão Flutuante (Oculto na Impressão) */}
      <button 
        onClick={handlePrint}
        className="no-print fixed bottom-8 right-8 z-[100] bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-110 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10"
      >
        <Printer size={20} /> Gerar PDF / Imprimir Protocolo
      </button>

      {/* PÁGINA 1: CAPA PREMIUM */}
      <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white border-b-[24px] border-[#d4af37] justify-between p-[2cm]`}>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.2)_0%,_transparent_60%)]"></div>
        
        <div className="flex flex-col items-center pt-[3cm] w-full relative z-10">
          <div className="p-8 bg-white/5 rounded-[4rem] border border-white/10 backdrop-blur-xl mb-24 shadow-[0_0_80px_rgba(212,175,55,0.3)]">
            <img 
                src={LOGO_RHINO_BLACK} 
                alt="Logo Team VBR" 
                className="w-80 h-auto block" 
            />
          </div>
          
          <div className="text-center space-y-10 w-full">
            <h1 className="text-7xl md:text-9xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'ESTRATÉGICO'}</span>
            </h1>
          </div>

          <div className="mt-[4cm] text-center w-full max-w-3xl">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-12"></div>
            <h2 className="text-6xl font-montserrat font-black text-white uppercase tracking-tight mb-6">
              {data.clientName || 'NOME DO ALUNO'}
            </h2>
            <div className="inline-block px-12 py-4 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-[0.3em] text-[14px] shadow-2xl">
              Vigência: {data.totalPeriod || 'A definir'}
            </div>
          </div>
        </div>

        <div className="w-full text-center pb-16 relative z-10">
          <p className="text-white/40 font-black text-sm tracking-[0.5em] uppercase mb-4">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[12px] uppercase tracking-[0.8em] font-black">TEAM VBR • SEM DESCULPAS</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO FÍSICA */}
      <div className={`${fixedPageClass} p-[1.5cm]`}>
        <div className="absolute top-10 right-10 opacity-5">
           <img src={LOGO_RHINO_WHITE} alt="Logo" className="w-48" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-14">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.6em]">Módulo 01</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Avaliação Física</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-gray-400">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Peso Atual', value: data.physicalData.weight, unit: 'kg' },
            { label: 'Altura', value: data.physicalData.height, unit: 'm' },
            { label: 'Idade', value: data.physicalData.age, unit: 'anos' },
            { label: 'Gordura', value: data.physicalData.bodyFat, unit: '%' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-8 rounded-[2.5rem] text-center border border-gray-100 avoid-break shadow-sm">
              <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-3 block">{item.label}</span>
              <div className="text-5xl font-black text-black leading-none">
                {item.value || '--'}<span className="text-sm ml-1 text-[#d4af37]">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-10 mb-12 flex-1">
          <div className="space-y-8">
             <h3 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#d4af37] border-l-[10px] border-[#d4af37] pl-5">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Massa Muscular', value: data.physicalData.muscleMass, unit: 'kg' },
                  { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'nível' },
                  { label: 'IMC', value: data.physicalData.imc, unit: '' },
                  { label: 'Perfil VBR', value: 'Elite', unit: '' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-md avoid-break">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">{item.label}</span>
                    <div className="text-3xl font-black text-black">{item.value || '--'}<span className="text-[11px] ml-1 text-[#d4af37]">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center border-r-[12px] border-[#d4af37] avoid-break">
            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-8">Estratégia do Coach</h3>
            <p className="text-[20px] leading-relaxed italic text-white/95 font-medium">
              "{data.physicalData.observations || "Foco absoluto em recomposição corporal e aumento de densidade muscular através de estímulos de alta intensidade."}"
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-10 rounded-[3.5rem] text-white flex flex-col items-center relative overflow-hidden border-b-8 border-[#d4af37] mt-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.6em] text-[#d4af37] mb-3 relative z-10">OBJETIVO CENTRAL DO PROTOCOLO</span>
          <div className="text-5xl font-black font-montserrat uppercase tracking-tight text-center relative z-10 drop-shadow-lg">{data.protocolTitle || 'ALTA PERFORMANCE'}</div>
        </div>
      </div>

      {/* PÁGINA 3: PLANO NUTRICIONAL */}
      <div className={`${fixedPageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-14">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.6em]">Módulo 02</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Plano Nutricional</h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] text-white p-14 rounded-[5rem] flex flex-col items-center mb-12 shadow-2xl border-b-[12px] border-[#d4af37] avoid-break">
          <span className="text-[16px] font-black text-[#d4af37] mb-8 tracking-[1em] uppercase">Meta Diária de Calorias</span>
          <div className="text-[110px] font-black font-montserrat tracking-tighter leading-none">
            {data.kcalGoal || '0000'} <span className="text-3xl text-[#d4af37]">KCAL</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Proteínas', val: data.macros.protein.value, ratio: data.macros.protein.ratio, color: 'bg-red-600' },
            { label: 'Carbos', val: data.macros.carbs.value, ratio: data.macros.carbs.ratio, color: 'bg-blue-600' },
            { label: 'Gorduras', val: data.macros.fats.value, ratio: data.macros.fats.ratio, color: 'bg-amber-600' }
          ].map((macro, i) => (
            <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-lg text-center avoid-break">
              <div className={`w-5 h-5 rounded-full ${macro.color} mx-auto mb-5 shadow-sm`}></div>
              <span className="text-gray-400 font-black uppercase text-[12px] mb-3 tracking-[0.2em] block">{macro.label}</span>
              <div className="text-5xl font-black mb-2">{macro.val || '0'}g</div>
              <span className="text-[14px] text-[#d4af37] font-black uppercase tracking-wider">{macro.ratio}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-12 rounded-[4rem] border-l-[14px] border-[#d4af37] mt-auto avoid-break shadow-sm">
          <h4 className="font-black uppercase text-[12px] text-[#d4af37] mb-5 tracking-[0.5em]">Fundamentação Alimentar</h4>
          <p className="text-[22px] leading-relaxed text-gray-800 italic font-bold">
            "{data.nutritionalStrategy || "A precisão nutricional é o pilar que sustenta sua evolução física."}"
          </p>
        </div>
      </div>

      {/* PÁGINA 4: ROTINA ALIMENTAR */}
      <div className={`${dynamicPageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-14">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.6em]">Módulo 03</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Rotina Alimentar</h2>
          </div>
        </div>

        <div className="rounded-[4rem] border border-gray-100 overflow-hidden shadow-2xl mb-12">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-10 text-left font-black uppercase text-[13px] tracking-[0.4em] text-[#d4af37] w-48 border-r border-white/10">Horário</th>
                <th className="p-10 text-left font-black uppercase text-[13px] tracking-[0.4em]">Descrição da Refeição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="avoid-break">
                  <td className="p-12 font-black text-[#d4af37] text-5xl align-top bg-gray-50/50 border-r border-gray-100">{meal.time}</td>
                  <td className="p-12">
                    <div className="font-black text-3xl text-black mb-5 uppercase tracking-tight">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-bold text-[20px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PÁGINA 5: METODOLOGIA DE TREINO */}
      <div className={`${dynamicPageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-14">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.6em]">Módulo 04</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Metodologia de Treino</h2>
          </div>
        </div>

        <div className="space-y-12 pb-14">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[4rem] border border-gray-100 overflow-hidden shadow-2xl avoid-break">
               <div className="bg-[#0a0a0a] text-white p-8 flex justify-between items-center border-b-10 border-[#d4af37]">
                  <h3 className="text-4xl font-black text-[#d4af37] uppercase font-montserrat tracking-tight">{day.title}</h3>
                  <span className="bg-[#d4af37] text-black px-8 py-2 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em]">{day.focus}</span>
               </div>
               <table className="w-full">
                 <tbody className="divide-y divide-gray-100">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id}>
                         <td className="p-10 text-black font-black text-2xl pl-14 uppercase tracking-tight">{ex.name}</td>
                         <td className="p-10 text-[#d4af37] font-black text-4xl text-right pr-14">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 6: OBSERVAÇÕES DO COACH */}
      <div className={`${fixedPageClass} !bg-[#0a0a0a] !text-white justify-center p-[2cm] border-t-[24px] border-[#d4af37]`}>
        <div className="max-w-3xl text-center space-y-20 relative z-10 mx-auto">
           <div className="bg-white/5 border-2 border-[#d4af37]/40 p-20 rounded-[5rem] backdrop-blur-2xl shadow-[0_0_100px_rgba(212,175,55,0.2)] relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-12 py-3 rounded-full font-black uppercase text-[14px] tracking-[0.6em] shadow-xl">OBSERVAÇÕES DO COACH</div>
              <p className="text-4xl leading-tight font-black italic text-white/95 uppercase font-montserrat tracking-tight">
                "{data.generalObservations || "NÃO NEGOCIE O SEU RESULTADO. FAÇA O QUE DEVE SER FEITO COM EXCELÊNCIA."}"
              </p>
           </div>
           
           <div className="pt-24 flex flex-col items-center">
             <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-80 mx-auto mb-16 drop-shadow-[0_0_40px_rgba(212,175,55,0.5)]" />
             <p className="text-5xl font-black tracking-[0.7em] uppercase font-montserrat">TEAM VBR</p>
             <div className="w-64 h-1.5 bg-[#d4af37] my-10 shadow-[0_0_30px_rgba(212,175,55,0.8)]"></div>
             <p className="text-[16px] font-black text-white/40 tracking-[1.8em] uppercase">SEM DESCULPAS • SEM LIMITES</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
