import React, { useState } from 'react';
import { BodyMeasurementEntry } from '../../types';
import { db } from '../../services/db';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Plus, 
  Save, 
  X, 
  Loader2, 
  Ruler, 
  TrendingUp 
} from 'lucide-react';
import { MEASUREMENT_LABELS } from '../../constants';

interface Props {
  measurements: BodyMeasurementEntry[];
  onUpdate: () => void;
  studentId: string;
}

const EvolutionCharts: React.FC<Props> = ({ measurements, onUpdate, studentId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<BodyMeasurementEntry>>({
    date: new Date().toISOString().split('T')[0],
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
    if (!newEntry.weight) {
      alert("Peso é obrigatório.");
      return;
    }

    setIsSaving(true);
    try {
      // Converte strings vazias para null ou número
      const cleanEntry = {
        ...newEntry,
        weight: newEntry.weight ? parseFloat(newEntry.weight) : null,
        chest: newEntry.chest ? parseFloat(newEntry.chest) : null,
        waist: newEntry.waist ? parseFloat(newEntry.waist) : null,
        abdomen: newEntry.abdomen ? parseFloat(newEntry.abdomen) : null,
        hip: newEntry.hip ? parseFloat(newEntry.hip) : null,
        armRight: newEntry.armRight ? parseFloat(newEntry.armRight) : null,
        armLeft: newEntry.armLeft ? parseFloat(newEntry.armLeft) : null,
        thighRight: newEntry.thighRight ? parseFloat(newEntry.thighRight) : null,
        thighLeft: newEntry.thighLeft ? parseFloat(newEntry.thighLeft) : null,
        calf: newEntry.calf ? parseFloat(newEntry.calf) : null,
        bodyFat: newEntry.bodyFat ? parseFloat(newEntry.bodyFat) : null,
      };

      await db.saveMeasurement({
        ...cleanEntry,
        studentId,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
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
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar medidas.");
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = measurements.map(m => ({
    ...m,
    dateFormatted: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weightNum: parseFloat(m.weight || '0'),
    bodyFatNum: parseFloat(m.bodyFat || '0'),
    waistNum: parseFloat(m.waist || '0'),
    abdomenNum: parseFloat(m.abdomen || '0')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#d4af37]/30 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-black text-[#d4af37] mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-bold text-white">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <Activity className="text-[#d4af37]" size={24} /> 
          Evolução Física
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-[#d4af37] text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> Nova Medição
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl p-6 animate-in slide-in-from-top-4 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">Registrar Medidas</h3>
            <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Data</label>
              <input 
                type="date" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.date}
                onChange={e => setNewEntry({...newEntry, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Peso (kg)</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.weight}
                onChange={e => setNewEntry({...newEntry, weight: e.target.value})}
                placeholder="00.0"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">Gordura (%)</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                value={newEntry.bodyFat}
                onChange={e => setNewEntry({...newEntry, bodyFat: e.target.value})}
                placeholder="00.0"
              />
            </div>
          </div>

          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Circunferências (cm)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">{label}</label>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-[#d4af37] outline-none"
                  value={(newEntry as any)[key] || ''}
                  onChange={e => setNewEntry({...newEntry, [key]: e.target.value})}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-[#d4af37] text-black hover:scale-105 shadow-lg font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Medidas
            </button>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-lg min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><TrendingUp size={20} /></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Evolução de Peso</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="dateFormatted" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="weightNum" name="Peso (kg)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Fat Chart */}
        <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-lg min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#d4af37]/10 p-2 rounded-lg text-[#d4af37]"><Activity size={20} /></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Percentual de Gordura</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="dateFormatted" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="bodyFatNum" name="Gordura (%)" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#d4af37', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Measurements Chart */}
        <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-lg lg:col-span-2 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500"><Ruler size={20} /></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Medidas Principais (Cintura e Abdômen)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="dateFormatted" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="waistNum" name="Cintura (cm)" stroke="#a855f7" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="abdomenNum" name="Abdômen (cm)" stroke="#ec4899" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionCharts;
