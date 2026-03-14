import React, { useState } from 'react';
import { ProtocolData } from '../../../types';
import { CheckCircle2, Circle, Clock, Repeat, Dumbbell } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const StudentWorkout: React.FC<Props> = ({ data }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [checkedExercises, setCheckedExercises] = useState<Set<number>>(new Set());
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!data.trainingDays || data.trainingDays.length === 0) {
    return (
      <div className="text-center py-20">
        <Dumbbell size={48} className="mx-auto text-white/20 mb-4" />
        <h2 className="text-xl font-bold text-white/40">Nenhum treino cadastrado.</h2>
      </div>
    );
  }

  const currentWorkout = data.trainingDays[activeDay];

  const toggleExercise = (idx: number) => {
    const newChecked = new Set(checkedExercises);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
    } else {
      newChecked.add(idx);
    }
    setCheckedExercises(newChecked);
  };

  const handleConfirmWorkout = () => {
    if (checkedExercises.size === 0) {
      alert("Marque pelo menos um exercício concluído!");
      return;
    }
    setIsConfirmed(true);
    // Reset after some time or keep it confirmed for the session
    setTimeout(() => setIsConfirmed(false), 5000);
    setCheckedExercises(new Set());
  };

  return (
    <div className="space-y-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Meu Treino
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Foco: <span className="text-[#d4af37] font-bold uppercase">{currentWorkout.focus}</span>
          </p>
        </div>
        {isConfirmed && (
          <div className="bg-green-500 text-black px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest animate-bounce">
            Treino Concluído! 🔥
          </div>
        )}
      </header>

      {data.trainingReasoning && (
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-6 rounded-2xl mb-8">
          <h3 className="text-[#d4af37] font-black uppercase text-xs tracking-widest mb-2">Linha de Raciocínio Adotada</h3>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{data.trainingReasoning}</p>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {data.trainingDays.map((day, index) => (
          <button
            key={index}
            onClick={() => setActiveDay(index)}
            className={`
              flex-shrink-0 px-6 py-4 rounded-2xl border transition-all duration-300 min-w-[140px] text-left group
              ${activeDay === index 
                ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                : 'bg-[#111] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}
            `}
          >
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Treino {String.fromCharCode(65 + index)}</p>
            <h3 className="font-bold text-sm uppercase truncate">{day.title}</h3>
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-4 relative z-10">
          {currentWorkout.exercises.map((exercise, idx) => {
            const isChecked = checkedExercises.has(idx);
            return (
              <div 
                key={idx}
                onClick={() => toggleExercise(idx)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isChecked 
                    ? 'bg-[#d4af37]/10 border-[#d4af37]/50' 
                    : 'bg-black/40 border-white/5 hover:border-[#d4af37]/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isChecked ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-white/20'
                  }`}>
                    {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>

                  <div className="flex-1">
                    <h4 className={`text-base font-bold uppercase mb-2 transition-all ${
                      isChecked ? 'text-[#d4af37]' : 'text-white'
                    }`}>
                      {exercise.name}
                    </h4>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-white/50 bg-white/5 px-2 py-1 rounded-md">
                        <Repeat size={12} />
                        <span className="font-medium">{exercise.sets}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/50 bg-white/5 px-2 py-1 rounded-md">
                        <Clock size={12} />
                        <span className="font-medium">Descanso: 60s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 relative z-10">
          <button
            onClick={handleConfirmWorkout}
            disabled={checkedExercises.size === 0}
            className={`
              w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
              ${checkedExercises.size > 0 
                ? 'bg-[#d4af37] text-black hover:scale-[1.02] active:scale-95' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'}
            `}
          >
            <CheckCircle2 size={20} />
            Confirmar Treino Feito
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentWorkout;
