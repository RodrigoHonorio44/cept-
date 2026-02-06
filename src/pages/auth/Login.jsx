import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toLowerCase } from '../../utils/Formatters';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Regra R S: Sempre lowercase para busca padronizada
      const emailLimpo = toLowerCase(email);
      console.log("Tentando login R S para:", emailLimpo);
      
      const userCredential = await signInWithEmailAndPassword(auth, emailLimpo, senha);
      const uid = userCredential.user.uid;
      
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || 'aluno';

        console.log("Acesso autorizado. Cargo detectado:", role);

        // R S: Substituímos window.location por navigate. 
        // O { replace: true } impede que o usuário volte para o login ao clicar no 'voltar' do navegador.
        if (role === 'root') {
          navigate('/root/dashboard', { replace: true });
        } else if (role === 'professor') {
          navigate('/professor/dashboard', { replace: true });
        } else {
          navigate('/aluno/dashboard', { replace: true });
        }
      } else {
        setErro('Perfil não encontrado no sistema.');
      }
    } catch (err) {
      console.error("Erro Auth:", err.code);
      setErro('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Área de Acesso</h2>
          <p className="text-slate-500 text-sm mt-2">Identifique-se para acessar os portais.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-cept-blue/10 outline-none transition-all"
                placeholder="seu-email@cept.com.br"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:ring-4 focus:ring-cept-blue/10 outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cept-blue transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center uppercase tracking-tighter">{erro}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-cept-blue hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}