import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext' 

function App() {
  return (
    <AuthProvider> 
      <Router>
        {/* r s: 
            - h-full + min-h-screen + overflow-visible garante que o scroll apareça.
            - Removi qualquer classe que possa travar a altura.
        */}
        <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-visible">
          
          <Header />

          {/* O h-auto aqui é vital para o scroll r s */}
          <main className="flex-grow w-full h-auto overflow-visible">
            <AppRoutes />
          </main>

          <Footer />
          
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App