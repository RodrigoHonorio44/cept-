import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Configuração Firebase - CEPT Itaipuaçu
 * R S - 2026
 */

const firebaseConfig = {
  apiKey: "AIzaSyD-pk4CJCZWRv2DUSJMMjnx4ZWZNnWCkgI",
  authDomain: "cept-40f3f.firebaseapp.com",
  projectId: "cept-40f3f",
  storageBucket: "cept-40f3f.firebasestorage.app",
  messagingSenderId: "488806528052",
  appId: "1:488806528052:web:e6cff04c62124d37a54661"
};

// 1. Inicializa o app principal (Onde você, Admin, está logado)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 2. REGRA R S: Inicializa um app secundário para criação de usuários
// Isso impede que o Admin seja deslogado ao cadastrar um Aluno/Funcionário
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const auth_admin = getAuth(secondaryApp);

// Configuração de persistência para o app principal
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("persistência r s configurada com sucesso.");
  })
  .catch((error) => {
    console.error("erro ao configurar persistência:", error);
  });

// r s: exportamos o auth_admin especificamente para o formulário de cadastro
export { auth, db, storage, auth_admin };
export default app;