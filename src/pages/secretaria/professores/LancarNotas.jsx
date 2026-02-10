import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Users, GraduationCap } from 'lucide-react';

export default function LancarNotas({ professorData }) {
  const [turmaSel, setTurmaSel] = useState('');
  const [materiaSel, setMateriaSel] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [notas, setNotas] = useState({}); // { alunoId: { 1: 8, 2: 7 ... } }
  const [salvando, setSalvando] = useState(false);

  // r s: busca alunos da turma selecionada em tempo real
  useEffect(() => {
    if (!turmaSel) {
      setAlunos([]);
      return;
    }

    const q = query(collection(db, "cadastro_alunos"), where("turma", "==", turmaSel));
    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlunos(lista);
    }, (error) => console.error("erro ao buscar alunos r s:", error));

    return () => unsub();
  }, [turmaSel]);

  const lidar_com_nota = (alunoId, bimestre, valor) => {
    // r s: salva o valor como número ou string vazia se inválido
    const numValor = valor === "" ? "" : parseFloat(valor);
    setNotas(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], [bimestre]: numValor }
    }));
  };

  // r s: Lógica de gravação definitiva no Boletim Central
  const salvar_notas = async () => {
    if (Object.keys(notas).length === 0) {
      alert("nenhuma nota foi digitada r s");
      return;
    }

    setSalvando(true);
    try {
      const promises = Object.entries(notas).map(([alunoId, bimestres]) => {
        // Criamos um ID único para o boletim: alunoID + materia
        // Normalizamos o nome da matéria para evitar problemas no ID
        const materiaId = materiaSel.toLowerCase().replace(/\s+/g, '_');
        const boletimRef = doc(db, "notas_boletim", `${alunoId}_${materiaId}`);
        
        // Mapeamos os números dos bimestres para as chaves do banco
        const dadosParaSalvar = {
          id_aluno: alunoId,
          id_materia: materiaSel.toLowerCase(),
          id_professor: professorData?.nome?.toLowerCase() || 'docente',
          turma: turmaSel,
          ultima_atualizacao: new Date()
        };

        // r s: injeta apenas os bimestres que foram alterados nesta sessão
        Object.entries(bimestres).forEach(([bim, valor]) => {
          if (valor !== "") dadosParaSalvar[`bimestre_${bim}`] = valor;
        });

        return setDoc(boletimRef, dadosParaSalvar, { merge: true });
      });

      await Promise.all(promises);
      
      alert("notas sincronizadas com o boletim central r s!");
      setNotas({}); // Limpa estado local após sucesso
    } catch (e) {
      console.error("erro ao salvar r s:", e);
      alert("falha na sincronização.");
    } finally { 
      setSalvando(false); 
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER DE SELEÇÃO r s */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 mb-2 block">Selecionar Turma</label>
          <select 
            onChange={(e) => setTurmaSel(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase italic text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">Escolha a Turma</option>
            {professorData?.turmas?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 mb-2 block">Selecionar Disciplina</label>
          <select 
            onChange={(e) => setMateriaSel(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase italic text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">Escolha a Matéria</option>
            {professorData?.materias?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* TABELA DE LANÇAMENTO r s */}
      {turmaSel && materiaSel ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <Users className="text-blue-600" size={20} />
               <h3 className="font-black uppercase italic text-slate-800 tracking-tighter">Lista de Alunos - {turmaSel}</h3>
            </div>
            <button 
              onClick={salvar_notas}
              disabled={salvando || Object.keys(notas).length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black uppercase italic text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30"
            >
              {salvando ? "Sincronizando..." : <><Save size={16}/> Salvar no Boletim</>}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Aluno</th>
                  {[1, 2, 3, 4].map(b => (
                    <th key={b} className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bimestre {b}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {alunos.map(aluno => (
                  <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                          {aluno.nome?.charAt(0)}
                        </div>
                        <span className="font-black uppercase italic text-slate-700 text-xs tracking-tight">{aluno.nome}</span>
                      </div>
                    </td>
                    {[1, 2, 3, 4].map(bim => (
                      <td key={bim} className="p-6 text-center">
                        <input 
                          type="number" 
                          min="0" max="10" step="0.1"
                          placeholder="0.0"
                          className="w-16 bg-slate-100 border-none rounded-lg p-2 text-center font-black text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          onChange={(e) => lidar_com_nota(aluno.id, bim, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2.5rem] p-20 text-center">
           <GraduationCap size={48} className="mx-auto text-blue-300 mb-4 animate-bounce" />
           <p className="font-black uppercase italic text-blue-400 tracking-widest text-sm">Selecione turma e disciplina r s</p>
        </div>
      )}
    </div>
  );
}