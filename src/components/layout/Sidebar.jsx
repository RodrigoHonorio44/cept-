import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // r s: minúsculo
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MENU_STRUCTURE } from '../../config/menuConfig'; // r s: minúsculo
import { 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const [pendentes, set_pendentes] = useState(0);

  useEffect(() => {
    if (role === 'root') {
      const q = query(collection(db, "solicitacoes_acesso"), where("status", "==", "pendente"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        set_pendentes(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [role]);

  const handle_logout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("erro ao sair r s:", error);
    }
  };

  const current_menu = MENU_STRUCTURE[role] || [];

  return (
    /* r s fix: removemos o 'fixed' e deixamos o flexbox do layout controlar.
       adicionamos flex-shrink-0 para ela não esmagar. */
    <aside className="w-72 h-full bg-slate-900 flex flex-col text-slate-300 shadow-2xl flex-shrink-0 z-50">
      
      {/* header r s */}
      <div className="p-8 flex items-center gap-3 border-b border-slate-800/50">
        <div className="bg-cept-blue p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
          <ShieldCheck className="text-white" size={26} />
        </div>
        <div>
          <h2 className="text-white font-black text-2xl tracking-tighter leading-none italic">CEPT</h2>
          <span className="text-[9px] uppercase font-black text-cept-blue tracking-[0.3em]">painel r s</span>
        </div>
      </div>

      {/* navegação dinâmica */}
      <nav className="flex-grow p-5 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest px-4 mb-4 opacity-50">
          menu {role}
        </p>
        
        {current_menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all duration-300 group
              ${isActive 
                ? 'bg-cept-blue text-white shadow-xl shadow-blue-600/20' 
                : 'hover:bg-slate-800/50 hover:text-white text-slate-400'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="font-black text-sm tracking-tight lowercase">{item.label}</span>
            </div>

            {item.badge && pendentes > 0 ? (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/40">
                {pendentes}
              </span>
            ) : (
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* perfil e logout r s */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-cept-blue text-xs italic">
            {role?.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-black truncate uppercase tracking-tighter">{role}</p>
            <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">sessão ativa</p>
          </div>
        </div>

        <button 
          onClick={handle_logout}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          sair do sistema
        </button>
      </div>
    </aside>
  );
}