
import React from 'react';
import { ProtocolData } from '../types';
import { LOGO_RHINO_BLACK } from '../constants';
import { Printer, ChevronLeft, AlertTriangle } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onBack?: () => void;
}

const ProtocolPreview: React.FC<Props> = ({ data, onBack }) => {
  // Altura rigorosa de 295mm para garantir que o Safari não crie páginas extras
  const pageClass = "bg-white w-[210mm] h-[295mm] min-h-[295mm] mx-auto flex flex-col page-break text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden select-none";
  const dynamicPageClass = "bg-white w-[210mm] min-h-[295mm] mx-auto flex flex-col page-break-dynamic text-black relative shadow-2xl print:shadow-none print:m-0 print:rounded-none mb-10 print:mb-0 overflow-hidden";

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
          className="bg-[#d4af37] text-black px-8 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs flex items-center gap-3 border-2 border-black/10"
        >
          <Printer size={20} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* PÁGINA 1: CAPA */}
      <div className={`${pageClass} !bg-[#1a1a1a] !text-white border-b-[20px] border-[#d4af37] justify-center items-center p-[2cm]`}>
        <div className="flex flex-col items-center w-full text-center space-y-12">
          <img src={LOGO_RHINO_BLACK} alt="Logo" className="w-80 h-auto mb-8" />
          
          <div className="space-y-4">
            <h1 className="text-6xl font-montserrat font-black text-[#d4af37] uppercase tracking-tighter leading-none">
              PROTOCOLO <br/>
              COMPLETO DE <br/>
              <span className="text-white">{data.protocolTitle || 'HIPERTROFIA'}</span>
            </h1>
          </div>

          <div className="pt-12">
            <h2 className="text-7xl font-montserrat font-black text-white uppercase tracking-tight mb-6">
              {data.clientName || 'NOME DO ALUNO'}
            </h2>
            <div className="text-xl font-medium text-white/60 mb-2">
              Período Consultoria: {data.totalPeriod || '11/02/2026 a 11/05/2026'}
            </div>
          </div>

          <div className="pt-20 space-y-2">
            <p className="text-white/80 font-bold text-lg">{data.consultantName || 'Vinicius Brasil'}</p>
            <p className="text-white/40 text-sm uppercase tracking-[0.3em]">Consultoria Personalizada</p>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: DADOS FÍSICOS E ESTRATÉGIA */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <div className="space-y-10">
          <section>
            <h2 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-6">1. Dados Físicos - {new Date().toLocaleDateString('pt-BR')}</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[{ label: 'Peso Atual', val: data.physicalData.weight, unit: 'kg' }, { label: 'Altura', val: data.physicalData.height, unit: 'm' }, { label: 'Idade', val: data.physicalData.age, unit: 'anos' }].map((item, i) => (
                <div key={i} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-sm text-gray-400 font-bold block mb-2">{item.label}</span>
                  <div className="text-3xl font-black">{item.val || '--'} <span className="text-lg font-bold">{item.unit}</span></div>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-bold mb-4">Bioimpedância</h3>
            <div className="grid grid-cols-4 gap-4">
              {[{ label: 'Massa Musc.', val: data.physicalData.muscleMass, unit: 'kg' }, { label: 'Gordura', val: data.physicalData.bodyFat, unit: '%' }, { label: 'G. Visceral', val: data.physicalData.visceralFat, unit: '' }, { label: 'IMC', val: data.physicalData.imc, unit: '' }].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border-l-4 border-[#d4af37] shadow-md">
                  <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">{item.label}</span>
                  <div className="text-xl font-black">{item.val || '--'}<span className="text-sm ml-1">{item.unit}</span></div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-2 mb-6">2. Estratégia Nutricional</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic font-medium leading-relaxed text-gray-700 mb-8">
              <span className="font-black not-italic text-black mr-2">Observação:</span> {data.nutritionalStrategy || "Estratégia personalizada para recomposição corporal."}
            </div>

            <div className="bg-[#1a1a1a] text-white p-8 rounded-3xl text-center shadow-xl mb-10">
               <span className="text-sm font-black uppercase tracking-[0.3em] mb-4 block">META DIÁRIA {data.kcalSubtext || '(SUPERÁVIT CONTROLADO)'}</span>
               <div className="text-6xl font-black text-[#d4af37] font-montserrat">{data.kcalGoal || '0.000'} <span className="text-2xl">kcal</span></div>
            </div>

            <h3 className="text-xl font-bold mb-6">Distribuição de Macronutrientes</h3>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'PROTEÍNAS', val: data.macros.protein.value, sub: data.macros.protein.ratio, color: 'text-amber-600' },
                { label: 'CARBOIDRATOS', val: data.macros.carbs.value, sub: data.macros.carbs.ratio, color: 'text-amber-600' },
                { label: 'GORDURAS', val: data.macros.fats.value, sub: data.macros.fats.ratio, color: 'text-amber-600' }
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg text-center">
                  <span className={`text-[11px] font-black ${m.color} block mb-3`}>{m.label}</span>
                  <div className="text-4xl font-black mb-1">{m.val}g</div>
                  <span className="text-[11px] text-gray-400 font-bold">{m.sub}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-auto bg-amber-50 p-4 rounded-xl border-l-4 border-[#d4af37]">
          <p className="text-[11px] text-gray-700 font-bold">
            <span className="font-black text-black">Nota Importante:</span> Manter a consistência na pesagem dos alimentos.
          </p>
        </div>
      </div>

      {/* PÁGINA 3: PLANO ALIMENTAR */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <h2 className="text-4xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-4 mb-8">3. Plano Alimentar Diário</h2>
        <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl mb-8">
          <table className="w-full">
            <thead className="bg-[#d4af37] text-white">
              <tr>
                <th className="p-6 text-left text-2xl font-black w-32">Horário</th>
                <th className="p-6 text-left text-2xl font-black">Refeição & Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="avoid-break">
                  <td className="p-6 font-black text-[#d4af37] text-2xl align-top">{meal.time}</td>
                  <td className="p-6">
                    <div className="font-black text-xl text-black mb-2 uppercase leading-none">{meal.name}</div>
                    <div className="text-gray-600 leading-relaxed font-bold text-lg whitespace-pre-line">{meal.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-auto border-2 border-dashed border-gray-200 p-8 rounded-[2rem] text-center italic text-gray-400 font-bold text-xl">
          Lembre-se de manter a hidratação ao longo do dia (mínimo 3.5L de água).
        </div>
      </div>

      {/* PÁGINA 4: SUPLEMENTAÇÃO */}
      <div className={`${pageClass} p-[1.5cm]`}>
        <h2 className="text-4xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-4 mb-10">4. Suplementação e Recomendações</h2>
        <div className="space-y-6 mb-16">
          {data.supplements.map((s, idx) => {
            const colors = ['bg-[#d4af37]', 'bg-[#4a90e2]', 'bg-[#5c4033]'];
            return (
              <div key={s.id} className={`${colors[idx % 3]} text-white p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg`}>
                <div>
                   <h3 className="text-3xl font-black uppercase mb-2">{s.name}</h3>
                   <p className="text-xl font-bold opacity-90">{s.dosage}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl font-black uppercase text-sm">
                   {s.timing}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl font-black text-black">Dicas:</h3>
          <ul className="space-y-4">
            {data.tips.map((tip, i) => (
              <li key={i} className="flex gap-4 items-start text-xl font-bold text-gray-700 leading-snug">
                <span className="text-[#d4af37] mt-1">■</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PÁGINAS DE TREINO */}
      {[0, 1].map(pageIdx => {
        const startIndex = pageIdx * 2;
        const daysToShow = data.trainingDays.slice(startIndex, startIndex + 2);
        if (daysToShow.length === 0) return null;

        return (
          <div key={pageIdx} className={`${pageClass} p-[1.5cm]`}>
            <h2 className="text-4xl font-bold text-[#d4af37] border-b-2 border-[#d4af37] pb-4 mb-4">5. Divisão de Treino (Parte {pageIdx + 1})</h2>
            <div className="mb-8 font-black text-gray-400 uppercase tracking-widest text-xl">Frequência: {data.trainingFrequency || '4 a 5x por semana'}</div>
            
            <div className="space-y-10">
              {daysToShow.map((day) => (
                <div key={day.id} className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl avoid-break">
                   <div className="bg-[#1a1a1a] text-white p-6 flex justify-between items-center border-b-4 border-[#d4af37]">
                      <h3 className="text-2xl font-black text-[#d4af37] uppercase font-montserrat">{day.title}</h3>
                      <span className="bg-[#d4af37] text-black px-6 py-1.5 rounded-xl text-sm font-black uppercase">{day.focus}</span>
                   </div>
                   <table className="w-full">
                     <tbody className="divide-y divide-gray-100">
                        {day.exercises.map((ex) => (
                          <tr key={ex.id}>
                             <td className="p-5 text-black font-black text-xl pl-10 uppercase">{ex.name}</td>
                             <td className="p-5 text-[#d4af37] font-black text-2xl text-right pr-10">{ex.sets}</td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* PÁGINA FINAL */}
      <div className={`${pageClass} justify-center items-center p-[2cm]`}>
        <div className="max-w-2xl text-center space-y-20">
          <div className="bg-[#1a1a1a] p-16 rounded-[3rem] border-2 border-[#d4af37] shadow-2xl space-y-8">
            <h3 className="text-4xl font-black text-white flex items-center justify-center gap-4">
              <AlertTriangle className="text-[#d4af37]" size={48} /> ⚠ ATENÇÃO:
            </h3>
            <p className="text-2xl font-bold text-white/90 leading-relaxed italic">
              "Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedback."
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 font-bold text-xl leading-none">Documento gerado para uso exclusivo de <span className="text-black">{data.clientName}</span>.</p>
            <div className="w-32 h-1 bg-[#d4af37] mx-auto opacity-50 my-6"></div>
            <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-sm">TEAM VBR © 2026</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProtocolPreview;
