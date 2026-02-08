import React, { useState, useEffect } from 'react';
import { db, auth_admin } from '../services/firebase'; 
import { collection, onSnapshot, query, orderBy, doc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';
import DashboardLayout from '../layouts/dashboardlayout';
import FormUsuarioSistema from '../components/FormUsuarioSistema'; // Importe seu modal r s
import { KeyRound, UserPlus, ShieldCheck, Search, CheckCircle2, Trash2, PlusCircle } from 'lucide-react';

export default function UsersManagement() {
  const [solicitacoes, set_solicitacoes] = useState([]);
  const [usuarios, set_usuarios] = useState([]);
  const [busca, set_busca] = useState('');
  const [modal_aberto, set_modal_aberto] = useState(false); // R S: Controle do modal

  useEffect(() => {
    const qSolicitacoes = query(collection(db, "solicitacoes_acesso"), orderBy("solicitado_em", "desc"));
    const unsubSol = onSnapshot(qSolicitacoes, (snap) => {
      set_solicitacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qUsers = query(collection(db, "users"), orderBy("nome", "asc"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      set_usuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSol(); unsubUsers(); };
  }, []);

  const handle_liberar_acesso = async (sol) => {
    const senha = prompt(`Defina a senha provisória para ${sol.nome.toUpperCase()}:`);
    if (!senha || senha.length < 6) {
      toast.error("senha inválida r s.");
      return;
    }

    const toast_id = toast.loading(`liberando acesso r s...`);
    const batch = writeBatch(db);

    try {
      // Normalização R S antes de salvar
      const email_db = sol.email.toLowerCase();
      const nome_db = sol.nome.toLowerCase();

      const user_credential = await createUserWithEmailAndPassword(auth_admin, email_db, senha);
      const uid = user_credential.user.uid;

      const novos_dados = {
        ...sol,
        uid,
        nome: nome_db,
        email: email_db,
        status: 'ativo',
        liberado_em: new Date().toISOString(),
        deve_trocar_senha: true
      };
      delete novos_dados.id;

      batch.set(doc(db, "users", uid), novos_dados);
      
      const mapeamento = { 'pai': 'responsaveis', 'aluno': 'alunos', 'funcionario': 'funcionarios' };
      const nome_col = mapeamento[sol.role] || `${sol.role}s`;
      batch.set(doc(db, nome_col, uid), novos_dados);
      batch.delete(doc(db, "solicitacoes_acesso", sol.id));

      await batch.commit();
      toast.success("acesso liberado r s!", { id: toast_id });
    } catch (error) {
      toast.error("erro: " + error.message, { id: toast_id });
    }
  };

  return (
    <DashboardLayout>
      {/* R S: O Modal agora fica aqui, fora do fluxo principal para não bugar o clique */}
      <FormUsuarioSistema 
        isOpen={modal_aberto} 
        onClose={() => set_modal_aberto(false)} 
        aoSucesso={() => set_modal_aberto(false)}
      />

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header com Botão de Novo Cadastro Direto */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Gestão de Acessos</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">administração r s</p>
          </div>
          <button 
            onClick={() => set_modal_aberto(true)}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <PlusCircle size={20} /> Novo Usuário R S
          </button>
        </header>

        {/* ... restante das suas seções de Solicitações e Tabela ... */}
        {/* Na sua tabela de usuários ativos, use busca.toLowerCase() r s */}
      </div>
    </DashboardLayout>
  );
}