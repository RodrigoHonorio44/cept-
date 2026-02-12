import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import { useDashboard } from '../../hooks/useDashboard'; 
import FormUsuarioSistema from '../root/forms/formusuariosistema'; 
import GerenciarNoticias from '../root/GerenciarNoticias'; 
import { 
  Users, Activity, HardDrive, UserPlus, Search, 
  ShieldCheck, MoreVertical, Settings, LayoutDashboard,
  ChevronLeft, ChevronRight, CheckCircle, Clock,
  Home, LogOut 
} from 'lucide-react';

export default function DashboardRoot() {
  const { userdata, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebar_open, set_sidebar_open] = useState(true);
  
  const { 
    active_tab, set_active_tab, 
    usuarios, pedidos, 
    total_usuarios, total_pedidos,
    busca, set_busca, 
    is_modal_open, set_is_modal_open,
    formatar_nome, // r s: Mantido conforme solicitado
    atualizar_e_fechar,
    pedido_selecionado, 
    abrir_com_pedido
  } = useDashboard();

  // r s: Função interna para garantir exibição com letras normais (Ex: Caio Giromba)
  const exibirNormal = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // r s: Tratamento de data para incluir hora (Firebase Timestamp ou Date)
  const formatarDataHora = (ts) => {
    if (!ts) return '---';
    try {
      const data = ts.toDate ? ts.toDate() : new Date(ts);
      return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '---'; }
  };

  const lidar_com_logout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("erro ao sair r s:", error);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans antialiased text-slate-900">
      
      {/* SIDEBAR ROOT r s */}
      <aside className={`${sidebar_open ? "w-72" : "w-24"} bg-[#0f172a] flex flex-col transition-all duration-500 relative z-50 shrink-0 h-full`}>
        <button
          onClick={() => set_sidebar_open(!sidebar_open)}
          className="absolute -right-3 top-12 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full shadow-sm z-[60] hover:text-blue-600 transition-colors"
        >
          {sidebar_open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="h-28 flex items-center px-8 border-b border-white/5 shrink-0">
          <h1 className={`text-white font-black italic uppercase tracking-tighter transition-all ${sidebar_open ? "text-2xl" : "text-xl mx-auto"}`}>
            {sidebar_open ? <>Cept <span className="text-blue-500">Root</span></> : "R"}
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavButton 
            icon={LayoutDashboard} label="usuários" 
            active={active_tab === 'usuarios'} 
            onClick={() => set_active_tab('usuarios')}
            sidebar_open={sidebar_open} 
          />
          <NavButton 
            icon={Clock} label="pedidos" 
            active={active_tab === 'pedidos'} 
            onClick={() => set_active_tab('pedidos')}
            sidebar_open={sidebar_open}
            badge={total_pedidos > 0 ? total_pedidos : null}
          />
          <NavButton 
            icon={Settings} label="notícias" 
            active={active_tab === 'configuracoes'} 
            onClick={() => set_active_tab('configuracoes')}
            sidebar_open={sidebar_open} 
          />

          <div className="pt-4 mt-4 border-t border-white/5">
            <NavButton 
              icon={Home} label="ir para home" 
              active={false} 
              onClick={() => navigate('/')}
              sidebar_open={sidebar_open} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/10 shrink-0">
            <button 
              onClick={lidar_com_logout}
              className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all ${!sidebar_open && "justify-center px-0"}`}
            >
              <LogOut size={22} />
              {sidebar_open && <span>deslogar</span>}
            </button>
            <p className={`text-[8px] font-black text-slate-600 uppercase mt-4 text-center ${!sidebar_open && 'hidden'}`}>
              r s 2026 system
            </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">
              comando <span className="text-blue-600">root</span>
            </h1>
            <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase mt-0.5">
              operador: {exibirNormal(userdata?.nome) || 'admin'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                set_busca(''); // Limpa busca ao abrir manual
                set_is_modal_open(true);
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <UserPlus size={16} /> {sidebar_open && "novo acesso manual"}
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="p-10 space-y-8 max-w-7xl mx-auto w-full pb-20">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="total acessos" value={total_usuarios} color="blue" icon={Users} />
              <StatCard label="pedidos pendentes" value={total_pedidos} color="orange" icon={Clock} />
              <StatCard label="servidor" value="online" color="green" icon={HardDrive} />
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center px-8">
               <Search className="text-slate-300 mr-4" size={20} />
               <input 
                  type="text" 
                  value={busca}
                  onChange={(e) => set_busca(e.target.value)}
                  placeholder={`localizar em ${active_tab}...`} 
                  className="bg-transparent border-none outline-none w-full font-bold text-sm lowercase"
               />
            </div>

            {active_tab === 'usuarios' && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
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
                      {usuarios.map((user) => (
                        <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              {/* r s: Exibição Capitalizada */}
                              <span className="font-black text-slate-700 text-xs">{exibirNormal(user.nome)}</span>
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
                            {user.criado_em ? formatarDataHora(user.criado_em) : '---'}
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
              </div>
            )}

            {active_tab === 'pedidos' && (
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase italic text-sm">solicitações de acesso</h3>
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-4 py-1 rounded-full uppercase italic">r s — central de chamados</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                        <tr>
                          <th className="px-8 py-5">interessado / protocolo</th>
                          <th className="px-8 py-5">origem</th>
                          <th className="px-8 py-5">data / hora</th>
                          <th className="px-8 py-5 text-right">comando</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {pedidos.map((ped) => (
                          <tr key={ped.id} className="group hover:bg-blue-50/30 transition-all">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-700 text-xs">{exibirNormal(ped.nome)}</span>
                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">PROTO: {ped.protocolo || '---'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-slate-600 uppercase italic">{exibirNormal(ped.solicitadoPor || 'externo')}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{ped.role}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-[10px] text-slate-500 font-black italic">
                              {ped.dataSolicitacao ? formatarDataHora(ped.dataSolicitacao) : '---'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => abrir_com_pedido(ped)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-blue-700 transition-all flex items-center gap-2 ml-auto shadow-md active:scale-95"
                              >
                                <CheckCircle size={14} /> liberar acesso r s
                              </button>
                            </td>
                          </tr>
                        ))}
                        {pedidos.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                              nenhuma solicitação pendente no sistema
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            )}

            {active_tab === 'configuracoes' && <GerenciarNoticias />}

            <footer className="mt-10 pb-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center pt-6">
                  cept r s — comando central 2026
                </p>
            </footer>
          </div>
        </section>
      </main>

      {/* r s: Modal recebendo dadosPreenchidos do hook para auto-complete */}
      <FormUsuarioSistema 
        isOpen={is_modal_open} 
        onClose={atualizar_e_fechar} 
        aoSucesso={atualizar_e_fechar}
        dadosPreenchidos={pedido_selecionado}
      />
    </div>
  );
}

// ... (NavButton e StatCard permanecem os mesmos conforme seu código original)

function NavButton({ icon: Icon, label, active, sidebar_open, onClick, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 relative ${
      active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
    } ${!sidebar_open && "justify-center px-0"}`}>
      <Icon size={22} />
      {sidebar_open && <span>{label}</span>}
      {badge && (
        <span className="absolute right-4 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-500",
    orange: "bg-orange-50 text-orange-500",
  };
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:border-blue-100">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black tracking-tighter text-slate-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}