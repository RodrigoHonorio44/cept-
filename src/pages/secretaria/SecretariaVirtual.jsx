import React, { useState, useEffect } from 'react';
// R S: Caminhos mantidos para subir dois níveis (../../)
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Send, Bell, FileText, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast'; 

export default function SecretariaVirtual() {
  const { user, userData } = useAuth();
  const [pedidos, set_pedidos] = useState([]);
  const [recados, set_recados] = useState([]);
  const [tipo, set_tipo] = useState('');
  const [texto, set_texto] = useState('');

  // 1. Carregar Pedidos e Recados (Padrão R S)
  useEffect(() => {
    if (!user?.uid) return;

    // Pedidos do usuário logado r s
    const qPedidos = query(
      collection(db, "solicitacoes_secretaria"),
      where("uid", "==", user.uid),
      orderBy("data_pedido", "desc")
    );

    // Recados gerais da escola r s
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
        // R S: Garantindo lowercase total na persistência
        aluno_nome: (userData?.nome || user.displayName || "sem nome").toLowerCase(),
        aluno_matricula: String(userData?.matricula || "n/a").toLowerCase(),
        tipo_servico: tipo.toLowerCase(),
        mensagem: texto.toLowerCase(),
        status: "pendente",
        data_pedido: serverTimestamp()
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
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
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
          
          {/* COLUNA ESQUERDA: FORMULÁRIO r s */}
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

          {/* COLUNA DIREITA: RECADOS E STATUS r s */}
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
                  <div key={sol.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
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
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      sol.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {sol.status === 'pendente' ? 'em análise' : 'concluído'}
                    </span>
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
    </div>
  );
}