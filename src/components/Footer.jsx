import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const closeMenu = () => window.scrollTo(0, 0);

  return (
    <footer className="bg-[#102937] text-slate-400 py-16 px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Coluna Logo R S - Aumentada para destaque máximo */}
          <div className="md:col-span-5">
            <Link 
              to="/" 
              className="flex items-center gap-6 mb-8 group transition-all" 
              onClick={closeMenu}
            >
              <img 
                src="/10.png" 
                alt="Logo CEPT" 
                width={160} // r s: reserva de espaço maior para evitar CLS
                height={160}
                className="h-32 md:h-48 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white leading-none tracking-tighter uppercase italic">
                  CEPT <span className="text-blue-500">Itaipuaçu</span>
                </span>
                <span className="text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Anísio Spínola Teixeira
                </span>
              </div>
            </Link>
            <p className="max-w-sm text-slate-400 text-sm leading-relaxed italic font-medium ml-2">
              Compromisso com a educação pública de qualidade e o desenvolvimento tecnológico da nossa região em Maricá.
            </p>
          </div>

          {/* Coluna Contato */}
          <div className="md:col-span-3">
            <h5 className="text-white font-black mb-6 text-[11px] uppercase tracking-[0.2em] italic border-l-2 border-blue-600 pl-3">Contato</h5>
            <div className="space-y-4 text-sm font-bold">
              <p className="hover:text-blue-400 transition-colors cursor-pointer break-words">contato@ceptitaipuacu.edu.br</p>
              <p className="hover:text-blue-400 transition-colors cursor-pointer">(21) 2637-0000</p>
            </div>
          </div>

          {/* Coluna Localização */}
          <div className="md:col-span-4">
            <h5 className="text-white font-black mb-6 text-[11px] uppercase tracking-[0.2em] italic border-l-2 border-blue-600 pl-3">Localização</h5>
            <div className="space-y-2 text-sm font-bold">
              <p>Avenida Jardel Filho</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">(Antiga Avenida 2)</p>
              <p>Itaipuaçu, Maricá - RJ</p>
            </div>
          </div>
        </div>

        {/* Linha de Crédito R S */}
        <div className="border-t border-white/5 mt-16 pt-8 text-center">
          <p className="text-[10px] tracking-[0.5em] font-black text-slate-600 uppercase italic">
            Desenvolvido para o CEPT © 2026. -  maricá rj.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;