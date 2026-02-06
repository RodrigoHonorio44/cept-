import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase'; 
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { 
  ArrowRight, Play, Globe, Cpu, Microscope, Trophy, 
  Bell, Newspaper, Calendar 
} from 'lucide-react';

const CardAcesso = ({ titulo, cor, desc, to }) => (
  <Link 
    to={to} 
    className={`p-10 rounded-[2.5rem] shadow-2xl ${cor} text-white hover:scale-[1.05] transition-all duration-500 group cursor-pointer border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[300px]`}
  >
    <div className="relative z-10 text-center">
      <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic border-b border-white/10 pb-4">{titulo}</h3>
      <p className="text-sm opacity-80 mb-6 leading-relaxed font-medium lowercase">{desc}</p>
    </div>
    <div className="relative z-10 flex justify-center">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-3/4 py-4 justify-center rounded-2xl backdrop-blur-md group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
        Entrar no Portal <ArrowRight size={14} />
      </div>
    </div>
    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
  </Link>
);

export default function Home() {
  const [conteudo, set_conteudo] = useState([]);

  const avisoReserva = [{
    id: 'reserva',
    titulo: 'portal em desenvolvimento r s',
    resumo: 'estamos preparando novidades incríveis para a comunidade cept. em breve, todos os comunicados oficiais estarão disponíveis aqui.',
    categoria: 'avisos',
    imagem: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200',
    data: new Date().toLocaleDateString('pt-br')
  }];

  useEffect(() => {
    const agora = new Date();
    
    const q = query(
      collection(db, "noticias"),
      where("exibirNoticias", "==", true),
      where("expiresAt", ">", agora),
      orderBy("expiresAt", "desc"), 
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set_conteudo(docs.length > 0 ? docs : avisoReserva);
    }, (error) => {
      console.error("erro ao carregar home r s:", error);
      set_conteudo(avisoReserva);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Banner Principal - Hero r s */}
      <section className="relative h-[85vh] flex items-center justify-start overflow-hidden rounded-b-[4rem] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="/ceptiamgem.jpg" 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Fachada CEPT Itaipuaçu"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent z-10"></div>
        </div>
        
        <div className="container mx-auto px-10 relative z-20 text-white">
          <span className="bg-red-600 text-white px-5 py-1.5 rounded-xl text-[10px] font-black uppercase mb-8 inline-block tracking-[0.2em] shadow-2xl">
            A maior escola em tempo integral do Brasil
          </span>
          <h2 className="text-6xl md:text-[90px] font-black mb-8 leading-[0.9] tracking-tighter uppercase italic max-w-4xl">
            O futuro da <br/> educação em <br/> <span className="text-blue-400">Itaipuaçu</span> começa aqui.
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 mb-16">
            <button className="bg-[#4ade80] hover:bg-[#22c55e] text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-green-900/40 text-sm uppercase italic tracking-widest">
              Conheça nossos cursos
            </button>
            <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black border border-white/20 transition-all text-sm uppercase italic">
              <Play size={20} fill="currentColor" /> Ver Institucional
            </button>
          </div>
        </div>
      </section>

      {/* Cards de Portais */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-30 grid grid-cols-1 md:grid-cols-3 gap-8">
        <CardAcesso to="/login-aluno" titulo="Portal do Aluno" cor="bg-[#0f172a]" desc="acesse suas notas, boletim, frequências e conteúdos digitais de forma rápida r s." />
        <CardAcesso to="/login-professor" titulo="Portal do Professor" cor="bg-[#1e293b]" desc="gerenciamento de turmas, diário de classe, planejamento e acompanhamento pedagógico r s." />
        <CardAcesso to="/login-professor" titulo="Secretaria Virtual" cor="bg-[#22c55e]" desc="solicitação de documentos, matrículas e suporte administrativo totalmente online r s." />
      </div>

      {/* SEÇÃO DE AVISOS DINÂMICAS R S */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Comunicados</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">atualizações em tempo real r s</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {conteudo.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col h-full">
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-blue-600 shadow-sm">
                {item.id === 'reserva' ? 'status' : item.categoria}
              </div>
              
              <div className="h-48 overflow-hidden bg-slate-100">
                <img src={item.imagem} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-3">
                  <Calendar size={12} /> {item.data}
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 lowercase group-hover:text-blue-600 transition-colors">
                  {item.titulo}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed lowercase italic line-clamp-3 mb-6 flex-grow">
                  {item.resumo}
                </p>
                
                {/* r s: AGORA O LINK APONTA PARA A NOTÍCIA ESPECÍFICA */}
                <Link 
                  to={item.id === 'reserva' ? "/noticias" : `/noticia/${item.id}`} 
                  className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:gap-4 transition-all"
                >
                  ler conteúdo completo <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Sobre o CEPT r s */}
      <section className="max-w-7xl mx-auto px-6 py-40 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-10 leading-[1] tracking-tighter uppercase italic">
            Ensino <span className="text-blue-600">Trilíngue</span> <br/> e infraestrutura global r s.
          </h3>
          <p className="text-slate-500 text-lg leading-relaxed mb-12 font-medium lowercase italic">
            o cept itaipuaçu é a maior escola em tempo integral do brasil. oferecemos ensino fundamental com foco em tecnologia, robótica e matemática. nosso campus é trilíngue (português, inglês e mandarim).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 font-black uppercase italic text-xs tracking-tight">
            <div className="flex items-center gap-4 text-slate-800"><Globe className="text-blue-600" /> Campus Trilíngue</div>
            <div className="flex items-center gap-4 text-slate-800"><Cpu className="text-green-600" /> Alta Tecnologia</div>
            <div className="flex items-center gap-4 text-slate-800"><Microscope className="text-orange-600" /> Ciência Viva</div>
            <div className="flex items-center gap-4 text-slate-800"><Trophy className="text-purple-600" /> Formação Completa</div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-10"></div>
          <div className="relative bg-slate-200 aspect-video rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-8 border-white transition-transform duration-500 group-hover:scale-[1.02]">
            <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1470" className="object-cover w-full h-full" alt="Estrutura CEPT" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                <Play className="text-blue-600 ml-1" size={40} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}