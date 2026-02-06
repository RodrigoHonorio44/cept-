import React, { useState } from 'react';
import { db } from '../../services/firebase'; // r s: ajuste para o caminho correto que você usa no Dashboard
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Newspaper, Image as ImageIcon, Type, Tag, Send } from 'lucide-react';

const GerenciarNoticias = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    resumo: '',
    imagem: '',
    categoria: 'tecnologia'
  });

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id_toast = toast.loading('publicando notícia r s...');

    try {
      // r s: salvando tudo em lowercase conforme sua regra
      await addDoc(collection(db, "noticias"), {
        titulo: form.titulo.toLowerCase(),
        resumo: form.resumo.toLowerCase(),
        imagem: form.imagem, 
        categoria: form.categoria.toLowerCase(),
        data: new Date().toLocaleDateString('pt-br'), 
        createdAt: serverTimestamp() 
      });

      toast.success('notícia publicada com sucesso!', { id: id_toast });
      setForm({ titulo: '', resumo: '', imagem: '', categoria: 'tecnologia' });
    } catch (error) {
      console.error("erro firestore r s:", error);
      toast.error('erro ao publicar r s', { id: id_toast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lowercase">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-cept-blue p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper size={24} className="text-cept-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">administração r s</span>
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">postar nova notícia</h2>
        </div>

        <form onSubmit={handlePublish} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Type size={14} /> título da notícia
            </label>
            <input 
              required
              value={form.titulo}
              onChange={(e) => setForm({...form, titulo: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cept-blue outline-none font-medium transition-all"
              placeholder="ex: nova sala de robótica inaugurada"
            />
          </div>

          <div className="md:col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <ImageIcon size={14} /> url da imagem (link)
            </label>
            <input 
              required
              value={form.imagem}
              onChange={(e) => setForm({...form, imagem: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cept-blue outline-none font-medium transition-all"
              placeholder="https://link-da-foto.com/foto.jpg"
            />
          </div>

          <div className="md:col-span-1">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Tag size={14} /> categoria
            </label>
            <select 
              value={form.categoria}
              onChange={(e) => setForm({...form, categoria: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cept-blue outline-none font-black uppercase text-xs appearance-none cursor-pointer"
            >
              <option value="tecnologia">tecnologia</option>
              <option value="eventos">eventos</option>
              <option value="idiomas">idiomas</option>
              <option value="avisos">avisos</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
              <Type size={14} /> resumo da notícia
            </label>
            <textarea 
              required
              value={form.resumo}
              onChange={(e) => setForm({...form, resumo: e.target.value})}
              rows="4"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-cept-blue outline-none font-medium transition-all resize-none"
              placeholder="descreva brevemente o que aconteceu..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button 
              type="submit"
              disabled={loading}
              className="group flex items-center gap-3 bg-cept-orange hover:bg-orange-500 text-white px-10 py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
            >
              {loading ? 'publicando...' : 'publicar notícia'}
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GerenciarNoticias;