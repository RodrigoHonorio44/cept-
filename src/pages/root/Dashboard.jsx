import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth'; // r s: lowercase
import DashboardLayout from '../../layouts/dashboardlayout'; // r s: lowercase
import FormUsuarioSistema from '../../components/forms/formusuariosistema'; // r s: lowercase
import GerenciarNoticias from '../root/GerenciarNoticias'; // r s: importação do novo componente
import { 
  Users, 
  Activity, 
  HardDrive, 
  UserPlus, 
  Search, 
  ShieldCheck,
  MoreVertical,
  Settings,
  LayoutDashboard
} from 'lucide-react';

export default function DashboardRoot() {
  const { userdata } = useAuth(); // r s: lowercase
  const [active_tab, set_active_tab] = useState('usuarios'); // r s: controle de abas
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [usuarios, set_usuarios] = useState([]);
  const [busca, set_busca] = useState('');

  // monitoramento real r s
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("criado_em", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set_usuarios(docs);
    });
    return () => unsubscribe();
  }, []);

  // filtro de busca r s
  const usuarios_filtrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <DashboardLayout active_tab={active_tab} set_active_tab={set_active_tab}>
      <div className="space-y-8 pb-20">
        
        {/* header estratégico root r s */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              comando <span className="text-cept-blue">root</span>
            </h1>
            <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mt-1 leading-none">
              controle global - r s 2026 | operador: {userdata?.nome?.toLowerCase() || 'admin'}
            </p>
          </div>

          <div className="flex gap-3">
            {/* abas de navegação rápida r s */}
            <nav className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                <button 
                    onClick={() => set_active_tab('usuarios')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active_tab === 'usuarios' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <Users size={14} /> usuários
                </button>
                <button 
                    onClick={() => set_active_tab('configuracoes')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active_tab === 'configuracoes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <Settings size={14} /> configurações
                </button>
            </nav>
          </div>
        </header>

        {active_tab === 'usuarios' ? (
          <>
            {/* cards de indicadores r s */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                label="total de acessos" 
                value={usuarios.length} 
                icon={<Users size={28} />} 
                bgColor="bg-blue-50" 
                textColor="text-cept-blue" 
              />
              <StatCard 
                label="usuários ativos" 
                value={usuarios.filter(u => u.status === 'ativo').length} 
                icon={<Activity size={28} />} 
                bgColor="bg-green-50" 
                textColor="text-green-500" 
              />
              <StatCard 
                label="status servidor" 
                value="online" 
                icon={<HardDrive size={28} />} 
                bgColor="bg-orange-50" 
                textColor="text-orange-500" 
              />
            </div>

            {/* área de gestão de usuários r s */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2.5 rounded-xl text-white">
                    <ShieldCheck size={18} />
                  </div>
                  <h2 className="font-black text-slate-800 uppercase tracking-tight italic">gestão de acessos r s</h2>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text" 
                            placeholder="localizar usuário..." 
                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full outline-none focus:ring-2 focus:ring-cept-blue"
                            onChange={(e) => set_busca(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => set_is_modal_open(true)}
                        className="p-3 bg-cept-blue text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <tr>
                      <th className="px-10 py-5">usuário</th>
                      <th className="px-10 py-5">nível / cargo</th>
                      <th className="px-10 py-5">data integração</th>
                      <th className="px-10 py-5 text-right">ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usuarios_filtrados.map((user) => (
                      <tr key={user.uid} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-700 text-sm lowercase">{user.nome}</span>
                            <span className="text-[11px] text-slate-400 lowercase">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            user.role === 'root' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-[12px] text-slate-500 font-bold italic">
                          {user.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : '--/--/--'}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="text-slate-300 hover:text-cept-blue transition-colors p-2 hover:bg-white rounded-lg shadow-sm">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* aba de configurações: gerenciador de notícias r s */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <GerenciarNoticias />
          </div>
        )}
      </div>

      <FormUsuarioSistema 
        isOpen={is_modal_open} 
        onClose={() => set_is_modal_open(false)} 
      />
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, bgColor, textColor }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
      <div>
        <h4 className="text-slate-400 font-black text-[10px] uppercase mb-1 tracking-widest">{label}</h4>
        <p className={`text-4xl font-black tracking-tighter ${value === 'online' ? 'text-emerald-500' : 'text-slate-900'}`}>
          {value}
        </p>
      </div>
      <div className={`p-5 ${bgColor} ${textColor} rounded-[1.5rem] transition-transform group-hover:scale-110`}>
        {icon}
      </div>
    </div>
  );
}