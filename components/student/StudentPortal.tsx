import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { LOGO_VBR_BLACK } from '../../constants';
import { ProtocolData } from '../../types';

// Sub-pages imports (will be created next)
import StudentDashboard from './pages/Dashboard';
import StudentProtocol from './pages/Protocol';
import StudentWorkout from './pages/Workout';
import StudentEvolution from './pages/Evolution';

interface StudentPortalProps {
  studentData: ProtocolData;
  onLogout: () => void;
}

type Page = 'dashboard' | 'protocol' | 'workout' | 'evolution';

const StudentPortal: React.FC<StudentPortalProps> = ({ studentData, onLogout }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verificação de Vencimento do Plano
  const checkPlanExpiration = () => {
    if (!studentData.contract.endDate) return false;
    
    // Converte DD/MM/YYYY para Date
    const [day, month, year] = studentData.contract.endDate.split('/');
    const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    endDate.setHours(23, 59, 59, 999); // Final do dia de vencimento

    const today = new Date();
    return today > endDate;
  };

  const isExpired = checkPlanExpiration();
  const isAvulso = studentData.contract.planType === 'Avulso';

  if (isAvulso) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-24 mx-auto opacity-50 mb-8" />
          
          <div className="bg-[#111] border border-[#d4af37]/20 p-8 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#d4af37]"></div>
            
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#d4af37]">
              <LogOut size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase text-white mb-2">Acesso Restrito</h2>
            <p className="text-white/40 text-sm font-medium mb-8">
              O plano <span className="text-white font-bold">Avulso</span> não possui acesso à plataforma.
              <br/>Para utilizar o portal do aluno, faça um upgrade do seu plano.
            </p>

            <button 
              onClick={onLogout}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
          
          <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Team VBR System</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-24 mx-auto opacity-50 mb-8" />
          
          <div className="bg-[#111] border border-red-500/20 p-8 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <LogOut size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase text-white mb-2">Acesso Expirado</h2>
            <p className="text-white/40 text-sm font-medium mb-8">
              Seu plano encerrou em <span className="text-white font-bold">{studentData.contract.endDate}</span>.
              <br/>Para continuar acessando seu protocolo e evoluindo, renove sua consultoria.
            </p>

            <button 
              onClick={onLogout}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
          
          <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Team VBR System</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Meu Painel', icon: LayoutDashboard },
    { id: 'protocol', label: 'Meu Protocolo', icon: Utensils },
    { id: 'workout', label: 'Meu Treino', icon: Dumbbell },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <StudentDashboard data={studentData} onNavigate={(page) => setActivePage(page as Page)} />;
      case 'protocol': return <StudentProtocol data={studentData} />;
      case 'workout': return <StudentWorkout data={studentData} />;
      case 'evolution': return <StudentEvolution data={studentData} />;
      default: return <StudentDashboard data={studentData} onNavigate={(page) => setActivePage(page as Page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-center border-b border-white/5">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-16 opacity-90" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-black text-lg">
              {studentData.clientName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">Bem-vindo,</p>
              <p className="font-bold text-sm truncate">{studentData.clientName.split(' ')[0]}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id as Page);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                    ${isActive ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-black' : 'text-[#d4af37]'} />
                  <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut size={20} />
            <span className="font-bold text-xs uppercase tracking-wider">Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header Mobile */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:hidden bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-30">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-10" />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-[#d4af37] hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12 pb-32">
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderPage()}
          </div>
        </div>
      </main>

    </div>
  );
};

export default StudentPortal;
