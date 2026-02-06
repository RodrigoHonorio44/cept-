import React, { useEffect } from 'react';
import { BookOpen, Cpu, Globe, GraduationCap, Microscope, Palette, Utensils, Star } from 'lucide-react';

const cursos = () => {
  
  // r s: garante que a página comece no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const diferenciais = [
    { icon: <GraduationCap size={24} />, label: 'ensino integral', desc: 'carga horária ampliada para o fundamental' },
    { icon: <Globe size={24} />, label: 'ensino trilíngue', desc: 'português, inglês e mandarim' },
    { icon: <Cpu size={24} />, label: 'tecnologia', desc: 'telas interativas e salas de robótica' },
    { icon: <Microscope size={24} />, label: 'ciência', desc: 'laboratórios de ponta e planetário' },
  ];

  const listaCursos = [
    {
      titulo: "robótica e programação",
      desc: "desenvolvimento de lógica e criação de projetos tecnológicos com kits lego e arduino.",
      icon: <Cpu className="text-blue-500" />,
      tag: "tecnologia"
    },
    {
      titulo: "liceu de línguas",
      desc: "imersão cultural com cursos gratuitos de inglês, espanhol, francês e mandarim.",
      icon: <Globe className="text-green-500" />,
      tag: "idiomas"
    },
    {
      titulo: "gastronomia (cozinha gourmet)",
      desc: "aprendizado prático de culinária e nutrição em um espaço profissional.",
      icon: <Utensils className="text-orange-500" />,
      tag: "oficinas"
    },
    {
      titulo: "artes e cultura asiática",
      desc: "exploração de artes visuais, dança e a rica cultura chinesa integrada ao currículo.",
      icon: <Palette className="text-purple-500" />,
      tag: "artes"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 lowercase pb-20">
      {/* banner principal r s */}
      <section className="bg-cept-blue py-20 px-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full inline-block mb-6">
            cept itaipuaçu r s
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
            nossa grade <span className="text-cept-orange">curricular</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
            oferecemos uma estrutura única no brasil, focada em inovação e no desenvolvimento global dos nossos 5.000 alunos.
          </p>
        </div>
      </section>

      {/* grid de diferenciais r s */}
      <section className="max-w-6xl mx-auto -mt-12 px-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {diferenciais.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-cept-blue mb-4 group-hover:bg-cept-blue group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="font-black text-slate-800 text-sm uppercase mb-1">{item.label}</h3>
              <p className="text-slate-400 text-[11px] leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* lista de cursos r s */}
      <main className="max-w-6xl mx-auto mt-20 px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-10 w-2 bg-cept-orange rounded-full"></div>
          <h2 className="text-3xl font-black text-cept-blue uppercase tracking-tighter italic">oficinas e especializações</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listaCursos.map((curso, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-6 items-start group">
              <div className="hidden sm:flex w-16 h-16 bg-slate-50 rounded-3xl items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-inner transition-all">
                {React.cloneElement(curso.icon, { size: 32 })}
              </div>
              <div>
                <span className="text-[10px] font-black text-cept-blue uppercase tracking-widest mb-2 block opacity-60">
                  {curso.tag}
                </span>
                <h3 className="text-xl font-black text-slate-800 mb-3 uppercase italic tracking-tight group-hover:text-cept-blue transition-colors">
                  {curso.titulo}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {curso.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* info extra r s */}
        <div className="mt-16 bg-blue-50 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 border border-blue-100">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-cept-orange shadow-lg shadow-blue-200/50">
              <Star size={40} fill="currentColor" />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl font-black text-cept-blue uppercase italic mb-2">liceu municipal de línguas</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                além do ensino regular, o cept abriga o liceu de línguas e artes, oferecendo gratuitamente para a comunidade de itaipuaçu o aprendizado de mandarim, inglês, espanhol e francês.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default cursos;