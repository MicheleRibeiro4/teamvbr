
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK, LOGO_RHINO_WHITE } from '../constants';

interface Props {
  data: ProtocolData;
}

const ProtocolPreview: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[850px] mx-auto bg-transparent">
      
      {/* PÁGINA 1: CAPA PREMIUM */}
      <div className="bg-[#0a0a0a] text-white w-full h-[1120px] min-h-[1120px] flex flex-col items-center justify-between p-16 relative page-break border-b-[24px] border-[#d4af37] overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.12)_0%,_transparent_60%)]"></div>
        
        <div className="flex flex-col items-center pt-28 w-full relative z-10">
          <div className="p-4 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md mb-16 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
            <img src={LOGO_RHINO_BLACK} alt="Logo VBR Rhino" className="w-[450px] h-auto" />
          </div>
          
          <div className="text-center space-y-8 w-full">
            <p className="text-[#d4af37] font-black uppercase tracking-[0.8em] text-[13px]">High Performance Elite Coaching</p>
            <h1 className="text-6xl md:text-8xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.85]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'STRATEGIC'}</span>
            </h1>
          </div>

          <div className="mt-32 text-center w-full max-w-2xl">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-10"></div>
            <h2 className="text-5xl font-montserrat font-black text-white uppercase tracking-tight mb-4">
              {data.clientName || 'NOME DO ALUNO'}
            </h2>
            <div className="inline-block px-10 py-3 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-widest text-[12px] shadow-xl">
              Vigência: {data.totalPeriod || 'Período não definido'}
            </div>
          </div>
        </div>

        <div className="w-full text-center pb-12 relative z-10">
          <p className="text-white/50 font-black text-sm tracking-[0.4em] uppercase mb-2">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[11px] uppercase tracking-[0.7em] font-black">TEAM VBR • NO EXCUSES</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO FÍSICA HD */}
      <div className="bg-white w-full h-[1120px] min-h-[1120px] p-20 flex flex-col page-break text-black border-b-[1px] border-gray-100 relative">
        <div className="absolute top-10 right-10 opacity-10">
           <img src={LOGO_RHINO_WHITE} alt="" className="w-32" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-16">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 01</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black">Bioimpedância</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Peso Atual', value: data.physicalData.weight, unit: 'kg' },
            { label: 'Altura', value: data.physicalData.height, unit: 'm' },
            { label: 'Idade', value: data.physicalData.age, unit: 'anos' },
            { label: 'Gordura', value: data.physicalData.bodyFat, unit: '%' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-10 rounded-[3rem] text-center border-2 border-gray-100 shadow-sm">
              <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-3 block">{item.label}</span>
              <div className="text-5xl font-black text-black leading-none">
                {item.value || '--'}<span className="text-lg ml-1 text-[#d4af37]">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
             <h3 className="text-md font-black uppercase tracking-[0.4em] text-[#d4af37] border-l-[12px] border-[#d4af37] pl-5">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Massa Muscular', value: data.physicalData.muscleMass, unit: 'kg' },
                  { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'lvl' },
                  { label: 'IMC', value: data.physicalData.imc, unit: '' },
                  { label: 'Score VBR', value: 'Elite', unit: '' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-50">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-3xl font-black">{item.value || '--'}<span className="text-[12px] ml-1">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center border-r-[12px] border-[#d4af37]">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#d4af37] mb-8">Estratégia do Coach</h3>
            <p className="text-[18px] leading-relaxed italic text-white/90 font-medium">
              "{data.physicalData.observations || "Foco absoluto em recomposição corporal e aumento de densidade muscular através de estímulos de alta intensidade e superávit controlado."}"
            </p>
          </div>
        </div>

        <div className="mt-auto bg-[#0a0a0a] p-12 rounded-[4rem] text-white flex flex-col items-center relative overflow-hidden border-b-8 border-[#d4af37]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)]"></div>
          <span className="text-[12px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-3 relative z-10">OBJETIVO CENTRAL</span>
          <div className="text-6xl font-black font-montserrat uppercase tracking-tight text-center relative z-10">{data.protocolTitle || 'PERFORMANCE'}</div>
        </div>
      </div>

      {/* PÁGINA 3: NUTRIÇÃO E MACROS */}
      <div className="bg-white w-full h-[1120px] min-h-[1120px] p-20 flex flex-col page-break text-black border-b-[1px] border-gray-100 relative">
        <div className="absolute top-10 right-10 opacity-10">
           <img src={LOGO_RHINO_WHITE} alt="" className="w-32" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-16">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 02</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black">Plano Nutricional</h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] text-white p-20 rounded-[5rem] flex flex-col items-center mb-16 shadow-2xl relative overflow-hidden border-b-[12px] border-[#d4af37]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.2)_0%,_transparent_75%)]"></div>
          <span className="text-[16px] font-black text-[#d4af37] mb-8 tracking-[0.8em] uppercase relative z-10">Aporte Calórico Diário</span>
          <div className="text-[140px] font-black font-montserrat tracking-tighter relative z-10 leading-none">
            {data.kcalGoal || '0000'} <span className="text-4xl text-[#d4af37] font-black">KCAL</span>
          </div>
          <div className="bg-[#d4af37] text-black px-8 py-2 rounded-full font-black uppercase text-[12px] tracking-widest mt-10 relative z-10">
            {data.kcalSubtext || 'FOCO EM HIPERTROFIA'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-10 mb-16">
          {[
            { label: 'Proteínas', val: data.macros.protein.value, ratio: data.macros.protein.ratio, color: 'bg-red-600' },
            { label: 'Carbos', val: data.macros.carbs.value, ratio: data.macros.carbs.ratio, color: 'bg-blue-600' },
            { label: 'Gorduras', val: data.macros.fats.value, ratio: data.macros.fats.ratio, color: 'bg-amber-600' }
          ].map((macro, i) => (
            <div key={i} className="bg-white p-12 rounded-[4rem] border-4 border-gray-50 shadow-xl text-center flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full ${macro.color} mb-6 shadow-md`}></div>
              <span className="text-gray-400 font-black uppercase text-[12px] mb-3 tracking-widest">{macro.label}</span>
              <div className="text-6xl font-black mb-2">{macro.val || '0'}g</div>
              <span className="text-[14px] text-[#d4af37] font-black uppercase">{macro.ratio}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-12 rounded-[4rem] border-l-[16px] border-[#d4af37] shadow-inner mt-auto">
          <h4 className="font-black uppercase text-sm text-[#d4af37] mb-5 tracking-[0.4em]">Estratégia Alimentar</h4>
          <p className="text-2xl leading-relaxed text-gray-800 italic font-bold">
            "{data.nutritionalStrategy || "Cada grama conta. A precisão na balança é o que dita o seu resultado final. Disciplina é liberdade."}"
          </p>
        </div>
      </div>

      {/* PÁGINA 4: CRONOGRAMA DE REFEIÇÕES */}
      <div className="bg-white w-full h-[1120px] min-h-[1120px] p-20 flex flex-col page-break text-black border-b-[1px] border-gray-100 relative">
        <div className="absolute top-10 right-10 opacity-10">
           <img src={LOGO_RHINO_WHITE} alt="" className="w-32" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-16">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 03</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black">Diet Routine</h2>
          </div>
        </div>

        <div className="rounded-[4rem] border-4 border-gray-50 overflow-hidden shadow-2xl flex-1">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-10 text-left font-black uppercase text-[14px] tracking-[0.3em] text-[#d4af37] w-48 border-r border-white/10">Time</th>
                <th className="p-10 text-left font-black uppercase text-[14px] tracking-[0.3em]">Meal Details</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-50">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-12 font-black text-[#d4af37] text-5xl align-top bg-gray-50/50 border-r border-gray-50">{meal.time}</td>
                  <td className="p-12">
                    <div className="font-black text-3xl text-black mb-6 uppercase tracking-tight">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-bold text-[20px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PÁGINA 5: TREINAMENTO ELITE */}
      <div className="bg-white w-full h-[1120px] min-h-[1120px] p-20 flex flex-col page-break text-black border-b-[1px] border-gray-100 relative">
        <div className="absolute top-10 right-10 opacity-10">
           <img src={LOGO_RHINO_WHITE} alt="" className="w-32" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-10 mb-16">
          <div>
            <span className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 04</span>
            <h2 className="text-6xl font-black uppercase font-montserrat tracking-tighter text-black">Training Lab</h2>
          </div>
        </div>

        <div className="space-y-16 flex-1">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[4rem] border-4 border-gray-50 overflow-hidden shadow-xl">
               <div className="bg-[#0a0a0a] text-white p-10 flex justify-between items-center border-b-8 border-[#d4af37]">
                  <h3 className="text-4xl font-black text-[#d4af37] uppercase font-montserrat tracking-tight">{day.title}</h3>
                  <span className="bg-[#d4af37] text-black px-8 py-2 rounded-2xl text-[14px] font-black uppercase tracking-[0.3em]">{day.focus}</span>
               </div>
               <table className="w-full">
                 <tbody className="divide-y-4 divide-gray-50">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                         <td className="p-10 text-black font-black text-2xl pl-16 uppercase">{ex.name}</td>
                         <td className="p-10 text-[#d4af37] font-black text-5xl text-right pr-16">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 6: ENCERRAMENTO E MOTIVAÇÃO */}
      <div className="bg-[#0a0a0a] text-white w-full h-[1120px] min-h-[1120px] p-24 flex flex-col items-center justify-center page-break border-t-[24px] border-[#d4af37] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="max-w-3xl text-center space-y-16 relative z-10">
           <div className="bg-white/5 border-4 border-[#d4af37]/30 p-20 rounded-[5rem] backdrop-blur-md shadow-2xl relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-10 py-3 rounded-full font-black uppercase text-[14px] tracking-[0.5em]">COACH NOTES</div>
              <p className="text-4xl md:text-5xl leading-tight font-black italic text-white/95 uppercase font-montserrat">
                "{data.generalObservations || "O SUCESSO NÃO É UM EVENTO, É UM HÁBITO. NÃO NEGOCIE O SEU RESULTADO. FAÇA O QUE DEVE SER FEITO."}"
              </p>
           </div>
           
           <div className="pt-24 flex flex-col items-center">
             <img src={LOGO_RHINO_BLACK} alt="VBR Rhino" className="w-80 mx-auto mb-16 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" />
             <p className="text-5xl font-black tracking-[0.8em] uppercase font-montserrat">TEAM VBR</p>
             <div className="w-64 h-2 bg-[#d4af37] my-10 shadow-[0_0_20px_rgba(212,175,55,0.6)]"></div>
             <p className="text-[16px] font-black text-white/40 tracking-[2em] uppercase">NO EXCUSES • NO LIMITS</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
