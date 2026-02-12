import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { Printer, X, Search, Loader2, UserCheck } from 'lucide-react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';

const GeradorDocumento = ({ aluno: alunoInicial, tipoDoc, onClose }) => {
  const [aluno, setAluno] = useState(alunoInicial);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);

  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const idDoc = `${aluno?.matricula || '0000'}-${tipoDoc?.substring(0,3)}`.toLowerCase();

  // FORMATADORES
  const formatarCPF = (cpf) => {
    if (!cpf) return "não informado";
    const limpo = cpf.replace(/\D/g, "");
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const buscarAluno = async (e) => {
    if (e) e.preventDefault();
    if (!busca) return;
    
    setCarregando(true);
    const termoOriginal = busca.toLowerCase().trim();
    const termoNumerico = termoOriginal.replace(/\D/g, '');

    try {
      // ATUALIZADO: Nome da coleção para cadastro_aluno
      const alunosRef = collection(db, "cadastro_aluno");
      let resultado = null;

      // 1. Busca por nome completo (lowercase)
      const qNome = query(alunosRef, where("nome", "==", termoOriginal));
      const snapNome = await getDocs(qNome);
      if (!snapNome.empty) resultado = snapNome.docs[0];

      // 2. Busca por CPF (apenas números)
      if (!resultado && termoNumerico.length > 0) {
        const qCpf = query(alunosRef, where("cpf", "==", termoNumerico));
        const snapCpf = await getDocs(qCpf);
        if (!snapCpf.empty) resultado = snapCpf.docs[0];
      }

      if (resultado) {
        setAluno({ id: resultado.id, ...resultado.data() });
        toast.success('aluno localizado no rodhonsystem!');
      } else {
        toast.error('nenhum registro encontrado em cadastro_aluno.');
      }
    } catch (error) {
      console.error("Erro Firebase:", error);
      toast.error('erro na comunicação com o banco.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* TOOLBAR */}
      <div className="print:hidden bg-slate-900 p-4 flex flex-wrap gap-6 justify-between items-center sticky top-0 shadow-2xl z-[210]">
        <button onClick={onClose} className="text-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:text-red-400 transition-colors">
          <X size={20} /> Fechar
        </button>

        <form onSubmit={buscarAluno} className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="nome completo ou cpf..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-slate-700 focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
          {carregando && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={16} />}
        </form>

        <button 
          onClick={() => window.print()} 
          disabled={!aluno}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          <Printer size={20} /> Imprimir R S
        </button>
      </div>

      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
        {aluno ? (
          <div className="relative max-w-[21cm] w-full my-10 p-[2.5cm] border border-slate-100 shadow-2xl bg-white print:shadow-none print:border-none print:my-0 animate-in fade-in duration-500 overflow-hidden">
            
            {/* MARCA D'ÁGUA */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none print:opacity-[0.06]">
              <img src="/10.png" alt="watermark" className="w-[15cm] h-auto rotate-[-15deg]" />
            </div>

            {/* CABEÇALHO */}
            <div className="relative text-center border-b-4 border-slate-900 pb-8 mb-12">
              <img src="/10.png" alt="logo" className="w-20 h-auto mx-auto mb-4" />
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">C.E.P.T</h1>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">Centro de Operações • RodhonSystem</p>
              <p className="text-[10px] uppercase font-bold text-slate-400">maricá • rj</p>
            </div>

            <h2 className="relative text-center text-2xl font-black underline mb-20 uppercase underline-offset-8">
              Declaração de {tipoDoc}
            </h2>

            {/* CORPO DO TEXTO (COM ENDEREÇO) */}
            <div className="relative space-y-8 text-justify text-slate-800 leading-[2] font-serif text-lg">
              <p>
                Declaramos para os devidos fins que o(a) aluno(a) <strong className="lowercase text-2xl underline decoration-blue-200">{aluno.nome}</strong>, 
                matrícula <strong>{aluno.matricula}</strong> e CPF <strong>{formatarCPF(aluno.cpf)}</strong>, 
                residente em <span className="lowercase"><strong>{aluno.rua}</strong>, <strong>{aluno.bairro}</strong></span>, 
                encontra-se regularmente matriculado(a) nesta unidade escolar.
              </p>
              <p>
                O referido discente frequenta a turma <strong>{aluno.turma}</strong> no período da <strong>{aluno.periodo}</strong>, 
                estando em pleno gozo de seus direitos estudantis para o ano letivo de 2026.
              </p>
            </div>

            {/* RODAPÉ */}
            <div className="relative mt-40 flex justify-between items-end">
              <div className="text-center">
                <div className="w-72 border-t-2 border-slate-900 pt-3">
                  <p className="text-[11px] font-black uppercase tracking-widest">Secretaria Escolar</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">C.E.P.T Maricá - RS</p>
                  <p className="text-[9px] text-blue-600 font-mono mt-1 font-bold">emissão: {dataHoje}</p>
                </div>
              </div>

              <div className="flex flex-col items-center p-3 border-2 border-slate-100 rounded-[2rem] bg-slate-50/50">
                <QRCodeSVG value={`https://cept.marica.gov.br/validar/${aluno.id}`} size={90} level="H" />
                <div className="text-center mt-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Autenticidade</p>
                  <p className="text-[9px] font-mono font-black text-slate-900 uppercase">{idDoc}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
             <div className="bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center border border-slate-100">
               <UserCheck size={48} className="opacity-20 text-slate-900 mb-6" />
               <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-500 mb-2">Painel RodhonSystem</p>
               <p className="text-sm font-bold text-slate-400 italic text-center">Coleção: cadastro_aluno</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeradorDocumento;