import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { Send, X, ClipboardList, UserCheck, Search, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function FormSolicitacaoSecretaria({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'aluno',
  });

  // --- LÓGICA DE BUSCA EM TEMPO REAL ---
  useEffect(() => {
    const buscarExistente = async () => {
      if (formData.nome.length < 3) {
        setSugestoes([]);
        return;
      }

      setBuscando(true);
      try {
        const colecoes = ["cadastro_aluno", "cadastro_funcionarios", "cadastro_professores"];
        let resultados = [];
        const termoBusca = formData.nome.toLowerCase();

        for (const colName of colecoes) {
          const q = query(
            collection(db, colName),
            where("nome", ">=", termoBusca),
            where("nome", "<=", termoBusca + "\uf8ff"),
            limit(3)
          );

          const snap = await getDocs(q);
          snap.forEach(doc => {
            resultados.push({
              id: doc.id,
              ...doc.data(),
              origem: colName.replace("cadastro_", "")
            });
          });
        }
        setSugestoes(resultados);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setBuscando(false);
      }
    };

    const timer = setTimeout(buscarExistente, 500);
    return () => clearTimeout(timer);
  }, [formData.nome]);

  if (!isOpen) return null;

  // --- SELECIONAR E PREENCHER COM PRIORIDADE DE E-MAIL ---
  const selecionarSugestao = (pessoa) => {
    // Lógica R S: Prioridade Aluno > Responsável > Principal
    const emailPrioritario = 
      pessoa.email_aluno || 
      pessoa.email_responsavel || 
      pessoa.email_principal || 
      pessoa.email || 
      '';

    setFormData({
      ...formData,
      nome: pessoa.nome,
      email: emailPrioritario,
      role: pessoa.origem === 'aluno' ? 'aluno' : 'funcionario'
    });
    setSugestoes([]);
    toast.success('Dados importados com sucesso!', {
      style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '12px' }
    });
  };

  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // REGRA R S: Normalização para salvar tudo em lowercase
      const nomeLimpo = formData.nome.toLowerCase().trim();
      const emailBaixo = formData.email.toLowerCase().trim();

      await addDoc(collection(db, "solicitacoes_acesso"), {
        nome: nomeLimpo,
        email: emailBaixo,
        role: formData.role,
        status: 'pendente',
        solicitadoPor: 'secretaria central',
        dataSolicitacao: new Date().toISOString(),
      });

      toast.success('Solicitação enviada ao Root!', {
        duration: 4000,
        position: 'top-center',
        style: { borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }
      });

      setTimeout(() => {
        onClose();
        setFormData({ nome: '', email: '', role: 'aluno' });
      }, 1000);

    } catch (error) {
      toast.error("Falha ao enviar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      {/* Componente que renderiza os Toasts */}
      <Toaster />

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-800 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <ClipboardList size={24} className="text-white" />
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase italic">Nova Solicitação</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">R S - System Control</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="bg-slate-700 p-2 rounded-full hover:bg-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleEnviarSolicitacao} className="p-10 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
            <UserCheck className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Busque por um nome já cadastrado. O sistema irá preencher o e-mail automaticamente.
            </p>
          </div>

          <div className="space-y-4">
            {/* Campo Nome com Auto-complete */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">Nome do Candidato</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  autoComplete="off"
                  placeholder="Comece a digitar o nome..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                {buscando && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />}
              </div>

              {/* Lista de Sugestões */}
              {sugestoes.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 mt-2 rounded-2xl shadow-xl overflow-hidden">
                  {sugestoes.map((p, idx) => {
                    const emailPreview = p.email_aluno || p.email_responsavel || p.email_principal || p.email || "Sem e-mail";
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selecionarSugestao(p)}
                        className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-sm font-black uppercase italic">{p.nome}</p>
                          <p className="text-[10px] text-blue-500 uppercase font-bold">{emailPreview}</p>
                        </div>
                        <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-lg font-black uppercase text-slate-500">{p.origem}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">E-mail para Acesso</label>
              <input 
                required 
                type="email" 
                placeholder="E-mail preenchido automaticamente" 
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 outline-none italic text-slate-600"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">Tipo de Acesso</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="aluno">Aluno</option>
                <option value="funcionario">Funcionário / Professor</option>
                <option value="pai">Responsável</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Solicitar Credenciais</>}
          </button>
        </form>
      </div>
    </div>
  );
}