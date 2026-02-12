import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';

export const useDashboard = () => {
  const [active_tab, set_active_tab] = useState('usuarios');
  const [usuarios, set_usuarios] = useState([]);
  const [pedidos, set_pedidos] = useState([]);
  const [busca, set_busca] = useState('');
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [loading, set_loading] = useState(true);
  
  // r s: estado para carregar o pedido no formulário
  const [pedido_selecionado, set_pedido_selecionado] = useState(null);

  // r s: Formatação visual padronizada para exibição (Capitalize apenas na view)
  const formatar_nome = useCallback((str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }, []);

  // r s: abre o modal já injetando os dados do pedido da secretaria
  const abrir_com_pedido = useCallback((pedido) => {
    set_pedido_selecionado(pedido);
    set_is_modal_open(true);
  }, []);

  const atualizar_e_fechar = useCallback(() => {
    set_is_modal_open(false);
    set_pedido_selecionado(null); // r s: limpa a memória do pedido ao fechar
    set_busca(''); 
  }, []);

  // 1. Monitoramento de USUÁRIOS (Real-time) r s
  useEffect(() => {
    // r s: Ajustado para "dataCadastro" para sincronizar com o que é salvo no formulário
    const q = query(collection(db, "users"), orderBy("dataCadastro", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // r s: mapeamos dataCadastro para criado_em para não quebrar a exibição na tabela
          criado_em: data.dataCadastro,
          nome: data.nome?.toLowerCase() || '',
          email: data.email?.toLowerCase() || ''
        };
      });
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
    const pedidosRef = collection(db, "solicitacoes_acesso");
    // r s: trazendo apenas os pendentes para o painel de ação do root
    const q = query(
      pedidosRef, 
      where("status", "==", "pendente")
    );

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
    u.nome.includes(busca.toLowerCase()) || 
    u.email.includes(busca.toLowerCase()) ||
    (u.cpf && u.cpf.includes(busca.replace(/\D/g, ''))) // r s: busca por CPF limpo
  );

  const pedidos_filtrados = pedidos.filter(p => 
    p.nome.includes(busca.toLowerCase()) || p.email.includes(busca.toLowerCase())
  );

  return {
    active_tab,
    set_active_tab,
    is_modal_open,
    set_is_modal_open,
    
    // r s: gestão de pedidos para o formulário
    pedido_selecionado,
    abrir_com_pedido,
    
    // Dados Filtrados
    usuarios: usuarios_filtrados,
    pedidos: pedidos_filtrados,
    
    // Contadores para StatCards e Sidebar r s
    total_usuarios: usuarios.length,
    total_pedidos: pedidos.length, 
    usuarios_ativos: usuarios.filter(u => u.status === 'ativo').length,
    
    // Busca e UI
    busca,
    set_busca,
    loading,
    formatar_nome,
    atualizar_e_fechar
  };
};