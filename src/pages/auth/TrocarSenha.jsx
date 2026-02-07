import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast'; // r s: importação do toast

export default function TrocarSenha() {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false); // r s: novo estado para o olho da contra-senha
  const { atualizarSenhaPrimeiroAcesso, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const temMaiuscula = /[A-Z]/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  const temTamanhoMin = senha.length >= 6;

  const handleTroca = async (e) => {
    e.preventDefault();
    
    if (!temTamanhoMin || !temMaiuscula || !temEspecial) {
      toast.error("a senha não atende aos requisitos de segurança r s");
      return;
    }

    if (senha !== confirmar) {
      toast.error("as senhas não coincidem r s");
      return;
    }

    try {
      const senhaPadronizada = senha.toLowerCase();
      await atualizarSenhaPrimeiroAcesso(senhaPadronizada);
      toast.success("senha atualizada com sucesso! r s");
      navigate('/'); 
    } catch (error) {
      console.error(error);
      toast.error("erro ao atualizar. faça login novamente r s.");
    }
  };

  const BadgeValidacao = ({ condicao, texto }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${condicao ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
      {condicao ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      <span className="text-[10px] font-black uppercase tracking-tight">{texto}</span>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cept-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-cept-blue" size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
            primeiro acesso ao C.E.P.T
          </h2>
          <p className="text-sm text-slate-400 font-bold lowercase mt-2 leading-tight">
            olá {userData?.nome || 'usuário'}, por segurança, altere sua senha inicial para continuar.
          </p>
        </div>

        <form onSubmit={handleTroca} className="space-y-4">
          {/* Campo Nova Senha */}
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={verSenha ? "text" : "password"}
                placeholder="nova senha"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cept-blue transition-all font-bold text-sm shadow-inner"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cept-blue transition-colors"
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <BadgeValidacao condicao={temTamanhoMin} texto="6+ caracteres" />
              <BadgeValidacao condicao={temMaiuscula} texto="1 maiúscula" />
              <BadgeValidacao condicao={temEspecial} texto="1 especial" />
            </div>
          </div>

          {/* Campo Confirmar Senha com Olho r s */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={verConfirmar ? "text" : "password"}
              placeholder="confirmar nova senha"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cept-blue transition-all font-bold text-sm shadow-inner"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setVerConfirmar(!verConfirmar)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cept-blue transition-colors"
            >
              {verConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-cept-blue hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all uppercase italic tracking-widest text-sm shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group mt-2"
          >
            atualizar e acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}