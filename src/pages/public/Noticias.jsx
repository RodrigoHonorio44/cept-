import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase'; 
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Calendar, ArrowRight, Tag, Newspaper, Loader2 } from 'lucide-react';

const Noticias = () => {
  const [noticiasReais, setNoticiasReais] = useState([]);
  const [visibilidadeLimite, setVisibilidadeLimite] = useState(6);
  const [loading, setLoading] = useState(true);

  const noticiasFixas = [
    {
      id: 'f1',
      titulo: "equipe de robótica inicia preparativos para torneio nacional",
      resumo: "alunos do fundamental utilizam laboratórios de última geração para desenvolver protótipos de automação.",
      data: "06 fev 2026",
      categoria: "tecnologia",
      imagem: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&h=250&auto=format&fit=crop"
    },
    {
      id: 'f2',
      titulo: "intercâmbio cultural: a vivência do mandarim no dia a dia",
      resumo: "projeto integra cultura chinesa e ensino da língua com atividades interativas e culinária típica.",
      data: "04 fev 2026",
      categoria: "idiomas",
      imagem: "https://images.unsplash.com/photo-1541339907198-e08756defe04?q=80&w=400&h=250&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    const agora = new Date();
    try {
      const q = query(
        collection(db, "noticias"),
        where("exibirNoticias", "==", true),
        where("expiresAt", ">", agora),
        orderBy("expiresAt", "desc"),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNoticiasReais(docs);
        setLoading(false);
      }, (error) => {
        console.error("erro firestore r s:", error);
        setLoading(false); 
      });

      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const dadosParaExibir = noticiasReais.length > 0 ? noticiasReais : noticiasFixas;
  const temMaisNoticias = dadosParaExibir.length > visibilidadeLimite;
  const noticiasExibidas = dadosParaExibir.slice(0, visibilidadeLimite);

  return (
    <div className="min-h-screen bg-slate-50 pb-20"> {/* r s: removido o 'lowercase' global daqui */}
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
            <p className="mt-4 text-slate-500 font-medium first-letter:uppercase">acompanhe os projetos, eventos e conquistas da nossa comunidade escolar r s.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
             {['todos', 'avisos', 'eventos', 'tecnologia'].map((f) => (
               <button key={f} className="px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase hover:bg-cept-blue hover:text-white transition-all whitespace-nowrap">
                 {f}
               </button>
             ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto mt-12 px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <span className="font-black uppercase text-[10px] tracking-widest">sincronizando r s...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticiasExibidas.map((n) => (
                <article key={n.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    <img src={n.imagem} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-cept-blue flex items-center gap-1 shadow-sm">
                          <Tag size={10} /> {n.categoria}
                       </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mb-3 uppercase tracking-wider">
                      <Calendar size={12} />
                      {n.data}
                    </div>
                    
                    {/* r s: Título do card com primeira letra maiúscula */}
                    <h2 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-cept-blue transition-colors first-letter:uppercase">
                      {n.titulo}
                    </h2>
                    
                    {/* r s: Resumo do card com primeira letra maiúscula */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 italic flex-grow first-letter:uppercase">
                      {n.resumo}
                    </p>

                    <Link 
                      to={n.id.startsWith('f') ? "#" : `/noticia/${n.id}`}
                      className="flex items-center gap-2 text-xs font-black text-cept-blue uppercase tracking-widest group-hover:gap-4 transition-all mt-auto"
                    >
                      ler notícia completa <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {temMaisNoticias && (
              <div className="mt-16 flex justify-center">
                 <button 
                  onClick={() => setVisibilidadeLimite(prev => prev + 6)}
                  className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-400 text-[10px] uppercase hover:bg-cept-blue hover:text-white transition-all shadow-sm"
                 >
                    carregar notícias anteriores
                 </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Noticias;