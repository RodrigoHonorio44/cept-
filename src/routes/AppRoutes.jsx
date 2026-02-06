import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Cursos from '../pages/public/curso'; 
import Noticias from '../pages/public/Noticias'; 
import SobreNos from '../pages/public/SobreNos'; 
import NoticiaDetalhes from '../pages/root/NoticiaDetalhes'; // r s: importação da nova página de detalhes
import Login from '../pages/auth/Login'; 
import DashboardRoot from '../pages/root/Dashboard'; 
import TrocarSenha from '../pages/auth/TrocarSenha'; 
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../hooks/useAuth';

const AppRoutes = () => {
  const { user, role, loading, userData } = useAuth(); 
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      console.log(`[r s router] rota: ${location.pathname} | logado: ${!!user} | role: ${role} | deve_trocar: ${userData?.deve_trocar_senha}`);
    }
  }, [location, user, role, loading, userData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cept-blue border-r-transparent"></div>
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">sincronizando r s</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. rotas públicas r s */}
      <Route path="/" element={<Home />} />
      <Route path="/cursos" element={<Cursos />} />
      <Route path="/noticias" element={<Noticias />} /> 
      <Route path="/sobre" element={<SobreNos />} /> 
      
      {/* r s: nova rota dinâmica para leitura completa da notícia */}
      <Route path="/noticia/:id" element={<NoticiaDetalhes />} /> 

      {/* 2. login com redirecionamento r s */}
      <Route 
        path="/login-aluno" 
        element={user && role ? <Navigate to={userData?.deve_trocar_senha ? "/trocar-senha" : `/${role}/dashboard`} replace /> : <Login />} 
      />
      <Route 
        path="/login-professor" 
        element={user && role ? <Navigate to={userData?.deve_trocar_senha ? "/trocar-senha" : `/${role}/dashboard`} replace /> : <Login />} 
      />

      {/* 3. rota de troca de senha r s */}
      <Route 
        path="/trocar-senha" 
        element={user ? <TrocarSenha /> : <Navigate to="/" />} 
      />

      {/* 4. rotas protegidas r s */}
      {user && (
        <>
          <Route 
            path="/root/dashboard" 
            element={
              <PrivateRoute roleRequired="root">
                <DashboardRoot />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/aluno/dashboard" 
            element={
              <PrivateRoute roleRequired="aluno">
                <div className="p-20 text-center font-black uppercase italic">painel do aluno r s</div>
              </PrivateRoute>
            } 
          />
        </>
      )}

      {/* fallback r s */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;