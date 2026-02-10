import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth'; 
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { 
  LayoutDashboard, BookOpen, Users, Calendar, 
  LogOut, ChevronRight, ChevronLeft, GraduationCap,
  Clock, FileText, User, Bell, Home, Save, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardProfessor() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [professorData, setProfessorData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('geral'); // r s: controle de navegação interna

  useEffect(() => {
    if (!user?.email) return;
    const q = query(
      collection(db, "cadastro_professores"), 
      where("email", "==", user.email.toLowerCase())
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setProfessorData(snapshot.docs[0].data());
      }
    }, (error) => {
      console.error("erro ao carregar dados r s:", error);
    });

    return () => unsub();
  }, [user]);

  const lidar_com_logout = async () => {
    try { await logout(); navigate('/'); } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
      
      {/* SIDEBAR r s */}
      <aside className={`${isExpanded ? "w-72" : "w-24"} bg-[#0f172a] flex flex-col transition-all duration-300 relative z-50 shrink-0 shadow-2xl`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-12 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-blue-600 shadow-md z-[60] transition-transform hover:scale-110"
        >
          {isExpanded ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>

        <div className="h-28 flex items-center px-6 border-b border-white/5 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 shrink-0">
             <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <GraduationCap size={24}/>
             </div>
             {isExpanded && (
               <h1 className="text-white font-black italic uppercase tracking-tighter text-xl whitespace-nowrap animate-in fade-in duration-500">
                 CEPT <span className="text-blue-500">DOCENTE</span>
               </h1>
             )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-0"} w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-white mb-6 border border-white/5`}
          >
            <Home size={22} className="shrink-0 text-blue-400" />
            {isExpanded && <span>Voltar para Home</span>}
          </button>

          <NavButton 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            active={activeTab === 'geral'} 
            expanded={isExpanded} 
            onClick={() => setActiveTab('geral')}
          />
          <NavButton 
            icon={FileText} 
            label="Lançar Notas" 
            active={activeTab === 'notas'} 
            expanded={isExpanded} 
            onClick={() => setActiveTab('notas')}
          />
          <NavButton icon={Users} label="Minhas Turmas" expanded={isExpanded} />
          <NavButton icon={Calendar} label="Horários" expanded={isExpanded} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={lidar_com_logout} className={`flex items-center ${isExpanded ? "gap-4 px-4" : "justify-center px-0"} w-full py-4 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest`}>
            <LogOut size={20} /> 
            {isExpanded && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL r s */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-28 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Portal do Professor</p>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">
              {activeTab === 'geral' ? 'Centro de ' : 'Lançamento de '} 
              <span className="text-slate-400 font-medium">{activeTab === 'geral' ? 'Operações' : 'Notas'}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end border-r border-slate-100 pr-6 mr-2">
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md mb-1">{role || 'professor'}</span>
                <span className="text-sm font-black text-slate-700 uppercase italic tracking-tighter">{professorData?.nome || 'Docente'}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 rounded-2xl"><Bell size={20}/></div>
                <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200"><User size={28}/></div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          {activeTab === 'geral' ? (
            <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
               {/* CARDS DE STATUS r s */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Total de Turmas" value={professorData?.turmas?.length || 0} color="emerald" icon={Users} />
                <StatCard title="Disciplinas" value={professorData?.materias?.length || 0} color="blue" icon={BookOpen} />
                <StatCard title="Aulas Hoje" value="04" color="amber" icon={Clock} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 <div className="xl:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm h-full">
                      <h3 className="font-black text-slate-800 uppercase italic text-sm mb-10">Minhas Turmas Ativas</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {professorData?.turmas?.map(turma => (
                              <div key={turma} onClick={() => setActiveTab('notas')} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-blue-500 hover:bg-white hover:shadow-2xl transition-all cursor-pointer">
                                  <div className="flex justify-between items-start mb-8">
                                      <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Users size={24}/></div>
                                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all"/>
                                  </div>
                                  <h4 className="font-black text-slate-800 uppercase italic text-2xl tracking-tighter">{turma}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">CEPT ITAIPUAÇU</p>
                              </div>
                          ))}
                      </div>
                    </div>
                 </div>
                 <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white shadow-xl h-fit">
                    <h3 className="font-black uppercase italic text-sm mb-8 text-blue-500 tracking-tighter">Disciplinas</h3>
                    <div className="space-y-4">
                        {professorData?.materias?.map(m => (
                            <div key={m} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-xs font-black uppercase italic tracking-wider">{m}</span>
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <LancarNotas professorData={professorData} />
          )}
        </section>
      </main>
    </div>
  );
}

// COMPONENTE DE LANÇAMENTO r s
function LancarNotas({ professorData }) {
  const [turmaSel, setTurmaSel] = useState('');
  const [materiaSel, setMateriaSel] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!turmaSel) return;
    setLoading(true);
    const q = query(collection(db, "cadastro_alunos"), where("turma", "==", turmaSel));
    const unsub = onSnapshot(q, (snapshot) => {
      setAlunos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [turmaSel]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 mb-2 block">Selecione a Turma</label>
          <select onChange={(e) => setTurmaSel(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase italic text-sm text-slate-700">
            <option value="">Escolha uma Turma</option>
            {professorData?.turmas?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 mb-2 block">Selecione a Disciplina</label>
          <select onChange={(e) => setMateriaSel(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase italic text-sm text-slate-700">
            <option value="">Escolha a Matéria</option>
            {professorData?.materias?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {turmaSel && materiaSel ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Estudante</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bimestre 1</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bimestre 2</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {alunos.map(aluno => (
                <tr key={aluno.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs uppercase">{aluno.nome?.charAt(0)}</div>
                        <span className="font-black uppercase italic text-slate-700 text-xs">{aluno.nome}</span>
                    </div>
                  </td>
                  <td className="p-8 text-center"><input type="number" placeholder="0.0" className="w-20 bg-slate-100 border-none rounded-xl p-3 text-center font-black text-blue-600 focus:ring-2 focus:ring-blue-500" /></td>
                  <td className="p-8 text-center"><input type="number" placeholder="0.0" className="w-20 bg-slate-100 border-none rounded-xl p-3 text-center font-black text-blue-600 focus:ring-2 focus:ring-blue-500" /></td>
                  <td className="p-8 text-center"><button className="bg-blue-600 text-white p-3 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-blue-500/20"><Save size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2.5rem] p-20 text-center text-blue-300 font-black uppercase italic text-xs tracking-[0.3em]">Selecione os dados acima para iniciar o lançamento r s</div>
      )}
    </div>
  );
}

// AUXILIARES
function NavButton({ icon: Icon, label, active, expanded, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center ${expanded ? "gap-4 px-6" : "justify-center px-0"} w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>
      <Icon size={22} className="shrink-0" />
      {expanded && <span>{label}</span>}
    </button>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = { emerald: "bg-green-500 shadow-green-200", blue: "bg-blue-600 shadow-blue-200", amber: "bg-orange-500 shadow-orange-200" };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className={`${colors[color]} w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center mb-6`}><Icon size={24}/></div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
      <Icon size={100} className="absolute -right-4 -bottom-4 text-slate-50 opacity-[0.05]" />
    </div>
  );
}