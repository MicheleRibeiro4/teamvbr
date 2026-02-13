
import React from 'react';
import { ProtocolData } from '../types';

interface Props {
  data: ProtocolData;
}

const ProtocolPreview: React.FC<Props> = ({ data }) => {
  const LOGO_URL = "https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png";

  return (
    <div className="flex flex-col items-center gap-0 print:gap-0 max-w-[850px] w-full bg-transparent shadow-2xl">
      
      {/* PÁGINA 1: CAPA PREMIUM */}
      <div className="bg-[#0a0a0a] text-white w-full min-h-[1120px] flex flex-col items-center justify-between p-16 relative page-break overflow-hidden border-b-[20px] border-[#d4af37]">
        {/* Elementos Decorativos */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(212,175,55,0.05)_0%,_transparent_50%)] pointer-events-none"></div>
        
        <div className="flex flex-col items-center pt-32 w-full relative z-10">
          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm mb-16">
            <img 
              src={LOGO_URL} 
              alt="Logo VBR" 
              className="w-64 h-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" 
            />
          </div>
          
          <div className="text-center space-y-6 w-full px-10">
            <p className="text-[#d4af37] font-black uppercase tracking-[0.6em] text-xs">Acompanhamento de Elite</p>
            <h1 className="text-5xl md:text-7xl font-montserrat font-black text-white tracking-tighter uppercase leading-[0.9] break-words">
              PROTOCOLO <br/>
              <span className="text-[#d4af37]">{data.protocolTitle || 'TREINO & DIETA'}</span>
            </h1>
          </div>

          <div className="mt-40 text-center w-full max-w-xl">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full mb-10 opacity-50"></div>
            <h2 className="text-4xl font-montserrat font-black text-white tracking-tight uppercase mb-4">
              {data.clientName || 'NOME DO ALUNO'}
            </h2>
            <div className="inline-block px-6 py-2 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20">
              <p className="text-[11px] text-[#d4af37] font-black uppercase tracking-[0.2em]">
                Vigência: {data.totalPeriod || 'Data não definida'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full text-center pb-16 relative z-10">
          <p className="text-white/40 font-black text-xs tracking-[0.3em] uppercase mb-1">{data.consultantName}</p>
          <div className="text-[#d4af37] text-[10px] uppercase tracking-[0.5em] font-black">TEAM VBR</div>
        </div>
      </div>

      {/* PÁGINA 2: AVALIAÇÃO E BIOMETRIA */}
      <div className="bg-white w-full min-h-[1120px] p-16 flex flex-col page-break text-[#1a1a1a]">
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Módulo 01</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter">Avaliação Física</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Data de Registro</span>
            <span className="text-lg font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Peso Atual', value: data.physicalData.weight, unit: 'kg' },
            { label: 'Altura', value: data.physicalData.height, unit: 'm' },
            { label: 'Idade', value: data.physicalData.age, unit: 'anos' },
            { label: 'Sexo', value: data.physicalData.gender, unit: '' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 text-center">{item.label}</span>
              <div className="text-3xl font-black text-[#1a1a1a] leading-none">
                {item.value || '--'}
                {item.value && <span className="text-xs ml-1 text-gray-400 font-bold">{item.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#d4af37] border-l-4 border-[#d4af37] pl-3">Composição Corporal</h3>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Gordura Corporal', value: data.physicalData.bodyFat, unit: '%' },
                  { label: 'Massa Muscular', value: data.physicalData.muscleMass, unit: 'kg' },
                  { label: 'G. Visceral', value: data.physicalData.visceralFat, unit: '' },
                  { label: 'IMC', value: data.physicalData.imc, unit: '' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{item.label}</span>
                    <div className="text-xl font-black">{item.value || '--'}<span className="text-[10px] ml-0.5">{item.unit}</span></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#d4af37] border-l-4 border-[#d4af37] pl-3 mb-4">Observações Bio</h3>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex-1 italic text-sm text-gray-600 leading-relaxed">
              {data.physicalData.observations || "Nenhuma observação física registrada para este período."}
            </div>
          </div>
        </div>

        <div className="mt-auto bg-[#0a0a0a] p-10 rounded-[3rem] text-white flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] opacity-10 rounded-full -mr-16 -mt-16"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-3">OBJETIVO CENTRAL</span>
          <div className="text-4xl font-black font-montserrat uppercase tracking-tight text-center">{data.protocolTitle || 'DEFINIÇÃO'}</div>
        </div>
      </div>

      {/* PÁGINA 3: NUTRIÇÃO E ESTRATÉGIA */}
      <div className="bg-white w-full min-h-[1120px] p-16 flex flex-col page-break text-[#1a1a1a]">
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Módulo 02</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter">Nutrição Avançada</h2>
          </div>
        </div>

        <div className="bg-[#fdfcf5] border-l-[6px] border-[#d4af37] p-8 rounded-r-[2rem] mb-12 shadow-sm">
          <p className="text-[16px] leading-relaxed text-gray-800">
            <span className="font-black text-[#1a1a1a] uppercase text-xs block mb-3 tracking-widest text-[#d4af37]">Mindset Nutricional:</span> 
            {data.nutritionalStrategy || "Estratégia personalizada focada em otimização metabólica e performance."}
          </p>
        </div>

        <div className="flex flex-col items-center mb-16">
          <div className="bg-[#0a0a0a] text-white p-12 rounded-[3rem] w-full flex flex-col items-center shadow-2xl border-b-[8px] border-[#d4af37]">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#d4af37] mb-4">
              META DIÁRIA {data.kcalSubtext || ''}
            </span>
            <div className="text-8xl font-black font-montserrat tracking-tighter">
              {data.kcalGoal || '0000'} <span className="text-3xl text-[#d4af37]">KCAL</span>
            </div>
          </div>
        </div>

        <h3 className="text-center text-xs font-black uppercase tracking-[0.4em] mb-10 text-gray-400">Distribuição de Macronutrientes</h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Proteínas', val: data.macros.protein.value, ratio: data.macros.protein.ratio, color: 'bg-red-500' },
            { label: 'Carbos', val: data.macros.carbs.value, ratio: data.macros.carbs.ratio, color: 'bg-blue-500' },
            { label: 'Gorduras', val: data.macros.fats.value, ratio: data.macros.fats.ratio, color: 'bg-amber-500' }
          ].map((macro, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg flex flex-col items-center group hover:border-[#d4af37] transition-colors">
              <div className={`w-3 h-3 rounded-full ${macro.color} mb-4`}></div>
              <span className="text-gray-400 font-black uppercase text-[10px] mb-2 tracking-widest">{macro.label}</span>
              <div className="text-4xl font-black mb-1">{macro.val || '0'}g</div>
              <span className="text-[11px] text-[#d4af37] font-black uppercase">{macro.ratio}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA 4: DIETA E SUPLEMENTAÇÃO */}
      <div className="bg-white w-full min-h-[1120px] p-16 flex flex-col page-break text-[#1a1a1a]">
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Módulo 03</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter">Rotina Diária</h2>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl mb-12">
          <table className="w-full text-left">
            <thead className="bg-[#0a0a0a] text-white">
              <tr>
                <th className="p-6 font-black text-[10px] uppercase tracking-[0.3em] w-32 text-[#d4af37] border-r border-white/10">Horário</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-[0.3em]">Refeição e Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-8 font-black text-[#d4af37] text-3xl align-top border-r border-gray-50 bg-gray-50/20">{meal.time}</td>
                  <td className="p-8">
                    <div className="font-black text-[#1a1a1a] text-xl mb-3 uppercase tracking-tight">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-medium text-[16px] whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.supplements.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#d4af37] border-l-4 border-[#d4af37] pl-3 mb-8">Suplementação Complementar</h3>
            <div className="grid grid-cols-1 gap-4">
              {data.supplements.map((s) => (
                <div key={s.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-[#d4af37]/5 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#d4af37] shadow-sm border border-gray-100">
                      <span className="font-black text-xs">VBR</span>
                    </div>
                    <div>
                      <span className="font-black text-xl text-[#1a1a1a] uppercase leading-none">{s.name}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{s.timing}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#d4af37] text-black px-5 py-2 rounded-2xl font-black text-lg shadow-lg">
                      {s.dosage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PÁGINA 5: TREINO DE ALTA PERFORMANCE */}
      <div className="bg-white w-full min-h-[1120px] p-16 flex flex-col page-break text-[#1a1a1a]">
        <div className="flex justify-between items-end border-b-4 border-[#d4af37] pb-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Módulo 04</span>
            <h2 className="text-4xl font-black uppercase font-montserrat tracking-tighter">Treinamento de Elite</h2>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Frequência Semanal</span>
             <span className="text-xl font-black">{data.trainingFrequency || '5x'}</span>
          </div>
        </div>
        
        <div className="space-y-10">
          {data.trainingDays.map((day) => (
            <div key={day.id} className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl">
               <div className="bg-[#0a0a0a] text-white p-6 flex justify-between items-center border-b-[6px] border-[#d4af37]">
                  <h3 className="text-2xl font-black text-[#d4af37] uppercase font-montserrat tracking-tight">{day.title}</h3>
                  <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl">{day.focus}</span>
               </div>
               <table className="w-full text-left">
                 <tbody className="divide-y divide-gray-50">
                    {day.exercises.map((ex, idx) => (
                      <tr key={ex.id} className={`transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
                         <td className="p-5 text-gray-800 font-bold text-lg border-r border-gray-50">{ex.name}</td>
                         <td className="p-5 text-[#d4af37] font-black text-2xl text-right w-32">{ex.sets}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ))}
        </div>
      </div>

      {/* PÁGINA FINAL: OBSERVAÇÕES E ENCERRAMENTO */}
      <div className="bg-[#0a0a0a] w-full min-h-[1120px] p-20 flex flex-col items-center justify-center page-break relative overflow-hidden border-t-[20px] border-[#d4af37]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
        
        <div className="w-full max-w-2xl relative z-10">
           <div className="bg-[#111] border-[2px] border-[#d4af37]/30 p-12 rounded-[3rem] shadow-[0_0_50px_rgba(212,175,55,0.1)]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-1 text-[#d4af37] bg-[#d4af37]"></div>
                <h3 className="text-3xl font-black font-montserrat tracking-tighter uppercase text-white">RECOMENDAÇÕES</h3>
              </div>
              <p className="text-2xl leading-relaxed font-medium text-white/70 italic text-center">
                "{data.generalObservations || "A constância é o que separa o sucesso do esquecimento. Mantenha o foco absoluto."}"
              </p>
           </div>
        </div>

        <div className="mt-40 text-center relative z-10">
           <div className="mb-10 flex justify-center">
              <img src={LOGO_URL} alt="VBR" className="w-40 opacity-80" />
           </div>
           <p className="text-3xl font-black text-white tracking-[0.5em] uppercase font-montserrat">
             TEAM VBR
           </p>
           <div className="h-px bg-white/10 w-64 mx-auto my-6"></div>
           <p className="text-[11px] font-black text-[#d4af37] uppercase tracking-[1em]">NO EXCUSES</p>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-12">Team VBR &copy; {new Date().getFullYear()}</p>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
