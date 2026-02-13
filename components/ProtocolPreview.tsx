
import React from 'react';
import { ProtocolData } from '../types';

interface Props {
  data: ProtocolData;
}

const ProtocolPreview: React.FC<Props> = ({ data }) => {
  const LOGO_URL = "https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png";

  return (
    <div className="flex flex-col items-center w-full max-w-[850px] mx-auto bg-transparent">
      
      {/* PÁGINA 1: CAPA */}
      <div className="bg-[#0a0a0a] text-white w-full min-h-[1120px] flex flex-col items-center justify-between p-16 relative page-break border-b-[20px] border-[#d4af37]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1)_0%,_transparent_50%)]"></div>
        
        <div className="flex flex-col items-center pt-32 w-full relative z-10">
          <div className="p-4 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm mb-16 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <img src={LOGO_URL} alt="Logo VBR" className="w-64 h-auto" />
          </div>
          
          <div className="text-center space-y-6 w-full px-10">
            <p className="text-[#d4af37] font-black uppercase tracking-[0.6em] text-[10px]">High Performance Coaching</p>
            <h1 className="text-5xl md:text-7xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.9]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'ESTRATÉGICO'}</span>
            </h1>
          </div>

          <div className="mt-40 text-center w-full max-w-xl">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-10 opacity-50"></div>
            <h2 className="text-4xl font-montserrat font-black text-white uppercase mb-4">
              {data.clientName || 'NOME DO ALUNO'}
            </h2>
            <div className="inline-block px-8 py-2 bg-[#d4af37] text-black rounded-full font-black uppercase tracking-widest text-[10px]">
              Vigência: {data.totalPeriod || 'Não definida'}
            </div>
          </div>
        </div>

        <div className="w-full text-center pb-12 relative z-10">
          <p className="text-white/40 font-black text-xs tracking-[0.3em] uppercase mb-1">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[10px] uppercase tracking-[0.5em] font-black">TEAM VBR</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO */}
      <div className="bg-white w-full min-h-[1120px] p-20 flex flex-col page-break text-black border-b-[1px] border-gray-100">
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em]">Módulo 01</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black">Bioimpedância</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Peso Atual', value: data.physicalData.weight, unit: 'kg' },
            { label: 'Altura', value: data.physicalData.height, unit: 'm' },
            { label: 'Idade', value: data.physicalData.age, unit: 'anos' },
            { label: 'Gordura', value: data.physicalData.bodyFat, unit: '%' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-100 p-8 rounded-[2.5rem] text-center shadow-sm">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">{item.label}</span>
              <div className="text-4xl font-black text-black leading-none">
                {item.value || '--'}<span className="text-sm ml-1 text-[#d4af37]">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-10 mb-12 flex-1">
          <div className="space-y-6">
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#d4af37] border-l-8 border-[#d4af37] pl-4">Análise Corporal</h3>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Massa Muscular', value: data.physicalData.muscleMass, unit: 'kg' },
                  { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: '' },
                  { label: 'IMC', value: data.physicalData.imc, unit: '' },
                  { label: 'Bio', value: 'VBR-ELITE', unit: '' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-gray-50 shadow-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-2xl font-black">{item.value || '--'}<span className="text-[10px] ml-1">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#d4af37] mb-6">Diagnóstico do Coach</h3>
            <p className="text-[16px] leading-relaxed italic opacity-80 font-medium">
              {data.physicalData.observations || "Foco total na otimização de massa muscular e controle de percentual de gordura para máxima performance estética."}
            </p>
          </div>
        </div>

        <div className="mt-auto bg-[#0a0a0a] p-10 rounded-[3rem] text-white flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] opacity-10 rounded-full -mr-16 -mt-16"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-3">FOCO DO PERÍODO</span>
          <div className="text-5xl font-black font-montserrat uppercase tracking-tight text-center">{data.protocolTitle || 'EVOLUÇÃO'}</div>
        </div>
      </div>

      {/* PÁGINA 3: NUTRIÇÃO */}
      <div className="bg-white w-full min-h-[1120px] p-20 flex flex-col page-break text-black">
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em]">Módulo 02</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black">Plano Nutricional</h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] text-white p-16 rounded-[4rem] flex flex-col items-center mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.15)_0%,_transparent_70%)]"></div>
          <span className="text-[12px] font-black text-[#d4af37] mb-6 tracking-[0.6em] uppercase">Meta Calórica Diária</span>
          <div className="text-9xl font-black font-montserrat tracking-tighter relative z-10">
            {data.kcalGoal || '0000'} <span className="text-3xl text-[#d4af37] font-black">KCAL</span>
          </div>
          <p className="text-white/40 font-bold uppercase text-xs mt-4 tracking-widest">{data.kcalSubtext || '(FOCO ABSOLUTO)'}</p>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Proteínas', val: data.macros.protein.value, ratio: data.macros.protein.ratio, color: 'bg-red-600' },
            { label: 'Carbos', val: data.macros.carbs.value, ratio: data.macros.carbs.ratio, color: 'bg-blue-600' },
            { label: 'Gorduras', val: data.macros.fats.value, ratio: data.macros.fats.ratio, color: 'bg-amber-600' }
          ].map((macro, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border-4 border-gray-50 shadow-lg text-center flex flex-col items-center group">
              <div className={`w-4 h-4 rounded-full ${macro.color} mb-4 shadow-sm`}></div>
              <span className="text-gray-400 font-black uppercase text-[11px] mb-2 tracking-widest">{macro.label}</span>
              <div className="text-5xl font-black mb-1">{macro.val || '0'}g</div>
              <span className="text-[12px] text-[#d4af37] font-black uppercase">{macro.ratio}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-10 rounded-[3rem] border-l-[12px] border-[#d4af37] shadow-inner mt-auto">
          <h4 className="font-black uppercase text-xs text-[#d4af37] mb-4 tracking-widest">Estratégia Nutricional</h4>
          <p className="text-lg leading-relaxed text-gray-700 italic font-semibold">
            "{data.nutritionalStrategy || "Cada refeição é um passo rumo ao seu objetivo. Siga com precisão cirúrgica."}"
          </p>
        </div>
      </div>

      {/* PÁGINA 4: REFEIÇÕES */}
      <div className="bg-white w-full min-h-[1120px] p-20 flex flex-col page-break text-black">
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em]">Módulo 03</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black">Rotina de Dieta</h2>
          </div>
        </div>

        <div className="rounded-[3rem] border-4 border-gray-50 overflow-hidden shadow-2xl mb-12">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-8 text-left font-black uppercase text-[12px] tracking-widest text-[#d4af37] w-44">Horário</th>
                <th className="p-8 text-left font-black uppercase text-[12px] tracking-widest">Refeição / Cardápio</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-50">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-10 font-black text-[#d4af37] text-4xl align-top bg-gray-50/30">{meal.time}</td>
                  <td className="p-10">
                    <div className="font-black text-2xl text-black mb-4 uppercase tracking-tight">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-bold text-[18px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PÁGINA 5: TREINO */}
      <div className="bg-white w-full min-h-[1120px] p-20 flex flex-col page-break text-black">
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em]">Módulo 04</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black">Protocolo de Treino</h2>
          </div>
        </div>

        <div className="space-y-12">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[3.5rem] border-4 border-gray-50 overflow-hidden shadow-xl">
               <div className="bg-[#0a0a0a] text-white p-8 flex justify-between items-center border-b-8 border-[#d4af37]">
                  <h3 className="text-3xl font-black text-[#d4af37] uppercase font-montserrat tracking-tight">{day.title}</h3>
                  <span className="bg-[#d4af37]/20 text-[#d4af37] px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">{day.focus}</span>
               </div>
               <table className="w-full">
                 <tbody className="divide-y-4 divide-gray-50">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                         <td className="p-8 text-black font-black text-2xl pl-12">{ex.name}</td>
                         <td className="p-8 text-[#d4af37] font-black text-4xl text-right pr-12">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 6: FINAL */}
      <div className="bg-[#0a0a0a] text-white w-full min-h-[1120px] p-24 flex flex-col items-center justify-center page-break border-t-[20px] border-[#d4af37] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="max-w-2xl text-center space-y-12 relative z-10">
           <div className="bg-white/5 border-2 border-[#d4af37]/30 p-16 rounded-[4rem] backdrop-blur-md shadow-2xl">
              <h3 className="text-[#d4af37] font-black text-[14px] uppercase mb-10 tracking-[0.6em]">Anotações do Coach</h3>
              <p className="text-3xl leading-relaxed font-black italic text-white/90">
                "{data.generalObservations || "NÃO ACEITE NADA MENOS QUE A SUA MELHOR VERSÃO. O SUCESSO É UMA DECISÃO DIÁRIA."}"
              </p>
           </div>
           
           <div className="pt-24 flex flex-col items-center">
             <img src={LOGO_URL} alt="VBR" className="w-64 mx-auto mb-12 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
             <p className="text-4xl font-black tracking-[0.8em] uppercase font-montserrat">TEAM VBR</p>
             <div className="w-48 h-1 bg-[#d4af37] my-8 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
             <p className="text-[14px] font-black text-white tracking-[1.5em] uppercase opacity-50">NO EXCUSES</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
