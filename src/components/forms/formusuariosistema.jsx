import React, { useState } from 'react';
import { db, auth_admin } from '../../services/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner'; 
import { X, ShieldCheck, UserPlus, Info, LockKeyhole, BookOpen } from 'lucide-react';

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
    cargo_funcao: '', // r s: será preenchido pelo select
    materia: '',      // r s: novo campo específico
    cpf: ''
  });

  if (!isOpen) return null;

  const handle_submit = async (e) => {
    e.preventDefault();
    set_loading(true);
    
    const toast_id = toast.loading('Sincronizando novo acesso r s...');
    const batch = writeBatch(db);

    try {
      const nome_db = form_data.nome.trim().toLowerCase(); 
      const email_db = form_data.email.toLowerCase().trim();
      const permissao = form_data.role.toLowerCase();

      const user_credential = await createUserWithEmailAndPassword(auth_admin, email_db, form_data.senha);
      const uid = user_credential.user.uid;

      const ref_global = doc(db, "users", uid);
      batch.set(ref_global, {
        uid,
        nome: nome_db,
        email: email_db,
        role: permissao,
        status: 'ativo',
        deve_trocar_senha: form_data.senha_provisoria, 
        criado_em: new Date().toISOString()
      });

      const mapeamento = {
        'pai': 'responsaveis',
        'aluno': 'alunos',
        'funcionario': 'funcionarios',
        'root': 'roots'
      };

      const nome_colecao = mapeamento[permissao] || `${permissao}s`;
      const ref_especifica = doc(db, nome_colecao, uid);

      let data_especifica = { uid, nome: nome_db, email: email_db, status: 'ativo' };

      if (permissao === 'aluno') {
        data_especifica.turma = form_data.turma.toLowerCase();
        data_especifica.matricula = form_data.matricula.toLowerCase();
      } else if (permissao === 'funcionario' || permissao === 'pai') {
        data_especifica.cpf = form_data.cpf.replace(/\D/g, '');
        if (permissao === 'funcionario') {
          data_especifica.cargo = form_data.cargo_funcao.toLowerCase();
          // r s: salva matéria se for perfil pedagógico
          if (form_data.cargo_funcao === 'professor' || form_data.cargo_funcao === 'professora') {
            data_especifica.materia = form_data.materia.toLowerCase();
          }
        }
      }

      batch.set(ref_especifica, data_especifica);
      await batch.commit();

      toast.success(`Sucesso: ${nome_db} cadastrado no sistema.`, { id: toast_id });
      
      if (aoSucesso) aoSucesso(); 
      onClose();

    } catch (error) {
      let msg_erro = "Erro ao criar acesso r s";
      if (error.code === 'auth/email-already-in-use') msg_erro = "Este e-mail já está em uso.";
      if (error.code === 'auth/weak-password') msg_erro = "A senha deve ter no mínimo 6 dígitos.";
      toast.error(msg_erro, { id: toast_id });
    } finally {
      set_loading(false);
    }
  };

  // r s: lógica de exibição do campo de matéria
  const eh_professor = form_data.cargo_funcao === 'professor' || form_data.cargo_funcao === 'professora';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-cept-blue p-2 rounded-xl">
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
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-cept-blue transition-all"
                onChange={(e) => set_form_data({...form_data, nome: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">E-mail</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-cept-blue transition-all"
                onChange={(e) => set_form_data({...form_data, email: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-2">Permissão</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-cept-blue cursor-pointer"
                value={form_data.role} onChange={(e) => set_form_data({...form_data, role: e.target.value, cargo_funcao: '', materia: ''})}>
                <option value="aluno">aluno</option>
                <option value="funcionario">funcionário</option>
                <option value="pai">responsável</option>
                <option value="root">root admin</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-cept-blue mb-2">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Dados de Perfil</span>
            </div>

            {form_data.role === 'aluno' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <input required placeholder="turma" className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, turma: e.target.value})} />
                <input required placeholder="matrícula" className="bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, matricula: e.target.value})} />
              </div>
            )}

            {form_data.role === 'funcionario' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <select required className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none cursor-pointer"
                  value={form_data.cargo_funcao} onChange={(e) => set_form_data({...form_data, cargo_funcao: e.target.value})}>
                  <option value="">selecione o cargo...</option>
                  <option value="diretora">diretora</option>
                  <option value="administrativo">administrativo</option>
                  <option value="professor">professor</option>
                  <option value="professora">professora</option>
                </select>

                {eh_professor && (
                  <div className="flex items-center gap-2 bg-green-50 p-1 rounded-xl border border-green-100 animate-in zoom-in-95">
                    <div className="bg-green-500 p-2 rounded-lg text-white">
                      <BookOpen size={16} />
                    </div>
                    <input required placeholder="qual a matéria?" className="w-full bg-transparent p-2 text-sm font-bold outline-none text-green-700 placeholder:text-green-300"
                      onChange={(e) => set_form_data({...form_data, materia: e.target.value})} />
                  </div>
                )}
                
                <input required placeholder="cpf" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                  onChange={(e) => set_form_data({...form_data, cpf: e.target.value})} />
              </div>
            )}

            {form_data.role === 'pai' && (
              <input required placeholder="cpf" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none animate-in fade-in"
                onChange={(e) => set_form_data({...form_data, cpf: e.target.value})} />
            )}
            
            <div className="relative">
              <input required type="password" placeholder="senha provisória" 
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cept-blue pr-10"
                onChange={(e) => set_form_data({...form_data, senha: e.target.value})} />
              <LockKeyhole size={18} className="absolute right-3 top-3.5 text-slate-300" />
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
              <input type="checkbox" checked={form_data.senha_provisoria} className="w-5 h-5 accent-cept-blue"
                onChange={(e) => set_form_data({...form_data, senha_provisoria: e.target.checked})} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-600 leading-none">senha provisória</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">obrigar troca no primeiro acesso r s</span>
              </div>
            </label>
          </div>

          <button disabled={loading} className="w-full bg-cept-blue text-white font-black py-5 rounded-[2rem] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 uppercase tracking-widest">
            {loading ? "Sincronizando..." : <><ShieldCheck size={22} /> cadastrar no sistema</>}
          </button>
        </form>
      </div>
    </div>
  );
}