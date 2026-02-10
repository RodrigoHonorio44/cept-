import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X, Calendar, Clock, CheckCircle, Printer, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth'; // R S: Importado para identificar quem libera

export default function ModalDeclaracao({ pedido, onClose, onGerarDoc }) {
  const { user } = useAuth(); // R S: Pegando dados do funcionário logado
  const [dataRetirada, setDataRetirada] = useState(pedido?.agendamento?.data || '');
  const [horaRetirada, setHoraRetirada] = useState(pedido?.agendamento?.hora || '');
  const [loading, setLoading] = useState(false);

  const finalizarPedidoEImprimir = async () => {
    if (!dataRetirada || !horaRetirada) {
      toast.error("defina a data e hora de retirada r s");
      return;
    }

    setLoading(true);
    try {
      const pedidoRef = doc(db, "solicitacoes_secretaria", pedido.id);
      
      // R S: Nome do funcionário em lowercase para o banco
      const nomeFuncionario = user?.displayName?.toLowerCase() || "secretaria central";
      
      // R S: Atualizando conforme a estrutura exata do seu Firebase
      await updateDoc(pedidoRef, {
        status: "concluido",
        agendamento: {
          data: dataRetirada,
          hora: horaRetirada
        },
        data_conclusao: serverTimestamp(),
        data_liberacao: serverTimestamp(), // Campo identificado no seu log
        visualizacao_aluno: true,
        liberado_por_nome: nomeFuncionario // Chave correta do seu banco
      });

      toast.success("pedido despachado r s!");

      // R S: Dispara o gerador de documento automaticamente com os dados novos
      onGerarDoc({
        ...pedido,
        agendamento: { data: dataRetirada, hora: horaRetirada },
        liberado_por_nome: nomeFuncionario
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase italic text-slate-800 tracking-tighter">
            Finalizar Atendimento R S
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* PROTOCOLO EM DESTAQUE */}
          <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-100 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black uppercase text-blue-200 mb-1">protocolo gerado</p>
              <p className="text-sm font-black text-white italic tracking-widest uppercase">
                {pedido.id_protocolo || pedido.protocolo || 'N/A'}
              </p>
            </div>
            <Hash className="text-blue-400 opacity-50" size={24} />
          </div>

          {/* INFO ALUNO */}
          <div className="bg-slate-50 p-5 rounded-3xl">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">aluno solicitante</p>
            <p className="text-xs font-bold text-slate-700 capitalize">{pedido.nome || pedido.aluno_nome}</p>
          </div>

          {/* INDICADOR DE QUEM ESTÁ LIBERANDO R S */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-emerald-400 leading-none mb-1">Liberando como:</p>
              <p className="text-[10px] font-bold text-emerald-700 capitalize">
                {user?.displayName || "Secretaria Central"}
              </p>
            </div>
          </div>

          {/* CAMPOS DE AGENDAMENTO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
              <label className="text-[9px] font-black uppercase text-blue-400 mb-2 flex items-center gap-1">
                <Calendar size={12}/> data de retirada
              </label>
              <input 
                type="date" 
                value={dataRetirada}
                onChange={(e) => setDataRetirada(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold outline-none text-blue-700"
              />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
              <label className="text-[9px] font-black uppercase text-blue-400 mb-2 flex items-center gap-1">
                <Clock size={12}/> horário
              </label>
              <input 
                type="time" 
                value={horaRetirada}
                onChange={(e) => setHoraRetirada(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold outline-none text-blue-700"
              />
            </div>
          </div>

          {/* BOTÃO ÚNICO: SALVAR E IMPRIMIR R S */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={finalizarPedidoEImprimir}
              disabled={loading}
              className="w-full p-6 bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-lg shadow-blue-200"
            >
              {loading ? (
                "processando..."
              ) : (
                <>
                  <Printer size={20} /> Concluir e Imprimir Declaração
                </>
              )}
            </button>
            
            <button onClick={onClose} className="text-[9px] font-black uppercase text-slate-400 tracking-widest py-2 hover:text-red-500">
              cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}