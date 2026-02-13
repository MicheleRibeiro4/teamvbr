
import React, { useState, useEffect } from 'react';
import { ProtocolData } from './types';
import { EMPTY_DATA, LOGO_RHINO_BLACK } from './constants';
import { db } from './services/db';
import ProtocolForm from './components/ProtocolForm';
import ProtocolPreview from './components/ProtocolPreview';
import ContractWorkspace from './components/ContractWorkspace';
import EvolutionTracker from './components/EvolutionTracker';
import MainDashboard from './components/MainDashboard';
import StudentSearch from './components/StudentSearch';
import { 
  Plus, 
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code,
  Database
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'protocol' | 'contract' | 'evolution' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);

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

  const handleSave = async () => {
    if (!data.clientName) {
      alert("⚠️ Defina o nome do aluno antes de salvar.");
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
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      console.error(err);
      setCloudStatus('error');
      alert(`⚠️ ERRO NO SUPABASE: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNew = () => {
    const newId = "vbr-" + Math.random().toString(36).substr(2, 9);
    setData({ ...EMPTY_DATA, id: newId, updatedAt: new Date().toISOString() });
    setActiveView('protocol');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'protocol') => {
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

  const sqlRepairScript = `-- SCRIPT DE REPARO VBR (RESOLVE ERRO DE COLUNA E CACHE)
-- 1. Remove TODAS as tabelas do esquema antigo que causam conflito
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.supplements CASCADE;
DROP TABLE IF EXISTS public.training_days CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.consultants CASCADE;
DROP TABLE IF EXISTS public.protocols CASCADE;

-- 2. Cria a tabela única otimizada com a coluna 'client_name'
CREATE TABLE public.protocols (
  id text NOT NULL PRIMARY KEY,
  client_name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  data jsonb NOT NULL
);

-- 3. Libera permissões públicas
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.protocols TO anon;
GRANT ALL ON TABLE public.protocols TO authenticated;
GRANT ALL ON TABLE public.protocols TO service_role;

-- 4. Força a atualização do cache do Supabase
NOTIFY pgrst, 'reload schema';`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              <CheckCircle2 size={20} /> Sincronizado com Sucesso
           </div>
        </div>
      )}

      <header className="h-24 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveView('home')} className="hover:scale-105 transition-transform">
            <img src={LOGO_RHINO_BLACK} alt="VBR Logo" className="h-20 w-auto" />
          </button>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${
              isSyncing ? 'bg-yellow-500 animate-pulse' : 
              cloudStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {isSyncing ? 'Sincronizando...' : cloudStatus === 'online' ? 'Supabase Conectado' : 'Erro de Estrutura'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setActiveView('search')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Lista de Alunos">
            <FolderOpen size={20} />
          </button>
          <button onClick={handleNew} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
            <Plus size={16} /> <span className="hidden md:inline">Novo Aluno</span>
          </button>
          {activeView !== 'home' && activeView !== 'search' && (
            <button 
              onClick={handleSave} 
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
              Salvar Nuvem
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        
        {cloudStatus === 'error' && (
          <div className="bg-red-600/10 border border-red-600/30 p-8 rounded-[2.5rem] mb-10 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4 text-left">
                <AlertTriangle className="text-red-500 shrink-0" size={40} />
                <div>
                  <h4 className="font-black uppercase text-sm text-red-500">Mapeamento de Banco de Dados Incorreto</h4>
                  <p className="text-xs text-white/60 max-w-xl">
                    Seu Supabase está com tabelas que não possuem a coluna 'client_name'. 
                    Clique no botão ao lado, cole o script no SQL Editor do Supabase e rode para consertar.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(sqlRepairScript); 
                  alert('Script SQL de Reparo Copiado!\n\nNo Supabase:\n1. SQL Editor -> New Query\n2. Cole o script e clique em RUN\n3. Recarregue esta página.'); 
                }}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-white/10 group"
              >
                <Code size={18} className="text-[#d4af37] group-hover:scale-110 transition-transform" /> 
                Copiar SQL de Reparo
              </button>
            </div>
          </div>
        )}

        {activeView === 'home' && (
          <MainDashboard protocols={savedProtocols} onNew={handleNew} onList={() => setActiveView('search')} onLoadStudent={loadStudent} />
        )}

        {activeView === 'search' && (
          <StudentSearch protocols={savedProtocols} onLoad={loadStudent} onDelete={deleteStudent} />
        )}

        {activeView === 'protocol' && (
          <div className="flex flex-col gap-16">
            <div className="max-w-4xl mx-auto w-full no-print">
               <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-xl">
                  <ProtocolForm data={data} onChange={setData} />
               </div>
            </div>
            <div className="w-full flex justify-center bg-[#111] p-4 md:p-16 rounded-[4rem] border border-white/5 shadow-inner overflow-hidden min-h-[1200px]">
               <ProtocolPreview data={data} />
            </div>
          </div>
        )}

        {activeView === 'contract' && <div className="no-print"><ContractWorkspace data={data} onChange={setData} /></div>}
        
        {activeView === 'evolution' && (
          <EvolutionTracker 
            currentProtocol={data} 
            history={savedProtocols.filter(p => p.clientName === data.clientName)} 
            onNotesChange={(n) => setData({...data, privateNotes: n})} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
