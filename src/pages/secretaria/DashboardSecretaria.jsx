import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import DashboardLayout from '../../layouts/dashboardlayout';
import FormSolicitacaoSecretaria from '../../components/forms/FormSolicitacaoSecretaria';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  Users, 
  Search, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function DashboardSecretaria() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0 });
  const [busca, setBusca] = useState('');

  // 1. Monitorar solicitações em tempo real (Padrão R S)
  useEffect(() => {
    // Note: 'limit(10)' mantém a manutenção leve para o Firebase
    const q = query(
      collection(db, "solicitacoes_acesso"),
      orderBy("dataSolicitacao", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSolicitacoes(docs);
      
      // Atualiza os contadores baseados no snapshot atual
      setStats({
        pendentes: docs.filter(d => d.status === 'pendente').length,
        aprovados: docs.filter(d => d.status === 'aprovado').length
      });
    });

    return () => unsubscribe();
  }, []);

  // Filtro de busca local para agilizar a manutenção
  const dadosFiltrados = solicitacoes.filter(s => 
    s.nome.toLowerCase().includes(busca.toLowerCase()) || 
    s.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER ESTRATÉGICO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Centro de <span className="text-cept-blue">Operações</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-1 leading-none">
              Secretaria Escolar • R S System 2026
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-cept-blue transition-all shadow-2xl shadow-slate-200 group active:scale-95"
          >
            <UserPlus size={22} className="group-hover:scale-110 transition-transform" />
            NOVA MATRÍCULA / ACESSO
          </button>
        </header>

        {/* CARDS DE INDICADORES (Componentizados para fácil manutenção) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Clock size={24} />} 
            label="Aguardando Root" 
            value={stats.pendentes} 
            bgColor="bg-orange-50" 
            textColor="text-orange-600" 
          />
          <StatCard 
            icon={<CheckCircle size={24} />} 
            label="Aprovados Recentemente" 
            value={stats.aprovados} 
            bgColor="bg-green-50" 
            textColor="text-green-600" 
          />
          <StatCard 
            icon={<Users size={24} />} 
            label="Alunos Ativos" 
            value="--" 
            bgColor="bg-blue-50" 
            textColor="text-cept-blue" 
          />
        </div>

        {/* ÁREA DE TRABALHO: HISTÓRICO DE SOLICITAÇÕES */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg shadow-slate-200">
                <ClipboardList size={18} />
              </div>
              <h2 className="font-black text-slate-800 uppercase tracking-tight text-lg italic">Últimas Movimentações</h2>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Localizar pedido..." 
                className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cept-blue w-full md:w-72 transition-all"
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-5">Candidato</th>
                  <th className="px-10 py-5">Categoria</th>
                  <th className="px-10 py-5">Data do Envio</th>
                  <th className="px-10 py-5">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dadosFiltradas.length > 0 ? dadosFiltradas.map((sol) => (
                  <tr key={sol.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm capitalize tracking-tight">{sol.nome}</span>
                        <span className="text-[11px] text-slate-400 font-bold lowercase">{sol.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {sol.role}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-[12px] text-slate-500 font-bold italic">
                      {new Date(sol.dataSolicitacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-between">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          sol.status === 'pendente' 
                          ? 'bg-orange-100 text-orange-600 animate-pulse' 
                          : 'bg-green-100 text-green-600 shadow-sm shadow-green-100'
                        }`}>
                          {sol.status === 'pendente' ? 'Em Análise' : 'Confirmado'}
                        </span>
                        <ArrowRight size={14} className="text-slate-200 group-hover:text-cept-blue group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      <FormSolicitacaoSecretaria 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </DashboardLayout>
  );
}

// Subcomponente de Card R S
function StatCard({ icon, label, value, bgColor, textColor }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`w-14 h-14 ${bgColor} ${textColor} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  );
}