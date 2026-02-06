import React, { useEffect } from 'react';
import { Lightbulb, Users, Handshake, Landmark, Award, Star, BookOpen } from 'lucide-react';

const SobreNos = () => {
  // r s: scroll para o topo ao carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const valores = [
    { icon: <Lightbulb size={24} />, titulo: "inovação", descricao: "incentivamos a criatividade e o pensamento crítico em todas as áreas." },
    { icon: <Users size={24} />, titulo: "inclusão", descricao: "ambiente acolhedor que valoriza a diversidade e o respeito mútuo." },
    { icon: <Handshake size={24} />, titulo: "colaboração", descricao: "trabalho em equipe entre alunos, professores e comunidade." },
    { icon: <Landmark size={24} />, titulo: "excelência", descricao: "busca contínua pela qualidade no ensino e nos resultados." },
  ];

  const diferenciais = [
    { icon: <Award size={20} />, text: "maior escola em tempo integral do brasil" },
    { icon: <BookOpen size={20} />, text: "ensino trilíngue: português, inglês e mandarim" },
    { icon: <Star size={20} />, text: "projetos de robótica e tecnologia avançada" },
    { icon: <Users size={20} />, text: "integração completa com a comunidade de maricá" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lowercase pb-20">
      {/* banner principal r s */}
      <section className="bg-gradient-to-br from-cept-blue to-blue-950 py-20 px-6 text-white text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full inline-block mb-6">
            nossa história e propósito r s
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
            sobre o <span className="text-cept-orange">cept</span> itaipuaçu
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
            um polo de educação transformadora, formando cidadãos globais e inovadores para o futuro.
          </p>
        </div>
      </section>

      {/* seção de introdução e missão r s */}
      <section className="max-w-6xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-black text-cept-blue uppercase italic tracking-tighter mb-6">nossa missão</h2>
          <p className="text-slate-700 leading-relaxed text-lg mb-4">
            no cept itaipuaçu, acreditamos que a educação é a ferramenta mais poderosa para transformar vidas. nossa missão é oferecer um ensino de excelência, inclusivo e inovador, que prepare nossos alunos não apenas para os desafios acadêmicos, mas para serem líderes em suas comunidades e cidadãos conscientes do mundo.
          </p>
          <p className="text-slate-500 text-sm italic">
            "educar para o futuro, com os olhos no presente e o coração na comunidade."
          </p>
        </div>
        <div>
            <div className="h-72 w-full bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
                {/* Imagem do CEPT */}
                <img src="/foto-cept-missao.jpg" alt="alunos estudando no cept" className="w-full h-full object-cover" />
            </div>
        </div>
      </section>

      {/* seção de valores r s */}
      <section className="max-w-6xl mx-auto mt-24 px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-cept-blue uppercase italic tracking-tighter mb-4">nossos valores</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">pilares que sustentam nossa jornada educacional e guiam nossas ações diárias.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valores.map((valor, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg shadow-blue-50/50 border border-blue-100 flex flex-col items-center text-center group hover:bg-cept-blue hover:text-white transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-cept-blue mb-6 group-hover:bg-white transition-colors">
                {valor.icon}
              </div>
              <h3 className="font-black text-xl uppercase mb-3 group-hover:text-white transition-colors">{valor.titulo}</h3>
              <p className="text-slate-500 text-sm leading-relaxed group-hover:text-blue-100 transition-colors">
                {valor.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* seção de diferenciais r s */}
      <section className="max-w-6xl mx-auto mt-24 px-6">
        <div className="bg-cept-orange rounded-[3rem] p-12 text-white text-center shadow-xl shadow-orange-100/50">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">o que nos torna <span className="text-blue-900">únicos</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                {diferenciais.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center gap-3">
                        {item.icon && React.cloneElement(item.icon, { size: 32, className: "text-blue-900" })}
                        <p className="font-black text-lg leading-snug">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </div>
  );
};

export default SobreNos;