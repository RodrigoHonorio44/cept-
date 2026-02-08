import React from 'react'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext' 

// Criamos um componente wrapper para decidir o que mostrar
function AppContent() {
  const location = useLocation();
  
  // r s: Verifica se a rota atual é do dashboard
  // Se o caminho começar com /dashboard ou /root, ignoramos o layout do site
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/root');

  if (isDashboard) {
    return (
      <main className="w-full h-screen overflow-hidden">
        <AppRoutes />
      </main>
    );
  }

  return (
    /* Layout Normal do Site Institucional r s */
    <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-visible">
      <Header />
      <main className="flex-grow w-full h-auto overflow-visible">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider> 
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App;