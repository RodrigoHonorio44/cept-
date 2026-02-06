import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  GraduationCap, 
  Settings, 
  UserCheck, 
  BookOpen, 
  Heart,
  FileText
} from 'lucide-react';

export const MENU_STRUCTURE = {
  // ACESSO TOTAL
  root: [
    { label: 'Dashboard', path: '/root/dashboard', icon: LayoutDashboard },
    { label: 'Gestão de Usuários', path: '/root/usuarios', icon: Users },
    { label: 'Aprovações', path: '/root/aprovacoes', icon: ShieldCheck, badge: true },
    { label: 'Configurações', path: '/root/config', icon: Settings },
  ],

  // ACESSO OPERACIONAL
  secretaria: [
    { label: 'Início', path: '/secretaria/dashboard', icon: LayoutDashboard },
    { label: 'Matrículas', path: '/secretaria/matriculas', icon: UserCheck },
    { label: 'Lista de Alunos', path: '/secretaria/alunos', icon: GraduationCap },
    { label: 'Documentos', path: '/secretaria/documentos', icon: FileText },
  ],

  // ACESSO PEDAGÓGICO
  professor: [
    { label: 'Minhas Turmas', path: '/professor/turmas', icon: GraduationCap },
    { label: 'Lançar Notas', path: '/professor/notas', icon: ClipboardList },
    { label: 'Diário de Classe', path: '/professor/diario', icon: FileText },
  ],

  // ACESSO RESPONSÁVEIS
  pai: [
    { label: 'Meus Filhos', path: '/pai/dashboard', icon: Heart },
    { label: 'Financeiro', path: '/pai/financeiro', icon: ClipboardList },
    { label: 'Boletins', path: '/pai/boletins', icon: BookOpen },
  ],

  // ACESSO DISCENTE
  aluno: [
    { label: 'Minha Área', path: '/aluno/dashboard', icon: LayoutDashboard },
    { label: 'Materiais', path: '/aluno/materiais', icon: BookOpen },
    { label: 'Minhas Notas', path: '/aluno/notas', icon: GraduationCap },
  ]
};