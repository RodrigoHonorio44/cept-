import React, { useState } from 'react';
import { db } from '../../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ShieldCheck, 
  UserPlus, 
  Fingerprint, 
  Mail, 
  Briefcase, 
  Check, 
  Lock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FormCadastroFuncionario() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cargo: '', 
    setor: 'secretaria', 
    identificacao: '' // CPF ou Matrícula
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nome || !form.identificacao || !form.cargo) {
      return toast.error("Preencha todos os campos r s");
    }

    setLoading(true);

    try {
      // R S: SALVANDO NA COLEÇÃO cadastro_funcionarios COM TUDO EM MINÚSCULO
      await addDoc(collection(db, "cadastro_funcionarios"), {
        nome: form.nome.toLowerCase(),
        email: form.email.toLowerCase(),
        cargo: form.cargo.toLowerCase(),
        setor: form.setor.toLowerCase(),
        identificacao: form.identificacao.toLowerCase(),
        role: 'secretaria', 
        status: 'ativo',
        criado_em: serverTimestamp()
      });

      toast.success("Funcionário(a) cadastrado com sucesso r s!");
      
      // Reseta o form
      setForm({ 
        nome: '', 
        email: '', 
        cargo: '', 
        setor: 'secretaria', 
        identificacao: '' 
      });

    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      toast.error("Erro ao salvar no banco r s.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 ml-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            CADASTRO DE <span className="text-blue-600">SECRETARIA</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            coleção: cadastro_funcionarios • 2026
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PERFIL */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
              <UserPlus size={14} className="text-blue-600" /> PERFIL DO USUÁRIO
            </h3>
            
            <input 
              required
              placeholder="nome completo"
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            <div className="relative">
              <input 
                required
                placeholder="cpf ou matrícula"
                value={form.identificacao}
                onChange={e => setForm({...form, identificacao: e.target.value})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none pl-12"
              />
              <Fingerprint className="absolute left-4 top-4 text-slate-300" size={18} />
            </div>

            <div className="relative">
              <input 
                required
                type="email"
                placeholder="e-mail de acesso"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none pl-12"
              />
              <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            </div>
          </div>

          {/* CARGO */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
              <Briefcase size={14} className="text-blue-600" /> ATRIBUIÇÕES
            </h3>

            <input 
              required
              placeholder="cargo (ex: secretário)"
              value={form.cargo}
              onChange={e => setForm({...form, cargo: e.target.value})}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <select 
              value={form.setor}
              onChange={e => setForm({...form, setor: e.target.value})}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="secretaria">Secretaria Central</option>
              <option value="administrativo">Administrativo</option>
              <option value="coordenacao">Coordenação</option>
              <option value="direcao">Direção</option>
            </select>
          </div>

          {/* RESUMO E BOTÃO */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex-1">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">CONFIRMAÇÃO R S</p>
                <h4 className="text-2xl font-black italic uppercase leading-tight">
                  {form.cargo || 'cargo'} <br/>
                  <span className="text-slate-400 text-lg">setor {form.setor}</span>
                </h4>
                <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                  ID: {form.identificacao || '---'}
                </p>
              </div>
              <ShieldCheck size={160} className="absolute -right-10 -bottom-10 text-white/5 pointer-events-none" />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-7 rounded-[2rem] font-black uppercase italic tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'SALVANDO...' : <><Check size={22} strokeWidth={3} /> CONFIRMAR CADASTRO</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}