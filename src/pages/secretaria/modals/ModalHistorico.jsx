import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { db } from '../../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function ModalHistorico({ pedido, onClose, user }) {
  const [dataRetirada, setDataRetirada] = useState('');
  const [horaRetirada, setHoraRetirada] = useState('');
  const [loading, setLoading] = useState(false);

  const finalizarAgendamento = async (e) => {
    e.preventDefault();
    if (!dataRetirada || !horaRetirada) {
      toast.error("preencha a data e horário para retirada r s");
      return;
    }

    setLoading(true);
    try {
      const pedidoRef = doc(db, "solicitacoes_secretaria", pedido.id);
      
      // R S: Pegando nome do root ou atendente e forçando lowercase
      const nomeAtendente = user?.displayName?.toLowerCase() || "secretaria central";
      
      // Mensagem padronizada em lowercase
      const mensagemFinal = `documento disponível para retirada no dia ${dataRetirada} às ${horaRetirada}h na secretaria central.`.toLowerCase();

      await updateDoc(pedidoRef, {
        status: 'concluido',
        resposta_secretaria: mensagemFinal,
        data_resposta: serverTimestamp(),
        data_liberacao: serverTimestamp(), // R S: Sincronizado com seu banco
        liberado_por_nome: nomeAtendente,  // R S: Chave correta do Firebase
        visualizacao_aluno: true,
        entrega_presencial: true,
        agendamento: {
          data: dataRetirada,
          hora: horaRetirada
        }
      });

      toast.success("agendamento de histórico enviado com sucesso r s!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("erro ao processar agendamento r s");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
        
        {/* HEADER R S */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Calendar size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Histórico Escolar</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Agendamento de Retirada Física</p>
        </div>

        {/* CORPO DO MODAL */}
        <form onSubmit={finalizarAgendamento} className="p-8 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Aluno Solicitante</p>
            <p className="font-bold text-slate-800 lowercase">{pedido.aluno_nome || pedido.nome}</p>
          </div>

          {/* INDICADOR DE QUEM ESTÁ LIBERANDO (ROOT) */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-500" />
            <div>
              <p className="text-[8px] font-black uppercase text-emerald-400 leading-none mb-1">Liberando como:</p>
              <p className="text-[10px] font-bold text-emerald-700 capitalize">
                {user?.displayName || "Secretaria Central (Root)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Disponível</label>
              <input 
                type="date" 
                required
                value={dataRetirada}
                onChange={(e) => setDataRetirada(e.target.value)}
                className="w-full p-4 bg-slate-100 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Horário</label>
              <input 
                type="time" 
                required
                value={horaRetirada}
                onChange={(e) => setHoraRetirada(e.target.value)}
                className="w-full p-4 bg-slate-100 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
            <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
              O aluno será notificado que o documento está pronto para retirada física r s.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Processando..." : (
                <>
                  <CheckCircle size={18} /> Confirmar e Finalizar
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-400 font-black p-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}