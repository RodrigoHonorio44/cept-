import React from 'react';
import { Navigate } from 'react-router-dom';
// R S: Importação mantida conforme sua estrutura de hooks
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, role, loading, userData } = useAuth();

  // 1. Enquanto carrega dados do Auth ou do Firestore, exibe o loading r s
  if (loading || (user && roleRequired && !role)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cept-blue"></div>
          <span className="text-xs font-black text-cept-blue uppercase tracking-widest italic">Validando Acesso R S</span>
        </div>
      </div>
    );
  }

  // 2. Se não está logado, tchau.
  if (!user) {
    return <Navigate to="/login-aluno" replace />;
  }

  // 3. O PULO DO GATO R S: 
  // Se o usuário logou mas a flag 'deve_trocar_senha' no Firestore está como true, 
  // ele é barrado de entrar no dashboard e mandado para a troca obrigatória.
  if (userData?.deve_trocar_senha === true) {
    return <Navigate to="/trocar-senha" replace />;
  }

  // 4. Lógica Root (R S)
  // Se for root, tem passe livre (a menos que precise trocar senha).
  if (role === 'root') {
    return children;
  }

  // 5. Verificação de cargos específicos
  if (roleRequired && role !== roleRequired) {
    console.warn(`[r s] acesso negado: necessário ${roleRequired} | cargo atual: ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;