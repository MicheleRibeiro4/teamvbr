
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
  TrendingUp, 
  Save, 
  Plus, 
  ScrollText, 
  Printer,
  FolderOpen,
  ArrowLeft,
  History,
  RefreshCw,
  Download,
  Upload,
  Database,
  CloudOff,
  Cloud,
  CheckCircle2
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'protocol' | 'contract' | 'evolution' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [showToast, setShowToast] = useState(false);

  const loadData = async () => {
    setIsSyncing(true);
    setCloudStatus('syncing');
    try {
      const protocols = await db.getAll();
      setSavedProtocols(protocols);
      setCloudStatus(db.isCloudEnabled() ? 'online' : 'offline');
    } catch (e) {
      setCloudStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSyncing(true);
    setCloudStatus('syncing');
    
    try {
      const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
      const updatedProtocol = { 
        ...data, 
        id: currentId, 
        updatedAt: new Date().toISOString() 
      };
      
      await db.saveProtocol(updatedProtocol);
      
      // Atualização imediata da UI
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
      alert(err.message || 'Erro ao sincronizar');
      setCloudStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => db.exportBackup(savedProtocols);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await db.importBackup(file);
        if (confirm(`Importar ${imported.length} registros para a nuvem?`)) {
          for (const p of imported) await db.saveProtocol(p);
          await loadData();
          alert('Backup restaurado com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar backup.');
      }
    }
  };

  const handleNew = () => {
    setData({
      ...EMPTY_DATA,
      id: "vbr-" + Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    });
    setActiveView('protocol');
  };

  const handleNewCheckin = () => {
    const newCheckin: ProtocolData = {
      ...data,
      id: "vbr-" + Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    setData(newCheckin);
    setActiveView('protocol');
    alert('🚀 Novo check-in de evolução iniciado!');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'protocol') => {
    setData(student);
    setActiveView(view);
  };

  const deleteStudent = async (id: string) => {
    if(confirm('Excluir este aluno permanentemente da nuvem?')) {
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
      
      {/* TOAST DE SUCESSO */}
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
              cloudStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
              cloudStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 
              'bg-red-500 opacity-50'
            }`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {cloudStatus === 'syncing' ? 'Sincronizando...' : 
               cloudStatus === 'online' ? 'Cloud VBR: Conectado' : 
               'Offline / Erro de Chave'}
            </span>
            {cloudStatus === 'online' ? <Cloud size={12} className="text-[#d4af37]" /> : <CloudOff size={12} className="text-red-500" />}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl no-print mr-2">
            <button onClick={handleExport} className="p-2.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#d4af37] transition-all" title="Backup Cloud">
              <Download size={18} />
            </button>
            <label className="p-2.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#d4af37] transition-all cursor-pointer" title="Importar">
              <Upload size={18} />
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
          </div>

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
              {isSyncing ? 'Sincronizando' : 'Sincronizar Cloud'}
            </button>
          )}
        </div>
      </header>

      {activeView !== 'home' && activeView !== 'search' && (
        <nav className="flex justify-center bg-[#0a0a0a] border-b border-white/5 no-print sticky top-24 z-40 bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="flex gap-4 md:gap-8 p-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'protocol', label: 'Protocolo', icon: <FileText size={16}/> },
              { id: 'contract', label: 'Contrato', icon: <ScrollText size={16}/> },
              { id: 'evolution', label: 'Evolução', icon: <TrendingUp size={16}/> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewMode)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeView === item.id ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-white/40 hover:text-white'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        {activeView === 'home' && (
          <div className="space-y-12">
            <MainDashboard protocols={savedProtocols} onNew={handleNew} onList={() => setActiveView('search')} onLoadStudent={loadStudent} />
            
            {/* CARD DE STATUS DA NUVEM */}
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cloudStatus === 'online' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-red-500/10 text-red-500'}`}>
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {cloudStatus === 'online' ? 'Base de Dados VBR Cloud' : 'Erro de Conexão Cloud'}
                  </h3>
                  <p className="text-white/40 text-sm font-medium max-w-xl">
                    {cloudStatus === 'online' 
                      ? 'Todos os seus protocolos estão salvos de forma segura no Supabase e disponíveis em qualquer dispositivo.' 
                      : 'Não foi possível conectar ao Supabase. Verifique se as chaves fornecidas são válidas e se a tabela "protocols" foi criada.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={loadData} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} /> Atualizar Lista
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-[#d4af37]" />
              </button>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Gestão de Alunos</h2>
            </div>
            <StudentSearch protocols={savedProtocols} onLoad={loadStudent} onDelete={deleteStudent} />
          </div>
        )}

        {activeView === 'protocol' && (
          <div className="flex flex-col gap-16">
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 no-print max-w-4xl mx-auto w-full">
               <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-xl">
                  <h3 className="text-[#d4af37] font-black text-sm uppercase tracking-widest mb-10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"></div> 
                    Configuração do Protocolo Técnico
                  </h3>
                  <ProtocolForm data={data} onChange={setData} />
               </div>
            </div>

            <div className="relative w-full">
              <div className="flex flex-col items-center">
                <div className="bg-black/40 text-[#d4af37] px-10 py-4 rounded-full font-black text-[12px] uppercase tracking-widest mb-12 no-print border border-[#d4af37]/30 backdrop-blur-md shadow-2xl">
                  Visualização do Documento Profissional (A4)
                </div>
                
                <div className="w-full flex justify-center bg-[#111] p-4 md:p-16 rounded-[4rem] border border-white/5 shadow-inner overflow-hidden min-h-[1200px]">
                   <ProtocolPreview data={data} />
                </div>

                <div className="flex flex-col md:flex-row gap-6 mt-16 no-print mb-20">
                  <button onClick={handleSave} disabled={isSyncing} className="flex items-center gap-4 bg-[#d4af37] text-black px-16 py-6 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl disabled:opacity-50">
                    <Save size={24} /> {isSyncing ? 'Sincronizando...' : 'Sincronizar Cloud'}
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-4 bg-white text-black px-16 py-6 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                    <Printer size={24} /> Exportar para Aluno (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'contract' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-end mb-4 no-print gap-4">
                <button onClick={handleSave} className="flex items-center gap-3 bg-[#d4af37] text-black px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  <Save size={20} /> Salvar Alterações Cloud
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  <Printer size={20} /> Imprimir Contrato
                </button>
             </div>
             <ContractWorkspace data={data} onChange={setData} />
          </div>
        )}

        {activeView === 'evolution' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div className="flex justify-end no-print gap-4">
                <button onClick={handleSave} className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                  <Save size={18} /> Salvar Notas de Coach
                </button>
                <button onClick={handleNewCheckin} className="flex items-center gap-3 bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  <History size={18} /> Registrar Novo Check-in
                </button>
             </div>
             <EvolutionTracker currentProtocol={data} history={savedProtocols.filter(p => p.clientName === data.clientName)} onNotesChange={(n) => setData({...data, privateNotes: n})} />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 p-16 text-center no-print opacity-20">
         <img src={LOGO_RHINO_BLACK} alt="VBR Logo" className="h-20 mx-auto mb-6 grayscale" />
         <p className="text-[11px] font-black text-white uppercase tracking-[0.8em]">Team VBR Engineering • Cloud Native Edition © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
