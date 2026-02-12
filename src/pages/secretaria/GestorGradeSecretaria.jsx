import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { X, Plus, Save, Clock, Search, Users, Filter, Edit3, Trash2, CalendarDays, Printer } from 'lucide-react';

// --- COMPONENTE DE IMPRESSÃO (GRID FIXO PARA NÃO QUEBRAR) ---
const GradeImpressao = ({ turma, grade, dias, slots }) => (
  <div className="hidden-print-template bg-white text-black print-container">
    <div className="print-header">
      <div>
        <h1 className="print-title">HORÁRIO ESCOLAR</h1>
        <p className="print-subtitle">SECRETARIA DE ENSINO • 2026</p>
      </div>
      <div className="text-right">
        <div className="print-turma-badge">
          TURMA: {turma || '---'}
        </div>
        <p className="print-date">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>

    {/* ESTRUTURA DE GRADE FIXA */}
    <div className="print-grid-wrapper">
      {/* CABEÇALHO DE DIAS */}
      <div className="print-grid-row header">
        {dias.map(dia => (
          <div key={dia} className="print-grid-cell header-cell">
            {dia.toUpperCase()}
          </div>
        ))}
      </div>

      {/* LINHAS DE AULAS */}
      {slots.map(linha => (
        <div key={linha} className="print-grid-row">
          {dias.map(dia => {
            const info = grade[`${dia}-${linha}`];
            return (
              <div key={`${dia}-${linha}`} className="print-grid-cell content-cell">
                {info ? (
                  <div className="cell-inner">
                    <span className="cell-time">{info.horarioManual}</span>
                    <span className="cell-subject">{info.materia}</span>
                    <span className="cell-teacher">{info.professor}</span>
                  </div>
                ) : (
                  <span className="cell-vago">VAGO</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>

    <div className="print-footer">
      <span>Documento oficial de organização de classe</span>
      <span>Assinatura da Coordenação: _____________________________________________</span>
    </div>
  </div>
);

export default function GestorGradeSecretaria({ aoFechar }) {
  const [professores, setProfessores] = useState([]);
  const [grade, setGrade] = useState({});
  const [todasGrades, setTodasGrades] = useState({}); 
  const [celulaAtiva, setCelulaAtiva] = useState(null); 
  const [buscaNome, setBuscaNome] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState(''); 
  const [materiaManual, setMateriaManual] = useState(false);
  
  const [selecao, setSelecao] = useState({ 
    professor: '', materia: '', turma: '', horaInicio: '', horaFim: '', dia: '' 
  });

  const dias = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const snapProfs = await getDocs(collection(db, "cadastro_professores"));
        setProfessores(snapProfs.docs.map(d => ({ id: d.id, ...d.data() })));
        const snapGrades = await getDocs(collection(db, "grade_turmas"));
        const mapaGrades = {};
        snapGrades.forEach(doc => { mapaGrades[doc.id] = doc.data().dados || {}; });
        setTodasGrades(mapaGrades);
      } catch (error) { console.error("erro ao carregar dados"); }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (!turmaFiltro) { setGrade({}); return; }
    const idLimpo = turmaFiltro.toLowerCase().trim();
    setGrade(todasGrades[idLimpo] || {});
  }, [turmaFiltro, todasGrades]);

  const professoresFiltrados = professores.filter(p => 
    p.nome?.toLowerCase().includes(buscaNome.toLowerCase())
  );

  const professorSelecionado = professores.find(p => p.nome === selecao.professor);

  const abrirEdicao = (dia, id) => {
    const chave = `${dia}-${id}`; 
    const infoExistente = grade[chave];
    setCelulaAtiva({ dia, id });
    setBuscaNome('');
    setMateriaManual(false);
    
    if (infoExistente) {
      const [inicio, fim] = (infoExistente.horarioManual || "").split(' as ');
      setSelecao({ ...infoExistente, dia, horaInicio: inicio || '', horaFim: fim || '' });
    } else {
      setSelecao({ 
        professor: '', 
        materia: '', 
        turma: turmaFiltro.toLowerCase().trim(), 
        horaInicio: '', 
        horaFim: '', 
        dia 
      });
    }
  };

  const confirmarAtribuicao = () => {
    if (!selecao.professor || !selecao.materia || !selecao.horaInicio || !selecao.horaFim || !selecao.dia) return;
    const horarioFormatado = `${selecao.horaInicio} as ${selecao.horaFim}`.toLowerCase();
    const chave = `${selecao.dia.toLowerCase()}-${celulaAtiva.id}`;
    
    const dadosNormalizados = {
      professor: selecao.professor.toLowerCase().trim(),
      materia: selecao.materia.toLowerCase().trim(),
      turma: turmaFiltro.toLowerCase().trim(),
      horarioManual: horarioFormatado,
      dia: selecao.dia.toLowerCase()
    };

    setGrade({ ...grade, [chave]: dadosNormalizados });
    setCelulaAtiva(null); 
  };

  const excluirSlot = () => {
    const chave = `${selecao.dia}-${celulaAtiva.id}`;
    const novaGrade = { ...grade };
    delete novaGrade[chave];
    setGrade(novaGrade);
    setCelulaAtiva(null);
  };

  const salvarNoFirebase = async () => {
    if (!turmaFiltro) return;
    try {
      const turmaId = turmaFiltro.toLowerCase().trim();
      await setDoc(doc(db, "grade_turmas", turmaId), {
        dados: grade,
        atualizado_em: serverTimestamp(),
        responsavel: "secretaria"
      });
      setTodasGrades(prev => ({ ...prev, [turmaId]: grade }));
    } catch (error) { console.error("erro ao salvar"); }
  };

  return (
    <div className="fixed inset-0 bg-white z-[999] flex flex-col w-screen h-screen overflow-hidden text-slate-800">
      
      {/* CSS DE IMPRESSÃO ULTRA-RÍGIDO */}
      <style>{`
        .hidden-print-template { display: none; }
        
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden; }
          .hidden-print-template, .hidden-print-template * { visibility: visible !important; }
          .hidden-print-template { 
            display: block !important; 
            position: absolute; left: 0; top: 0; width: 100%; 
            background: white !important; padding: 0;
          }

          .print-header { display: flex !important; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 4px solid black; padding-bottom: 10px; }
          .print-title { font-size: 24pt; font-weight: 900; margin: 0; italic: true; }
          .print-subtitle { font-size: 10pt; font-weight: bold; color: #666; letter-spacing: 2px; }
          .print-turma-badge { background: black !important; color: white !important; padding: 5px 15px; font-size: 16pt; font-weight: 900; -webkit-print-color-adjust: exact; }
          .print-date { font-size: 8pt; font-weight: bold; margin-top: 4px; }

          /* FORÇANDO O GRID HORIZONTAL */
          .print-grid-wrapper { border: 2px solid black; width: 100%; display: block !important; }
          .print-grid-row { display: flex !important; flex-direction: row !important; width: 100%; border-bottom: 1px solid black; }
          .print-grid-row.header { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; border-bottom: 2px solid black; }
          .print-grid-cell { 
            width: 20% !important; /* 5 dias = 20% cada */
            border-right: 1px solid black;
            padding: 8px;
            text-align: center;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center;
            min-height: 80px;
          }
          .print-grid-cell:last-child { border-right: none; }
          .header-cell { font-weight: 900; font-size: 10pt; padding: 10px; }
          
          .cell-inner { display: flex !important; flex-direction: column !important; gap: 2px; }
          .cell-time { font-size: 7pt; font-weight: 900; }
          .cell-subject { font-size: 11pt; font-weight: 900; text-transform: uppercase; }
          .cell-teacher { font-size: 8pt; font-weight: bold; color: #444; }
          .cell-vago { font-size: 7pt; opacity: 0.3; font-style: italic; }

          .print-footer { display: flex !important; justify-content: space-between; margin-top: 30px; font-size: 9pt; font-weight: bold; border-top: 1px solid #ccc; pt: 10px; }
        }
      `}</style>

      {/* HEADER TELA */}
      <div className="h-16 border-b border-slate-100 flex justify-between items-center px-8 bg-white shrink-0">
        <h2 className="text-lg font-black uppercase italic tracking-tighter shrink-0">
          GESTOR <span className="text-blue-600">GRADE </span>
        </h2>
        <div className="flex-1 max-w-xs relative mx-10">
          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16}/>
          <input 
            type="text"
            placeholder="TURMA (EX: 201)"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full font-bold text-[11px] uppercase focus:bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
            value={turmaFiltro}
            onChange={(e) => setTurmaFiltro(e.target.value)}
          />
        </div>
        <button onClick={aoFechar} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#f8fafc]">
        {/* ÁREA DA GRADE TELA */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {!turmaFiltro ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Filter size={60} />
              <p className="font-black text-[10px] mt-2 uppercase">Digite a turma para visualizar</p>
            </div>
          ) : (
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-5 gap-4 mb-4">
                {dias.map(dia => (
                  <div key={dia} className="p-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase italic tracking-widest text-center">
                    {dia}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {slots.map(linha => (
                  <div key={linha} className="grid grid-cols-5 gap-4">
                    {dias.map(dia => {
                      const info = grade[`${dia}-${linha}`];
                      return (
                        <div 
                          key={`${dia}-${linha}`} 
                          onClick={() => abrirEdicao(dia, linha)}
                          className={`p-3 h-32 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-center items-center text-center relative group
                            ${info ? 'bg-white border-blue-500 ring-2 ring-blue-50 shadow-sm' : 'bg-slate-50/50 border-slate-100 border-dashed hover:border-blue-300 hover:bg-white'}`}
                        >
                          {info ? (
                            <div className="space-y-1 pointer-events-none">
                              <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{info.horarioManual}</span>
                              <p className="text-[11px] font-black uppercase italic leading-tight">{info.materia}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{info.professor}</p>
                            </div>
                          ) : (
                            <Plus size={20} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAINEL LATERAL */}
        {celulaAtiva && (
          <div className="w-80 bg-white border-l border-slate-100 flex flex-col shadow-2xl shrink-0">
             <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[10px] font-black uppercase text-slate-600 italic">Aula {celulaAtiva.id} - {celulaAtiva.dia}</h3>
              <div className="flex gap-2">
                <button onClick={excluirSlot} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <button onClick={() => setCelulaAtiva(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><CalendarDays size={10}/> Dia da Semana</label>
                <select className="w-full p-3 bg-slate-100 rounded-xl border-none text-xs font-bold h-11 outline-none" value={selecao.dia} onChange={(e) => setSelecao({...selecao, dia: e.target.value})}>
                  {dias.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Search size={10}/> Professor</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-t-xl border border-slate-100 text-xs font-bold outline-none" placeholder="BUSCAR NOME..." value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} />
                <select className="w-full p-3 bg-white rounded-b-xl border-x border-b border-slate-100 text-xs font-bold h-11 outline-none" value={selecao.professor} onChange={(e) => setSelecao({...selecao, professor: e.target.value, materia: ''})}>
                  <option value="">SELECIONAR PROFESSOR...</option>
                  {professoresFiltrados.map(p => <option key={p.id} value={p.nome}>{p.nome?.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Matéria</label>
                  <button onClick={() => setMateriaManual(!materiaManual)} className="text-[8px] font-black text-blue-600 flex items-center gap-1"><Edit3 size={10}/> {materiaManual ? "VER LISTA" : "DIGITAR"}</button>
                </div>
                {materiaManual ? (
                  <input type="text" className="w-full p-3 bg-blue-50/30 rounded-xl border border-blue-100 text-xs font-bold outline-none" value={selecao.materia} onChange={(e) => setSelecao({...selecao, materia: e.target.value})} />
                ) : (
                  <select className="w-full p-3 bg-blue-50/30 rounded-xl border border-blue-100 text-xs font-bold h-11 outline-none" value={selecao.materia} onChange={(e) => setSelecao({...selecao, materia: e.target.value})}>
                    <option value="">ESCOLHA A MATÉRIA...</option>
                    {professorSelecionado?.materias?.map((m, i) => <option key={i} value={m}>{m.toUpperCase()}</option>)}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Horário da Aula</label>
                <div className="flex items-center gap-2">
                  <input type="time" className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold outline-none" value={selecao.horaInicio} onChange={(e) => setSelecao({...selecao, horaInicio: e.target.value})} />
                  <input type="time" className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold outline-none" value={selecao.horaFim} onChange={(e) => setSelecao({...selecao, horaFim: e.target.value})} />
                </div>
              </div>

              <button onClick={confirmarAtribuicao} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Confirmar Aula</button>
            </div>
          </div>
        )}
      </div>

      <div className="h-14 border-t border-slate-100 bg-white flex justify-end items-center px-8 shrink-0 gap-4">
        <button 
          onClick={() => window.print()} 
          className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all active:scale-95"
        >
          <Printer size={16} /> Imprimir Grade
        </button>

        <button onClick={salvarNoFirebase} className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-blue-600 transition-all">
          <Save size={16} /> Salvar Grade Completa
        </button>
      </div>

      <GradeImpressao 
        turma={turmaFiltro} 
        grade={grade} 
        dias={dias} 
        slots={slots} 
      />
    </div>
  );
}