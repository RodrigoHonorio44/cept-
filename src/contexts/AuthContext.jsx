import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../services/firebase'; 
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth'; 
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; 

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      // Importante: Não setamos loading como false aqui ainda! r s
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
          setLoading(false); // Só libera o loading após ler o Firestore r s
        }, (error) => {
          console.error("Erro Firestore R S:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
        setLoading(false); // Libera o loading se não houver usuário logado r s
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const atualizarSenhaPrimeiroAcesso = async (novaSenha) => {
    if (!auth.currentUser) throw new Error("usuário não autenticado r s");
    try {
      await updatePassword(auth.currentUser, novaSenha);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { deve_trocar_senha: false });
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
    atualizarSenhaPrimeiroAcesso,
    logout: () => signOut(auth),
    isAuthenticated: !!user
  }), [user, role, userData, loading]);

  // R S: Renderizamos o Provider sempre, e o AppRoutes cuida do loader interno.
  // Isso evita que o App inteiro "desapareça" da memória.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}