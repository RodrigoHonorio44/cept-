import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../hooks/useAuth'; 
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

// COMPONENTES DE FORMULÁRIO
import FormSolicitacaoSecretaria from '../secretaria/forms/FormSolicitacaoSecretaria';
import FormCadastroAluno from '../secretaria/forms/formCadastroAluno'; 

// SERVIÇOS RS
import GeradorDocumento from './servicos/GeradorDocumento'; 
import PainelDocumentos from './servicos/PainelDocumentos'; 
import ModalDeclaracao from './modals/ModalDeclaracao'; // Importação do Modal de Resposta

import { 
  UserPlus, Clock, CheckCircle, Users, Search, 
  ArrowRight, ClipboardList, LayoutDashboard, 
  ShieldCheck, Settings, LogOut, ChevronLeft, ChevronRight, Home, X, Plus, FileText
} from 'lucide-react';

export default function DashboardSecretaria() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ESTADOS DOS MODAIS
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [documentoAtivo, setDocumentoAtivo] = useState(null); 
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // Estado para abrir o formulário de resposta

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0 });
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const qAcesso = query(collection(db, "solicitacoes_acesso"), orderBy("dataSolicitacao", "desc"), limit(10));
    const qSecretaria = query(collection(db, "solicitacoes_secretaria"), orderBy("data_pedido", "desc"), limit(20));

    const processarDocs = (snapshotAcesso, snapshotSec) => {
      const docsAcesso = snapshotAcesso.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        nome: doc.data().nome?.toLowerCase() || '',
        email: doc.data().email?.toLowerCase() || '',
        role: doc.data().role?.toLowerCase() || 'acesso sistema',
        timestamp: doc.data().dataSolicitacao,
        colecao: 'solicitacoes_acesso',
        isServico: false
      }));

      const docsSec = snapshotSec.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        nome: doc.data().aluno_nome?.toLowerCase() || '',
        email: doc.data().aluno_matricula?.toLowerCase() || '', 
        role: doc.data().tipo_servico?.toLowerCase() || 'serviço',
        timestamp: doc.data().data_pedido,
        colecao: 'solicitacoes_secretaria',
        isServico: true 
      }));

      const todos = [...docsAcesso, ...docsSec].sort((a, b) => 
        (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      );

      setSolicitacoes(todos);
      setStats({
        pendentes: todos.filter(d => d.status === 'pendente').length,
        aprovados: todos.filter(d => d.status === 'concluido' || d.status === 'aprovado').length
      });
    };

    let snapAcesso = { docs: [] };
    let snapSec = { docs: [] };
    const unsubAcesso = onSnapshot(qAcesso, (s) => { snapAcesso = s; processarDocs(snapAcesso, snapSec); });
    const unsubSec = onSnapshot(qSecretaria, (s) => { snapSec = s; processarDocs(snapAcesso, snapSec); });

    return () => { unsubAcesso(); unsubSec(); };
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
          <div className="mb-6">
             <NavButton icon={LayoutDashboard} label="Painel Geral" active sidebarOpen={sidebarOpen} onClick={() => {}} />
             <NavButton icon={ShieldCheck} label="Aprovações" sidebarOpen={sidebarOpen} onClick={() => {
                document.getElementById('tabela-movimentacoes')?.scrollIntoView({ behavior: 'smooth' });
             }} />
          </div>

          <div className="mb-6">
            <p className={`text-[9px] font-black text-slate-500 uppercase px-4 mb-2 tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>Cadastros R S</p>
            <NavButton icon={UserPlus} label="Novo Aluno" sidebarOpen={sidebarOpen} onClick={() => setIsCadastroModalOpen(true)} />
            <NavButton icon={Settings} label="Usuário Sistema" sidebarOpen={sidebarOpen} onClick={() => setIsModalOpen(true)} />
          </div>

          <div className="mb-6">
            <p className={`text-[9px] font-black text-slate-500 uppercase px-4 mb-2 tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>Serviços Digitais</p>
            <NavButton icon={ClipboardList} label="Declarações/QR" sidebarOpen={sidebarOpen} onClick={() => setDocumentoAtivo({ aluno: null, tipo: 'Matrícula' })} />
            <NavButton icon={FileText} label="Frequência" sidebarOpen={sidebarOpen} onClick={() => setDocumentoAtivo({ aluno: null, tipo: 'Frequência' })} />
            <NavButton icon={Plus} label="Atestados" sidebarOpen={sidebarOpen} onClick={() => setDocumentoAtivo({ aluno: null, tipo: 'Atestado' })} />
          </div>
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavButton icon={Home} label="ver site" sidebarOpen={sidebarOpen} onClick={() => navigate('/')} />
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/10 shrink-0">
          <button onClick={lidar_com_logout} className={`flex items-center gap-4 w-full p-4 text-red-400 rounded-2xl hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest ${!sidebarOpen && "justify-center"}`}>
            <LogOut size={22} />
            {sidebarOpen && <span>deslogar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">secretaria escolar</h2>
            <h1 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">centro de operações</h1>
          </div>
          <button onClick={() => setIsCadastroModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95">
            <Plus size={18} /> {sidebarOpen && "Cadastrar Aluno"}
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="aguardando" value={stats.pendentes} color="amber" icon={Clock} />
              <StatCard title="concluídos" value={stats.aprovados} color="emerald" icon={CheckCircle} />
              <StatCard title="ativos" value="--" color="blue" icon={Users} />
            </div>

            <PainelDocumentos onOpenDoc={(doc) => setDocumentoAtivo(doc)} />

            {/* TABELA DE MOVIMENTAÇÕES */}
            <div id="tabela-movimentacoes" className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl text-white"><ClipboardList size={18} /></div>
                  <h3 className="font-black text-slate-800 uppercase italic text-sm">Últimas Movimentações</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" placeholder="localizar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-bold w-64 outline-none lowercase" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-5">solicitante</th>
                      <th className="px-8 py-5">categoria</th>
                      <th className="px-8 py-5">data</th>
                      <th className="px-8 py-5 text-right">situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dadosFiltrados.map((sol) => (
                      <tr 
                        key={sol.id} 
                        // AQUI: Agora o clique na linha abre o formulário de resposta
                        onClick={() => setPedidoSelecionado(sol)} 
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-8 py-6 lowercase">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-700 text-xs">{sol.nome}</span>
                            <span className="text-[10px] text-slate-400">{sol.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 uppercase text-[9px] font-black text-slate-500">
                          <span className={sol.isServico ? "text-blue-600" : ""}>{sol.role}</span>
                        </td>
                        <td className="px-8 py-6 text-[11px] text-slate-500 font-bold italic">
                          {sol.timestamp?.seconds ? new Date(sol.timestamp.seconds * 1000).toLocaleString('pt-BR') : 'recente'}
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                sol.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {sol.status}
                              </span>
                              <ArrowRight size={14} className="text-slate-200 group-hover:text-blue-600 transition-all" />
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL DE RESPOSTA/DESPACHO (ABRE O FORMULÁRIO) */}
      {pedidoSelecionado && (
        <ModalDeclaracao 
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
          onGerarDoc={(p) => {
            // Esta função será chamada pelo botão de imprimir dentro do ModalDeclaracao
            setDocumentoAtivo({ 
              aluno: { nome: p.nome, matricula: p.aluno_matricula || p.email }, 
              tipo: p.role?.includes('frequência') ? 'Frequência' : 'Matrícula'
            });
          }}
        />
      )}

      {/* OUTROS MODAIS */}
      <FormSolicitacaoSecretaria isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCadastroModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-white rounded-[40px] shadow-2xl custom-scrollbar">
            <button onClick={() => setIsCadastroModalOpen(false)} className="absolute top-8 right-8 z-[110] bg-slate-100 text-slate-900 p-2 rounded-full hover:bg-red-500 hover:text-white">
              <X size={24} />
            </button>
            <FormCadastroAluno />
          </div>
        </div>
      )}

      {documentoAtivo && (
        <GeradorDocumento 
          aluno={documentoAtivo.aluno} 
          tipoDoc={documentoAtivo.tipo} 
          onClose={() => setDocumentoAtivo(null)} 
        />
      )}
    </div>
  );
}

// NavButton e StatCard permanecem os mesmos...
function NavButton({ icon: Icon, label, active, sidebarOpen, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "text-slate-500 hover:bg-white/5 hover:text-white"} ${!sidebarOpen && "justify-center px-0"}`}>
      <Icon size={22} />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = { amber: "bg-orange-500", emerald: "bg-emerald-500", blue: "bg-blue-600" };
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-center mb-6">
        <div className={`${colors[color]} p-3 rounded-2xl text-white shadow-lg`}><Icon size={20} /></div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}