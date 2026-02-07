import React, { useState } from 'react';
import { db, auth_admin } from '../../services/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner'; 
import { X, ShieldCheck, UserPlus, Info, LockKeyhole } from 'lucide-react';

export default function FormUsuarioSistema({ isOpen, onClose, aoSucesso }) {
  const [loading, set_loading] = useState(false);
  const [form_data, set_form_data] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'aluno',
    turma: '',
    matricula: '',
    senha_provisoria: true,
    cargo_funcao: '', 
    materia: '',      
    cpf: ''
  });

  if (!isOpen) return null;

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let cpfs = cpf.split('').map(el => +el);
    const rest = (count) => (cpfs.slice(0, count - 12).reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
    return rest(10) === cpfs[9] && rest(11) === cpfs[10];
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    
    if (form_data.role === 'funcionario' || form_data.role === 'pai') {
      if (!validarCPF(form_data.cpf)) {
        toast.error("cpf inválido. verifique os números r s.");
        return;
      }
    }

    set_loading(true);
    const toast_id = toast.loading('Sincronizando novo acesso r s...');
    const batch = writeBatch(db);

    try {
      const nome_db = form_data.nome.trim().toLowerCase(); 
      const email_db = form_data.email.trim().toLowerCase();
      const permissao = form_data.role.trim().toLowerCase();

      // 1. Criar no Authentication
      const user_credential = await createUserWithEmailAndPassword(auth_admin, email_db, form_data.senha);
      const uid = user_credential.user.uid;

      // 2. Objeto completo com normalização r s
      let dados_completos = {
        uid,
        nome: nome_db,
        email: email_db,
        role: permissao,
        status: 'ativo',
        deve_trocar_senha: form_data.senha_provisoria, 
        criado_em: new Date().toISOString()
      };

      if (permissao === 'aluno') {
        dados_completos.turma = form_data.turma.trim().toLowerCase();
        dados_completos.matricula = form_data.matricula.trim().toLowerCase();
      } else if (permissao === 'funcionario' || permissao === 'pai') {
        dados_completos.cpf = form_data.cpf.replace(/\D/g, ''); 
        if (permissao === 'funcionario') {
          dados_completos.cargo = form_data.cargo_funcao.trim().toLowerCase();
          if (dados_completos.cargo.includes('professor')) {
            dados_completos.materia = form_data.materia.trim().toLowerCase();
          }
        }
      }

      // 3. R S: Agora salvando na coleção padrão 'users'
      const ref_user = doc(db, "users", uid);
      batch.set(ref_user, dados_completos);

      // 4. Espelhamento na coleção específica
      const mapeamento = {
        'pai': 'responsaveis',
        'aluno': 'alunos',
        'funcionario': 'funcionarios',
        'root': 'roots'
      };
      const nome_colecao = mapeamento[permissao] || `${permissao}s`;
      const ref_especifica = doc(db, nome_colecao, uid);
      batch.set(ref_especifica, dados_completos);

      await batch.commit();

      toast.success(`sucesso: ${nome_db} cadastrado r s.`, { id: toast_id });
      if (aoSucesso) aoSucesso(); 
      onClose();

    } catch (error) {
      console.error("erro cadastro r s:", error);
      let msg_erro = "erro ao criar acesso r s";
      if (error.code === 'auth/email-already-in-use') msg_erro = "este e-mail já existe r s.";
      toast.error(msg_erro, { id: toast_id });
    } finally {
      set_loading(false);
    }
  };

  const eh_professor = form_data.cargo_funcao === 'professor' || form_data.cargo_funcao === 'professora';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <UserPlus className="text-white" size={24} />
            </div>
            <h2 className="font-black text-xl tracking-tighter uppercase italic">Novo Acesso R S</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 bg-slate-800 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handle_submit} className="p-10 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">Nome Completo</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                onChange={(e) => set_form_data({...form_data, nome: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">E-mail</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                onChange={(e) => set_form_data({...form_data, email: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">Permissão</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                value={form_data.role} onChange={(e) => set_form_data({...form_data, role: e.target.value, cargo_funcao: '', materia: '', cpf: ''})}>
                <option value="aluno">aluno</option>
                <option value="funcionario">funcionário</option>
                <option value="pai">responsável</option>
                <option value="root">root admin</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Detalhes do Perfil</span>
            </div>

            {form_data.role === 'aluno' && (
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="turma" className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, turma: e.target.value})} />
                <input required placeholder="matrícula" className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
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
                      <input required placeholder="matéria" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                        onChange={(e) => set_form_data({...form_data, materia: e.target.value})} />
                    )}
                  </>
                )}
                <input required placeholder="cpf (apenas números)" 
                  maxLength={11}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, cpf: e.target.value})} />
              </div>
            )}
            
            <div className="relative">
              <input required type="password" placeholder="senha provisória" 
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

          <button disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 uppercase tracking-widest">
            {loading ? "Sincronizando r s..." : <><ShieldCheck size={22} /> cadastrar no sistema</>}
          </button>
        </form>
      </div>
    </div>
  );
}