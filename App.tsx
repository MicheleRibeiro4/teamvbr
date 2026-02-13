
import React, { useState, useEffect } from 'react';
import { ProtocolData } from './types';
import { INITIAL_DATA, EMPTY_DATA, LOGO_RHINO_BLACK } from './constants';
import { db } from './services/db';
import ProtocolForm from './components/ProtocolForm';
import ProtocolPreview from './components/ProtocolPreview';
import ContractWorkspace from './components/ContractWorkspace';
import EvolutionTracker from './components/EvolutionTracker';
import MainDashboard from './components/MainDashboard';
import StudentSearch from './components/StudentSearch';
import { 
  FileText, 
  Save, 
  Plus, 
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code,
  Key,
  ShieldAlert
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'protocol' | 'contract' | 'evolution' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const protocols = await db.getAll();
      setSavedProtocols(protocols);
      // Se conseguir carregar mas a lista for menor que o esperado e der erro silencioso no db.ts, o status mudará
      setCloudStatus(db.isCloudEnabled() ? 'online' : 'error');
    } catch (e: any) {
      console.error("Erro ao carregar:", e);
      setCloudStatus('error');
      if (e.message?.includes('Load failed')) setNetworkError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSyncing(true);
    try {
      const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
      const updatedProtocol = { 
        ...data, 
        id: currentId, 
        updatedAt: new Date().toISOString() 
      };
      
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
      setNetworkError(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('navegador') || err.message?.includes('Load failed')) {
        setNetworkError(true);
      }
      setCloudStatus('error');
      alert(`⚠️ ERRO NA NUVEM: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNew = () => {
    const newId = "vbr-" + Math.random().toString(36).substr(2, 9);
    setData({
      ...EMPTY_DATA,
      id: newId,
      updatedAt: new Date().toISOString()
    });
    setActiveView('protocol');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'protocol') => {
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
        alert('Erro ao deletar.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              <CheckCircle2 size={20} /> Sincronizado com Nuvem VBR
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
              {isSyncing ? 'Sincronizando...' : cloudStatus === 'online' ? 'Nuvem Ativa' : 'Erro de Conexão'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setActiveView('search')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white">
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
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Nuvem
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        
        {/* Alerta de Erro de Conexão ou Configuração */}
        {cloudStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[2rem] mb-10 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-500" size={32} />
              <div>
                <h4 className="font-black uppercase text-sm">Falha de Comunicação com a Nuvem</h4>
                <p className="text-xs text-white/60">O app está funcionando em modo Local (salvando apenas no seu computador).</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
               {networkError ? (
                 <div className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/20 md:col-span-2">
                   <h5 className="flex items-center gap-2 text-orange-400 font-black uppercase text-[10px] mb-2">
                     <ShieldAlert size={14}/> Possível Bloqueio de Rede (TypeError: Load failed)
                   </h5>
                   <p className="text-[11px] text-white/60 mb-2">
                     Seu navegador ou uma extensão (como <b>uBlock</b> ou <b>AdBlock</b>) pode estar bloqueando a conexão com o banco de dados Supabase.
                   </p>
                   <p className="text-[11px] font-bold text-white/40 italic">
                     Sugestão: Tente desativar o AdBlock para este domínio ou usar uma janela anônima para testar.
                   </p>
                 </div>
               ) : (
                 <>
                   <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                     <h5 className="flex items-center gap-2 text-[#d4af37] font-black uppercase text-[10px] mb-2">
                       <Code size={14}/> Passo 1: SQL Editor
                     </h5>
                     <p className="text-[11px] text-white/40 mb-4">Certifique-se que a tabela 'protocols' existe no seu Supabase.</p>
                     <button 
                      onClick={() => alert('Script SQL:\n\nCREATE TABLE IF NOT EXISTS protocols (\n  id TEXT PRIMARY KEY,\n  client_name TEXT NOT NULL,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  data JSONB NOT NULL\n);\n\nALTER TABLE protocols DISABLE ROW LEVEL SECURITY;')}
                      className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg font-black text-[9px] uppercase transition-all"
                     >
                       Ver Script SQL de Criação
                     </button>
                   </div>
                   <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                     <h5 className="flex items-center gap-2 text-[#d4af37] font-black uppercase text-[10px] mb-2">
                       <Key size={14}/> Passo 2: Verificação de Chave
                     </h5>
                     <p className="text-[11px] text-white/40 mb-4">Agora o sistema está usando a chave JWT correta fornecida. Se o erro persistir, verifique as permissões da tabela.</p>
                   </div>
                 </>
               )}
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

        {activeView === 'contract' && (
          <div className="no-print">
            <ContractWorkspace data={data} onChange={setData} />
          </div>
        )}
        
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
