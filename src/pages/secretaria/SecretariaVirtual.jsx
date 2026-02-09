import React, { useState, useEffect } from 'react';
// R S: Caminhos mantidos para subir dois níveis (../../)
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Send, Bell, FileText, Clock, Printer, MapPin } from 'lucide-react'; 
import { toast } from 'react-hot-toast'; 

// R S: Importando o gerador para o aluno imprimir em casa
import GeradorDocumento from '../secretaria/servicos/GeradorDocumento';

export default function SecretariaVirtual() {
  const { user, userData } = useAuth();
  const [pedidos, set_pedidos] = useState([]);
  const [recados, set_recados] = useState([]);
  const [tipo, set_tipo] = useState('');
  const [texto, set_texto] = useState('');

  // R S: Estado para o documento que será impresso pelo aluno
  const [documentoAtivo, setDocumentoAtivo] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const qPedidos = query(
      collection(db, "solicitacoes_secretaria"),
      where("uid", "==", user.uid),
      orderBy("data_pedido", "desc")
    );

    const qRecados = query(
      collection(db, "comunicados_secretaria"),
      orderBy("data", "desc")
    );

    const unsubPedidos = onSnapshot(qPedidos, (snap) => {
      set_pedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("erro ao carregar pedidos r s:", error);
    });

    const unsubRecados = onSnapshot(qRecados, (snap) => {
      set_recados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("erro ao carregar recados r s:", error);
    });

    return () => { unsubPedidos(); unsubRecados(); };
  }, [user]);

  const enviarSolicitacao = async (e) => {
    e.preventDefault();
    if (!tipo) {
      toast.error("selecione o tipo de documento r s");
      return;
    }

    try {
      await addDoc(collection(db, "solicitacoes_secretaria"), {
        uid: user.uid,
        aluno_nome: (userData?.nome || user.displayName || "sem nome").toLowerCase(),
        aluno_matricula: String(userData?.matricula || "n/a").toLowerCase(),
        tipo_servico: tipo.toLowerCase(),
        mensagem: texto.toLowerCase(),
        status: "pendente",
        data_pedido: serverTimestamp(),
        visualizacao_aluno: false 
      });

      toast.success("requerimento enviado com sucesso r s!");
      set_tipo(''); 
      set_texto('');
    } catch (error) {
      console.error(error);
      toast.error("erro ao enviar. tente novamente r s");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Secretaria <span className="text-green-600">Virtual</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
            espaço do aluno e responsável • 2026
          </p>
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
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase italic transition-all focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                >
                  <option value="">selecione o documento...</option>
                  <option value="declaração de matrícula">declaração de matrícula</option>
                  <option value="histórico escolar">histórico escolar</option>
                  <option value="passe escolar">passe escolar (riocard)</option>
                </select>
                <textarea 
                  value={texto}
                  onChange={(e) => set_texto(e.target.value)}
                  placeholder="detalhes da sua solicitação r s..."
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl text-xs font-medium h-32 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                />
                <button className="w-full bg-green-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-95">
                  enviar requerimento
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="font-black uppercase italic text-slate-400 text-[10px] mb-4 tracking-widest flex items-center gap-2">
                <Bell size={16} /> comunicados da secretaria
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {recados.length > 0 ? recados.map(rec => (
                  <div key={rec.id} className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">
                      {rec.data?.toDate ? rec.data.toDate().toLocaleDateString() : 'hoje'}
                    </p>
                    <p className="font-bold italic lowercase text-sm relative z-10">{rec.mensagem}</p>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Bell size={80} />
                    </div>
                  </div>
                )) : (
                  <div className="bg-slate-100 p-6 rounded-[2rem] text-slate-400 text-[11px] font-bold italic uppercase border border-dashed border-slate-300">
                    nenhum recado hoje 
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-black uppercase italic text-slate-400 text-[10px] mb-4 tracking-widest flex items-center gap-2">
                <Clock size={16} /> acompanhamento
              </h3>
              <div className="space-y-4">
                {pedidos.length > 0 ? pedidos.map(sol => (
                  <div key={sol.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl text-slate-400 group-hover:text-green-600 group-hover:bg-green-50 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase text-[11px] italic leading-none">{sol.tipo_servico}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">
                            enviado em {sol.data_pedido?.toDate ? sol.data_pedido.toDate().toLocaleDateString() : 'processando...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* BOTÃO IMPRIMIR: APENAS SE NÃO FOR ENTREGA PRESENCIAL R S */}
                        {sol.status === 'concluido' && sol.visualizacao_aluno && !sol.entrega_presencial && (
                          <button 
                            onClick={() => setDocumentoAtivo({
                              aluno: { nome: sol.aluno_nome, matricula: sol.aluno_matricula },
                              tipo: sol.tipo_servico.includes('frequência') ? 'Frequência' : 'Matrícula'
                            })}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                          >
                            <Printer size={14} /> Imprimir
                          </button>
                        )}

                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          sol.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {sol.status === 'pendente' ? 'em análise' : 'concluído'}
                        </span>
                      </div>
                    </div>

                    {/* R S: ALERTA DE RETIRADA FÍSICA PARA HISTÓRICO */}
                    {sol.status === 'concluido' && sol.entrega_presencial && (
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
                        <div className="bg-orange-500 p-2.5 rounded-xl text-white">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Retirada Disponível</p>
                          <p className="text-[11px] font-bold text-slate-700 lowercase italic">{sol.resposta_secretaria}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                    <div className="p-10 text-center text-slate-300 text-[10px] font-black uppercase italic">
                        você ainda não possui solicitações .
                    </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

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