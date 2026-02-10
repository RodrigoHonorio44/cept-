import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Home from '../pages/Home';
import Cursos from '../pages/public/curso'; 
import Noticias from '../pages/public/Noticias'; 
import SobreNos from '../pages/public/SobreNos'; 
import NoticiaDetalhes from '../pages/root/NoticiaDetalhes'; 
import Login from '../pages/auth/Login'; 
import DashboardRoot from '../pages/root/Dashboard'; 
import DashboardSecretaria from '../pages/secretaria/DashboardSecretaria'; 
import DashboardProfessor from '../pages/secretaria/professores/DashboardProfessor'; 
import DashboardAluno from '../pages/secretaria/Alunos/DashboardAluno'; // R S: Importando a Dashboard Real
import SecretariaVirtual from '../pages/secretaria/SecretariaVirtual'; 
import TrocarSenha from '../pages/auth/TrocarSenha'; 
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../hooks/useAuth';
import { Shield, Landmark, Users, GraduationCap, FileText } from 'lucide-react';

// R S: Componente de seleção ROOT com distinção de Secretarias
const SelecaoPortalRoot = () => {
  const navigate = useNavigate();
  
  const botoes = [
    { label: "painel administrativo", rota: "/root/dashboard", icon: <Shield size={20} />, bg: "bg-blue-600" },
    { label: "gestão de secretaria", rota: "/funcionario/dashboard", icon: <Landmark size={20} />, bg: "bg-slate-800" },
    { label: "portal do professor", rota: "/professor/dashboard", icon: <GraduationCap size={20} />, bg: "bg-green-600" },
    { label: "secretaria virtual", rota: "/secretaria", icon: <FileText size={20} />, bg: "bg-emerald-500" }, 
    { label: "área do aluno", rota: "/aluno/dashboard", icon: <Users size={20} />, bg: "bg-slate-700" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-white text-center">
      <h1 className="font-black text-3xl mb-2 italic uppercase tracking-tighter">
        Portal de <span className="text-blue-500">Gestão</span>
      </h1>
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.5em] mb-10">acesso de administrador global r s</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {botoes.map((btn) => (
          <button 
            key={btn.rota}
            onClick={() => navigate(btn.rota)} 
            className={`${btn.bg} p-8 rounded-[2rem] font-black uppercase italic text-xs flex flex-col items-center gap-3 hover:scale-[1.02] transition-all border border-white/5 shadow-2xl group`}
          >
            <div className="opacity-40 group-hover:opacity-100 transition-opacity">{btn.icon}</div>
            {btn.label}
          </button>
        ))}
      </div>
      <p className="mt-12 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">sistema integral • 2026</p>
    </div>
  );
};

const AppRoutes = () => {
  const { user, role, loading, userData } = useAuth(); 
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      console.log(`[router] rota: ${location.pathname} | role: ${role}`);
    }
  }, [location, role, loading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-r-transparent"></div>
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">sincronizando sistema r s</span>
      </div>
    );
  }

  // R S: Lógica de redirecionamento inteligente
  const getRedirectPath = () => {
    if (userData?.deve_trocar_senha) return "/trocar-senha";
    if (role === 'root') return "/root/selecao";
    
    // R S: Adicionado redirecionamento direto para aluno
    if (role === 'aluno') return "/aluno/dashboard";

    if (role === 'funcionario') {
      const cargo = userData?.cargo?.toLowerCase();
      if (cargo === 'professor' || cargo === 'professora') return "/professor/dashboard";
      return "/funcionario/dashboard";
    }

    return role ? `/${role}/dashboard` : "/";
  };

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/cursos" element={<Cursos />} />
      <Route path="/noticias" element={<Noticias />} /> 
      <Route path="/sobre" element={<SobreNos />} /> 
      <Route path="/noticia/:id" element={<NoticiaDetalhes />} /> 

      {/* Autenticação */}
      <Route 
        path="/login-aluno" 
        element={user && role ? <Navigate to={getRedirectPath()} replace /> : <Login />} 
      />
      <Route 
        path="/login-professor" 
        element={user && role ? <Navigate to={getRedirectPath()} replace /> : <Login />} 
      />
      
      <Route path="/trocar-senha" element={user ? <TrocarSenha /> : <Navigate to="/" />} />
      
      {user && userData?.deve_trocar_senha && location.pathname !== "/trocar-senha" && (
        <Route path="*" element={<Navigate to="/trocar-senha" replace />} />
      )}

      {/* Seleção Root */}
      <Route 
        path="/root/selecao" 
        element={role === 'root' ? <SelecaoPortalRoot /> : <Navigate to="/" />} 
      />

      {/* Rotas Privadas R S */}
      {user && (
        <>
          {/* Painel Administrativo Geral */}
          <Route 
            path="/root/dashboard" 
            element={<PrivateRoute roleRequired="root"><DashboardRoot /></PrivateRoute>} 
          />

          {/* Gestão de Secretaria (Dashboard Interna) */}
          <Route 
            path="/funcionario/dashboard" 
            element={<PrivateRoute roleRequired="funcionario"><DashboardSecretaria /></PrivateRoute>} 
          />

          {/* Portal Docente */}
          <Route 
            path="/professor/dashboard" 
            element={<PrivateRoute><DashboardProfessor /></PrivateRoute>} 
          />

          {/* Secretaria Virtual */}
          <Route 
            path="/secretaria" 
            element={<PrivateRoute><SecretariaVirtual /></PrivateRoute>} 
          />

          {/* Área do Aluno - Agora renderizando a dashboard real r s */}
          <Route 
            path="/aluno/dashboard" 
            element={
              <PrivateRoute roleRequired="aluno">
                <DashboardAluno />
              </PrivateRoute>
            } 
          />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;