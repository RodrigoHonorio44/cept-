import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Tag, ArrowLeft, Share2, Clock } from 'lucide-react';

export default function NoticiaDetalhes() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarNoticia = async () => {
      try {
        const docRef = doc(db, "noticias", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setNoticia({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("notícia não encontrada r s");
        }
      } catch (error) {
        console.error("erro ao buscar r s:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarNoticia();
    window.scrollTo(0, 0); 
  }, [id]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">carregando conteúdo r s...</p>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-black uppercase italic text-slate-900">notícia não encontrada r s</h1>
        <Link to="/noticias" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">voltar para o portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Navegação Superior r s */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/noticias" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group">
            <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">voltar ao portal</span>
          </Link>
          <button 
            onClick={() => {
              navigator.share({ title: noticia.titulo, url: window.location.href })
                .catch(() => alert("link copiado r s!"));
            }}
            className="bg-slate-900 text-white p-2.5 rounded-xl hover:scale-110 transition-transform"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Cabeçalho r s */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
              {noticia.categoria}
            </span>
            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-2">
              <Calendar size={12} /> {noticia.data}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase italic mb-8 first-letter:uppercase">
            {noticia.titulo}
          </h1>

          <p className="text-xl text-slate-500 font-medium italic leading-relaxed border-l-4 border-blue-600 pl-6 first-letter:uppercase">
            {noticia.resumo}
          </p>
        </header>

        {/* Imagem Principal r s */}
        <div className="relative h-[300px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl mb-16 bg-slate-100">
          <img 
            src={noticia.imagem} 
            className="w-full h-full object-cover" 
            alt={noticia.titulo} 
          />
        </div>

        {/* Conteúdo da Notícia r s */}
        <div className="max-w-3xl mx-auto">
          <div className="text-slate-700 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-wrap first-letter:uppercase">
            {noticia.conteudo || noticia.resumo}
          </div>
        </div>

       {/* Rodapé do Artigo r s */}
        <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            {/* r s: Box do Logo com o arquivo correto logo_cept.png */}
            <div className="w-30 h-30 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 p-2 shadow-sm">
              <img 
                src="/10.png" 
                alt="Logo CEPT Itaipuaçu" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=CEPT"; }}
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">publicado por</p>
              <p className="text-sm font-black text-slate-900 uppercase italic">equipe cept itaipuaçu</p>
            </div>
          </div>
          
          <Link to="/noticias" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
            ver mais comunicados
          </Link>
        </footer>
      </article>
    </div>
  );
}