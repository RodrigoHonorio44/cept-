import React, { useState } from 'react';
// Usamos o db e o auth_admin que você já configurou r s
import { db, auth_admin } from '../../services/firebase'; 
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'; 
import { toast } from 'sonner'; 
import { X, ShieldCheck, UserPlus, LockKeyhole, Loader2 } from 'lucide-react';

export default function FormUsuarioSistema({ isOpen, onClose, aoSucesso }) {
  const [loading, set_loading] = useState(false);
  const [form_data, set_form_data] = useState({
    nome: '', email: '', senha: '', role: 'aluno',
    turma: '', matricula: '', senha_provisoria: true,
    cargo_funcao: '', materia: '', cpf: ''
  });

  if (!isOpen) return null;

  const validarCPF = (cpf) => {
    const limpo = cpf.replace(/\D/g, '');
    if (limpo.length !== 11 || !!limpo.match(/(\d)\1{10}/)) return false;
    let cpfs = limpo.split('').map(el => +el);
    const rest = (count) => (cpfs.slice(0, count - 12).reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
    return rest(10) === cpfs[9] && rest(11) === cpfs[10];
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🚀 Iniciando cadastro via auth_admin r s...");

    const nomeLimpo = form_data.nome.trim();
    if (nomeLimpo.split(/\s+/).length < 2) {
      toast.error("insira nome e sobrenome r s.");
      return;
    }
    
    if ((form_data.role === 'funcionario' || form_data.role === 'pai') && !validarCPF(form_data.cpf)) {
      toast.error("cpf inválido r s.");
      return;
    }

    set_loading(true);
    const toast_id = toast.loading('processando acesso r s...');

    try {
      // Padronização r s
      const nome_db = nomeLimpo.toLowerCase(); 
      const email_db = form_data.email.trim().toLowerCase();
      const permissao = form_data.role.trim().toLowerCase();

      // 1. Criar o Auth (usando a instância secundária já existente)
      console.log("🚀 Criando credenciais no auth_admin r s...");
      const user_credential = await createUserWithEmailAndPassword(auth_admin, email_db, form_data.senha);
      const uid = user_credential.user.uid;

      // 2. Preparar gravação em lote
      const batch = writeBatch(db);

      let dados_completos = {
        uid,
        nome: nome_db,
        email: email_db,
        role: permissao,
        status: 'ativo',
        deve_trocar_senha: Boolean(form_data.senha_provisoria), 
        criado_em: new Date().toISOString(),
        dataCadastro: serverTimestamp()
      };

      if (permissao === 'aluno') {
        dados_completos.turma = (form_data.turma || "").trim().toLowerCase();
        dados_completos.matricula = (form_data.matricula || "").trim().toLowerCase();
      } else {
        dados_completos.cpf = (form_data.cpf || "").replace(/\D/g, ''); 
        if (permissao === 'funcionario') {
          dados_completos.cargo = (form_data.cargo_funcao || "").trim().toLowerCase();
          dados_completos.materia = (form_data.materia || "").trim().toLowerCase();
        }
      }

      // Gravação nas coleções r s
      batch.set(doc(db, "users", uid), dados_completos);
      
      const mapeamento = { 'pai': 'responsaveis', 'aluno': 'alunos', 'funcionario': 'funcionarios', 'root': 'roots' };
      const nome_colecao = mapeamento[permissao] || `${permissao}s`;
      batch.set(doc(db, nome_colecao, uid), dados_completos);

      // 3. Commit final
      await batch.commit();
      console.log("✅ Dados salvos com sucesso r s!");

      // Desloga o usuário da instância secundária para não sujar o estado
      await signOut(auth_admin);

      toast.success(`sucesso: ${nome_db} cadastrado r s.`, { id: toast_id });
      
      if (aoSucesso) aoSucesso(); 
      onClose();

    } catch (error) {
      console.error("❌ Erro no processo r s:", error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "este e-mail já existe r s.";
      toast.error(msg, { id: toast_id });
    } finally {
      set_loading(false);
    }
  };

  const eh_professor = form_data.cargo_funcao.toLowerCase().includes('prof');

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 pointer-events-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <UserPlus className="text-white" size={24} />
            </div>
            <h2 className="font-black text-xl tracking-tighter uppercase italic">Novo Acesso CEPT</h2>
          </div>
          <button type="button" onClick={onClose} className="hover:rotate-90 transition-transform duration-300 bg-slate-800 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handle_submit} noValidate className="p-10 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">Nome Completo</label>
              <input required type="text" value={form_data.nome}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                onChange={(e) => set_form_data({...form_data, nome: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">E-mail</label>
              <input required type="email" value={form_data.email}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                onChange={(e) => set_form_data({...form_data, email: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">Permissão</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                value={form_data.role} onChange={(e) => set_form_data({...form_data, role: e.target.value, cargo_funcao: '', materia: '', cpf: '', turma: '', matricula: ''})}>
                <option value="aluno">aluno</option>
                <option value="funcionario">funcionário</option>
                <option value="pai">responsável</option>
                <option value="root">root admin</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 space-y-4">
            {form_data.role === 'aluno' && (
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="turma" value={form_data.turma}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, turma: e.target.value})} />
                <input required placeholder="matrícula" value={form_data.matricula}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, matricula: e.target.value})} />
              </div>
            )}

            {(form_data.role === 'funcionario' || form_data.role === 'pai') && (
              <div className="space-y-4">
                {form_data.role === 'funcionario' && (
                  <>
                    <select required className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      value={form_data.cargo_funcao} onChange={(e) => set_form_data({...form_data, cargo_funcao: e.target.value})}>
                      <option value="">selecione o cargo...</option>
                      <option value="diretora">diretora</option>
                      <option value="administrativo">administrativo</option>
                      <option value="professor">professor</option>
                      <option value="professora">professora</option>
                    </select>
                    {eh_professor && (
                      <input required placeholder="matéria" value={form_data.materia}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                        onChange={(e) => set_form_data({...form_data, materia: e.target.value})} />
                    )}
                  </>
                )}
                <input required placeholder="cpf (apenas números)" 
                  maxLength={11} value={form_data.cpf}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, cpf: e.target.value})} />
              </div>
            )}
            
            <div className="relative">
              <input required type="password" placeholder="senha provisória" value={form_data.senha}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none pr-10"
                onChange={(e) => set_form_data({...form_data, senha: e.target.value})} />
              <LockKeyhole size={18} className="absolute right-3 top-3 text-slate-300" />
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100 cursor-pointer">
              <input type="checkbox" checked={form_data.senha_provisoria} className="w-5 h-5 accent-blue-600"
                onChange={(e) => set_form_data({...form_data, senha_provisoria: e.target.checked})} />
              <span className="text-[10px] font-black uppercase text-slate-600">obrigar troca de senha r s</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <><ShieldCheck size={22} /> cadastrar no sistema </>}
          </button>
        </form>
      </div>
    </div>
  );
}