import React, { useState } from 'react';
import { db } from '../../../services/firebase'; // Ajustado para a nova estrutura de pastas
import { collection, addDoc } from 'firebase/firestore';
import { Send, X, ClipboardList, UserCheck } from 'lucide-react';

export default function FormSolicitacaoSecretaria({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'aluno', // Valor padrão
  });

  if (!isOpen) return null;

  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // REGRA R S: Normalização rigorosa antes de enviar para o Root
      const nomeLimpo = formData.nome.trim();
      const nomeBusca = nomeLimpo.toLowerCase();
      const emailBaixo = formData.email.toLowerCase().trim();

      await addDoc(collection(db, "solicitacoes_acesso"), {
        nome: nomeLimpo,        // Nome completo para exibição
        nome_busca: nomeBusca,  // Nome para facilitar sua busca como Root
        email: emailBaixo,
        role: formData.role,
        status: 'pendente',     // Começa como pendente para sua aprovação
        solicitadoPor: 'Secretaria Central',
        dataSolicitacao: new Date().toISOString(),
      });

      alert("Solicitação de acesso enviada com sucesso! Aguarde a aprovação do Root.");
      onClose();
    } catch (error) {
      console.error("Erro ao solicitar acesso:", error);
      alert("Falha ao enviar solicitação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header do Modal */}
        <div className="bg-slate-800 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-cept-blue p-2 rounded-xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase italic">Nova Solicitação</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Secretaria - R S System</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 bg-slate-700 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleEnviarSolicitacao} className="p-10 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
            <UserCheck className="text-cept-blue shrink-0" size={20} />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Este cadastro passará por revisão do administrador. O utilizador só terá acesso após a criação oficial das credenciais.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">Nome Completo do Candidato</label>
              <input 
                required 
                type="text" 
                placeholder="Ex: João da Silva Honório" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-cept-blue transition-all"
                onChange={(e) => setFormData({...formData, nome: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">E-mail de Contacto</label>
              <input 
                required 
                type="email" 
                placeholder="exemplo@escola.pt" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-cept-blue transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2 tracking-widest">Tipo de Conta Requisitada</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cept-blue appearance-none"
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="aluno">Novo Aluno</option>
                <option value="pai">Responsável (Pai/Mãe)</option>
                <option value="funcionario">Funcionário / Professor</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-tighter mt-4"
          >
            {loading ? "A processar..." : <><Send size={20} /> Enviar Solicitacão de Acesso</>}
          </button>
        </form>
      </div>
    </div>
  );
}