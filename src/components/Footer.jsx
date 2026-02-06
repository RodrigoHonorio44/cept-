import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        
        {/* Coluna Sobre */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-white font-black text-3xl mb-6 tracking-tighter">
            CEPT Itaipuaçu
          </h4>
          <p className="max-w-sm text-slate-400 leading-relaxed">
            Compromisso com a educação pública de qualidade e o desenvolvimento tecnológico da nossa região em Maricá.
          </p>
        </div>

        {/* Coluna Contato */}
        <div>
          <h5 className="text-white font-bold mb-6 text-lg">Contato</h5>
          <div className="space-y-3 text-sm">
            <p>contato@ceptitaipuacu.edu.br</p>
            <p>(21) 2637-0000</p>
          </div>
        </div>

        {/* Coluna Localização Atualizada */}
        <div>
          <h5 className="text-white font-bold mb-6 text-lg">Localização</h5>
          <div className="space-y-3 text-sm">
            <p>Avenida Jardel Filho (Antiga Avenida 2)</p>
            <p>Itaipuaçu, Maricá - RJ</p>
          </div>
        </div>

      </div>

      {/* Créditos R S */}
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-20 pt-10 text-center text-[10px] tracking-[0.3em] font-bold text-slate-600 uppercase">
        Desenvolvido para o CEPT © 2026. R S - Maricá RJ.
      </div>
    </footer>
  );
};

export default Footer;