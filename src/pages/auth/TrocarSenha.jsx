import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrocarSenha() {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const { atualizarSenhaPrimeiroAcesso, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  // Regras r s
  const temMaiuscula = /[A-Z]/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  const temTamanhoMin = senha.length >= 6;

  // r s: Se o usuário entrar aqui e já tiver trocado, manda pro dash
  useEffect(() => {
    if (userData && userData.deve_trocar_senha === false) {
      navigate('/dashboard');
    }
  }, [userData, navigate]);

  const handleTroca = async (e) => {
    e.preventDefault();
    
    if (!temTamanhoMin || !temMaiuscula || !temEspecial) {
      toast.error("a senha não atende aos requisitos r s");
      return;
    }

    if (senha !== confirmar) {
      toast.error("as senhas não coincidem r s");
      return;
    }

    try {
      // r s: enviamos a senha para o context que cuidará do Auth e do Firestore
      await atualizarSenhaPrimeiroAcesso(senha); 
      toast.success("senha atualizada! acesso liberado r s");
      
      // r s: após o sucesso, redireciona para o dashboard
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      toast.error("erro ao atualizar. tente novamente r s.");
    }
  };

  const BadgeValidacao = ({ condicao, texto }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${condicao ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
      {condicao ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      <span className="text-[10px] font-black uppercase tracking-tight">{texto}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex items-center justify-center px-4 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 my-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="text-blue-600" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
            comando r s: troca obrigatória
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-4 leading-tight">
            olá {userData?.nome || 'operador'}, defina sua credencial definitiva.
          </p>
        </div>

        <form onSubmit={handleTroca} className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type={verSenha ? "text" : "password"}
                placeholder="nova senha"
                className="w-full pl-14 pr-12 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600"
              >
                {verSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <BadgeValidacao condicao={temTamanhoMin} texto="6+ digitos" />
              <BadgeValidacao condicao={temMaiuscula} texto="1 maiúscula" />
              <BadgeValidacao condicao={temEspecial} texto="1 especial" />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type={verConfirmar ? "text" : "password"}
              placeholder="confirmar nova senha"
              className="w-full pl-14 pr-12 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setVerConfirmar(!verConfirmar)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600"
            >
              {verConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f172a] hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all uppercase italic tracking-[0.2em] text-[11px] shadow-xl flex items-center justify-center gap-3 group active:scale-95"
          >
            validar e entrar <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}