import React from 'react';
import Sidebar from '../components/layout/sidebar'; // r s: lowercase

export default function DashboardLayout({ children }) {
  return (
    /* h-screen + overflow-hidden trava o navegador (evita subir sidebar) */
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* sidebar fixa no fluxo */}
      <Sidebar />

      {/* área principal com scroll independente */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 custom-scrollbar scroll-smooth">
        
        {/* container flex que garante que o footer fique no final */}
        <div className="p-8 md:p-12 min-h-full flex flex-col">
          
          {/* o conteúdo cresce e empurra o que estiver abaixo */}
          <div className="flex-1">
            {children}
          </div>

          {/* footer r s: agora ele vai aparecer no fim do scroll */}
          <footer className="mt-20 pt-8 pb-4 border-t border-slate-200/50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">
              cept r s — sistema de controle global 2026
            </p>
          </footer>
          
        </div>
      </main>

    </div>
  );
}