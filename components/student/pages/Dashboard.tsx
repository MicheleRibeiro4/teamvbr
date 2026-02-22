import React from 'react';
import { ProtocolData } from '../../../types';
import { Activity, Calendar, Trophy, ArrowUpRight, Clock } from 'lucide-react';

interface Props {
  data: ProtocolData;
  onNavigate: (page: string) => void;
}

const StudentDashboard: React.FC<Props> = ({ data, onNavigate }) => {
  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 15); // Mock date

  const daysLeft = 15;

  return (
    <div className="space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Painel Principal
        </h1>
        <p className="text-white/40 text-sm font-medium">
          Visão geral do seu progresso e atividades.
        </p>
      </header>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4">
              <Trophy size={24} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Protocolo Ativo</p>
            <h3 className="text-xl font-bold text-white">{data.protocolTitle || 'Hipertrofia'}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Em andamento
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <Clock size={24} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Próxima Atualização</p>
            <h3 className="text-xl font-bold text-white">{nextUpdate.toLocaleDateString('pt-BR')}</h3>
            <div className="mt-4 text-xs text-blue-400 font-bold">
              Faltam {daysLeft} dias
            </div>
          </div>
        </div>

        <div className="bg-[#d4af37] p-6 rounded-3xl border border-[#d4af37] relative overflow-hidden text-black group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-black mb-4">
              <Activity size={24} />
            </div>
            <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mb-1">Foco Atual</p>
            <h3 className="text-xl font-black uppercase tracking-tight">Consistência</h3>
            <p className="mt-4 text-xs font-bold opacity-80 leading-relaxed">
              "A disciplina é a ponte entre metas e realizações."
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] rounded-3xl border border-white/5 p-8">
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-[#d4af37] rounded-full"></span>
            Resumo da Dieta
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Meta Calórica</p>
                <p className="text-2xl font-black text-white">{data.kcalGoal || '0'} <span className="text-sm font-medium text-white/50">kcal</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Água</p>
                <p className="text-xl font-bold text-[#d4af37]">{data.waterGoal || '0'}L</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                <p className="text-[9px] font-bold text-white/40 uppercase">Proteína</p>
                <p className="text-lg font-bold text-white">{data.macros?.protein?.value || 0}g</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                <p className="text-[9px] font-bold text-white/40 uppercase">Carbo</p>
                <p className="text-lg font-bold text-white">{data.macros?.carbs?.value || 0}g</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                <p className="text-[9px] font-bold text-white/40 uppercase">Gordura</p>
                <p className="text-lg font-bold text-white">{data.macros?.fats?.value || 0}g</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-3xl border border-white/5 p-8">
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-[#d4af37] rounded-full"></span>
            Treino de Hoje
          </h3>
          {data.trainingDays && data.trainingDays.length > 0 ? (
            <div className="bg-gradient-to-br from-[#d4af37]/20 to-transparent p-6 rounded-2xl border border-[#d4af37]/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#d4af37] font-black uppercase text-xs tracking-widest mb-1">Treino A</p>
                  <h4 className="text-xl font-bold text-white">{data.trainingDays[0].title}</h4>
                </div>
                <span className="bg-[#d4af37] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {data.trainingDays[0].exercises.length} Exercícios
                </span>
              </div>
              <p className="text-white/60 text-sm mb-6 line-clamp-2">
                Foco: {data.trainingDays[0].focus}
              </p>
              <button 
                onClick={() => onNavigate('workout')}
                className="w-full bg-white text-black py-3 rounded-xl font-bold uppercase text-xs hover:bg-[#d4af37] transition-colors"
              >
                Ver Treino Completo
              </button>
            </div>
          ) : (
            <div className="text-center py-10 text-white/30">
              <p>Nenhum treino cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
