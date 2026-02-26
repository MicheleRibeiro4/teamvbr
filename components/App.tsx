
import React, { useState, useEffect } from 'react';
import { ProtocolData } from './types';
import { EMPTY_DATA, LOGO_VBR_BLACK } from './constants';
import { db } from './services/db';
import UnifiedEditor from './components/UnifiedEditor';
import MainDashboard from './components/MainDashboard';
import StudentSearch from './components/StudentSearch';
import StudentDashboard from './components/StudentDashboard';
import EvolutionTracker from './components/EvolutionTracker';
import StudentEntryForm from './components/StudentEntryForm';
import { 
  RefreshCw,
  CheckCircle2,
  Database,
  ChevronLeft,
  Lock,
  AlertTriangle,
  Loader2,
  UserPlus
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'manage' | 'settings' | 'student-dashboard' | 'evolution';

const App: React.FC = () => {
  // --- ROTEAMENTO ESTRITO (SPA) ---
  const checkIsStudent = () => {
    if (typeof window !== 'undefined') {
       const h = window.location.hash;
       return h.includes('student') || h.includes('cadastro');
    }
    return false;
  };

  const [isStudentPage, setIsStudentPage] = useState(checkIsStudent);
  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const MASTER_PASSWORD = "vbr-master-2025";

  useEffect(() => {
    const handleHashChange = () => {
      setIsStudentPage(checkIsStudent());
    };
    window.addEventListener('hashchange', handleHashChange);
    // Verifica inicial
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
      localStorage.setItem('vbr_auth', 'true');
      loadData();
    } else {
      setLoginError(true);
    }
  };

  useEffect(() => {
    if (isStudentPage) return;
    const auth = localStorage.getItem('vbr_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, [isStudentPage]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const protocols = await db.getAll();
      
      // --- MIGRATION: Update Vitor's date one-time ---
      const vitor = protocols.find(p => p.clientName.toLowerCase().includes('vitor'));
      if (vitor) {
          // Force update if date is not 2026-02-20 OR if we want to ensure it's fresh
          if (vitor.lastSentDate !== '2026-02-20') {
              console.log("Applying fix for Vitor...");
              const updatedVitor = { 
                  ...vitor, 
                  lastSentDate: '2026-02-20',
                  updatedAt: new Date().toISOString()
              };
              await db.saveProtocol(updatedVitor);
              const idx = protocols.findIndex(p => p.id === vitor.id);
              if (idx >= 0) protocols[idx] = updatedVitor;
          }
      }
      // -----------------------------------------------

      setSavedProtocols(protocols);
      setCloudStatus('online');
    } catch (e: any) {
      setCloudStatus('error');
      console.error("Erro na carga inicial:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (silent = false, specificData?: ProtocolData, forceNewId = false) => {
    const dataToSave = specificData || data;
    if (!dataToSave.clientName) {
      if (!silent) alert("⚠️ Defina o nome do aluno antes de salvar.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const currentId = (forceNewId) 
        ? "vbr-" + Math.random().toString(36).substr(2, 9)
        : (dataToSave.id || "vbr-" + Math.random().toString(36).substr(2, 9));
      
      const protocolToSave = { 
        ...JSON.parse(JSON.stringify(dataToSave)), 
        id: currentId, 
        updatedAt: new Date().toISOString()
      };
      
      await db.saveProtocol(protocolToSave);
      
      setSavedProtocols(prev => {
        if (forceNewId) {
             return [protocolToSave, ...prev];
        } else {
             const index = prev.findIndex(p => p.id === currentId);
             if (index >= 0) {
               const newList = [...prev];
               newList[index] = protocolToSave;
               return newList;
             }
             return [protocolToSave, ...prev];
        }
      });
      
      if (!specificData || specificData.id === data.id || forceNewId) {
        setData(protocolToSave);
      }
      
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

  const handleNew = () => {
    const newId = "vbr-" + Math.random().toString(36).substr(2, 9);
    setData({ ...EMPTY_DATA, id: newId, updatedAt: new Date().toISOString() });
    setActiveView('manage');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'manage') => {
    setData(student);
    setActiveView(view);
  };

  const deleteStudent = async (id: string) => {
    if(confirm('Excluir este aluno permanentemente?')) {
      try {
        await db.deleteProtocol(id);
        setSavedProtocols(prev => prev.filter(p => p.id !== id));
        if (activeView !== 'home') setActiveView('home');
      } catch (err) {
        alert('Erro ao excluir.');
      }
    }
  };

  const sqlRepairScript = `-- SCRIPT DE REPARO
CREATE TABLE IF NOT EXISTS public.protocols (
  id text NOT NULL PRIMARY KEY,
  client_name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  data jsonb NOT NULL
);
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.protocols TO anon;
GRANT ALL ON TABLE public.protocols TO authenticated;
GRANT ALL ON TABLE public.protocols TO service_role;`;

  // --- MODO ALUNO ---
  if (isStudentPage) {
     return <StudentEntryForm onCancel={() => {
        window.location.hash = ''; 
     }} />;
  }

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 my-10">
          <img src={LOGO_VBR_BLACK} alt="Team VBR Logo" className="h-28 w-auto mx-auto mb-8" />
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            {/* Login Form */}
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center text-black mx-auto mb-6"><Lock size={20} /></div>
              <h1 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Acesso Consultor</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-[#d4af37] transition-colors" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Senha Mestra" />
                {loginError && <p className="text-xs text-red-500 font-black uppercase">Senha incorreta.</p>}
                <button type="submit" className="w-full bg-[#d4af37] text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all">Entrar</button>
              </form>
            </div>
            
            {/* 
              REMOVIDO BOTÃO DE ALUNO DAQUI 
              O aluno deve usar o link direto com hash #student ou #cadastro
            */}
          </div>

          <p className="mt-8 text-white/20 text-[10px] uppercase font-bold tracking-widest">Team VBR System © 2026</p>
        </div>
      </div>
    );
  }

  // --- SISTEMA CONSULTOR ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              <CheckCircle2 size={20} /> Salvo
           </div>
        </div>
      )}

      {isSyncing && !showToast && (
         <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in duration-300">
             <div className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-3 border border-white/10">
                <Loader2 size={16} className="animate-spin text-[#d4af37]" /> Salvando...
             </div>
         </div>
      )}

      <header className="h-24 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveView('home')} className="hover:scale-105 transition-transform">
            <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-20 w-auto" />
          </button>
          
          {activeView !== 'home' && (
            <button 
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
            >
              <ChevronLeft size={16} /> Voltar ao Início
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { localStorage.removeItem('vbr_auth'); setIsAuthenticated(false); }} className="text-[9px] font-black uppercase text-white/20 hover:text-red-500">Sair</button>
          {data.id && activeView !== 'home' && activeView !== 'search' && (
            <button 
              onClick={() => handleSave()} 
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
              Salvar
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
                  <p className="text-xs text-white/60">Permissões ou tabela faltando. Copie o SQL.</p>
                </div>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(sqlRepairScript); alert('SQL Copiado!'); }}
                className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase border border-white/10 hover:bg-white/5 transition-colors"
              >
                Copiar SQL
              </button>
            </div>
          </div>
        )}

        {activeView === 'home' && (
          <MainDashboard 
            protocols={savedProtocols} 
            onNew={handleNew} 
            onList={() => setActiveView('search')} 
            onLoadStudent={(p) => loadStudent(p, 'manage')} 
            onUpdateStudent={(p) => handleSave(true, p)}
            onDeleteStudent={deleteStudent}
          />
        )}

        {activeView === 'search' && (
          <StudentSearch protocols={savedProtocols} onLoad={(p) => loadStudent(p, 'manage')} onDelete={deleteStudent} />
        )}

        {/* StudentDashboard removed */}

        {activeView === 'manage' && (
          <UnifiedEditor 
            data={data} 
            onChange={setData} 
            onBack={() => setActiveView('home')} 
          />
        )}

        {activeView === 'evolution' && (
          <EvolutionTracker 
              currentProtocol={data} 
              history={savedProtocols.filter(p => p.clientName === data.clientName)} 
              onNotesChange={(n) => setData({...data, privateNotes: n})} 
              onUpdateData={(newData, createHistory) => handleSave(false, newData, createHistory)}
              onSelectHistory={(hist) => setData(hist)}
              onOpenEditor={() => setActiveView('manage')}
          />
        )}

      </main>
    </div>
  );
};

export default App;
