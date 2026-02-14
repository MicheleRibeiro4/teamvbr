
import React, { useState, useEffect } from 'react';
import { ProtocolData } from './types';
import { EMPTY_DATA, LOGO_VBR_BLACK } from './constants';
import { db } from './services/db';
import UnifiedEditor from './components/UnifiedEditor';
import EvolutionTracker from './components/EvolutionTracker';
import MainDashboard from './components/MainDashboard';
import StudentSearch from './components/StudentSearch';
import StudentDashboard from './components/StudentDashboard';
import { 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ChevronLeft,
  Lock,
  LogIn
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'manage' | 'evolution' | 'settings' | 'student-dashboard';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);

  const MASTER_PASSWORD = "vbr-master-2025";

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

  useEffect(() => {
    const auth = localStorage.getItem('vbr_auth');
    if (auth === 'true') setIsAuthenticated(true);
    loadData();
  }, []);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const protocols = await db.getAll();
      setSavedProtocols(protocols);
      setCloudStatus('online');
    } catch (e: any) {
      setCloudStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!data.clientName) return;
    setIsSyncing(true);
    try {
      const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
      const updatedProtocol = { ...data, id: currentId, updatedAt: new Date().toISOString() };
      await db.saveProtocol(updatedProtocol);
      setSavedProtocols(prev => {
        const index = prev.findIndex(p => p.id === currentId);
        if (index >= 0) { const newList = [...prev]; newList[index] = updatedProtocol; return newList; }
        return [updatedProtocol, ...prev];
      });
      setData(updatedProtocol);
      setCloudStatus('online');
      if (!silent) { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }
    } catch (err: any) { setCloudStatus('error'); } finally { setIsSyncing(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-[#d4af37] selection:text-black">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center mb-10">
            <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="h-32 w-auto" />
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Lock size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Acesso Consultor</h1>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Portal Team VBR</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Senha de Segurança</label>
                <div className="relative">
                  <input 
                    type="password" 
                    className={`w-full p-4 bg-white/5 border ${loginError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold text-white text-sm transition-all pr-12`}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                </div>
                {loginError && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-2 text-center">Senha incorreta.</p>}
              </div>

              <button type="submit" className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                Entrar no Sistema
              </button>
            </form>
          </div>
          <p className="text-center mt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            &copy; 2025 Team VBR - Excelência em Performance
          </p>
        </div>
      </div>
    );
  }

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
            <img src={LOGO_VBR_BLACK} alt="VBR Logo" className="h-20 w-auto" />
          </button>
          {activeView !== 'home' && (
            <button onClick={() => setActiveView(data.id && activeView !== 'student-dashboard' ? 'student-dashboard' : 'home')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors">
              <ChevronLeft size={16} /> Voltar
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => {localStorage.removeItem('vbr_auth'); setIsAuthenticated(false);}} className="text-[9px] font-black uppercase text-white/20 hover:text-red-500 transition-colors">Sair</button>
          {data.id && activeView !== 'home' && activeView !== 'search' && (
            <button onClick={() => handleSave()} disabled={isSyncing} className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />} Salvar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        {activeView === 'home' && <MainDashboard protocols={savedProtocols} onNew={() => { setData({...EMPTY_DATA, id: "vbr-" + Math.random().toString(36).substr(2, 9)}); setActiveView('manage'); }} onList={() => setActiveView('search')} onLoadStudent={(p) => { setData(p); setActiveView('student-dashboard'); }} />}
        {activeView === 'search' && <StudentSearch protocols={savedProtocols} onLoad={(p) => { setData(p); setActiveView('student-dashboard'); }} onDelete={async (id) => { if(confirm('Excluir aluno?')) { await db.deleteProtocol(id); setSavedProtocols(prev => prev.filter(p => p.id !== id)); } }} />}
        {activeView === 'student-dashboard' && <StudentDashboard data={data} setView={(v) => setActiveView(v as ViewMode)} />}
        {activeView === 'manage' && <UnifiedEditor data={data} onChange={setData} onBack={() => setActiveView('student-dashboard')} />}
        {activeView === 'evolution' && (
          <div className="space-y-10">
            <button onClick={() => setActiveView('student-dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#d4af37] transition-colors"><ChevronLeft size={16} /> Voltar</button>
            <EvolutionTracker currentProtocol={data} history={savedProtocols.filter(p => p.clientName === data.clientName)} onNotesChange={(n) => setData({...data, privateNotes: n})} onUpdateData={(newData) => { setData(newData); handleSave(true); }} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
