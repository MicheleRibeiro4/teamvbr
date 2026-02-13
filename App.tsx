
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
  Home,
  ArrowLeft,
  History,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  Database
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'protocol' | 'contract' | 'evolution' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline' | 'syncing'>('online');

  // Carregamento Inicial do "Banco de Dados"
  useEffect(() => {
    const loadData = async () => {
      setCloudStatus('syncing');
      const protocols = await db.getAll();
      setSavedProtocols(protocols);
      if (protocols.length > 0) setData(protocols[0]);
      setCloudStatus('online');
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSyncing(true);
    setCloudStatus('syncing');
    
    const now = new Date().toISOString();
    let updatedList: ProtocolData[];
    const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
    const index = savedProtocols.findIndex(p => p.id === currentId);
    
    const updatedProtocol = { ...data, id: currentId, updatedAt: now };
    
    if (index >= 0) {
      updatedList = [...savedProtocols];
      updatedList[index] = updatedProtocol;
    } else {
      updatedList = [updatedProtocol, ...savedProtocols];
      setData(updatedProtocol);
    }

    await db.save(updatedList);
    setSavedProtocols(updatedList);
    setIsSyncing(false);
    setCloudStatus('online');
    alert('✅ Dados sincronizados com a nuvem VBR!');
  };

  const handleExport = () => db.exportBackup(savedProtocols);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await db.importBackup(file);
        if (confirm(`Deseja importar ${imported.length} registros? Isso substituirá os dados atuais.`)) {
          await db.save(imported);
          setSavedProtocols(imported);
          alert('Backup importado com sucesso!');
        }
      } catch (err) {
        alert(err);
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

  // Fix: Added handleNewCheckin to create a new session record for the same student
  const handleNewCheckin = () => {
    const newCheckin: ProtocolData = {
      ...data,
      id: "vbr-" + Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    setData(newCheckin);
    setActiveView('protocol');
    alert('🚀 Novo check-in iniciado! Atualize os dados físicos e o protocolo.');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'protocol') => {
    setData(student);
    setActiveView(view);
  };

  const deleteStudent = async (id: string) => {
    if(confirm('Excluir este registro permanentemente?')) {
      const filtered = savedProtocols.filter(p => p.id !== id);
      await db.save(filtered);
      setSavedProtocols(filtered);
      if (activeView !== 'home') setActiveView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {/* HEADER COM STATUS DE NUVEM */}
      <header className="h-24 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveView('home')} className="hover:scale-105 transition-transform">
            <img src={LOGO_RHINO_BLACK} alt="VBR Logo" className="h-20 w-auto" />
          </button>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          
          {/* Cloud Indicator */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${cloudStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} shadow-[0_0_10px_rgba(34,197,94,0.4)]`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {cloudStatus === 'syncing' ? 'Sincronizando...' : 'Nuvem VBR: Ativa'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl no-print mr-2">
            <button onClick={handleExport} className="p-2.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#d4af37] transition-all" title="Exportar Backup JSON">
              <Download size={18} />
            </button>
            <label className="p-2.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#d4af37] transition-all cursor-pointer" title="Importar Backup JSON">
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
              {isSyncing ? 'Sincronizando' : 'Sincronizar'}
            </button>
          )}
        </div>
      </header>

      {/* Navegação Secundária */}
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
            
            {/* Widget de Banco de Dados */}
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center text-[#d4af37]">
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Gerenciamento de Dados</h3>
                  <p className="text-white/40 text-sm font-medium">Seus dados estão protegidos localmente e prontos para sincronização em nuvem.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleExport} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <Download size={18} /> Exportar Backup
                </button>
                <label className="flex items-center gap-3 bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer">
                  <Upload size={18} /> Importar Dados
                  <input type="file" className="hidden" onChange={handleImport} accept=".json" />
                </label>
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
                    Configuração do Protocolo
                  </h3>
                  <ProtocolForm data={data} onChange={setData} />
               </div>
            </div>

            <div className="relative w-full">
              <div className="flex flex-col items-center">
                <div className="bg-black/40 text-[#d4af37] px-10 py-4 rounded-full font-black text-[12px] uppercase tracking-widest mb-12 no-print border border-[#d4af37]/30 backdrop-blur-md shadow-2xl">
                  Visualização do Documento (A4)
                </div>
                
                <div className="w-full flex justify-center bg-[#111] p-4 md:p-16 rounded-[4rem] border border-white/5 shadow-inner overflow-hidden min-h-[1200px]">
                   <ProtocolPreview data={data} />
                </div>

                <div className="flex gap-6 mt-16 no-print mb-20">
                  <button onClick={handleSave} className="flex items-center gap-4 bg-[#d4af37] text-black px-16 py-6 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                    <Save size={24} /> Sincronizar Tudo
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-4 bg-white text-black px-16 py-6 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                    <Printer size={24} /> Exportar PDF
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
                  <Save size={20} /> Salvar Alterações
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
                  <Save size={18} /> Salvar Notas
                </button>
                <button onClick={handleNewCheckin} className="flex items-center gap-3 bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  <History size={18} /> Novo Check-in de Evolução
                </button>
             </div>
             <EvolutionTracker currentProtocol={data} history={savedProtocols.filter(p => p.clientName === data.clientName)} onNotesChange={(n) => setData({...data, privateNotes: n})} />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 p-16 text-center no-print opacity-20">
         <img src={LOGO_RHINO_BLACK} alt="VBR Logo" className="h-20 mx-auto mb-6 grayscale" />
         <p className="text-[11px] font-black text-white uppercase tracking-[0.8em]">Team VBR Engineering • Cloud Persistent Mode © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
