
import React, { useState, useEffect, useRef } from 'react';
import { ProtocolData } from '../types';
import { EMPTY_DATA, LOGO_VBR_BLACK } from '../constants';
import { db } from '../services/db';
import UnifiedEditor from '../components/UnifiedEditor';
import MainDashboard from '../components/MainDashboard';
import StudentSearch from '../components/StudentSearch';
import StudentDashboard from '../components/StudentDashboard';
import EvolutionTracker from '../components/EvolutionTracker';
import StudentEntryForm from '../components/StudentEntryForm';
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

type ViewMode = 'home' | 'search' | 'manage' | 'settings' | 'student-dashboard' | 'evolution' | 'student-entry';

const App: React.FC = () => {
  // --- LÓGICA DE DETECÇÃO DE URL ---
  // Verifica se estamos no modo de cadastro via URL (Funciona com query param ou hash)
  const isStudentModeUrl = () => {
    if (typeof window === 'undefined') return false;
    const href = window.location.href;
    return href.includes('mode=cadastro');
  };

  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  
  // Inicializa o activeView com base na URL
  const [activeView, setActiveView] = useState<ViewMode>(() => {
    return isStudentModeUrl() ? 'student-entry' : 'home';
  });

  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Ref para o timer do auto-save
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MASTER_PASSWORD = "vbr-master-2025";

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
      localStorage.setItem('vbr_auth', 'true');
    } else {
      setLoginError(true);
    }
  };

  // Garante que se a URL mudar (ex: navegação manual), o view atualiza
  useEffect(() => {
    const handlePopState = () => {
      if (isStudentModeUrl()) {
        setActiveView('student-entry');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Verificação inicial extra após montagem
    if (isStudentModeUrl() && activeView !== 'student-entry') {
        setActiveView('student-entry');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check auth and load data
  useEffect(() => {
    // 1. Verifica autenticação do admin
    const auth = localStorage.getItem('vbr_auth');
    if (auth === 'true') setIsAuthenticated(true);
    
    // 2. Carrega dados APENAS se não estivermos no modo cadastro
    // Usamos uma verificação dupla aqui para não carregar dados desnecessários para o aluno
    const currentlyStudentMode = activeView === 'student-entry' || isStudentModeUrl();

    if (!currentlyStudentMode) {
        loadData();
    }
  }, [activeView]);

  // AUTO-SAVE LOGIC
  useEffect(() => {
    // Só ativa o auto-save se estiver editando um aluno e tiver um ID válido
    if (activeView === 'manage' && data.id && data.clientName) {
      // Limpa timer anterior se houver (debounce)
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Configura novo timer de 2 segundos
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true); // Salvar silenciosamente
      }, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [data]); // Dispara sempre que 'data' muda

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

  // Save changes to Supabase
  const handleSave = async (silent = false, specificData?: ProtocolData, forceNewId = false) => {
    const dataToSave = specificData || data;

    if (!dataToSave.clientName) {
      if (!silent) alert("⚠️ Defina o nome do aluno antes de salvar.");
      return;
    }
    
    setIsSyncing(true);
    try {
      // Se forçado um novo ID, gera um novo. Se não, usa o existente ou gera um se não tiver.
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
        // Se for novo ID, adiciona à lista. Se for atualização, substitui.
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
      
      // Se estivermos salvando o dado ativo, atualiza o estado
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

  const sqlRepairScript = `-- SCRIPT DE CONFIGURAÇÃO (SEGURANÇA + TABELA)
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

  // --- RENDERIZAÇÃO CONDICIONAL ---
  
  // 1. MODO DE AUTO-CADASTRO (Prioridade Máxima Absoluta)
  // Se a URL contiver 'mode=cadastro', renderiza o form e ignora o resto.
  if (isStudentModeUrl() || activeView === 'student-entry') {
     return <StudentEntryForm onCancel={() => {
        // Limpa a URL ao cancelar
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
        setActiveView('home');
     }} />;
  }

  // 2. TELA DE LOGIN (Se não estiver autenticado)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
          <img src={LOGO_VBR_BLACK} alt="Team VBR Logo" className="h-32 w-auto mx-auto mb-10" />
          <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
            <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center text-black mx-auto mb-6"><Lock size={24} /></div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Acesso Consultor Team VBR</h1>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Senha" />
              {loginError && <p className="text-xs text-red-500 font-black uppercase">Senha incorreta.</p>}
              <button type="submit" className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] mb-4">Entrar</button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-white/5">
                <button 
                  onClick={() => {
                     // Adiciona o param na URL e muda a view
                     const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?mode=cadastro";
                     window.history.pushState({path:newUrl},'',newUrl);
                     setActiveView('student-entry');
                  }} 
                  className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-[#d4af37] hover:border-[#d4af37] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                   <UserPlus size={14} /> Sou Aluno (Novo Cadastro)
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. APP PRINCIPAL (Logado)
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              <CheckCircle2 size={20} /> Salvo Automaticamente
           </div>
        </div>
      )}

      {/* Indicador de Auto Save no Header se estiver syncando silenciosamente */}
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
              onClick={() => setActiveView(data.id && activeView !== 'student-dashboard' ? 'student-dashboard' : 'home')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"
            >
              <ChevronLeft size={16} /> Voltar
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
              Salvar Agora
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
                  <p className="text-xs text-white/60">Permissões ou tabela faltando. Copie o SQL ao lado.</p>
                </div>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(sqlRepairScript); alert('SQL Copiado! Cole no Editor SQL do Supabase.'); }}
                className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase border border-white/10 hover:bg-white/5 transition-colors"
              >
                Copiar SQL de Correção
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

        {/* VIEW DE EVOLUÇÃO */}
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
