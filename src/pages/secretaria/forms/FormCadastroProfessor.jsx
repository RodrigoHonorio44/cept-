import React, { useState } from 'react';
import { db } from '../../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  UserPlus, BookOpen, Fingerprint, Check, 
  GraduationCap, Mail, Users, Plus, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FormCadastroProfessor() {
  const [loading, setLoading] = useState(false);
  
  // R S: MATERIAS E TURMAS AGORA SÃO ARRAYS
  const [form, setForm] = useState({
    nome: '',
    email: '',
    genero: 'professor',
    identificacao: ''
  });

  const [materias, setMaterias] = useState([]);
  const [novaMateria, setNovaMateria] = useState('');
  
  const [turmas, setTurmas] = useState([]);
  const [novaTurma, setNovaTurma] = useState('');

  // FUNÇÕES PARA GERENCIAR AS LISTAS R S
  const adicionarItem = (e, valor, lista, setLista, setValorLimpar) => {
    e.preventDefault();
    const formatado = valor.trim().toLowerCase();
    if (formatado && !lista.includes(formatado)) {
      setLista([...lista, formatado]);
      setValorLimpar('');
    }
  };

  const removerItem = (item, lista, setLista) => {
    setLista(lista.filter(i => i !== item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nome || !form.identificacao) {
      return toast.error("Preencha os campos obrigatórios r s");
    }

    if (materias.length === 0 || turmas.length === 0) {
      return toast.error("Adicione pelo menos uma matéria e uma turma r s");
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "cadastro_professores"), {
        nome: form.nome.toLowerCase(),
        email: form.email.toLowerCase(),
        cargo: form.genero.toLowerCase(),
        materias: materias, // Array de strings
        turmas: turmas,     // Array de strings
        identificacao: form.identificacao.toLowerCase(),
        status: 'ativo',
        criado_em: serverTimestamp()
      });

      toast.success(`${form.genero === 'professor' ? 'Professor' : 'Professora'} cadastrado(a) com sucesso!`);
      
      // Reset total
      setForm({ nome: '', email: '', genero: 'professor', identificacao: '' });
      setMaterias([]);
      setTurmas([]);
    } catch (error) {
      console.error("Erro ao cadastrar r s:", error);
      toast.error("Erro ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 ml-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            CADASTRO DE <span className="text-green-600">PROFESSORES</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            múltiplas atribuições • unidade cept • 2026
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BLOCO 1: IDENTIDADE */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
              <UserPlus size={14} className="text-green-600" /> IDENTIFICAÇÃO BÁSICA
            </h3>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button type="button" onClick={() => setForm({...form, genero: 'professor'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.genero === 'professor' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 grayscale'}`}>Professor</button>
              <button type="button" onClick={() => setForm({...form, genero: 'professora'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.genero === 'professora' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 grayscale'}`}>Professora</button>
            </div>

            <div className="space-y-4">
              <input required type="text" placeholder="nome completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all" />
              
              <div className="relative">
                <input required type="text" placeholder="cpf ou matrícula" value={form.identificacao} onChange={e => setForm({...form, identificacao: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none pl-12 transition-all" />
                <Fingerprint className="absolute left-4 top-4 text-slate-300" size={18} />
              </div>

              <div className="relative">
                <input type="email" placeholder="e-mail institucional" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none pl-12 transition-all" />
                <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
              </div>
            </div>
          </div>

          {/* BLOCO 2: ATRIBUIÇÕES (DINÂMICO) */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-green-600" /> DISCIPLINAS E TURMAS
            </h3>

            {/* MATÉRIAS */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="matéria (ex: inglês)" 
                  value={novaMateria} 
                  onChange={e => setNovaMateria(e.target.value)}
                  className="flex-1 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" 
                />
                <button type="button" onClick={(e) => adicionarItem(e, novaMateria, materias, setMaterias, setNovaMateria)} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all"><Plus size={18}/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {materias.map(m => (
                  <span key={m} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                    {m} <X size={12} className="cursor-pointer" onClick={() => removerItem(m, materias, setMaterias)} />
                  </span>
                ))}
              </div>
            </div>

            {/* TURMAS */}
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="turma (ex: 1001)" 
                  value={novaTurma} 
                  onChange={e => setNovaTurma(e.target.value)}
                  className="flex-1 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" 
                />
                <button type="button" onClick={(e) => adicionarItem(e, novaTurma, turmas, setTurmas, setNovaTurma)} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all"><Plus size={18}/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {turmas.map(t => (
                  <span key={t} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                    {t} <X size={12} className="cursor-pointer" onClick={() => removerItem(t, turmas, setTurmas)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCO 3: RESUMO E ENVIO */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex-1">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-4">Docente Cept</p>
                <h4 className="text-2xl font-black italic uppercase leading-tight">
                  {form.nome || 'Nome do Docente'}<br/>
                  <span className="text-slate-400 text-sm">
                    {materias.length > 0 ? materias.join(' + ') : 'aguardando disciplinas...'}
                  </span>
                </h4>
                <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> {turmas.length} turmas vinculadas
                  </p>
                </div>
              </div>
              <GraduationCap size={160} className="absolute -right-10 -bottom-10 text-white/5 pointer-events-none" />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-green-600 text-white p-7 rounded-[2rem] font-black uppercase italic tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <span className="animate-pulse">SALVANDO...</span> : <><Check size={22} strokeWidth={3} /> FINALIZAR </>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}