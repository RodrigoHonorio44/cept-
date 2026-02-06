import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../services/firebase'; 
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth'; // R S: adicionado updatePassword
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; // R S: adicionado updateDoc

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      setLoading(true);

      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (userAuth) {
        const userRef = doc(db, "users", userAuth.uid);
        
        unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            setUserData(data);
            setRole(data.role || 'aluno');
            setUser(userAuth);
          } else {
            setUser(userAuth);
            setRole('aluno');
            setUserData({ nome: 'usuário novo', role: 'aluno' });
          }
          
          setLoading(false);
        }, (error) => {
          console.error("Erro Firestore R S:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // R S: Função para trocar a senha no primeiro acesso
  const atualizarSenhaPrimeiroAcesso = async (novaSenha) => {
    if (!auth.currentUser) throw new Error("usuário não autenticado r s");

    try {
      // 1. Atualiza no Firebase Auth
      await updatePassword(auth.currentUser, novaSenha);
      
      // 2. Atualiza no Firestore para o onSnapshot ler a mudança
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        deve_trocar_senha: false
      });

      return { success: true };
    } catch (error) {
      console.error("Erro na troca de senha r s:", error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    role,
    userData,
    loading,
    atualizarSenhaPrimeiroAcesso, // R S: função exportada aqui
    logout: () => signOut(auth),
    isAuthenticated: !!user
  }), [user, role, userData, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}