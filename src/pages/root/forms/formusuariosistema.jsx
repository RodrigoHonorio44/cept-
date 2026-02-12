import React, { useState, useEffect } from 'react';
import { db, auth_admin } from '../../../services/firebase'; 
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'; 
import { toast } from 'sonner'; 
import { X, ShieldCheck, UserPlus, LockKeyhole, Loader2, Info } from 'lucide-react';

export default function FormUsuarioSistema({ isOpen, onClose, aoSucesso, dadosPreenchidos }) {
  const [loading, set_loading] = useState(false);
  const estado_inicial = {
    nome: '', email: '', senha: '', role: 'aluno',
    turma: '', matricula: '', senha_provisoria: true,
    cargo_funcao: '', materia: '', cpf: '',
    idUnico: '', nome_responsavel: '', cpf_responsavel: ''
  };

  const [form_data, set_form_data] = useState(estado_inicial);

  const formatarParaExibicao = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    if (isOpen) {
      if (dadosPreenchidos) {
        set_form_data({
          ...estado_inicial,
          nome: dadosPreenchidos.nome?.toLowerCase() || '',
          email: dadosPreenchidos.email?.toLowerCase() || '',
          role: dadosPreenchidos.role || 'aluno',
          turma: dadosPreenchidos.turma?.toLowerCase() || '',
          matricula: dadosPreenchidos.matricula?.toLowerCase() || '',
          cpf: dadosPreenchidos.cpf || '',
          cargo_funcao: dadosPreenchidos.cargo_funcao?.toLowerCase() || '',
          materia: dadosPreenchidos.materia?.toLowerCase() || '',
          idUnico: dadosPreenchidos.idUnico || '',
          nome_responsavel: dadosPreenchidos.nome_responsavel?.toLowerCase() || '',
          cpf_responsavel: dadosPreenchidos.cpf_responsavel || '',
        });
      } else {
        set_form_data(estado_inicial);
      }
    }
  }, [isOpen, dadosPreenchidos]);

  if (!isOpen) return null;

  const handle_submit = async (e) => {
    e.preventDefault();
    
    const nomeLimpo = form_data.nome.trim();
    if (nomeLimpo.split(/\s+/).length < 2) return toast.error("insira nome e sobrenome r s.");
    if (!form_data.senha || form_data.senha.length < 6) return toast.error("senha deve ter no mínimo 6 caracteres r s.");

    set_loading(true);
    const toast_id = toast.loading('processando acesso r s...');

    try {
      const email_db = form_data.email.trim().toLowerCase();
      const permissao = form_data.role.toLowerCase();
      const nome_db = nomeLimpo.toLowerCase();
      let uid = "";

      // 1. Criar Auth r s (com bypass para email já existente)
      try {
        const user_credential = await createUserWithEmailAndPassword(auth_admin, email_db, form_data.senha);
        uid = user_credential.user.uid;
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log("r s: usuário já existe no auth, vinculando dados...");
          // Fallback seguro de ID caso já exista
          uid = authError.customData?._tokenResponse?.localId || `id_${Date.now()}`;
        } else {
          throw authError;
        }
      }

      const batch = writeBatch(db);
      const dados_completos = {
        uid,
        nome: nome_db,
        email: email_db,
        role: permissao,
        status: 'ativo',
        deve_trocar_senha: Boolean(form_data.senha_provisoria),
        dataCadastro: serverTimestamp(),
        idUnico: form_data.idUnico || ''
      };

      // Normalização de campos
      if (permissao === 'aluno') {
        dados_completos.turma = form_data.turma.toLowerCase();
        dados_completos.matricula = form_data.matricula.toLowerCase();
        dados_completos.cpf = form_data.cpf.replace(/\D/g, '');
        dados_completos.nome_responsavel = form_data.nome_responsavel.toLowerCase();
      } else {
        dados_completos.cpf = form_data.cpf.replace(/\D/g, '');
        if (permissao === 'funcionario') {
          dados_completos.cargo = form_data.cargo_funcao.toLowerCase();
          dados_completos.materia = form_data.materia.toLowerCase();
        }
      }

      // SALVANDO NA COLEÇÃO USERS (atualizado de usuarios para users)
      batch.set(doc(db, "users", uid), dados_completos, { merge: true });
      
      const mapeamento = { 'pai': 'responsaveis', 'aluno': 'alunos', 'funcionario': 'funcionarios', 'root': 'roots' };
      const nome_colecao = mapeamento[permissao] || `${permissao}s`;
      batch.set(doc(db, nome_colecao, uid), dados_completos, { merge: true });

      if (dadosPreenchidos?.id) {
        batch.update(doc(db, "solicitacoes_acesso", dadosPreenchidos.id), {
          status: "concluido",
          finalizado_em: serverTimestamp()
        });
      }

      await batch.commit();
      await signOut(auth_admin);

      toast.success("usuário criado com sucesso r s!", { id: toast_id });
      set_form_data(estado_inicial); // Limpa o formulário r s
      
      if (aoSucesso) aoSucesso(); 
      onClose();

    } catch (error) {
      console.error("❌ ERRO NO CADASTRO r s:", error);
      toast.error("erro ao processar cadastro.", { id: toast_id });
    } finally {
      set_loading(false);
    }
  };

  const eh_professor = form_data.cargo_funcao.toLowerCase().includes('prof');

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden font-sans">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><ShieldCheck size={24} /></div>
            <div>
               <h2 className="font-black text-xl tracking-tighter uppercase italic">Root Control</h2>
               <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest italic">ID: {form_data.idUnico || 'manual'}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform bg-slate-800 p-2 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handle_submit} className="p-10 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-2 italic">Nome Completo do Usuário</label>
              <input required type="text" value={form_data.nome}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all capitalize"
                onChange={(e) => set_form_data({...form_data, nome: e.target.value.toLowerCase()})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-2 italic">E-mail de Acesso</label>
                <input required type="email" value={form_data.email}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all lowercase"
                  onChange={(e) => set_form_data({...form_data, email: e.target.value.toLowerCase()})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-2 italic">Nível de Permissão</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  value={form_data.role} onChange={(e) => set_form_data({...form_data, role: e.target.value})}>
                  <option value="aluno">aluno</option>
                  <option value="funcionario">funcionário</option>
                  <option value="pai">responsável</option>
                  <option value="root">root admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 space-y-4">
            {form_data.role === 'aluno' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Turma</label>
                    <input required placeholder="ex: 1001" value={form_data.turma}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      onChange={(e) => set_form_data({...form_data, turma: e.target.value.toLowerCase()})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Matrícula</label>
                    <input required placeholder="00000" value={form_data.matricula}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      onChange={(e) => set_form_data({...form_data, matricula: e.target.value.toLowerCase()})} />
                  </div>
                </div>
                <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">CPF do Aluno</label>
                    <input required placeholder="000.000.000-00" value={form_data.cpf}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      onChange={(e) => set_form_data({...form_data, cpf: e.target.value})} />
                </div>
              </div>
            )}

            {form_data.role === 'funcionario' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Cargo / Função</label>
                  <select required className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                    value={form_data.cargo_funcao} onChange={(e) => set_form_data({...form_data, cargo_funcao: e.target.value})}>
                    <option value="">selecione...</option>
                    <option value="diretora">diretora</option>
                    <option value="administrativo">administrativo</option>
                    <option value="professor">professor(a)</option>
                  </select>
                </div>
                {eh_professor && (
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Disciplina</label>
                    <input required placeholder="matéria" value={form_data.materia}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      onChange={(e) => set_form_data({...form_data, materia: e.target.value.toLowerCase()})} />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block italic">Definir Senha de Acesso</label>
              <div className="relative">
                <input required type="password" placeholder="mínimo 6 dígitos" value={form_data.senha}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none pr-10"
                  onChange={(e) => set_form_data({...form_data, senha: e.target.value})} />
                <LockKeyhole size={18} className="absolute right-3 top-3 text-slate-300" />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100 cursor-pointer">
              <input type="checkbox" checked={form_data.senha_provisoria} className="w-5 h-5 accent-blue-600"
                onChange={(e) => set_form_data({...form_data, senha_provisoria: e.target.checked})} />
              <span className="text-[10px] font-black uppercase text-slate-600">exigir troca de senha no primeiro acesso</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <><ShieldCheck size={22} /> {dadosPreenchidos ? "aprovar e liberar acesso" : "confirmar cadastro r s"} </>}
          </button>
        </form>
      </div>
    </div>
  );
}