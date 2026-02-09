import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  User, Calendar, Hash, MapPin, Users, 
  Phone, GraduationCap, Save, Loader2, Info 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FormCadastroAluno = () => {
  const [loading, setLoading] = useState(false);
  const [idade, setIdade] = useState('');
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    dataNascimento: '',
    genero: '',
    cpf: '',
    rg: '',
    turma: '',
    periodo: '',
    cep: '',
    endereco: '',
    filiacao: '',
    contatoEmergencia: ''
  });

  // --- LÓGICA: IDADE INTELIGENTE ---
  useEffect(() => {
    if (formData.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(formData.dataNascimento);
      let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idadeCalculada--;
      }
      setIdade(idadeCalculada > 0 ? `${idadeCalculada} anos` : '0 anos');
    }
  }, [formData.dataNascimento]);

  // --- LÓGICA: CEP INTELIGENTE ---
  const buscarCEP = async (cep) => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`.toLowerCase()
          }));
          toast.success("ENDEREÇO LOCALIZADO", { 
            style: { fontSize: '10px', fontWeight: 'bold', border: '1px solid #e2e8f0' } 
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  // --- LÓGICA: TRATAMENTO DE INPUTS (MINÚSCULAS / APENAS NÚMEROS) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // CPF, RG e CEP: Apenas números
    if (name === 'cpf' || name === 'rg' || name === 'cep') {
      finalValue = value.replace(/\D/g, '');
    } else {
      // Nome e outros campos: Sempre minúsculo
      finalValue = value.toLowerCase();
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    if (name === 'cep' && finalValue.length === 8) buscarCEP(finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Gerador de Identificador Único: matricula_nomesobrenome
    const nomeSemEspaco = formData.nome.replace(/\s+/g, '');
    const idUnico = `${formData.matricula}_${nomeSemEspaco}`.toLowerCase();

    try {
      // Salva na coleção cadastro_aluno para sua aprovação posterior
      await setDoc(doc(db, "cadastro_aluno", idUnico), {
        ...formData,
        idUnico,
        idade,
        dataSolicitacao: serverTimestamp(),
        statusAcesso: 'pendente',
        role: 'aluno'
      });
      
      toast.success("SOLICITAÇÃO ENVIADA COM SUCESSO!", {
        style: { background: '#020617', color: '#fff', fontWeight: 'bold', fontSize: '12px' }
      });
      
      // Reseta o formulário
      setFormData({
        matricula: '', nome: '', dataNascimento: '', genero: '', cpf: '', rg: '',
        turma: '', periodo: '', cep: '', endereco: '', filiacao: '', contatoEmergencia: ''
      });
      setIdade('');
      
    } catch (error) {
      toast.error("ERRO AO SALVAR: " + error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-10 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header Estilizado RodhonSystem */}
        <div className="bg-[#020617] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Secretaria Virtual</h2>
            </div>
            <p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.4em]">Cadastro e Solicitação de Acesso • C.E.P.T</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          
          {/* SEÇÃO 1: ACESSO */}
          <section>
            <div className="flex items-center gap-3 mb-8">
               <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
               <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">01. Identificação Escolar</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2">
                  <Hash size={12}/> Matrícula (Manual)
                </label>
                <input name="matricula" required value={formData.matricula} onChange={handleChange} placeholder="ex: 2026001" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-all text-sm shadow-sm" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2">
                  <User size={12}/> Nome Completo do Aluno
                </label>
                <input name="nome" required value={formData.nome} onChange={handleChange} placeholder="ex: caio giromba" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-all text-sm shadow-sm" />
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: DADOS PESSOAIS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nascimento</label>
              <input type="date" name="dataNascimento" required value={formData.dataNascimento} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Idade</label>
              <div className="w-full px-6 py-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black text-blue-700 text-sm flex items-center gap-2">
                <Calendar size={14} /> {idade || "---"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4">CPF (Só números)</label>
              <input name="cpf" required value={formData.cpf} onChange={handleChange} maxLength={11} placeholder="000.000.000-00" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4">RG / Identidade</label>
              <input name="rg" value={formData.rg} onChange={handleChange} placeholder="00.000.000-0" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
            </div>
          </section>

          {/* SEÇÃO 3: TURMA */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Turma / Ano Escolar</label>
                <input name="turma" required value={formData.turma} onChange={handleChange} placeholder="ex: 9º ano b" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Período</label>
                <select name="periodo" required value={formData.periodo} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm appearance-none">
                  <option value="">Selecione o turno</option>
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Gênero</label>
                <select name="genero" required value={formData.genero} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm appearance-none">
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
             </div>
          </section>

          {/* SEÇÃO 4: ENDEREÇO E FAMÍLIA */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
               <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">02. Endereço e Filiação</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">CEP (Busca automática)</label>
                <input name="cep" required value={formData.cep} onChange={handleChange} maxLength={8} placeholder="00000-000" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Endereço Residencial</label>
                <input name="endereco" required value={formData.endereco} onChange={handleChange} placeholder="Rua, número, bairro..." className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2"><Users size={12}/> Nome do Responsável (Filiação)</label>
                <input name="filiacao" required value={formData.filiacao} onChange={handleChange} placeholder="ex: maria giromba" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2"><Phone size={12}/> Telefone de Emergência</label>
                <input name="contatoEmergencia" required value={formData.contatoEmergencia} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-700 text-sm shadow-sm" />
              </div>
            </div>
          </section>

          {/* BOTÃO FINALIZAR */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#020617] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.4em] text-[13px] hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:bg-slate-300 shadow-2xl active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Enviar Solicitação de Cadastro <Save size={22} /></>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Info size={12}/> Suas informações serão analisadas pela secretaria para liberação do acesso.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default FormCadastroAluno;