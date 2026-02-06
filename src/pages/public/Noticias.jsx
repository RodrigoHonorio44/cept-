import React, { useEffect } from 'react';
import { Calendar, ArrowRight, Tag, Newspaper } from 'lucide-react';

const Noticias = () => {
  
  // r s: scroll para o topo ao carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const noticias = [
    {
      id: 1,
      titulo: "equipe de robótica inicia preparativos para torneio nacional",
      resumo: "alunos do fundamental utilizam laboratórios de última geração para desenvolver protótipos de automação.",
      data: "06 fev 2026",
      categoria: "tecnologia",
      imagem: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&h=250&auto=format&fit=crop"
    },
    {
      id: 2,
      titulo: "intercâmbio cultural: a vivência do mandarim no dia a dia",
      resumo: "projeto integra cultura chinesa e ensino da língua com atividades interativas e culinária típica.",
      data: "04 fev 2026",
      categoria: "idiomas",
      imagem: "https://images.unsplash.com/photo-1541339907198-e08756defe04?q=80&w=400&h=250&auto=format&fit=crop"
    },
    {
      id: 3,
      titulo: "aula inaugural no planetário anísio spínola teixeira",
      resumo: "estudantes realizam primeira observação guiada do semestre no observatório tecnológico do cept.",
      data: "01 fev 2026",
      categoria: "ciência",
      imagem: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&h=250&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 lowercase pb-20">
      {/* topo da página r s */}
      <section className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-cept-blue mb-4">
              <Newspaper size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">portal de notícias r s</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
              fique por dentro de <span className="text-cept-blue">tudo</span>
            </h1>
            <p className="mt-4 text-slate-500 font-medium">acompanhe os projetos, eventos e conquistas da nossa comunidade escolar.</p>
          </div>
          
          {/* filtro simples r s */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
             {['todos', 'tecnologia', 'eventos', 'avisos'].map((f) => (
               <button key={f} className="px-4 py-2 rounded-full border border-slate-200 text-xs font-black uppercase hover:bg-cept-blue hover:text-white transition-all whitespace-nowrap">
                 {f}
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* grid de notícias r s */}
      <main className="max-w-6xl mx-auto mt-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {noticias.map((n) => (
            <article key={n.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* imagem com overlay r s */}
              <div className="relative h-52 overflow-hidden">
                <img src={n.imagem} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                   <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-cept-blue flex items-center gap-1 shadow-sm">
                      <Tag size={10} /> {n.categoria}
                   </span>
                </div>
              </div>

              {/* conteúdo r s */}
              <div className="p-7">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mb-3 uppercase tracking-wider">
                  <Calendar size={12} />
                  {n.data}
                </div>
                
                <h2 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-cept-blue transition-colors">
                  {n.titulo}
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {n.resumo}
                </p>

                <button className="flex items-center gap-2 text-xs font-black text-cept-blue uppercase tracking-widest group-hover:gap-4 transition-all">
                  ler notícia completa <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* paginação ou load more r s */}
        <div className="mt-16 flex justify-center">
           <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-400 text-xs uppercase hover:bg-slate-50 transition-all shadow-sm">
              carregar notícias anteriores
           </button>
        </div>
      </main>
    </div>
  );
};

export default Noticias;