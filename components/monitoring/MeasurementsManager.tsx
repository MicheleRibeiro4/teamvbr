import React, { useState } from 'react';
import { BodyMeasurementEntry } from '../../types';
import { db } from '../../services/db';
import { 
  Ruler, 
  Plus, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trash2,
  Calendar,
  Save,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { MEASUREMENT_LABELS, getLocalDateString } from '../../constants';

interface Props {
  studentId: string;
  measurements: BodyMeasurementEntry[];
  onRefresh: () => void;
}

const MeasurementsManager: React.FC<Props> = ({ studentId, measurements, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<BodyMeasurementEntry>>({
    date: getLocalDateString(),
    weight: '',
    chest: '',
    waist: '',
    abdomen: '',
    hip: '',
    armRight: '',
    armLeft: '',
    thighRight: '',
    thighLeft: '',
    calf: '',
    bodyFat: ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanEntry = {
        ...newEntry,
        studentId,
        weight: newEntry.weight ? parseFloat(newEntry.weight as any) : null,
        chest: newEntry.chest ? parseFloat(newEntry.chest as any) : null,
        waist: newEntry.waist ? parseFloat(newEntry.waist as any) : null,
        abdomen: newEntry.abdomen ? parseFloat(newEntry.abdomen as any) : null,
        hip: newEntry.hip ? parseFloat(newEntry.hip as any) : null,
        armRight: newEntry.armRight ? parseFloat(newEntry.armRight as any) : null,
        armLeft: newEntry.armLeft ? parseFloat(newEntry.armLeft as any) : null,
        thighRight: newEntry.thighRight ? parseFloat(newEntry.thighRight as any) : null,
        thighLeft: newEntry.thighLeft ? parseFloat(newEntry.thighLeft as any) : null,
        calf: newEntry.calf ? parseFloat(newEntry.calf as any) : null,
        bodyFat: newEntry.bodyFat ? parseFloat(newEntry.bodyFat as any) : null,
        date: newEntry.date || new Date().toISOString()
      };
      
      await db.saveMeasurement(cleanEntry);
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar medidas.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este registro de medidas?')) {
      try {
        await db.deleteMeasurement(id);
        onRefresh();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sortedMeasurements = [...measurements].sort((a, b) => 
    new Date(b.date || b.createdAt!).getTime() - new Date(a.date || a.createdAt!).getTime()
  );

  const latest = sortedMeasurements[0];
  const previous = sortedMeasurements[1];

  const getDiff = (current: any, prev: any, field: string) => {
    if (!current || !prev || !current[field] || !prev[field]) return null;
    const diff = parseFloat(current[field]) - parseFloat(prev[field]);
    return diff;
  };

  const renderDiff = (diff: number | null) => {
    if (diff === null || diff === 0) return <Minus size={12} className="text-white/20" />;
    const isPositive = diff > 0;
    return (
      <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(diff).toFixed(1)}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <Ruler className="text-[#d4af37]" size={24} /> 
          Medidas Corporais
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#d4af37] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          {isAdding ? <ChevronLeft size={14} /> : <Plus size={14} />}
          {isAdding ? 'Voltar' : 'Nova Medida'}
        </button>
      </div>

      {isAdding ? (
        <div className="bg-[#111] border border-[#d4af37]/30 rounded-[2rem] p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Data do Registro</label>
              <input 
                type="date" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.date}
                onChange={e => setNewEntry({...newEntry, date: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Peso (kg)</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.weight}
                onChange={e => setNewEntry({...newEntry, weight: e.target.value})}
                placeholder="00.0"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Gordura (%)</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.bodyFat}
                onChange={e => setNewEntry({...newEntry, bodyFat: e.target.value})}
                placeholder="00.0"
              />
            </div>

            {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">{label} (cm)</label>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#d4af37] outline-none"
                  value={(newEntry as any)[key] || ''}
                  onChange={e => setNewEntry({...newEntry, [key]: e.target.value})}
                  placeholder="00.0"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#d4af37] text-black px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Medidas
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Comparação Rápida */}
          {latest && previous && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Peso', field: 'weight', unit: 'kg' },
                { label: 'Gordura', field: 'bodyFat', unit: '%' },
                { label: 'Cintura', field: 'waist', unit: 'cm' },
                { label: 'Abdômen', field: 'abdomen', unit: 'cm' },
                { label: 'Braço D', field: 'armRight', unit: 'cm' },
                { label: 'Coxa D', field: 'thighRight', unit: 'cm' },
              ].map((item) => {
                const diff = getDiff(latest, previous, item.field);
                return (
                  <div key={item.field} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-lg font-black text-white tracking-tighter">
                      {(latest as any)[item.field] || '0'}<span className="text-[10px] text-white/40 ml-0.5">{item.unit}</span>
                    </p>
                    {renderDiff(diff)}
                  </div>
                );
              })}
            </div>
          )}

          {/* Histórico de Medidas */}
          <div className="bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10">
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Peso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">BF%</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Cintura</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Abdômen</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Braço D</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Coxa D</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedMeasurements.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#d4af37]" />
                          <span className="text-xs font-bold text-white">
                            {new Date(m.date || m.createdAt!).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-white">{m.weight}kg</td>
                      <td className="px-6 py-4 text-xs font-black text-white">{m.bodyFat}%</td>
                      <td className="px-6 py-4 text-xs font-medium text-white/60">{m.waist}cm</td>
                      <td className="px-6 py-4 text-xs font-medium text-white/60">{m.abdomen}cm</td>
                      <td className="px-6 py-4 text-xs font-medium text-white/60">{m.armRight}cm</td>
                      <td className="px-6 py-4 text-xs font-medium text-white/60">{m.thighRight}cm</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(m.id!)}
                          className="text-white/20 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sortedMeasurements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-white/20 text-[10px] font-black uppercase tracking-widest">
                        Nenhuma medida registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementsManager;
