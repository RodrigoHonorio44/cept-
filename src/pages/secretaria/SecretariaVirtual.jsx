import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Send, FileText, Clock, Printer, History, Calendar, Hash } from 'lucide-react'; 
import { toast } from 'react-hot-toast'; 

// R S: Mantemos o gerador para as declarações e importamos o novo para protocolos
import GeradorDocumento from '../secretaria/servicos/GeradorDocumento';
import ProtocoloRetirada from '../secretaria/servicos/ProtocoloRetirada'; 

export default function SecretariaVirtual() {
  const { user, userData } = useAuth();
  const [pedidos, set_pedidos] = useState([]);
  const [historicoConcluidos, set_historicoConcluidos] = useState([]); 
  const [tipo, set_tipo] = useState('');
  const [texto, set_texto] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('pendentes'); 
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  
  // R S: Estados separados para cada tipo de impressão
  const [documentoAtivo, setDocumentoAtivo] = useState(null);
  const [protocoloAtivo, setProtocoloAtivo] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const qPedidos = query(
      collection(db, "solicitacoes_secretaria"),
      where("uid", "==", user.uid),
      where("status", "==", "pendente"),
      orderBy("data_pedido", "desc")
    );

    const unsubPedidos = onSnapshot(qPedidos, (snap) => {
      set_pedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("erro ao carregar pedidos r s:", error);
    });

    return () => unsubPedidos();
  }, [user]);

  const buscarHistorico = async () => {
    if (historicoConcluidos.length > 0 && abaAtiva === 'concluidos') {
        setAbaAtiva('concluidos');
        return;
    }
    
    setLoadingHistorico(true);
    try {
      const q = query(
        collection(db, "solicitacoes_secretaria"),
        where("uid", "==", user.uid),
        where("status", "==", "concluido"),
        orderBy("data_pedido", "desc"),
        limit(15)
      );
      const snap = await getDocs(q);
      set_historicoConcluidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAbaAtiva('concluidos');
    } catch (error) {
      toast.error("erro ao buscar histórico r s");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const enviarSolicitacao = async (e) => {
    e.preventDefault();
    if (!tipo) {
      toast.error("selecione o tipo de documento r s");
      return;
    }

    const numAleatorio = Math.floor(1000 + Math.random() * 9000);
    const novoProtocolo = `cept2026-${numAleatorio}`;

    try {
      await addDoc(collection(db, "solicitacoes_secretaria"), {
        uid: user.uid,
        aluno_nome: (userData?.nome || user.displayName || "sem nome").toLowerCase(),
        aluno_matricula: String(userData?.matricula || "n/a").toLowerCase(),
        tipo_servico: tipo.toLowerCase(),
        mensagem: (texto || "sem observações").toLowerCase(),
        status: "pendente",
        id_protocolo: novoProtocolo,
        data_pedido: serverTimestamp(),
        visualizacao_aluno: false 
      });

      toast.success(`requerimento ${novoProtocolo} enviado r s!`);
      set_tipo(''); 
      set_texto('');
      setAbaAtiva('pendentes'); 
    } catch (error) {
      toast.error("erro ao enviar r s");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Secretaria <span className="text-green-600">Virtual</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
              unidade nam5 • atendimento 2026
            </p>
          </div>

          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit relative">
            <button 
              onClick={() => setAbaAtiva('pendentes')}
              className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${abaAtiva === 'pendentes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Em Análise
              {pedidos.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white"></span>
                </span>
              )}
            </button>

            <button 
              onClick={buscarHistorico}
              disabled={loadingHistorico}
              className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${abaAtiva === 'concluidos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {loadingHistorico ? '...' : <><History size={14}/> Concluídos</>}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="font-black uppercase italic mb-6 text-slate-800 flex items-center gap-2 text-sm">
                <Send size={18} className="text-green-600" /> Novo Pedido
              </h3>
              <form onSubmit={enviarSolicitacao} className="space-y-4">
                <select 
                  value={tipo} 
                  onChange={(e) => set_tipo(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase italic focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                >
                  <option value="">selecione o documento...</option>
                  <option value="declaração de matrícula">declaração de matrícula</option>
                  <option value="declaração de frequência">declaração de frequência</option>
                  <option value="histórico escolar">histórico escolar</option>
                  <option value="passe escolar">passe escolar (riocard)</option>
                </select>
                <textarea 
                  value={texto}
                  onChange={(e) => set_texto(e.target.value)}
                  placeholder="detalhes da sua solicitação r s..."
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl text-xs font-medium h-32 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button className="w-full bg-slate-900 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95">
                  enviar requerimento
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="font-black uppercase italic text-slate-400 text-[10px] mb-4 tracking-widest flex items-center gap-2">
                {abaAtiva === 'pendentes' ? <Clock size={16} /> : <History size={16} />} 
                {abaAtiva === 'pendentes' ? 'pedidos em análise r s' : 'histórico de concluídos r s'}
              </h3>
              <div className="space-y-4">
                {(abaAtiva === 'pendentes' ? pedidos : historicoConcluidos).length > 0 ? (abaAtiva === 'pendentes' ? pedidos : historicoConcluidos).map(sol => (
                  <div key={sol.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl text-slate-400 group-hover:text-green-600 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase text-[11px] italic leading-none">{sol.tipo_servico}</h4>
                          <p className="text-[10px] text-green-600 font-black mt-1 uppercase flex items-center gap-1">
                             <Hash size={10} /> {sol.id_protocolo || 'processando r s'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        sol.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {sol.status === 'pendente' ? 'em análise' : 'concluído'}
                      </span>
                    </div>

                    {/* R S: CARD DE CONCLUSÃO COM O NOVO PROTOCOLO */}
                    {sol.status === 'concluido' && (
                      <div className="bg-slate-900 text-white p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500 p-3 rounded-xl text-white">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Disponível para Retirada</p>
                            <p className="text-[12px] font-bold italic">
                              {sol.agendamento ? `${sol.agendamento.data} às ${sol.agendamento.hora}h` : 'Consulte a secretaria'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setProtocoloAtivo({
                            nome: sol.aluno_nome, 
                            matricula: sol.aluno_matricula,
                            data_agendada: sol.agendamento?.data,
                            hora_agendada: sol.agendamento?.hora,
                            funcionario: sol.liberado_por_nome || "secretaria central",
                            servico: sol.tipo_servico,
                            protocolo: sol.id_protocolo
                          })}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all shadow-xl active:scale-95"
                        >
                            <Printer size={14} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">Imprimir Protocolo R S</span>
                        </button>
                      </div>
                    )}
                  </div>
                )) : (
                    <div className="p-16 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-300 text-[10px] font-black uppercase italic">nenhum registro r s</p>
                    </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* R S: Modais de Impressão Separados */}
      {protocoloAtivo && (
        <ProtocoloRetirada 
          dados={protocoloAtivo} 
          onClose={() => setProtocoloAtivo(null)} 
        />
      )}

      {documentoAtivo && (
        <GeradorDocumento 
          aluno={documentoAtivo.aluno} 
          tipoDoc={documentoAtivo.tipo} 
          onClose={() => setDocumentoAtivo(null)} 
        />
      )}
    </div>
  );
}