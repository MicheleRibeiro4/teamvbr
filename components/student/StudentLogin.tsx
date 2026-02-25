import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { LOGO_VBR_BLACK } from '../../constants';

interface StudentLoginProps {
  onLogin: (phone: string, password?: string) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulação de login
    setTimeout(() => {
      if (phone && password) {
        onLogin(phone, password);
      } else {
        setError('Credenciais inválidas. Tente novamente.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <img src={LOGO_VBR_BLACK} alt="Team VBR" className="h-24 mx-auto mb-6 opacity-90" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Área do Aluno</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2 font-bold">Acesse seu protocolo exclusivo</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 ml-1">Celular de Acesso</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 ml-1">Senha (CPF - Apenas números)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none text-sm"
                placeholder="Apenas números"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Acessando...' : 'Entrar no Portal'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => alert('Sua senha é o seu CPF (apenas números).\n\nCaso tenha problemas para acessar, entre em contato com seu consultor.')}
              className="text-[10px] text-white/30 hover:text-[#d4af37] transition-colors uppercase font-bold tracking-wider border-b border-transparent hover:border-[#d4af37] bg-transparent outline-none"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
          Team VBR System © 2026
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
