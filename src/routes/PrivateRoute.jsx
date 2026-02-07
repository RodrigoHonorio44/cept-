import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, role, loading, userData } = useAuth();

  // 1. Loading state r s
  if (loading || (user && roleRequired && !role)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest italic">Validando Acesso R S</span>
        </div>
      </div>
    );
  }

  // 2. Se não está logado, volta pro login r s
  if (!user) {
    return <Navigate to="/login-aluno" replace />;
  }

  // 3. O PULO DO GATO R S: Troca de senha obrigatória
  // Root também deve trocar se a flag estiver ativa, por segurança.
  if (userData?.deve_trocar_senha === true) {
    return <Navigate to="/trocar-senha" replace />;
  }

  // 4. SUPER PODER ROOT R S
  // Se for root, ele ignora as próximas validações e entra em qualquer lugar.
  if (role === 'root') {
    return children;
  }

  // 5. Verificação de cargos e permissões r s
  // Agora, se a rota pede 'funcionario', e o usuário é 'funcionario', ele passa.
  // A diferenciação de Dashboard (Secretaria vs Professor) é feita pelo redirecionamento no AppRoutes.
  if (roleRequired && role !== roleRequired) {
    console.warn(`[r s] acesso negado: necessário ${roleRequired} | seu role: ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;