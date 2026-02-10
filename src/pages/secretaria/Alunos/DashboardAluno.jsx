import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth'; 
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, BookOpen, Calendar, 
  LogOut, ChevronRight, ChevronLeft, GraduationCap,
  Clock, FileText, User, Bell, Home, Award, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardAluno() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [alunoData, setAlunoData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    // r s: buscando na coleção de alunos
    const q = query(
      collection(db, "cadastro_alunos"), 
      where("email", "==", user.email.toLowerCase())
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAlunoData(snapshot.docs[0].data());
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
      
      {/* SIDEBAR ALUNO r s */}
      <aside className={`${isExpanded ? "w-72" : "w-24"} bg-[#0f172a] flex flex-col transition-all duration-300 relative z-50 shrink-0 shadow-2xl`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-12 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-blue-600 shadow-md z-[60] transition-transform hover:scale-110"
        >
          {isExpanded ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>

        <div className="h-28 flex items-center px-6 border-b border-white/5 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
             <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap size={24}/>
             </div>
             {isExpanded && (
               <h1 className="text-white font-black italic uppercase tracking-tighter text-xl whitespace-nowrap animate-in fade-in duration-500">
                 CEPT <span className="text-indigo-400">ALUNO</span>
               </h1>
             )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-0"} w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-white mb-6 border border-white/5`}
          >
            <Home size={22} className="shrink-0 text-indigo-400" />
            {isExpanded && <span>Voltar para Home</span>}
          </button>

          <NavButton icon={LayoutDashboard} label="Meu Painel" active expanded={isExpanded} />
          <NavButton icon={BookOpen} label="Disciplinas" expanded={isExpanded} />
          <NavButton icon={Award} label="Notas e Faltas" expanded={isExpanded} />
          <NavButton icon={Calendar} label="Horário de Aula" expanded={isExpanded} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={lidar_com_logout} className={`flex items-center ${isExpanded ? "gap-4 px-4" : "justify-center px-0"} w-full py-4 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest`}>
            <LogOut size={20} /> 
            {isExpanded && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL r s */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-28 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Área Acadêmica</p>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">
              Central do <span className="text-slate-400 font-medium">Estudante</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end border-r border-slate-100 pr-6 mr-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md mb-1">Matrícula Ativa</span>
                <span className="text-sm font-black text-slate-700 uppercase italic tracking-tighter">
                    {alunoData?.nome || 'Estudante'}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 cursor-pointer hover:bg-slate-100">
                    <Bell size={20} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm relative">
                    <User size={28} />
                </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* STATUS CARDS r s */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard title="Frequência Geral" value="94%" color="indigo" icon={TrendingUp} />
              <StatCard title="Média Global" value="8.5" color="emerald" icon={Award} />
              <StatCard title="Aulas Pendentes" value="02" color="amber" icon={Clock} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2">
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm h-full">
                    <h3 className="font-black text-slate-800 uppercase italic text-sm tracking-tighter mb-8">Minhas Matérias</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {alunoData?.materias?.map(materia => (
                            <div key={materia} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-indigo-500 hover:bg-white hover:shadow-2xl transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase">Aprovado</span>
                                </div>
                                <h4 className="font-black text-slate-800 uppercase italic text-xl tracking-tighter mb-1">{materia}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Turma: {alunoData?.turma || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                  </div>
               </div>

               {/* CARD DE AVISOS r s */}
               <div className="space-y-6">
                  <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
                    <h3 className="font-black uppercase italic text-sm mb-8 text-indigo-400 tracking-tighter relative z-10">Comunicados</h3>
                    <div className="space-y-6 relative z-10">
                        <div className="border-l-2 border-indigo-500 pl-4">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">12 Fev</p>
                           <p className="text-xs font-black italic uppercase">Reunião de Pais e Mestres</p>
                        </div>
                        <div className="border-l-2 border-slate-700 pl-4">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">15 Fev</p>
                           <p className="text-xs font-black italic uppercase">Início das Avaliações Bimestrais</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, expanded }) {
  return (
    <button className={`flex items-center ${expanded ? "gap-4 px-6" : "justify-center px-0"} w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>
      <Icon size={22} className="shrink-0" />
      {expanded && <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>}
    </button>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = { 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    emerald: "bg-emerald-500 shadow-emerald-200", 
    amber: "bg-orange-500 shadow-orange-200" 
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col relative z-10">
        <div className={`${colors[color]} w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center mb-6`}>
            <Icon size={24} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
      </div>
      <Icon size={100} className="absolute -right-4 -bottom-4 text-slate-50 opacity-[0.05]" />
    </div>
  );
}