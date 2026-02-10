import React from 'react';
import { Printer, X, ShieldCheck, Clock, Calendar, Hash, MapPin } from 'lucide-react';

export default function ProtocoloRetirada({ dados, onClose }) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* CONTROLES - NÃO SAEM NA IMPRESSÃO */}
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
          >
            <Printer size={16} /> IMPRIMIR RECIBO
          </button>
          <button 
            onClick={onClose} 
            className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 border shadow-sm transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* ÁREA DO RECIBO */}
        <div className="p-10 bg-white">
          <div className="border-[3px] border-slate-900 p-8 rounded-[2rem] relative">
            
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                PROTOCOLO DE <span className="text-green-600">RETIRADA</span>
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">
                CEPT • UNIDADE NAM5 • 2026
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">CÓDIGO PROTOCOLO</p>
                  <div className="flex items-center gap-1 text-slate-900">
                    <Hash size={14} className="text-green-600" />
                    <span className="font-black text-lg uppercase tracking-tighter">
                        {dados.protocolo?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">DOCUMENTO</p>
                  {/* r s: capitalize para aparecer 'Declaração De Matrícula' */}
                  <p className="font-bold text-slate-700 text-xs capitalize italic">
                    {dados.servico}
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 p-5 rounded-2xl">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">ALUNO(A)</p>
                {/* r s: AQUI ESTÁ O SEGREDO - Troquei 'lowercase' por 'capitalize' */}
                <p className="text-sm font-black text-slate-800 capitalize">
                  {dados.nome}
                </p>
                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">MAT: {dados.matricula}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <Calendar size={10}/> DATA/HORA RETIRADA
                  </p>
                  <p className="text-[11px] font-black text-slate-900 uppercase">
                    {dados.data_agendada} <br/>
                    ÀS {dados.hora_agendada}H
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <ShieldCheck size={10}/> LIBERADO POR
                  </p>
                  {/* r s: capitalize para o nome do funcionário também */}
                  <p className="text-[11px] font-black text-slate-900 capitalize">
                    {dados.funcionario}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                <MapPin size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">SECRETARIA CENTRAL • UNIDADE CEPT</span>
            </div>
          </div>
          
          <p className="text-center text-[7px] font-bold text-slate-300 uppercase mt-6 tracking-[0.2em]">
            DOCUMENTO GERADO DIGITALMENTE PELO SISTEMA CEPT
          </p>
        </div>
      </div>
    </div>
  );
}