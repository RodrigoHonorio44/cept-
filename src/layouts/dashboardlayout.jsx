import React from 'react';
// R S: Forçando o caminho relativo completo para evitar ambiguidade no Linux
import Sidebar from '../components/layout/sidebar.jsx'; 

// r s: adicionando active_tab e set_active_tab nas props para controle de estado
export default function DashboardLayout({ children, active_tab, set_active_tab }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* r s nota: passamos as props para a sidebar. 
          dentro da sua sidebar, os botões devem usar o set_active_tab 
          em vez de links <Link> ou <a> para evitar o refresh da página.
      */}
      <Sidebar active_tab={active_tab} set_active_tab={set_active_tab} />

      {/* área principal com scroll independente */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 custom-scrollbar scroll-smooth">
        
        <div className="p-8 md:p-12 min-h-full flex flex-col">
          
          <div className="flex-1">
            {children}
          </div>

          {/* footer r s: padronizado em lowercase como solicitado */}
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