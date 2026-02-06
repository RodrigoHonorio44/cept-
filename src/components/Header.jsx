import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Menu, X, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toView } from '../utils/Formatters'; 
import { toast } from 'sonner';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, isAuthenticated, logout, userData } = useAuth(); 
  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
    // r s: força o scroll para o topo em qualquer troca de rota
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // r s: garante o redirecionamento ANTES de limpar o estado se necessário
  const handle_logout = async () => {
    const id_toast = toast.loading('encerrando sessão r s...');
    try {
      closeMenu();
      await logout();
      navigate('/', { replace: true }); // replace evita que o usuário volte com o botão "voltar" do navegador
      toast.success('até logo!', { id: id_toast });
    } catch (error) {
      toast.error('falha ao sair', { id: id_toast });
    }
  };

  const formatDisplayName = (name) => {
    if (!name) return "";
    const lowerName = name.toLowerCase();
    if (lowerName === 'rodrigo da silva honorio' || lowerName === 'r s') {
      return 'R S';
    }
    return toView(name);
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm/50">
      <div className="container-cept h-20 flex items-center justify-between">
        
        {/* r s: Clique na marca sempre reseta a navegação para a home pública */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group active:scale-95 transition-all" 
          onClick={closeMenu}
        >
          <img 
            src="/logo_cept.png" 
            alt="Logo CEPT" 
            className="h-12 md:h-14 w-auto object-contain" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-black text-cept-blue leading-none tracking-tighter uppercase italic">CEPT Itaipuaçu</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Anísio Spínola Teixeira</span>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/cursos" onClick={closeMenu} className="text-sm font-black text-slate-600 hover:text-cept-blue transition-colors uppercase tracking-tight">Cursos</Link>
          <Link to="/noticias" onClick={closeMenu} className="text-sm font-black text-slate-600 hover:text-cept-blue transition-colors uppercase tracking-tight">Notícias</Link>
          <Link to="/sobre" onClick={closeMenu} className="text-sm font-black text-slate-600 hover:text-cept-blue transition-colors uppercase tracking-tight">Sobre Nós</Link>
        </nav>

        {/* Ações Dinâmicas R S */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && userData ? (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-right flex flex-col">
                <span className="text-[13px] font-black text-slate-800 leading-tight">
                  {formatDisplayName(userData.nome)}
                </span>
                <span className="text-[9px] font-black text-cept-blue uppercase tracking-widest">
                  {role}
                </span>
              </div>
              
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-cept-blue border border-slate-200 shadow-sm">
                <User size={18} />
              </div>

              <button 
                onClick={handle_logout} 
                className="ml-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sair do Sistema"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login-aluno" 
              onClick={closeMenu} 
              className="flex items-center gap-2 text-sm font-black text-cept-blue px-5 py-2.5 hover:bg-blue-50 rounded-xl transition-all uppercase border border-transparent hover:border-blue-100"
            >
              <LayoutDashboard size={18} /> Portais
            </Link>
          )}

          {isAuthenticated && role === 'root' && (
            <Link 
              to="/root/dashboard" 
              onClick={closeMenu} 
              className="p-2.5 bg-cept-orange text-white hover:brightness-110 rounded-xl transition-all shadow-md shadow-orange-100"
            >
              <ShieldCheck size={20} />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          {isAuthenticated && (
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-cept-blue">
              <User size={14} />
            </div>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-cept-blue bg-slate-50 rounded-xl">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile R S */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-5 font-black uppercase">
            <Link to="/" onClick={closeMenu} className="text-lg py-2 border-b border-slate-50 text-cept-blue italic">Início</Link>
            
            {isAuthenticated && role === 'root' && (
               <Link to="/root/dashboard" onClick={closeMenu} className="text-lg text-cept-orange flex items-center gap-2 py-2 border-b border-slate-50">
                 <ShieldCheck size={20} /> Painel Root
               </Link>
            )}
            
            <Link to="/cursos" onClick={closeMenu} className="text-lg py-2 border-b border-slate-50">Cursos</Link>
            
            {isAuthenticated ? (
              <button 
                onClick={handle_logout} 
                className="flex items-center gap-2 text-red-500 py-4 text-left font-black"
              >
                <LogOut size={20} /> Encerrar Acesso R S
              </button>
            ) : (
              <Link 
                to="/login-aluno" 
                onClick={closeMenu} 
                className="flex items-center justify-center gap-2 w-full py-4 bg-cept-blue text-white rounded-2xl shadow-lg shadow-blue-100"
              >
                <LayoutDashboard size={20} /> Acessar Portais
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;