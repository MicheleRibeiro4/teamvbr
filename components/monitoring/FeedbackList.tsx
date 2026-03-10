import React, { useState } from 'react';
import { Feedback } from '../../types';
import { db } from '../../services/db';
import { getSafeDateObject, getLocalDateString } from '../../constants';
import { 
  MessageSquare, 
  Plus, 
  Save, 
  X, 
  Loader2, 
  Calendar, 
  Activity, 
  Moon, 
  Zap,
  Utensils,
  Dumbbell
} from 'lucide-react';

interface Props {
  feedbacks: Feedback[];
  onUpdate: () => void;
  studentId: string;
}

const FeedbackList: React.FC<Props> = ({ feedbacks, onUpdate, studentId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeedback, setNewFeedback] = useState<Partial<Feedback>>({
    date: getLocalDateString(),
    dietAdherence: 'Boa',
    trainingAdherence: 'Boa',
    sleepQuality: '',
    energyLevel: '',
    notes: '',
    weight: ''
  });

  const handleSave = async () => {
    if (!newFeedback.weight || !newFeedback.notes) {
      alert("Preencha peso e observações.");
      return;
    }

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
        sleepQuality: '',
        energyLevel: '',
        notes: '',
        weight: ''
      });
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <MessageSquare className="text-[#d4af37]" size={24} /> 
          Feedbacks & Acompanhamento
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> Novo Feedback
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl p-6 animate-in slide-in-from-top-4 shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">Novo Registro</h3>
            <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Data</label>
              <input 
                type="date" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newFeedback.date}
                onChange={e => setNewFeedback({...newFeedback, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Peso Atual (kg)</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newFeedback.weight}
                onChange={e => setNewFeedback({...newFeedback, weight: e.target.value})}
                placeholder="00.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 flex items-center gap-1"><Utensils size={12}/> Adesão Dieta</label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                value={newFeedback.dietAdherence}
                onChange={e => setNewFeedback({...newFeedback, dietAdherence: e.target.value as any})}
              >
                <option value="Boa">Boa</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 flex items-center gap-1"><Dumbbell size={12}/> Adesão Treino</label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none appearance-none"
                value={newFeedback.trainingAdherence}
                onChange={e => setNewFeedback({...newFeedback, trainingAdherence: e.target.value as any})}
              >
                <option value="Boa">Boa</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 flex items-center gap-1"><Moon size={12}/> Qualidade Sono</label>
              <input 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newFeedback.sleepQuality}
                onChange={e => setNewFeedback({...newFeedback, sleepQuality: e.target.value})}
                placeholder="Ex: 7h, Acordou cansado..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 flex items-center gap-1"><Zap size={12}/> Nível Energia</label>
              <input 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newFeedback.energyLevel}
                onChange={e => setNewFeedback({...newFeedback, energyLevel: e.target.value})}
                placeholder="Ex: Alto, Baixo a tarde..."
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Observações Gerais & Estratégias</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-[#d4af37] outline-none min-h-[100px]"
              value={newFeedback.notes}
              onChange={e => setNewFeedback({...newFeedback, notes: e.target.value})}
              placeholder="Descreva o feedback do aluno, dificuldades relatadas e estratégias adotadas..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-[#d4af37] text-black hover:scale-105 shadow-lg font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Feedback
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#d4af37]/10 text-[#d4af37] p-2 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">{getSafeDateObject(feedback.date).toLocaleDateString('pt-BR')}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">Peso: {feedback.weight}kg</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${feedback.dietAdherence === 'Boa' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>Dieta: {feedback.dietAdherence}</span>
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${feedback.trainingAdherence === 'Boa' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>Treino: {feedback.trainingAdherence}</span>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{feedback.notes}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] text-white/40 font-bold uppercase">
              <div className="flex items-center gap-2"><Moon size={12} /> Sono: <span className="text-white">{feedback.sleepQuality || '-'}</span></div>
              <div className="flex items-center gap-2"><Zap size={12} /> Energia: <span className="text-white">{feedback.energyLevel || '-'}</span></div>
            </div>
          </div>
        ))}

        {feedbacks.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-[#111] rounded-2xl border border-white/5 border-dashed">
            <MessageSquare size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Nenhum feedback registrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
