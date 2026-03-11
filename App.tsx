
import React, { useState, useEffect, useRef } from 'react';
import { ProtocolData } from './types';
import { EMPTY_DATA, LOGO_VBR_BLACK } from './constants';
import { db } from './services/db';
import UnifiedEditor from './components/UnifiedEditor';
import MainDashboard from './components/MainDashboard';
import StudentSearch from './components/StudentSearch';
import StudentDashboard from './components/StudentDashboard';
import StudentEntryForm from './components/StudentEntryForm';
import ProtocolGenerator from './components/ProtocolGenerator';
import StudentLogin from './components/student/StudentLogin';
import StudentPortal from './components/student/StudentPortal';
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

import StudentMonitoring from './components/monitoring/StudentMonitoring';

type ViewMode = 'home' | 'search' | 'manage' | 'settings' | 'student-dashboard' | 'generator' | 'monitoring';

const App: React.FC = () => {
  const getPageType = () => {
    if (typeof window !== 'undefined') {
       const h = window.location.hash;
       if (h.includes('portal')) return 'portal';
       if (h.includes('student') || h.includes('cadastro')) return 'register';
    }
    return 'admin';
  };

  const [pageType, setPageType] = useState(getPageType);
  const [data, setData] = useState<ProtocolData>(EMPTY_DATA);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [monitoringTab, setMonitoringTab] = useState<'checkin'>('checkin');
  const [savedProtocols, setSavedProtocols] = useState<ProtocolData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'error'>('online');
  const [showToast, setShowToast] = useState(false);
  
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);
  const [studentData, setStudentData] = useState<ProtocolData | null>(null);
  
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MASTER_PASSWORD = "vbr-master-2025";

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    const handleHashChange = () => {
      setPageType(getPageType());
    };
    window.addEventListener('hashchange', handleHashChange);
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

  const handleStudentLogin = async (phone: string, password?: string) => {
    setIsSyncing(true);
    try {
      // Busca aluno pelo telefone no banco de dados
      const result = await db.getAll();
      const protocols = result.data;
      
      const student = protocols.find(p => {
        const studentPhone = p.contract?.phone?.replace(/\D/g, '') || '';
        const searchPhone = phone.replace(/\D/g, '');
        return studentPhone === searchPhone && searchPhone !== '';
      });

      if (student) {
        // Verifica a senha (CPF - apenas números)
        // Se não tiver senha (login automático via localStorage), passa direto
        if (password) {
            const cleanCpf = student.contract.cpf.replace(/\D/g, '');
            const cleanPassword = password.replace(/\D/g, '');
            
            if (cleanPassword !== cleanCpf) {
                alert('Senha incorreta. A senha é o seu CPF (apenas números).');
                setIsSyncing(false);
                return;
            }
        }

        setStudentData(student);
        setIsStudentAuthenticated(true);
        localStorage.setItem('vbr_student_auth', JSON.stringify({ phone, id: student.id }));
      } else {
        alert('Número de celular não encontrado. Verifique com seu consultor.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStudentLogout = () => {
    setIsStudentAuthenticated(false);
    setStudentData(null);
    localStorage.removeItem('vbr_student_auth');
  };

  useEffect(() => {
    if (pageType === 'portal') {
      const studentAuth = localStorage.getItem('vbr_student_auth');
      if (studentAuth) {
        try {
          const { phone } = JSON.parse(studentAuth);
          handleStudentLogin(phone);
        } catch (e) {
          localStorage.removeItem('vbr_student_auth');
        }
      }
      return;
    }

    if (pageType === 'admin') {
        const auth = localStorage.getItem('vbr_auth');
        if (auth === 'true') {
        setIsAuthenticated(true);
        loadData();
        }
    }
  }, [pageType]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const result = await db.getAll();
      setSavedProtocols(result.data);
      
      if (result.source === 'cache') {
          setCloudStatus('error');
          if (!showToast) alert("⚠️ Modo Offline: Exibindo dados em cache. Verifique sua conexão ou configuração do Supabase.");
      } else {
          setCloudStatus('online');
      }
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
        ? generateUUID()
        : (dataToSave.id || generateUUID());
      
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
    setActiveView('generator');
  };

  const handleGeneratedProtocol = async (generatedData: ProtocolData) => {
      // Find the last active protocol for this user and deactivate it
      const lastActive = savedProtocols.find(p => p.clientName === generatedData.clientName && p.isActiveProtocol !== false);
      
      if (lastActive) {
          const updatedLastActive = {
              ...lastActive,
              isActiveProtocol: false
          };
          await handleSave(true, updatedLastActive);
      }

      const newProtocol = {
          ...generatedData,
          isActiveProtocol: true
      };

      setData(newProtocol);
      setActiveView('manage');
      handleSave(true, newProtocol, true);
  };

  const loadStudent = (student: ProtocolData, view: ViewMode = 'student-dashboard', tab: 'checkin' = 'checkin') => {
    setData(student);
    setActiveView(view);
    setMonitoringTab(tab);
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

  const sqlRepairScript = `-- SCRIPT DE CONFIGURAÇÃO COMPLETA (SUPABASE)
-- Copie e cole no SQL Editor do Supabase e clique em RUN.

-- 1. Limpa tabelas existentes (CUIDADO: APAGA DADOS)
DROP TABLE IF EXISTS public.body_measurements CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.protocols CASCADE;

-- 2. Cria tabelas
CREATE TABLE public.protocols (
  id text NOT NULL,
  client_name text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  data jsonb NOT NULL,
  CONSTRAINT protocols_pkey PRIMARY KEY (id)
);

-- 3. Cria a tabela 'students'
CREATE TABLE public.students (
  id text NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Cria a tabela 'feedbacks'
CREATE TABLE public.feedbacks (
  id text NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id text NOT NULL,
  feedback_date date NOT NULL,
  diet_adherence text,
  training_adherence text,
  sleep_quality text,
  energy_level text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Cria a tabela 'body_measurements'
CREATE TABLE public.body_measurements (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  weight numeric,
  chest numeric,
  waist numeric,
  abdomen numeric,
  hip numeric,
  arm_right numeric,
  arm_left numeric,
  thigh_right numeric,
  thigh_left numeric,
  calf numeric,
  body_fat numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Permissões
ALTER TABLE public.protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.protocols TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.feedbacks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.body_measurements TO anon, authenticated, service_role;

-- 7. Índices
CREATE INDEX IF NOT EXISTS idx_protocols_client_name ON public.protocols(client_name);
CREATE INDEX IF NOT EXISTS idx_protocols_student_id ON public.protocols((data->>'studentId'));
CREATE INDEX IF NOT EXISTS idx_feedbacks_student_id ON public.feedbacks(student_id);
CREATE INDEX IF NOT EXISTS idx_measurements_student_id ON public.body_measurements(student_id);

-- 9. Inserção de Dados Iniciais (Exemplo)
INSERT INTO public.protocols (id, client_name, updated_at, data)
VALUES
  ('vbr-0s4rbei6l', 'Michele Flávia Ribeiro', '2026-03-02 18:01:23.444+00', '{"id": "vbr-0s4rbei6l", "tips": ["Beber no mínimo 2.5L de água por dia.", "Mantenha a intensidade nos treinos de força; o músculo é o tecido metabolicamente mais ativo.", "Priorize o sono de 7 a 8 horas por noite para otimizar a lipólise e recuperação muscular.", "Pese os alimentos prontos para garantir a precisão das calorias ingeridas."], "meals": [{"id": "s4xhxsmz7", "name": "Café da Manhã", "time": "07:30", "details": "2 ovos inteiros + 2 claras mexidas, 1 fatia de pão integral (50g), 100g de mamão papaia com 1 colher de sopa de sementes de chia."}, {"id": "4zyg02mq5", "name": "Almoço", "time": "12:00", "details": "120g de peito de frango grelhado ou filé de tilápia, 100g de arroz integral ou batata doce, 80g de feijão, salada de folhas verdes à vontade e 1 colher de chá de azeite de oliva extra virgem."}, {"id": "l6v8k9j2n", "name": "Lanche da Tarde", "time": "16:00", "details": "1 iogurte natural desnatado (170g) com 1 scoop de Whey Protein e 1 colher de sopa de aveia em flocos."}, {"id": "p3m5q8r4t", "name": "Jantar", "time": "20:00", "details": "Omelete com 3 claras e 1 gema, recheado com espinafre e tomate, acompanhado de salada verde variada."}], "macros": {"fats": {"ratio": "25%", "value": "45g"}, "carbs": {"ratio": "35%", "value": "140g"}, "protein": {"ratio": "40%", "value": "160g"}}, "anamnesis": {"routine": "Trabalho em escritório, sedentária na maior parte do dia. Treina musculação 4x na semana à noite.", "injuries": "Nenhuma lesão relatada.", "ergogenics": "Nunca utilizou.", "medications": "Anticoncepcional oral.", "mainObjective": "Emagrecimento e definição muscular.", "foodPreferences": "Gosta de frutas e ovos. Não gosta de peixe cru.", "trainingHistory": "Treina há 6 meses, mas sem constância na dieta."}, "clientName": "Michele Flávia Ribeiro", "contract": {"rg": "MG-12.345.678", "cpf": "123.456.789-00", "city": "Belo Horizonte", "email": "michele@email.com", "phone": "(31) 99999-9999", "state": "MG", "number": "100", "status": "Ativo", "street": "Rua das Flores", "endDate": "2026-06-02", "address": "Rua das Flores, 100 - Centro, Belo Horizonte - MG", "planType": "Trimestral", "planValue": "450,00", "startDate": "2026-03-02", "durationDays": "90", "installments": "3x", "neighborhood": "Centro", "paymentMethod": "Cartão de Crédito", "planValueWords": "Quatrocentos e cinquenta reais"}, "createdAt": "2026-03-02T18:00:00.000Z", "updatedAt": "2026-03-02T18:01:23.444Z", "waterGoal": "2.5L", "supplements": [{"id": "x9z2w1y5v", "name": "Whey Protein Isolado", "dosage": "30g", "timing": "Pós-treino ou lanche da tarde"}, {"id": "b7n4m3k8j", "name": "Creatina Monohidratada", "dosage": "5g", "timing": "Qualquer horário do dia, todos os dias"}, {"id": "c5l6p9o2i", "name": "Multivitamínico", "dosage": "1 cápsula", "timing": "Junto com o almoço"}], "consultantCpf": "000.000.000-00", "consultantName": "Team VBR", "protocolTitle": "Protocolo de Emagrecimento - Fase 1", "consultantEmail": "contato@teamvbr.com.br", "physicalData": {"age": "29", "imc": "24.5", "date": "2026-03-02", "gender": "Feminino", "height": "165", "weight": "67", "bodyFat": "28%", "muscleMass": "32%", "measurements": {"hip": "102", "calf": "36", "chest": "92", "waist": "74", "biceps": "28", "thighs": "58", "abdomen": "80", "forearms": "24"}, "visceralFat": "4", "observations": "Boa estrutura muscular, foco em reduzir gordura abdominal.", "waterPercentage": "52%"}, "trainingDays": [{"id": "d1f2g3h4", "focus": "Membros Inferiores (Ênfase em Quadríceps)", "title": "Treino A", "exercises": [{"id": "e1", "name": "Agachamento Livre", "sets": "4x 10-12"}, {"id": "e2", "name": "Leg Press 45°", "sets": "4x 12-15"}, {"id": "e3", "name": "Cadeira Extensora", "sets": "3x 15 + Drop Set"}, {"id": "e4", "name": "Afundo com Halteres", "sets": "3x 12 cada perna"}, {"id": "e5", "name": "Panturrilha no Leg Press", "sets": "4x 20"}]}, {"id": "i5j6k7l8", "focus": "Membros Superiores e Abdômen", "title": "Treino B", "exercises": [{"id": "e6", "name": "Supino Reto com Halteres", "sets": "3x 12"}, {"id": "e7", "name": "Puxada Alta Frente", "sets": "3x 12"}, {"id": "e8", "name": "Desenvolvimento com Halteres", "sets": "3x 12"}, {"id": "e9", "name": "Elevação Lateral", "sets": "3x 15"}, {"id": "e10", "name": "Tríceps Corda", "sets": "3x 15"}, {"id": "e11", "name": "Rosca Direta", "sets": "3x 15"}, {"id": "e12", "name": "Abdominal Supra", "sets": "4x 20"}]}], "consultantAddress": "Belo Horizonte, MG", "generalObservations": "Siga o plano com consistência. Beba água e descanse bem.", "nutritionalStrategy": "Déficit calórico moderado com alto aporte proteico.", "trainingFrequency": "4x por semana", "trainingReasoning": "Divisão AB para otimizar recuperação e frequência de estímulo.", "kcalGoal": "1600", "kcalSubtext": "kcal/dia"}');`;

  // ROTA DE CADASTRO (NOVO ALUNO)
  if (pageType === 'register') {
     return <StudentEntryForm onCancel={() => {
        window.location.hash = ''; 
     }} />;
  }

  // ROTA DO ALUNO (PORTAL)
  if (pageType === 'portal') {
    if (!isStudentAuthenticated || !studentData) {
      return <StudentLogin onLogin={handleStudentLogin} />;
    }
    return <StudentPortal studentData={studentData} onLogout={handleStudentLogout} />;
  }

  // ROTA DO CONSULTOR (ADMIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 my-10">
          <img src={LOGO_VBR_BLACK} alt="Team VBR Logo" className="h-28 w-auto mx-auto mb-8" />
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center text-black mx-auto mb-6"><Lock size={20} /></div>
              <h1 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Acesso Consultor</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-[#d4af37] transition-colors" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Senha Mestra" />
                {loginError && <p className="text-xs text-red-500 font-black uppercase">Senha incorreta.</p>}
                <button type="submit" className="w-full bg-[#d4af37] text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all">Entrar</button>
              </form>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <a href="#portal" className="text-white/30 text-[10px] uppercase font-bold tracking-widest hover:text-[#d4af37] transition-colors">
              Acesso do Aluno
            </a>
          </div>

          <p className="mt-8 text-white/20 text-[10px] uppercase font-bold tracking-widest">Team VBR System © 2026</p>
        </div>
      </div>
    );
  }

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
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { localStorage.removeItem('vbr_auth'); setIsAuthenticated(false); }} className="text-[9px] font-black uppercase text-white/20 hover:text-red-500">Sair</button>
          {data.id && activeView !== 'home' && activeView !== 'search' && activeView !== 'generator' && (
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
                  <h4 className="font-black uppercase text-sm text-red-500">Instalação Necessária</h4>
                  <p className="text-xs text-white/60">Tabelas não encontradas. Copie e execute o SQL no Supabase.</p>
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
            onLoadStudent={(p, view) => loadStudent(p, view)}
            onUpdateStudent={(p) => handleSave(true, p)} 
            onDeleteStudent={(id) => deleteStudent(id)} 
            onReload={loadData}
          />
        )}

        {activeView === 'generator' && (
           <ProtocolGenerator 
             onGenerate={handleGeneratedProtocol} 
             onCancel={() => setActiveView('home')} 
           />
        )}

        {activeView === 'search' && (
          <StudentSearch 
            protocols={savedProtocols} 
            onLoad={(p, view) => loadStudent(p, view)}
            onDelete={deleteStudent} 
            onUpdate={(p) => handleSave(true, p)} 
          />
        )}

        {activeView === 'student-dashboard' && (
          <StudentDashboard 
            data={data} 
            setView={(v, tab) => { 
              setActiveView(v as ViewMode); 
              if (tab) setMonitoringTab(tab as any);
            }} 
          />
        )}

        {activeView === 'manage' && (
          <UnifiedEditor 
            data={data} 
            onChange={(newData) => setData(newData)} 
            onBack={() => setActiveView('student-dashboard')} 
            onUpdateData={(newData, createHistory, forceNewId) => handleSave(false, newData, forceNewId)}
          />
        )}

        {activeView === 'monitoring' && data.id && (
           <StudentMonitoring 
              studentId={data.studentId || data.id} 
              currentProtocol={data}
              onUpdateProtocol={(p) => { setData(p); handleSave(true, p); }}
              onBack={() => setActiveView('student-dashboard')}
              initialTab={monitoringTab}
           />
        )}

      </main>
    </div>
  );
};

export default App;
