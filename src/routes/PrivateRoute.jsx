import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, role, loading, userData } = useAuth();

  // 1. LOADING STATE R S
  // Só libera a renderização quando o loading do Firebase terminar
  // E quando o papel (role) do usuário estiver carregado no contexto.
  if (loading || (user && !role)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest italic animate-pulse">
            Sincronizando Credenciais R S
          </span>
        </div>
      </div>
    );
  }

  // 2. PROTEÇÃO DE SESSÃO R S
  // Se o Firebase terminou o loading e não achou usuário, tchau.
  if (!user) {
    return <Navigate to="/login-aluno" replace />;
  }

  // 3. SEGURANÇA OBRIGATÓRIA R S
  // Se a flag de trocar senha estiver ativa, nada mais importa, ele tem que trocar.
  if (userData?.deve_trocar_senha === true) {
    // Evita loop se o usuário já estiver na página de troca de senha
    return <Navigate to="/trocar-senha" replace />;
  }

  // 4. SUPER PODER ROOT R S
  // Se você for root, você é o dono da chave. Passa direto por qualquer barreira.
  if (role === 'root') {
    return children;
  }

  // 5. VALIDAÇÃO DE ACESSO POR CARGO R S
  // Se a rota exige um cargo (ex: 'aluno') e você não tem esse cargo,
  // você é jogado para a Home para evitar o loop de redirecionamento infinito.
  if (roleRequired && role !== roleRequired) {
    console.warn(`[r s] bloqueio de camada: exigido ${roleRequired} | detectado ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;