import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../hooks/useAuth'; 
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import FormSolicitacaoSecretaria from '../secretaria/forms/FormSolicitacaoSecretaria';
// ACRESCENTADO: Importação do novo formulário
import FormCadastroAluno from '../secretaria/forms/formCadastroAluno'; 

import { 
  UserPlus, Clock, CheckCircle, Users, Search, 
  ArrowRight, ClipboardList, LayoutDashboard, 
  ShieldCheck, Settings, LogOut, ChevronLeft, ChevronRight, Home, X, Plus
} from 'lucide-react';

export default function DashboardSecretaria() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ACRESCENTADO: Estado para o novo modal de cadastro
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0 });
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, "solicitacoes_acesso"),
      orderBy("dataSolicitacao", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        nome: doc.data().nome?.toLowerCase() || '',
        email: doc.data().email?.toLowerCase() || '',
        role: doc.data().role?.toLowerCase() || 'estudante'
      }));
      setSolicitacoes(docs);
      setStats({
        pendentes: docs.filter(d => d.status === 'pendente').length,
        aprovados: docs.filter(d => d.status === 'aprovado').length
      });
    });
    return () => unsubscribe();
  }, []);

  const lidar_com_logout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("erro ao sair:", error);
    }
  };

  const dadosFiltrados = solicitacoes.filter(s => 
    s.nome.includes(busca.toLowerCase()) || s.email.includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] font-sans antialiased text-slate-900 flex overflow-hidden z-[9999]">
      
      {/* SIDEBAR R S */}
      <aside className={`${sidebarOpen ? "w-72" : "w-24"} bg-[#0f172a] flex flex-col transition-all duration-500 relative z-50 shrink-0 h-full`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-12 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full shadow-sm z-[60] hover:text-blue-600 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="h-28 flex items-center px-8 border-b border-white/5 shrink-0">
          <h1 className={`text-white font-black italic uppercase tracking-tighter transition-all ${sidebarOpen ? "text-2xl" : "text-xl mx-auto"}`}>
            {sidebarOpen ? <>Cept <span className="text-blue-500">Secretária</span></> : "C"}
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavButton icon={LayoutDashboard} label="dashboard" active sidebarOpen={sidebarOpen} onClick={() => {}} />
          <NavButton icon={ShieldCheck} label="aprovações" sidebarOpen={sidebarOpen} onClick={() => {}} />
          <NavButton icon={Settings} label="configurações" sidebarOpen={sidebarOpen} onClick={() => {}} />
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavButton 
              icon={Home} label="ver site" 
              sidebarOpen={sidebarOpen} 
              onClick={() => navigate('/')} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/10 shrink-0">
          <button 
            onClick={lidar_com_logout}
            className={`flex items-center gap-4 w-full p-4 text-red-400 rounded-2xl hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest ${!sidebarOpen && "justify-center"}`}
          >
            <LogOut size={22} />
            {sidebarOpen && <span>deslogar</span>}
          </button>
          <p className={`text-[8px] font-black text-slate-600 uppercase mt-4 text-center ${!sidebarOpen && 'hidden'}`}>
             2026 system
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">secretaria escolar</h2>
            <h1 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">centro de operações</h1>
          </div>

          {/* AREA DE BOTÕES: Mantido o original e acrescentado o novo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-200 transition-all active:scale-95"
            >
              <UserPlus size={18} /> {sidebarOpen && "Solicitar Acesso"}
            </button>

            <button 
              onClick={() => setIsCadastroModalOpen(true)}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} /> {sidebarOpen && "Cadastrar Aluno"}
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="aguardando" value={stats.pendentes} color="amber" icon={Clock} />
              <StatCard title="aprovados" value={stats.aprovados} color="emerald" icon={CheckCircle} />
              <StatCard title="ativos" value="--" color="blue" icon={Users} />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl text-white">
                    <ClipboardList size={18} />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase italic text-sm">Últimas Movimentações</h3>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="localizar..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-bold w-64 focus:ring-2 focus:ring-blue-600 outline-none lowercase"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-5">candidato</th>
                      <th className="px-8 py-5">categoria</th>
                      <th className="px-8 py-5">data</th>
                      <th className="px-8 py-5 text-right">situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dadosFiltrados.map((sol) => (
                      <tr key={sol.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-700 text-xs lowercase">{sol.nome}</span>
                            <span className="text-[10px] text-slate-400 lowercase">{sol.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 uppercase text-[9px] font-black text-slate-500">{sol.role}</td>
                        <td className="px-8 py-6 text-[11px] text-slate-500 font-bold italic">
                          {sol.dataSolicitacao?.seconds ? new Date(sol.dataSolicitacao.seconds * 1000).toLocaleDateString() : '08/02/2026'}
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                sol.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {sol.status}
                              </span>
                              <ArrowRight size={14} className="text-slate-200 group-hover:text-blue-600 transition-all cursor-pointer" />
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="pt-10 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                cept  — comando central 2026
              </p>
            </footer>
          </div>
        </section>
      </main>

      {/* MODAL ORIGINAL 1 */}
      <FormSolicitacaoSecretaria isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ACRESCENTADO: MODAL PARA O NOVO formCadastroAluno */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCadastroModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-white rounded-[40px] shadow-2xl custom-scrollbar">
            <button 
              onClick={() => setIsCadastroModalOpen(false)}
              className="absolute top-8 right-8 z-[110] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <FormCadastroAluno />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, sidebarOpen, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
      active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "text-slate-500 hover:bg-white/5 hover:text-white"
    } ${!sidebarOpen && "justify-center px-0"}`}>
      <Icon size={22} />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    amber: "bg-orange-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-600",
  };
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-center mb-6">
        <div className={`${colors[color]} p-3 rounded-2xl text-white shadow-lg`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}