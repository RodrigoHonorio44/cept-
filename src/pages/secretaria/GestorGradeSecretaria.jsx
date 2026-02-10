import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { X, Plus, Save, User, BookOpen, Users, Clock, Trash2 } from 'lucide-react';

export default function GestorGradeSecretaria({ aoFechar }) {
  const [professores, setProfessores] = useState([]);
  const [grade, setGrade] = useState({});
  const [celulaAtiva, setCelulaAtiva] = useState(null); 
  const [selecao, setSelecao] = useState({ 
    professor: '', 
    materia: '', 
    turma: '', 
    horarioManual: '' 
  });

  const dias = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];
  const slots = [1, 2, 3, 4, 5, 6, 7];

  // 1. Carregar Professores e Grade Existente r s
  useEffect(() => {
    const carregarDados = async () => {
      // Carrega Professores
      const snapProfs = await getDocs(collection(db, "usuarios"));
      const listaProfs = snapProfs.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role === 'professor');
      setProfessores(listaProfs);

      // Carrega Grade salva (opcional, para não começar do zero)
      const docRef = doc(db, "configuracoes", "grade_horaria_geral");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGrade(docSnap.data().dados || {});
      }
    };
    carregarDados();
  }, []);

  // 2. Função para abrir edição carregando dados r s
  const abrirEdicao = (dia, id) => {
    const infoExistente = grade[`${dia}-${id}`];
    setCelulaAtiva({ dia, id });
    
    if (infoExistente) {
      setSelecao(infoExistente);
    } else {
      setSelecao({ professor: '', materia: '', turma: '', horarioManual: '' });
    }
  };

  // 3. Função para excluir horário r s
  const excluirHorario = () => {
    const chave = `${celulaAtiva.dia}-${celulaAtiva.id}`;
    const novaGrade = { ...grade };
    delete novaGrade[chave];
    setGrade(novaGrade);
    setCelulaAtiva(null);
  };

  const confirmarAtribuicao = () => {
    if (!selecao.professor || !selecao.materia || !selecao.horarioManual) {
      alert("preencha o horário, professor e matéria r s");
      return;
    }
    const chave = `${celulaAtiva.dia}-${celulaAtiva.id}`;
    setGrade({ ...grade, [chave]: { ...selecao } });
    setCelulaAtiva(null); 
    setSelecao({ professor: '', materia: '', turma: '', horarioManual: '' });
  };

  const salvarNoFirebase = async () => {
    try {
      await setDoc(doc(db, "configuracoes", "grade_horaria_geral"), {
        dados: grade,
        atualizado_em: serverTimestamp(),
        responsavel: "secretaria_r_s"
      });
      alert("grade salva com sucesso r s");
      if (aoFechar) aoFechar();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white text-left overflow-hidden rounded-[40px]">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
            Gestor de Grade <span className="text-blue-600">Manual R S</span>
          </h2>
        </div>
        <button onClick={aoFechar} className="p-2 bg-white shadow-sm rounded-xl text-slate-400 hover:text-red-500 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* GRID PRINCIPAL */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#fcfcfc]">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                {dias.map(dia => (
                  <th key={dia} className="p-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(linha => (
                <tr key={linha}>
                  {dias.map(dia => {
                    const info = grade[`${dia}-${linha}`];
                    return (
                      <td 
                        key={dia} 
                        onClick={() => abrirEdicao(dia, linha)}
                        className={`p-4 h-32 w-48 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col justify-center items-center text-center
                          ${info ? 'border-blue-500 bg-white shadow-md' : 'border-slate-100 bg-white/50 hover:border-blue-300'}`}
                      >
                        {info ? (
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-blue-600 flex items-center justify-center gap-1"><Clock size={10}/> {info.horarioManual}</span>
                            <p className="text-[10px] font-black text-slate-800 uppercase italic leading-none">{info.materia}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{info.professor}</p>
                            <span className="block mt-1 text-[7px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">Turma: {info.turma}</span>
                          </div>
                        ) : (
                          <Plus size={18} className="text-slate-200" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAINEL LATERAL DE EDIÇÃO R S */}
        {celulaAtiva && (
          <div className="w-80 border-l border-slate-100 flex flex-col bg-white animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase italic text-slate-700 flex items-center gap-2">
                   {grade[`${celulaAtiva.dia}-${celulaAtiva.id}`] ? "Editar Horário" : "Novo Horário"}
                </h3>
                {/* BOTÃO EXCLUIR R S */}
                {grade[`${celulaAtiva.dia}-${celulaAtiva.id}`] && (
                  <button onClick={excluirHorario} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block ml-1">Horário (ex: 08:00 às 10:00)</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 ring-blue-500/20"
                  value={selecao.horarioManual}
                  onChange={(e) => setSelecao({...selecao, horarioManual: e.target.value.toLowerCase()})}
                />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block ml-1">Professor</label>
                <select 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 ring-blue-500/20"
                  value={selecao.professor}
                  onChange={(e) => setSelecao({...selecao, professor: e.target.value})}
                >
                  <option value="">escolher prof...</option>
                  {professores.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block ml-1">Matéria</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 ring-blue-500/20"
                  value={selecao.materia}
                  onChange={(e) => setSelecao({...selecao, materia: e.target.value.toLowerCase()})}
                />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block ml-1">Turma (Manual)</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 ring-blue-500/20"
                  value={selecao.turma}
                  onChange={(e) => setSelecao({...selecao, turma: e.target.value.toLowerCase()})}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-50 space-y-2 bg-white">
                <button 
                  onClick={confirmarAtribuicao}
                  className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg"
                >
                  Confirmar Alteração
                </button>
                <button onClick={() => setCelulaAtiva(null)} className="w-full text-[9px] font-black uppercase text-slate-400">
                  cancelar
                </button>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ GERAL */}
      <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
        <button 
          onClick={salvarNoFirebase}
          className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 transition-all"
        >
          <Save size={16} /> Salvar Grade Final 
        </button>
      </div>
    </div>
  );
}