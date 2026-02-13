
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK, LOGO_RHINO_WHITE } from '../constants';
import { Printer } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const ProtocolPreview: React.FC<Props> = ({ data }) => {
  // Classe base para páginas A4
  const pageClass = "bg-white w-[210mm] min-h-[297mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full bg-transparent print:gap-0 print-container pb-20 print:pb-0">
      
      {/* Botão de Impressão Flutuante (Apenas na Web) */}
      <button 
        onClick={handlePrint}
        className="no-print fixed bottom-8 right-8 z-[100] bg-[#d4af37] text-black px-6 py-4 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:scale-110 transition-all font-black uppercase text-xs flex items-center gap-3"
      >
        <Printer size={20} /> Salvar PDF / Imprimir
      </button>

      {/* PÁGINA 1: CAPA PREMIUM */}
      <div className={`${pageClass} !bg-[#0a0a0a] !text-white border-b-[20px] border-[#d4af37] justify-between p-[2cm] !h-[297mm]`}>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_60%)]"></div>
        
        <div className="flex flex-col items-center pt-[3cm] w-full relative z-10">
          <div className="p-6 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md mb-20 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
            <img 
                src={LOGO_RHINO_BLACK} 
                alt="Logo Team VBR" 
                className="w-80 h-auto block" 
            />
          </div>
          
          <div className="text-center space-y-8 w-full">
            <p className="text-[#d4af37] font-black uppercase tracking-[0.8em] text-[13px]">High Performance Elite Coaching</p>
            <h1 className="text-6xl md:text-8xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.85]">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'STRATEGIC'}</span>
            </h1>
          </div>

          <div className="mt-[4cm] text-center w-full max-w-2xl">
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

      {/* PÁGINA 2: BIOIMPEDÂNCIA */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <div className="absolute top-10 right-10 opacity-10">
           <img src={LOGO_RHINO_WHITE} alt="Logo" className="w-32" />
        </div>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 01</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Bioimpedância</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Peso Atual', value: data.physicalData.weight, unit: 'kg' },
            { label: 'Altura', value: data.physicalData.height, unit: 'm' },
            { label: 'Idade', value: data.physicalData.age, unit: 'anos' },
            { label: 'Gordura', value: data.physicalData.bodyFat, unit: '%' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-[2rem] text-center border border-gray-100 avoid-break">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">{item.label}</span>
              <div className="text-4xl font-black text-black leading-none">
                {item.value || '--'}<span className="text-sm ml-1 text-[#d4af37]">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 flex-1">
          <div className="space-y-6">
             <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#d4af37] border-l-[8px] border-[#d4af37] pl-4">Status Metabólico</h3>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Massa Muscular', value: data.physicalData.muscleMass, unit: 'kg' },
                  { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: 'lvl' },
                  { label: 'IMC', value: data.physicalData.imc, unit: '' },
                  { label: 'Score VBR', value: 'Elite', unit: '' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm avoid-break">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-2xl font-black">{item.value || '--'}<span className="text-[10px] ml-1">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0a0a0a] text-white p-10 rounded-[3rem] shadow-xl flex flex-col justify-center border-r-[10px] border-[#d4af37] avoid-break">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-6">Estratégia do Coach</h3>
            <p className="text-[16px] leading-relaxed italic text-white/90 font-medium">
              "{data.physicalData.observations || "Foco absoluto em recomposição corporal e aumento de densidade muscular através de estímulos de alta intensidade."}"
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-8 rounded-[3rem] text-white flex flex-col items-center relative overflow-hidden border-b-8 border-[#d4af37] mt-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-2 relative z-10">OBJETIVO CENTRAL</span>
          <div className="text-4xl font-black font-montserrat uppercase tracking-tight text-center relative z-10">{data.protocolTitle || 'PERFORMANCE'}</div>
        </div>
      </div>

      {/* PÁGINA 3: PLANO NUTRICIONAL */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 02</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Plano Nutricional</h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] text-white p-12 rounded-[4rem] flex flex-col items-center mb-10 shadow-xl border-b-[10px] border-[#d4af37] avoid-break">
          <span className="text-[14px] font-black text-[#d4af37] mb-6 tracking-[0.8em] uppercase">Aporte Calórico</span>
          <div className="text-[100px] font-black font-montserrat tracking-tighter leading-none">
            {data.kcalGoal || '0000'} <span className="text-2xl text-[#d4af37]">KCAL</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Proteínas', val: data.macros.protein.value, ratio: data.macros.protein.ratio, color: 'bg-red-600' },
            { label: 'Carbos', val: data.macros.carbs.value, ratio: data.macros.carbs.ratio, color: 'bg-blue-600' },
            { label: 'Gorduras', val: data.macros.fats.value, ratio: data.macros.fats.ratio, color: 'bg-amber-600' }
          ].map((macro, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center avoid-break">
              <div className={`w-4 h-4 rounded-full ${macro.color} mx-auto mb-4`}></div>
              <span className="text-gray-400 font-black uppercase text-[10px] mb-2 tracking-widest block">{macro.label}</span>
              <div className="text-4xl font-black mb-1">{macro.val || '0'}g</div>
              <span className="text-[12px] text-[#d4af37] font-black uppercase">{macro.ratio}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-10 rounded-[3rem] border-l-[12px] border-[#d4af37] mt-auto avoid-break">
          <h4 className="font-black uppercase text-[11px] text-[#d4af37] mb-4 tracking-[0.4em]">Estratégia Alimentar</h4>
          <p className="text-[18px] leading-relaxed text-gray-800 italic font-bold">
            "{data.nutritionalStrategy || "Precisão é o que dita o seu resultado final."}"
          </p>
        </div>
      </div>

      {/* PÁGINA 4: REFEIÇÕES */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 03</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Diet Routine</h2>
          </div>
        </div>

        <div className="rounded-[3rem] border border-gray-100 overflow-hidden shadow-xl mb-8">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-8 text-left font-black uppercase text-[12px] tracking-[0.3em] text-[#d4af37] w-40 border-r border-white/10">Time</th>
                <th className="p-8 text-left font-black uppercase text-[12px] tracking-[0.3em]">Meal Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="avoid-break">
                  <td className="p-10 font-black text-[#d4af37] text-4xl align-top bg-gray-50/50 border-r border-gray-100">{meal.time}</td>
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
      <div className={`${pageClass} p-[1.5cm]`}>
        <div className="flex justify-between items-end border-b-8 border-[#d4af37] pb-8 mb-12">
          <div>
            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em]">Módulo 04</span>
            <h2 className="text-5xl font-black uppercase font-montserrat tracking-tighter text-black leading-none">Training Lab</h2>
          </div>
        </div>

        <div className="space-y-10 pb-10">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[3rem] border border-gray-100 overflow-hidden shadow-lg avoid-break">
               <div className="bg-[#0a0a0a] text-white p-6 flex justify-between items-center border-b-8 border-[#d4af37]">
                  <h3 className="text-2xl font-black text-[#d4af37] uppercase font-montserrat tracking-tight">{day.title}</h3>
                  <span className="bg-[#d4af37] text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">{day.focus}</span>
               </div>
               <table className="w-full">
                 <tbody className="divide-y divide-gray-50">
                    {day.exercises.map((ex) => (
                      <tr key={ex.id}>
                         <td className="p-6 text-black font-black text-lg pl-10 uppercase">{ex.name}</td>
                         <td className="p-6 text-[#d4af37] font-black text-3xl text-right pr-10">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 6: ENCERRAMENTO */}
      <div className={`${pageClass} !bg-[#0a0a0a] !text-white justify-center p-[2cm] border-t-[20px] border-[#d4af37] !h-[297mm]`}>
        <div className="max-w-2xl text-center space-y-16 relative z-10 mx-auto">
           <div className="bg-white/5 border-2 border-[#d4af37]/30 p-16 rounded-[4rem] backdrop-blur-md shadow-2xl relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-8 py-2 rounded-full font-black uppercase text-[12px] tracking-[0.5em]">COACH NOTES</div>
              <p className="text-3xl leading-tight font-black italic text-white/95 uppercase font-montserrat">
                "{data.generalObservations || "NÃO NEGOCIE O SEU RESULTADO. FAÇA O QUE DEVE SER FEITO."}"
              </p>
           </div>
           
           <div className="pt-20 flex flex-col items-center">
             <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-72 mx-auto mb-12 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" />
             <p className="text-4xl font-black tracking-[0.6em] uppercase font-montserrat">TEAM VBR</p>
             <div className="w-48 h-1 bg-[#d4af37] my-8 shadow-[0_0_20px_rgba(212,175,55,0.6)]"></div>
             <p className="text-[14px] font-black text-white/40 tracking-[1.5em] uppercase">NO EXCUSES • NO LIMITS</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
