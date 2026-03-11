import React, { useState } from 'react';
import { Feedback } from '../../types';
import { db } from '../../services/db';
import { 
  MessageSquare, 
  Plus, 
  Save, 
  Loader2, 
  Trash2, 
  Calendar,
  ChevronLeft,
  Smile,
  Frown,
  Meh,
  Zap,
  Moon
} from 'lucide-react';
import { getLocalDateString } from '../../constants';

interface Props {
  studentId: string;
  feedbacks: Feedback[];
  onRefresh: () => void;
}

const FeedbackManager: React.FC<Props> = ({ studentId, feedbacks, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeedback, setNewFeedback] = useState<Partial<Feedback>>({
    date: getLocalDateString(),
    dietAdherence: 'Boa',
    trainingAdherence: 'Boa',
    sleepQuality: 'Boa',
    energyLevel: 'Alto',
    notes: '',
    difficulties: '',
    strategies: ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.saveFeedback({
        ...newFeedback,
        studentId,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewFeedback({
        date: getLocalDateString(),
        dietAdherence: 'Boa',
        trainingAdherence: 'Boa',
        sleepQuality: 'Boa',
        energyLevel: 'Alto',
        notes: '',
        difficulties: '',
        strategies: ''
      });
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este feedback?')) {
      try {
        await db.deleteFeedback(id);
        onRefresh();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sortedFeedbacks = [...feedbacks].sort((a, b) => 
    new Date(b.date || b.createdAt!).getTime() - new Date(a.date || a.createdAt!).getTime()
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <MessageSquare className="text-[#d4af37]" size={24} /> 
          Feedbacks & Evolução
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#d4af37] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          {isAdding ? <ChevronLeft size={14} /> : <Plus size={14} />}
          {isAdding ? 'Voltar' : 'Novo Feedback'}
        </button>
      </div>

      {isAdding ? (
        <div className="bg-[#111] border border-[#d4af37]/30 rounded-[2rem] p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Data do Feedback</label>
              <input 
                type="date" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newFeedback.date}
                onChange={e => setNewFeedback({...newFeedback, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Adesão Dieta</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                  value={newFeedback.dietAdherence}
                  onChange={e => setNewFeedback({...newFeedback, dietAdherence: e.target.value as any})}
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Adesão Treino</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                  value={newFeedback.trainingAdherence}
                  onChange={e => setNewFeedback({...newFeedback, trainingAdherence: e.target.value as any})}
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Observações do Profissional</label>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[120px]"
                value={newFeedback.notes}
                onChange={e => setNewFeedback({...newFeedback, notes: e.target.value})}
                placeholder="Escreva aqui o feedback sobre a evolução do aluno..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Dificuldades Relatadas</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[80px]"
                  value={newFeedback.difficulties}
                  onChange={e => setNewFeedback({...newFeedback, difficulties: e.target.value})}
                  placeholder="Quais foram as principais dificuldades?"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Estratégias Propostas</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[80px]"
                  value={newFeedback.strategies}
                  onChange={e => setNewFeedback({...newFeedback, strategies: e.target.value})}
                  placeholder="Quais ajustes serão feitos?"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#d4af37] text-black px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Feedback
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFeedbacks.map((f, index) => (
            <div key={f.id} className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-2xl">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter">Feedback de Evolução</h3>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(f.date || f.createdAt!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Dieta</p>
                      <p className={`text-[10px] font-black uppercase ${f.dietAdherence === 'Boa' ? 'text-green-400' : f.dietAdherence === 'Média' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {f.dietAdherence}
                      </p>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Treino</p>
                      <p className={`text-[10px] font-black uppercase ${f.trainingAdherence === 'Boa' ? 'text-green-400' : f.trainingAdherence === 'Média' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {f.trainingAdherence}
                      </p>
                    </div>
                    {f.sleepQuality && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Sono</p>
                        <p className="text-[10px] font-black text-white uppercase">{f.sleepQuality}</p>
                      </div>
                    )}
                    {f.energyLevel && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Energia</p>
                        <p className="text-[10px] font-black text-white uppercase">{f.energyLevel}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {f.notes}
                      </p>
                    </div>

                    {(f.difficulties || f.strategies) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {f.difficulties && (
                          <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">Dificuldades</p>
                            <p className="text-xs text-red-200/60 leading-relaxed">{f.difficulties}</p>
                          </div>
                        )}
                        {f.strategies && (
                          <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                            <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">Estratégias</p>
                            <p className="text-xs text-green-200/60 leading-relaxed">{f.strategies}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(f.id!)}
                  className="text-white/10 hover:text-red-500 transition-colors p-2 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {sortedFeedbacks.length === 0 && (
            <div className="text-center py-20 bg-[#111] border border-dashed border-white/10 rounded-[2rem]">
              <MessageSquare size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 text-xs font-black uppercase tracking-widest">Nenhum feedback registrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
