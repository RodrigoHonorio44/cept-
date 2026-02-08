import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Regra R S: E-mail sempre tratado para lowercase e sem espaços
      const emailLimpo = email.toLowerCase().trim();
      
      console.log("🚀 Autenticando R S:", emailLimpo);
      
      // r s: A senha NÃO deve ter toLowerCase(), pois senhas são case-sensitive no Firebase
      await signInWithEmailAndPassword(auth, emailLimpo, senha);
      
      // O AppRoutes detectará a mudança de estado e o userData.deve_trocar_senha
      
    } catch (err) {
      console.error("Erro Auth R S:", err.code);
      
      // r s: Unificando erros de credenciais para maior segurança
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        setErro('E-mail ou senha incorretos r s.');
      } else if (err.code === 'auth/too-many-requests') {
        setErro('Muitas tentativas. Tente mais tarde r s.');
      } else {
        setErro('Erro ao acessar o sistema r s.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Área de Acesso CEPT</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Identifique-se para comando</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">E-mail Operacional</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold lowercase"
                placeholder="ro@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-14 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                placeholder="••••••••"
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
              <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest leading-none">{erro}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-[#0f172a] hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase italic tracking-widest disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Validar Acesso CEPT"}
          </button>
        </form>
      </div>
    </div>
  );
}