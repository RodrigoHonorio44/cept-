import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Newspaper, Image as ImageIcon, Type, Tag, Send, Clock, Layout, Trash2, Eye, FileText } from 'lucide-react';

const GerenciarNoticias = () => {
  const [loading, setLoading] = useState(false);
  const [noticiasAtivas, setNoticiasAtivas] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    resumo: '',
    conteudo: '', // r s: matéria completa
    imagem: '',
    categoria: 'avisos',
    diasVisivel: 5,
    exibirHome: true,
    exibirNoticias: true
  });

  useEffect(() => {
    const q = query(collection(db, "noticias"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNoticiasAtivas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("erro ao carregar r s:", error);
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id_toast = toast.loading('configurando publicação r s...');

    try {
      const agora = new Date();
      const dataExpiracao = new Date();
      dataExpiracao.setDate(agora.getDate() + parseInt(form.diasVisivel));

      // r s: aqui a mágica acontece. salvamos tudo em lowercase no banco,
      // independente de como foi digitado, mantendo sua regra de ouro.
      await addDoc(collection(db, "noticias"), {
        titulo: form.titulo.toLowerCase().trim(),
        resumo: form.resumo.toLowerCase().trim(),
        conteudo: form.conteudo.toLowerCase().trim(),
        imagem: form.imagem.trim(), 
        categoria: form.categoria.toLowerCase(),
        exibirHome: Boolean(form.exibirHome),
        exibirNoticias: Boolean(form.exibirNoticias),
        expiresAt: dataExpiracao, 
        data: agora.toLocaleDateString('pt-br'), 
        createdAt: serverTimestamp() 
      });

      toast.success(`publicado r s! visível até ${dataExpiracao.toLocaleDateString('pt-br')}`, { id: id_toast });
      
      setForm({ titulo: '', resumo: '', conteudo: '', imagem: '', categoria: 'avisos', diasVisivel: 5, exibirHome: true, exibirNoticias: true });
    } catch (error) {
      console.error(error);
      toast.error('erro ao publicar r s.', { id: id_toast });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if(window.confirm("deseja remover este post r s?")) {
      try {
        await deleteDoc(doc(db, "noticias", id));
        toast.success("post removido com sucesso!");
      } catch (error) {
        toast.error("erro ao deletar r s");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10"> {/* r s: removido o lowercase global para facilitar a escrita */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-cept-blue p-8 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Newspaper size={24} className="text-cept-orange" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">administração r s</span>
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">postar novo conteúdo</h2>
          </div>
        </div>

        <form onSubmit={handlePublish} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Type size={14} /> título da postagem
            </label>
            <input 
              required 
              value={form.titulo} 
              onChange={(e) => setForm({...form, titulo: e.target.value})} 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium transition-all focus:ring-2 ring-cept-blue/10" 
              placeholder="digite o título livremente r s..." 
            />
          </div>

          <div className="md:col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Clock size={14} /> dias no ar (validade)
            </label>
            <input type="number" required min="1" value={form.diasVisivel} onChange={(e) => setForm({...form, diasVisivel: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-black text-cept-blue" />
          </div>

          <div className="md:col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Tag size={14} /> categoria
            </label>
            <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-black uppercase text-xs">
              <option value="avisos">avisos</option>
              <option value="noticias">notícias</option>
              <option value="eventos">eventos</option>
              <option value="tecnologia">tecnologia</option>
            </select>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
             <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 ml-2">
               <Layout size={14} /> canais de exibição
             </label>
             <div className="flex gap-8 ml-2">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={form.exibirHome} onChange={(e) => setForm({...form, exibirHome: e.target.checked})} className="w-5 h-5 rounded-lg accent-cept-blue" />
                 <span className="text-xs font-black uppercase tracking-widest group-hover:text-cept-blue transition-colors">página home</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={form.exibirNoticias} onChange={(e) => setForm({...form, exibirNoticias: e.target.checked})} className="w-5 h-5 rounded-lg accent-cept-blue" />
                 <span className="text-xs font-black uppercase tracking-widest group-hover:text-cept-blue transition-colors">portal de notícias</span>
               </label>
             </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <ImageIcon size={14} /> url da imagem
            </label>
            <input required value={form.imagem} onChange={(e) => setForm({...form, imagem: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium" placeholder="https://..." />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <FileText size={14} /> resumo curto (para o card r s)
            </label>
            <textarea required value={form.resumo} onChange={(e) => setForm({...form, resumo: e.target.value})} rows="2" maxLength="160" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium resize-none italic" placeholder="resumo para a listagem..." />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-cept-blue mb-2 ml-2 tracking-widest">
              <FileText size={14} /> matéria completa (conteúdo principal r s)
            </label>
            <textarea 
              required 
              value={form.conteudo} 
              onChange={(e) => setForm({...form, conteudo: e.target.value})} 
              rows="10" 
              className="w-full px-6 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] outline-none font-medium leading-relaxed focus:border-cept-blue transition-colors" 
              placeholder="escreva livremente aqui r s..." 
            />
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 bg-cept-orange py-5 rounded-2xl font-black text-white uppercase italic tracking-widest hover:bg-orange-600 transition-all flex justify-center items-center gap-3 shadow-lg disabled:opacity-50">
            {loading ? 'processando r s...' : 'confirmar e publicar agora'} <Send size={18} />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
        <h3 className="text-xl font-black uppercase italic text-slate-900 mb-6">gerenciar conteúdo ativo</h3>
        <div className="space-y-4">
          {noticiasAtivas.length > 0 ? noticiasAtivas.map(post => {
            const dataExpiracao = post.expiresAt?.toDate();
            const expirou = dataExpiracao < new Date();
            
            return (
              <div key={post.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${expirou ? 'bg-red-50/30 border-red-100 opacity-70' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={post.imagem} className="w-14 h-14 rounded-xl object-cover" alt="" />
                    {expirou && <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center text-[8px] font-black text-white uppercase">off</div>}
                  </div>
                  <div>
                    {/* r s: No histórico, aplicamos o first-letter para manter o visual limpo */}
                    <h4 className={`font-black text-sm first-letter:uppercase ${expirou ? 'text-slate-400' : 'text-slate-800'}`}>{post.titulo}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold text-slate-400 uppercase mt-1">
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                        <Eye size={10} className="text-cept-blue"/> {post.exibirHome && 'home'} {post.exibirNoticias && 'noticias'}
                      </span>
                      <span className={`flex items-center gap-1 ${expirou ? 'text-red-500' : 'text-cept-blue'}`}>
                        <Clock size={10}/> {expirou ? 'expirado' : `vence em: ${dataExpiracao?.toLocaleDateString('pt-br')}`}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => deletePost(post.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            )
          }) : (
            <div className="py-10 text-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-3xl">nenhuma postagem encontrada r s</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GerenciarNoticias;