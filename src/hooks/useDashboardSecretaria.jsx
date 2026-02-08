import { useState, useEffect } from 'react';
import { db } from '../services/firebase'; 
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

export function useDashboardSecretaria() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [logs, setLogs] = useState([]); // r s: histórico de acessos liberados
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0 });
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Escuta Solicitações Pendentes 📨
    const qSolicitacoes = query(
      collection(db, "solicitacoes_acesso"),
      orderBy("solicitado_em", "desc"),
      limit(50)
    );

    // 2. Escuta Logs de Liberação 📝
    const qLogs = query(
      collection(db, "logs_liberacao"),
      orderBy("data_liberacao", "desc"),
      limit(50)
    );

    const unsubSolicitacoes = onSnapshot(qSolicitacoes, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSolicitacoes(docs);
      setStats({
        pendentes: docs.filter(d => d.status === 'pendente').length,
        aprovados: docs.filter(d => d.status === 'aprovado').length
      });
      setLoading(false);
    });

    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(docs);
    });

    return () => {
      unsubSolicitacoes();
      unsubLogs();
    };
  }, []);

  // r s: Função de filtro reutilizável (sempre em lowercase)
  const aplicarFiltro = (lista) => lista.filter(item => 
    item.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    item.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return {
    solicitacoes: aplicarFiltro(solicitacoes),
    logs: aplicarFiltro(logs), // r s: agora os logs também são buscáveis
    stats,
    busca,
    setBusca,
    loading
  };
}