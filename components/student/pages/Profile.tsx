import React from 'react';
import { ProtocolData } from '../../../types';
import { User, Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';

interface Props {
  data: ProtocolData;
}

const StudentProfile: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Meu Perfil
        </h1>
        <p className="text-white/40 text-sm font-medium">
          Seus dados cadastrais e informações de contrato.
        </p>
      </header>

      <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="w-24 h-24 rounded-full bg-[#d4af37] flex items-center justify-center text-black text-3xl font-black border-4 border-[#111] shadow-[0_0_0_4px_#d4af37]">
            {data.clientName.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{data.clientName}</h2>
            <p className="text-white/40 text-sm font-medium">Aluno Team VBR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-[#d4af37] font-black uppercase text-xs tracking-widest border-b border-white/5 pb-2 mb-4">Dados Pessoais</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase">E-mail</p>
                <p className="text-white font-medium">{data.contract.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase">Telefone</p>
                <p className="text-white font-medium">{data.contract.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase">Endereço</p>
                <p className="text-white font-medium text-sm">{data.contract.address || '-'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[#d4af37] font-black uppercase text-xs tracking-widest border-b border-white/5 pb-2 mb-4">Contrato</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase">Plano Ativo</p>
                <p className="text-white font-medium">{data.contract.planType || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase">Vigência</p>
                <p className="text-white font-medium text-sm">
                  {data.contract.startDate} até {data.contract.endDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
