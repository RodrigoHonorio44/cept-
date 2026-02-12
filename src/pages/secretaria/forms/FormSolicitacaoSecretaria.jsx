import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { Send, X, ClipboardList, Search, Loader2, ShieldAlert } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function FormSolicitacaoSecretaria({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'aluno',
    cpf: '',
    metadata: {} 
  });

  // r s: Exibição elegante (Rogeria dos Santos), mas dados salvos em lowercase
  const formatarNomeVisivel = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // r s: Gerador de Protocolo Personalizado ceptacesso2026 + números aleatórios
  const gerarProtocolo = () => {
    const prefixo = "ceptacesso2026";
    const random = Math.floor(100000 + Math.random() * 900000); // Gera 6 números aleatórios
    return `${prefixo}${random}`;
  };

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
        console.error("Erro na busca r s:", error);
      } finally {
        setBuscando(false);
      }
    };

    const timer = setTimeout(buscarExistente, 500);
    return () => clearTimeout(timer);
  }, [formData.nome]);

  if (!isOpen) return null;

  const selecionarSugestao = (pessoa) => {
    const emailPrioritario = pessoa.email_principal || pessoa.email_responsavel || pessoa.email_aluno || pessoa.email || '';
    
    // r s: Normalizando metadados para minúsculas antes de salvar
    let extraData = {};
    let novaRole = 'aluno';

    if (pessoa.origem === 'aluno') {
      novaRole = 'aluno';
      extraData = {
        turma: (pessoa.turma || '').toLowerCase(),
        matricula: (pessoa.matricula || '').toLowerCase(),
        cpf_responsavel: pessoa.cpf_responsavel || '',
        nome_responsavel: (pessoa.nome_responsavel || '').toLowerCase(),
        idUnico: pessoa.idUnico || ''
      };
    } else {
      novaRole = 'funcionario';
      extraData = {
        cargo_funcao: (pessoa.origem === 'professores' ? 'professor' : (pessoa.cargo || '')).toLowerCase(),
        materia: (pessoa.materia || '').toLowerCase()
      };
    }

    setFormData({
      ...formData,
      nome: pessoa.nome.toLowerCase(),
      email: emailPrioritario.toLowerCase(),
      cpf: pessoa.cpf || '',
      role: novaRole,
      metadata: extraData
    });

    setSugestoes([]);
    toast.success(`Importado: ${formatarNomeVisivel(pessoa.nome)} r s`);
  };

  const usaCpfResponsavel = formData.role === 'aluno' && formData.cpf && formData.cpf === formData.metadata.cpf_responsavel;

  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    setLoading(true);
    const protocolo = gerarProtocolo();

    try {
      const payload = {
        protocolo: protocolo, // ceptacesso2026XXXXXX
        nome: formData.nome.toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        role: formData.role,
        status: 'pendente',
        solicitadoPor: 'secretaria central',
        dataSolicitacao: serverTimestamp(),
        ...formData.metadata 
      };

      await addDoc(collection(db, "solicitacoes_acesso"), payload);
      
      // r s: Exibe o protocolo personalizado no Toast
      toast.success(`Protocolo Gerado: ${protocolo}`, {
        duration: 8000,
        style: { 
          background: '#1e293b', 
          color: '#fff', 
          fontWeight: 'bold',
          border: '1px solid #3b82f6'
        }
      });

      setTimeout(() => {
        onClose();
        setFormData({ nome: '', email: '', role: 'aluno', cpf: '', metadata: {} });
      }, 2000);

    } catch (error) {
      toast.error("Erro ao processar r s: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans">
      <Toaster position="top-center" />

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><ClipboardList size={24} /></div>
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase italic">Solicitação de Acesso</h2>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Protocolo CEPT • r s</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-slate-700 p-2 rounded-full hover:bg-red-500 transition-all shadow-lg"><X size={20} /></button>
        </div>

        <form onSubmit={handleEnviarSolicitacao} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Nome Completo</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  autoComplete="off"
                  placeholder="Pesquisar cadastro..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold capitalize"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value.toLowerCase()})} 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                {buscando && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />}
              </div>

              {sugestoes.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 mt-2 rounded-2xl shadow-xl overflow-hidden">
                  {sugestoes.map((p, idx) => (
                    <button key={idx} type="button" onClick={() => selecionarSugestao(p)}
                      className="w-full p-4 text-left hover:bg-blue-50 border-b border-slate-50 flex justify-between items-center transition-colors">
                      <div>
                        <p className="text-sm font-black uppercase italic">{formatarNomeVisivel(p.nome)}</p>
                        <p className="text-[10px] text-blue-500 uppercase font-bold">{p.origem === 'aluno' ? `turma ${p.turma}` : p.cargo || p.origem} • {p.cpf || 'sem cpf'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">CPF</label>
                <input required type="text" placeholder="000.000.000-00" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-bold"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Permissão</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none cursor-pointer"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="aluno">aluno</option>
                  <option value="funcionario">funcionário</option>
                  <option value="pai">responsável</option>
                </select>
              </div>
            </div>

            {usaCpfResponsavel && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 animate-pulse">
                <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                <p className="text-[11px] font-bold text-amber-700 italic">CPF do Responsável: {formatarNomeVisivel(formData.metadata.nome_responsavel)}</p>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">E-mail para Acesso</label>
              <input required type="email" placeholder="email@dominio.com" 
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 outline-none font-bold text-slate-600 lowercase"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})} />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 uppercase active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Gerar Protocolo r s</>}
          </button>
        </form>
      </div>
    </div>
  );
}