
import React, { useState, useEffect } from 'react';
import { ProtocolData } from './types';
import { INITIAL_DATA, EMPTY_DATA } from './constants';
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
  ChevronRight,
  FolderOpen,
  Trash2,
  Home,
  ArrowLeft,
  History
} from 'lucide-react';

type ViewMode = 'home' | 'search' | 'protocol' | 'contract' | 'evolution';

const App: React.FC = () => {
  const [data, setData] = useState<ProtocolData>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('vbr_cloud_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedProtocols(parsed);
      // Se tiver dados, mas for a primeira vez, carrega o último aluno para o estado 'data'
      if (parsed.length > 0) setData(parsed[0]);
    }
  }, []);

  const handleSave = () => {
    const now = new Date().toISOString();
    let updatedList: ProtocolData[];
    
    // Se o ID for vazio (novo cadastro), gera um novo
    const currentId = data.id || "vbr-" + Math.random().toString(36).substr(2, 9);
    const index = savedProtocols.findIndex(p => p.id === currentId);
    
    if (index >= 0) {
      updatedList = [...savedProtocols];
      updatedList[index] = { ...data, id: currentId, updatedAt: now };
    } else {
      const newEntry = { ...data, id: currentId, updatedAt: now };
      updatedList = [newEntry, ...savedProtocols];
      setData(newEntry);
    }

    setSavedProtocols(updatedList);
    localStorage.setItem('vbr_cloud_data', JSON.stringify(updatedList));
    alert('Informações sincronizadas com sucesso!');
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
    // Cria uma nova sessão (protocolo) baseada na atual, mas com data de hoje
    const newCheckin: ProtocolData = {
      ...data,
      id: "vbr-" + Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    setData(newCheckin);
    setActiveView('protocol');
    alert('Novo check-in iniciado! Atualize os dados físicos e salve.');
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'protocol') => {
    setData(student);
    setActiveView(view);
  };

  const deleteStudent = (id: string) => {
    if(confirm('Excluir este registro permanentemente?')) {
      const filtered = savedProtocols.filter(p => p.id !== id);
      setSavedProtocols(filtered);
      localStorage.setItem('vbr_cloud_data', JSON.stringify(filtered));
      if (activeView !== 'home') setActiveView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      <header className="h-24 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveView('home')} className="hover:scale-105 transition-transform">
            <img src="https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png" alt="VBR" className="h-12 w-auto" />
          </button>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[#d4af37]">Team VBR</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {activeView === 'home' ? 'Painel de Controle' : data.clientName || 'Novo Cadastro'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {activeView !== 'home' && (
            <button 
              onClick={() => setActiveView('home')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
            >
              <Home size={20} />
            </button>
          )}
          <button 
            onClick={() => setActiveView('search')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
          >
            <FolderOpen size={20} />
          </button>
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Plus size={16} /> <span className="hidden md:inline">Novo Aluno</span>
          </button>
          {activeView !== 'home' && activeView !== 'search' && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <Save size={16} /> Salvar
            </button>
          )}
        </div>
      </header>

      {activeView !== 'home' && activeView !== 'search' && (
        <nav className="flex justify-center bg-[#0a0a0a] border-b border-white/5 no-print sticky top-24 z-40 bg-[#0a0a0a]/90 backdrop-blur-md">
          <div className="flex gap-4 md:gap-8 p-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'protocol', label: 'Protocolo', icon: <FileText size={16}/> },
              { id: 'contract', label: 'Contrato', icon: <ScrollText size={16}/> },
              { id: 'evolution', label: 'Evolução', icon: <TrendingUp size={16}/> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeView === item.id ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-white/40 hover:text-white'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        {activeView === 'home' && (
          <MainDashboard protocols={savedProtocols} onNew={handleNew} onList={() => setActiveView('search')} onLoadStudent={loadStudent} />
        )}

        {activeView === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-[#d4af37]" />
              </button>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Alunos</h2>
            </div>
            <StudentSearch protocols={savedProtocols} onLoad={loadStudent} onDelete={deleteStudent} />
          </div>
        )}

        {activeView === 'protocol' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                  <h3 className="text-[#d4af37] font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div> Edição Técnica
                  </h3>
                  <ProtocolForm data={data} onChange={setData} />
               </div>
            </div>
            <div className="relative">
              <div className="sticky top-48 flex flex-col items-center">
                <div className="bg-black/40 text-[#d4af37] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-6 no-print border border-[#d4af37]/20 backdrop-blur-sm">Preview do Documento</div>
                <div className="w-full flex justify-center bg-white/5 p-4 md:p-8 rounded-[3rem] border border-white/10 shadow-inner overflow-hidden">
                   <ProtocolPreview data={data} />
                </div>
                <button onClick={() => window.print()} className="mt-8 flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl no-print">
                  <Printer size={20} /> Exportar PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'contract' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-end mb-4 no-print">
                <button onClick={() => window.print()} className="flex items-center gap-3 bg-[#d4af37] text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  <Printer size={18} /> Exportar Contrato (PDF)
                </button>
             </div>
             <ContractWorkspace data={data} onChange={setData} />
          </div>
        )}

        {activeView === 'evolution' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div className="flex justify-end no-print">
                <button 
                  onClick={handleNewCheckin}
                  className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  <History size={16} /> Adicionar Novo Check-in
                </button>
             </div>
             <EvolutionTracker 
               currentProtocol={data} 
               history={savedProtocols.filter(p => p.clientName === data.clientName)}
               onNotesChange={(n) => setData({...data, privateNotes: n})}
             />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 p-12 text-center no-print">
         <img src="https://i.ibb.co/m5vjF6P9/vbr-logo-gold.png" alt="VBR" className="h-8 mx-auto mb-4 opacity-20 grayscale" />
         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Team VBR © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
