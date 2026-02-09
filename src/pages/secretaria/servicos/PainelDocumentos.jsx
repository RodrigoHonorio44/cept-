import React from 'react';
import { FileText, GraduationCap, Clock, ClipboardList, ShieldAlert } from 'lucide-react';

const PainelDocumentos = ({ onOpenDoc }) => {
  const servicos = [
    { id: 'matricula', label: 'Matrícula', icon: ClipboardList, color: 'bg-blue-600' },
    { id: 'frequencia', label: 'Frequência', icon: Clock, color: 'bg-emerald-600' },
    { id: 'boletim', label: 'Boletim', icon: GraduationCap, color: 'bg-orange-600' },
    { id: 'atestado', label: 'Atestado', icon: ShieldAlert, color: 'bg-red-600' }, // Ajustado para "Atestado" (singular) para bater com a lógica do Gerador
    { id: 'historico', label: 'Histórico', icon: FileText, color: 'bg-slate-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
      {servicos.map((s) => (
        <button
          key={s.id}
          // Agora enviamos um objeto que o Dashboard entende: aluno como null e o tipo correto
          onClick={() => onOpenDoc({ aluno: null, tipo: s.label })}
          className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left outline-none"
        >
          <div className={`${s.color} w-10 h-10 rounded-xl text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
            <s.icon size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {s.label}
            </p>
            <p className="text-[11px] font-black text-slate-800 uppercase italic leading-none">
              Acessar Serviço
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PainelDocumentos;