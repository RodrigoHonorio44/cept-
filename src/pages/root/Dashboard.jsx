import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth'; 
import DashboardLayout from '../../layouts/dashboardlayout'; 
import FormUsuarioSistema from '../../components/forms/formusuariosistema'; 
import GerenciarNoticias from '../root/GerenciarNoticias'; 
import { 
  Users, Activity, HardDrive, UserPlus, Search, 
  ShieldCheck, MoreVertical, Settings, LayoutDashboard,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

export default function DashboardRoot() {
  const { userdata } = useAuth();
  const [sidebar_open, set_sidebar_open] = useState(true); // r s: controle sidebar
  const [active_tab, set_active_tab] = useState('usuarios'); 
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [usuarios, set_usuarios] = useState([]);
  const [busca, set_busca] = useState('');

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("criado_em", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        nome: doc.data().nome?.toLowerCase() || '',
        email: doc.data().email?.toLowerCase() || ''
      }));
      set_usuarios(docs);
    });
    return () => unsubscribe();
  }, []);

  const usuarios_filtrados = usuarios.filter(u => 
    u.nome.includes(busca.toLowerCase()) || 
    u.email.includes(busca.toLowerCase())
  );

  return (
    // ESTRUTURA DE TRAVA H-SCREEN r s
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans antialiased text-slate-900">
      
      {/* SIDEBAR ROOT r s */}
      <aside className={`${sidebar_open ? "w-72" : "w-24"} bg-[#0f172a] flex flex-col transition-all duration-500 relative z-50 shrink-0`}>
        <button
          onClick={() => set_sidebar_open(!sidebar_open)}
          className="absolute -right-3 top-12 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full shadow-sm z-60"
        >
          {sidebar_open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="h-28 flex items-center px-8 border-b border-white/5">
          <h1 className={`text-white font-black italic uppercase tracking-tighter transition-all ${sidebar_open ? "text-2xl" : "text-xl mx-auto"}`}>
            {sidebar_open ? <>Cept <span className="text-blue-500">Root</span></> : "R"}
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavButton 
            icon={LayoutDashboard} label="usuários" 
            active={active_tab === 'usuarios'} 
            onClick={() => set_active_tab('usuarios')}
            sidebar_open={sidebar_open} 
          />
          <NavButton 
            icon={Settings} label="notícias" 
            active={active_tab === 'configuracoes'} 
            onClick={() => set_active_tab('configuracoes')}
            sidebar_open={sidebar_open} 
          />
        </nav>

        <div className="p-4 border-t border-white/5 text-center">
            <p className={`text-[8px] font-black text-slate-600 uppercase mb-4 ${!sidebar_open && 'hidden'}`}>r s 2026 system</p>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL r s */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER FIXO r s */}
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">
              comando <span className="text-blue-600">root</span>
            </h1>
            <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase mt-0.5">
              operador: {userdata?.nome?.toLowerCase() || 'admin'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => set_is_modal_open(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <UserPlus size={16} /> {sidebar_open && "novo acesso"}
            </button>
          </div>
        </header>

        {/* ÁREA DE SCROLL INDEPENDENTE r s */}
        <section className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {active_tab === 'usuarios' ? (
              <>
                {/* CARDS INDICADORES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="total acessos" value={usuarios.length} color="blue" icon={Users} />
                  <StatCard label="ativos" value={usuarios.filter(u => u.status === 'ativo').length} color="green" icon={Activity} />
                  <StatCard label="servidor" value="online" color="orange" icon={HardDrive} />
                </div>

                {/* TABELA GESTÃO */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2 rounded-xl text-white">
                        <ShieldCheck size={18} />
                      </div>
                      <h3 className="font-black text-slate-800 uppercase italic text-sm">gestão global de acessos</h3>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="localizar..." 
                        className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-bold w-64 focus:ring-2 focus:ring-blue-600 outline-none lowercase"
                        onChange={(e) => set_busca(e.target.value)}
                      />
                    </div>
                  </div>

                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-5">usuário</th>
                        <th className="px-8 py-5">nível</th>
                        <th className="px-8 py-5">integração</th>
                        <th className="px-8 py-5 text-right">ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {usuarios_filtrados.map((user) => (
                        <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-700 text-xs lowercase">{user.nome}</span>
                              <span className="text-[10px] text-slate-400 lowercase">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${
                              user.role === 'root' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-[11px] text-slate-500 font-bold italic">
                            {user.criado_em ? new Date(user.criado_em).toLocaleDateString() : '---'}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="text-slate-300 hover:text-blue-600 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GerenciarNoticias />
              </div>
            )}
          </div>
        </section>
      </main>

      <FormUsuarioSistema 
        isOpen={is_modal_open} 
        onClose={() => set_is_modal_open(false)} 
      />
    </div>
  );
}

// COMPONENTES AUXILIARES r s
function NavButton({ icon: Icon, label, active, sidebar_open, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
      active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "text-slate-500 hover:bg-white/5 hover:text-white"
    } ${!sidebar_open && "justify-center px-0"}`}>
      <Icon size={22} />
      {sidebar_open && <span>{label}</span>}
    </button>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-500",
    orange: "bg-orange-50 text-orange-500",
  };
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-3xl font-black tracking-tighter ${value === 'online' ? 'text-emerald-500' : 'text-slate-900'}`}>
            {value}
        </h3>
      </div>
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}