import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export const useDashboard = () => {
  const [active_tab, set_active_tab] = useState('usuarios');
  const [usuarios, set_usuarios] = useState([]);
  const [pedidos, set_pedidos] = useState([]);
  const [busca, set_busca] = useState('');
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [loading, set_loading] = useState(true);

  // r s: Formatação visual padronizada para exibição (Capitalize apenas na view)
  const formatar_nome = useCallback((str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }, []);

  // r s: Função para destravar a UI e fechar o modal com segurança
  const atualizar_e_fechar = useCallback(() => {
    set_is_modal_open(false);
    set_busca(''); // Reseta busca para mostrar o novo usuário no topo
  }, []);

  // 1. Monitoramento de USUÁRIOS (Real-time) r s
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("criado_em", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // r s: garantindo lowercase para busca consistente
        nome: doc.data().nome?.toLowerCase() || '',
        email: doc.data().email?.toLowerCase() || ''
      }));
      set_usuarios(docs);
      set_loading(false);
    }, (error) => {
      console.error("erro snapshot users r s:", error);
      set_loading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Monitoramento de PEDIDOS da Secretaria (Real-time) r s
  useEffect(() => {
    const q = query(collection(db, "solicitacoes_acesso"), orderBy("solicitado_em", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        nome: doc.data().nome?.toLowerCase() || '',
        email: doc.data().email?.toLowerCase() || ''
      }));
      set_pedidos(docs);
    }, (error) => {
      console.error("erro snapshot pedidos r s:", error);
    });
    return () => unsubscribe();
  }, []);

  // 3. Filtros Inteligentes (lowercase search) r s
  const usuarios_filtrados = usuarios.filter(u => 
    u.nome.includes(busca.toLowerCase()) || u.email.includes(busca.toLowerCase())
  );

  const pedidos_filtrados = pedidos.filter(p => 
    p.nome.includes(busca.toLowerCase()) || p.email.includes(busca.toLowerCase())
  );

  return {
    // Estados de Navegação
    active_tab,
    set_active_tab,
    is_modal_open,
    set_is_modal_open,
    
    // Dados Filtrados
    usuarios: usuarios_filtrados,
    pedidos: pedidos_filtrados,
    
    // Contadores para StatCards r s
    total_usuarios: usuarios.length,
    total_pedidos: pedidos.length,
    usuarios_ativos: usuarios.filter(u => u.status === 'ativo').length,
    
    // Busca e UI
    busca,
    set_busca,
    loading,
    formatar_nome,
    atualizar_e_fechar // r s: importante passar para o aoSucesso do Form
  };
};