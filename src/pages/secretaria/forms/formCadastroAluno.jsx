import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  User, Calendar, Hash, MapPin, Users, Clock,
  Phone, GraduationCap, Save, Loader2, Info, Lock, Unlock, Eraser
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FormCadastroAluno = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [idade, setIdade] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  
  const initialFormState = {
    matricula: '', // Alterado para vazio para o placeholder "e-cidade" aparecer
    nome: '',
    dataNascimento: '',
    genero: '',
    cpf: '',
    rg: '',
    turma: '', // Campo mantido
    periodo: '', // Campo mantido
    cep: '',
    rua: '',
    complemento: '',
    bairro: '',
    nome_mae: '',
    nome_pai: '',
    nome_responsavel: '',
    parentesco_responsavel: '',
    cpf_responsavel: '',
    rg_responsavel: '',
    contatoEmergencia: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const limparFormulario = () => {
    setFormData(initialFormState);
    setIdade('');
    toast.success("FORMULÁRIO LIMPO");
  };

  const aplicarMascaraTelefone = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 11) return cleaned.slice(0, 11);
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    return cleaned;
  };

  const buscarAlunoNoBanco = async (nomeDigitado) => {
    if (nomeDigitado.length < 4) return;
    setSearching(true);
    try {
      const nomeBusca = nomeDigitado.toLowerCase().trim();
      const q = query(collection(db, "cadastro_aluno"), where("nome", "==", nomeBusca));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const dados = querySnapshot.docs[0].data();
        const formatar = (str) => str ? str.replace(/\b\w/g, l => l.toUpperCase()) : "";

        setFormData({
          ...dados,
          nome: formatar(dados.nome),
          nome_mae: formatar(dados.nome_mae),
          nome_pai: formatar(dados.nome_pai),
          nome_responsavel: formatar(dados.nome_responsavel),
          rua: formatar(dados.rua),
          bairro: formatar(dados.bairro),
          complemento: formatar(dados.complemento),
          matricula: dados.matricula || ''
        });
        toast.success("DADOS LOCALIZADOS");
      }
    } catch (error) { console.error(error); } finally { setSearching(false); }
  };

  useEffect(() => {
    if (formData.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(formData.dataNascimento);
      let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idadeCalculada--;
      setIdade(idadeCalculada > 0 ? `${idadeCalculada} anos` : '0 anos');
    }
  }, [formData.dataNascimento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (['cpf', 'rg', 'cep', 'cpf_responsavel', 'rg_responsavel', 'contatoEmergencia'].includes(name)) {
      finalValue = value.replace(/\D/g, '');
    } 
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (name === 'cep' && finalValue.length === 8) {
        fetch(`https://viacep.com.br/ws/${finalValue}/json/`)
          .then(res => res.json())
          .then(data => {
            if(!data.erro) setFormData(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro }));
          });
    }
    if (name === 'nome') buscarAlunoNoBanco(finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = Object.keys(formData).reduce((acc, key) => {
      acc[key] = typeof formData[key] === 'string' ? formData[key].toLowerCase().trim() : formData[key];
      return acc;
    }, {});

    const numMatricula = dataToSave.matricula.replace(/\D/g, '');
    const idSufixo = dataToSave.cpf ? dataToSave.cpf : dataToSave.cpf_responsavel;
    const idUnico = `ecidade_${numMatricula}_${idSufixo}`;

    try {
      await setDoc(doc(db, "cadastro_aluno", idUnico), {
        ...dataToSave,
        idUnico: idUnico,
        dataAtualizacao: serverTimestamp(),
      });
      
      toast.success("CADASTRO ATUALIZADO COM SUCESSO!");
      limparFormulario();
    } catch (error) { 
      console.error(error);
      toast.error("ERRO AO SALVAR"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-10 font-sans text-left">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-[#020617] p-10 text-white relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-xl"><GraduationCap size={28} /></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Secretaria Virtual</h2>
          </div>
          <p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] mt-2">Sistema C.E.P.T</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          
          {/* 01. IDENTIFICAÇÃO */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b pb-4">
               <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-6 bg-blue-600 rounded-full"></div> 01. Identificação do Aluno
               </h3>
               <div className="flex gap-2">
                 <button type="button" onClick={limparFormulario} className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 bg-red-50 text-red-600 text-[9px] font-black uppercase hover:bg-red-100 transition-all">
                    <Eraser size={12} /> Limpar
                 </button>
                 <button type="button" onClick={() => setIsLocked(!isLocked)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase transition-all ${isLocked ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />} {isLocked ? 'Campos Bloqueados' : 'Edição Liberada'}
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">E - Cidade (Números)</label>
                <input name="matricula" required value={formData.matricula} onChange={handleChange} placeholder="e-cidade" className="input-rs font-bold text-blue-600" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2">
                  Nome Completo {searching && <Loader2 size={12} className="animate-spin text-blue-500" />}
                </label>
                <input name="nome" required value={formData.nome} onChange={handleChange} placeholder="Digite o nome completo" className="input-rs" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nascimento</label>
                <input type="date" name="dataNascimento" required value={formData.dataNascimento} onChange={handleChange} className="input-rs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Idade</label>
                <div className="input-rs bg-blue-50/50 border-blue-100 text-blue-700 flex items-center gap-2 font-black uppercase"><Calendar size={14} /> {idade || "---"}</div>
              </div>
              {/* CAMPOS READICIONADOS ABAIXO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Turma</label>
                <input name="turma" required value={formData.turma} onChange={handleChange} placeholder="Ex: 1001" className="input-rs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Turno</label>
                <select name="periodo" required value={formData.periodo} onChange={handleChange} className="input-rs">
                  <option value="">Selecione...</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">CPF Aluno</label>
                <input name="cpf" value={formData.cpf} onChange={handleChange} disabled={isLocked} placeholder="Só números" className={`input-rs ${isLocked ? 'opacity-50' : ''}`} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">RG Aluno</label>
                <input name="rg" value={formData.rg} onChange={handleChange} disabled={isLocked} placeholder="Só números" className={`input-rs ${isLocked ? 'opacity-50' : ''}`} />
              </div>
            </div>
          </section>

          {/* 02. FILIAÇÃO E RESPONSÁVEL */}
          <section className="space-y-8">
            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div> 02. Filiação e Responsáveis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nome da Mãe</label>
                <input name="nome_mae" required value={formData.nome_mae} onChange={handleChange} placeholder="Nome completo da mãe" className="input-rs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nome do Pai</label>
                <input name="nome_pai" required value={formData.nome_pai} onChange={handleChange} placeholder="Nome completo do pai" className="input-rs" />
              </div>
            </div>

            <div className="p-8 bg-blue-50/20 rounded-[32px] border border-blue-100 space-y-6">
              <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2"><Info size={14}/> Responsável Legal pela Matrícula</p>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Parentesco</label>
                  <select name="parentesco_responsavel" required value={formData.parentesco_responsavel} onChange={handleChange} className="input-rs bg-white">
                    <option value="">Selecione...</option>
                    <option value="mae">Mãe</option>
                    <option value="pai">Pai</option>
                    <option value="avo">Avô/Avó</option>
                    <option value="tio">Tio/Tia</option>
                  </select>
                </div>
                <div className="md:col-span-5 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nome do Responsável</label>
                  <input name="nome_responsavel" required value={formData.nome_responsavel} onChange={handleChange} placeholder="Nome completo" className="input-rs bg-white" />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">CPF do Responsável</label>
                  <input name="cpf_responsavel" required value={formData.cpf_responsavel} onChange={handleChange} placeholder="Só números" className="input-rs bg-white" />
                </div>
              </div>
            </div>
          </section>

          {/* 03. ENDEREÇO */}
          <section className="space-y-8">
            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div> 03. Localização e Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">CEP</label>
                <input name="cep" required value={formData.cep} onChange={handleChange} placeholder="00000000" className="input-rs" />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Rua</label>
                <input name="rua" required value={formData.rua} onChange={handleChange} placeholder="Logradouro" className="input-rs" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Complemento</label>
                <input name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Apto, Bloco..." className="input-rs" />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Bairro</label>
                <input name="bairro" required value={formData.bairro} onChange={handleChange} placeholder="Nome do Bairro" className="input-rs" />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 text-blue-600">Celular de Contato</label>
                <input name="contatoEmergencia" required value={aplicarMascaraTelefone(formData.contatoEmergencia)} onChange={handleChange} placeholder="(21) 90000-0000" className="input-rs border-blue-200" />
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-[#020617] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.3em] text-[13px] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-xl">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <>Salvar Matrícula <Save size={22} /></>}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-rs { width: 100%; padding: 1rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; color: #334155; outline: none; transition: all 0.2s; font-size: 0.875rem; }
        .input-rs:focus:not(:disabled) { border-color: #2563eb; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
      `}</style>
    </div>
  );
};

export default FormCadastroAluno;