import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import DashboardLayout from '../../layouts/dashboardlayout';
import FormUsuarioSistema from '../../pages/root/forms/formusuariosistema'; // import minúsculo
import { KeyRound, UserPlus, ShieldCheck, Mail, Search } from 'lucide-react';

export default function UsersManagement() {
  const [usuarios, set_usuarios] = useState([]);
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [busca, set_busca] = useState('');

  // 1. listener em tempo real r s (melhor que getDocs para ver mudanças na hora)
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set_usuarios(lista);
    });
    return () => unsubscribe();
  }, []);

  // 2. função de reset de senha r s
  const handle_reset_password = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`e-mail de redefinição enviado com sucesso para: ${email}`);
    } catch (error) {
      alert("erro ao enviar reset r s: " + error.message);
    }
  };

  // 3. filtro de busca em lowercase
  const usuarios_filtrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* header r s */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              gestão de usuários
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              controle de acessos r s • 2026
            </p>
          </div>
          
          <button 
            onClick={() => set_is_modal_open(true)}
            className="bg-cept-blue text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-blue-100 text-xs uppercase"
          >
            <UserPlus size={20} /> novo usuário sistema
          </button>
        </header>

        {/* barra de busca r s */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="buscar por nome ou email..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-cept-blue text-sm font-bold"
            onChange={(e) => set_busca(e.target.value)}
          />
        </div>

        {/* tabela r s */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">nome do operador</th>
                <th className="px-8 py-5">identificação / e-mail</th>
                <th className="px-8 py-5">nível r s</th>
                <th className="px-8 py-5 text-right">segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios_filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="font-black text-slate-700 text-sm lowercase tracking-tight">
                        {u.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-xs font-bold lowercase">
                    {u.email}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                      u.role === 'root' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-cept-blue'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handle_reset_password(u.email)}
                      className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all"
                    >
                      <KeyRound size={14} /> resetar senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal de cadastro r s */}
      <FormUsuarioSistema 
        isOpen={is_modal_open} 
        onClose={() => set_is_modal_open(false)} 
      />
    </DashboardLayout>
  );
}