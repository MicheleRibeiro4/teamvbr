

import React, { useState, useEffect } from 'react';
import { ProtocolData } from '../types';
// Fix: Correct typo in logo constant name
import { EMPTY_DATA, LOGO_VBR_BLACK } from '../constants';
import { db } from '../services/db';
import UnifiedEditor from './UnifiedEditor';
import EvolutionTracker from './EvolutionTracker';
import MainDashboard from './MainDashboard';
import StudentSearch from './StudentSearch';
import StudentDashboard from './StudentDashboard';
import { 
  Plus, 
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Printer,
  ChevronLeft
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'manage' | 'evolution' | 'settings' | 'student-dashboard';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);

  // Load saved data from backend
  const loadData = async () => {
    setIsSyncing(true);
    try {
      const protocols = await db.getAll();
      setSavedProtocols(protocols);
      setCloudStatus('online');
    } catch (e: any) {
      setCloudStatus('error');
      console.error("Erro na carga inicial:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes to Supabase
  const handleSave = async (silent = false) => {
    if (!data.clientName) {
      if (!silent) alert("⚠️ Defina o nome do aluno antes de salvar.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
      const updatedProtocol = { ...data, id: currentId, updatedAt: new Date().toISOString() };
      
      await db.saveProtocol(updatedProtocol);
      
      setSavedProtocols(prev => {
        const index = prev.findIndex(p => p.id === currentId);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = updatedProtocol;
          return newList;
        }
        return [updatedProtocol, ...prev];
      });
      
      setData(updatedProtocol);
      setCloudStatus('online');
      if (!silent) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setCloudStatus('error');
      if (!silent) alert(`⚠️ ERRO NO SUPABASE: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new blank record
  const handleNew = () => {
    const newId = "vbr-" + Math.random().toString(36).substr(2, 9);
    setData({ ...EMPTY_DATA, id: newId, updatedAt: new Date().toISOString() });
    setActiveView('manage');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'student-dashboard') => {
    setData(student);
    setActiveView(view);
  };

  const deleteStudent = async (id: string) => {
    if(confirm('Excluir este aluno permanentemente do Banco de Dados?')) {
      try {
        await db.deleteProtocol(id);
        setSavedProtocols(prev => prev.filter(p => p.id !== id));
        if (activeView !== 'home') setActiveView('home');
      } catch (err) {
        alert('Erro ao excluir do banco.');
      }
    }
  };

  const sqlRepairScript = `-- SCRIPT DE REPARO DEFINITIVO VBR
DROP TABLE IF EXISTS public.protocols CASCADE;
CREATE TABLE public.protocols (
  id text NOT NULL PRIMARY KEY,
  client_name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  data jsonb NOT NULL
);
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.protocols TO anon;
GRANT ALL ON TABLE public.protocols TO authenticated;
GRANT ALL ON TABLE public.protocols TO service_role;`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              <CheckCircle2 size={20} /> Sincronizado
           </div>
        </div>
      )}

      <header className="h-24 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveView('home')} className="hover:scale-105 transition-transform">
            {/* Fix: Correct typo in logo constant name */}
            <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="h-20 w-auto" />
          </button>
          
          {activeView !== 'home' && (
            <button 
              onClick={() => setActiveView(data.id && activeView !== 'student-dashboard' ? 'student-dashboard' : 'home')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
            >
              <ChevronLeft size={16} /> Voltar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {data.id && activeView !== 'home' && activeView !== 'search' && (
            <button 
              onClick={() => handleSave()} 
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
              Salvar Alterações
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        
        {cloudStatus === 'error' && (
          <div className="bg-red-600/10 border border-red-600/30 p-8 rounded-[2.5rem] mb-10">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4 text-left">
                <AlertTriangle className="text-red-500 shrink-0" size={40} />
                <div>
                  <h4 className="font-black uppercase text-sm text-red-500">Erro de Banco de Dados</h4>
                  <p className="text-xs text-white/60">Rode o SQL de reparo no seu Supabase.</p>
                </div>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(sqlRepairScript); alert('Copiado!'); }}
                className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase border border-white/10"
              >
                Copiar SQL
              </button>
            </div>
          </div>
        )}

        {activeView === 'home' && (
          <MainDashboard protocols={savedProtocols} onNew={handleNew} onList={() => setActiveView('search')} onLoadStudent={(p) => loadStudent(p, 'student-dashboard')} />
        )}

        {activeView === 'search' && (
          <StudentSearch protocols={savedProtocols} onLoad={(p) => loadStudent(p, 'student-dashboard')} onDelete={deleteStudent} />
        )}

        {activeView === 'student-dashboard' && (
          <StudentDashboard data={data} setView={(v) => setActiveView(v as ViewMode)} />
        )}

        {activeView === 'manage' && (
          <UnifiedEditor 
            data={data} 
            onChange={setData} 
            onBack={() => setActiveView('student-dashboard')} 
          />
        )}
        
        {activeView === 'evolution' && (
          <div className="space-y-10">
            <button 
              onClick={() => setActiveView('student-dashboard')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors no-print"
            >
              <ChevronLeft size={16} /> Voltar ao Painel
            </button>
            <EvolutionTracker 
              currentProtocol={data} 
              history={savedProtocols.filter(p => p.clientName === data.clientName)} 
              onNotesChange={(n) => setData({...data, privateNotes: n})} 
              onUpdateData={(newData) => {
                setData(newData);
                // Salvar silenciosamente após atualização rápida
                setTimeout(() => handleSave(true), 100);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
