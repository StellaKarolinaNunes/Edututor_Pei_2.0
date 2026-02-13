import { FC, useState, useEffect } from 'react'
import {
  LogOut, LayoutDashboard, Users, BookOpen,
  Calendar, Bell, Search, Settings, CheckCircle2,
  ChevronRight, TrendingUp, Menu, X, Filter,
  ArrowUpRight, Clock, MessageSquare, Briefcase,
  ChevronLeft, ClipboardList, Lightbulb, Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { cleanOrphanAuthUsers, checkEmailConflict } from '@/lib/cleanOrphanUsers';
import '@/lib/criarPrimeiroAdmin'; // Carrega ferramentas de diagnóstico
import logotipoHorizontal from '@/assets/images/logotipo_Horizontal.svg';
import { StudentsView } from './Students/StudentsView';
import { ManagementView } from './Management/ManagementView';
import { DisciplineView } from './Discipline/DisciplineView';
import { SettingsView } from './Settings/SettingsView';
import { ReportsView } from './Reports/ReportsView';
import { SearchModal } from './SearchModal';
import { HelpCenter } from './HelpCenter';

import styles from './Dashboard.module.css';
import { div, section } from 'framer-motion/client';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type ViewState = 'dashboard' | 'students' | 'management' | 'discipline' | 'reports' | 'settings' | 'help';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Permissions and Auth
  const { user: authUser, permissions, loading: authLoading } = useAuth();

  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Novo PEI criado', description: 'Arthur Silva agora tem um PEI.', time: '10 min atrás' },
    { id: 2, title: 'Atendimento agendado', description: 'Beatriz Costa às 16:30.', time: '1 hora atrás' },
  ]);
  const [realStats, setRealStats] = useState({
    alunosAtivos: 0,
    totalAlunos: 0,
    peisConcluidos: 0,
    totalPeis: 0,
    atendimentosHoje: 0,
    mediaAlunosTurma: 0,
    taxaAtivos: 0,
    pendencia: 0
  });

  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<number[]>([40, 60, 45, 80, 100]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: alunosAtivos } = await supabase
          .from('Alunos')
          .select('*', { count: 'exact', head: true })
          .eq('Status', 'Ativo');

        const { count: peisConcluidos } = await supabase
          .from('PEIs')
          .select('*', { count: 'exact', head: true })
          .eq('Status', 'Concluído');

        const { count: totalPeis } = await supabase
          .from('PEIs')
          .select('*', { count: 'exact', head: true });

        const today = new Date().toISOString().split('T')[0];
        const { count: atendimentosHoje } = await supabase
          .from('Aulas')
          .select('*', { count: 'exact', head: true })
          .gte('Data_hora_inicio', `${today}T00:00:00`)
          .lte('Data_hora_inicio', `${today}T23:59:59`);

        const { count: totalTurmas } = await supabase
          .from('Turmas')
          .select('*', { count: 'exact', head: true });

        const { count: totalAlunosTurmas } = await supabase
          .from('Alunos_Turmas')
          .select('*', { count: 'exact', head: true });

        const { count: totalAlunos } = await supabase
          .from('Alunos')
          .select('*', { count: 'exact', head: true });

        const { count: pendencias } = await supabase
          .from('Relatorios_PEI')
          .select('*', { count: 'exact', head: true });

        // Fetch Pending Activities
        const { data: pendingData } = await supabase
          .from('Relatorios_PEI')
          .select('*, Alunos(Nome)')
          .limit(3)
          .order('Relatorio_ID', { ascending: false });

        if (pendingData) {
          setPendingActivities(pendingData.map((item: any) => ({
            name: item.Alunos?.Nome || 'N/A',
            type: item.Tipo || 'Relatório de Progresso',
            time: new Date(item.Created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: item.Status || 'Pendente',
            priority: 'medium'
          })));
        }

        // Fetch Engagement Data (last 5 days of classes)
        const last5Days = [...Array(5)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (4 - i));
          return d.toISOString().split('T')[0];
        });

        const engagementCounts = await Promise.all(
          last5Days.map(async (day) => {
            const { count } = await supabase
              .from('Aulas')
              .select('*', { count: 'exact', head: true })
              .gte('Data_hora_inicio', `${day}T00:00:00`)
              .lte('Data_hora_inicio', `${day}T23:59:59`);
            return count || 0;
          })
        );

        const maxCount = Math.max(...engagementCounts, 1);
        setEngagementMetrics(engagementCounts.map(c => Math.round((c / maxCount) * 100)));

        setRealStats({
          alunosAtivos: alunosAtivos || 0,
          totalAlunos: totalAlunos || 0,
          peisConcluidos: peisConcluidos || 0,
          totalPeis: totalPeis || 0,
          atendimentosHoje: atendimentosHoje || 0,
          mediaAlunosTurma: totalTurmas && totalTurmas > 0 ? Math.round((totalAlunosTurmas || 0) / totalTurmas) : 0,
          taxaAtivos: totalAlunos && totalAlunos > 0 ? Math.round(((alunosAtivos || 0) / totalAlunos) * 100) : 0,
          pendencia: pendencias || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) onLogout();
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSelectSearchResult = (result: any) => {
    setIsSearchModalOpen(false);

    // Logic to navigate based on result type
    switch (result.type) {
      case 'Alunos':
      case 'PEIs':
      case 'Atendimentos':
      case 'Notas':
        setActiveView('students');
        break;
      case 'Disciplinas':
        setActiveView('discipline');
        break;
      case 'Turmas':
      case 'Professores':
      case 'Escolas':
        setActiveView('management');
        break;
      default:
        break;
    }
  };

  const stats = [
    { label: 'Alunos Ativos', value: realStats.alunosAtivos.toString().padStart(2, '0'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Total' },
    { label: 'PEIs Concluídos', value: realStats.peisConcluidos.toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: `${realStats.totalPeis > 0 ? Math.round((realStats.peisConcluidos / realStats.totalPeis) * 100) : 0}% do total` },
    { label: 'Atendimentos Hoje', value: realStats.atendimentosHoje.toString().padStart(2, '0'), icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Hoje' },
    { label: 'Média Alunos/Turma', value: realStats.mediaAlunosTurma.toString().padStart(2, '0'), icon: LayoutDashboard, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Estável' },
    { label: 'Taxa de Ativos', value: `${realStats.taxaAtivos}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5', trend: `${realStats.alunosAtivos}/${realStats.totalAlunos} Alunos` },
    { label: 'Pendência', value: realStats.pendencia.toString().padStart(2, '0'), icon: Bell, color: 'text-red-500', bg: 'bg-red-50', trend: 'Atenção' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'students': return <StudentsView />;
      case 'management': return <ManagementView />;
      case 'discipline': return <DisciplineView />;
      case 'settings': return <SettingsView />;
      case 'reports': return <ReportsView />;
      case 'help': return <HelpCenter />;
      case 'dashboard':
      default:
        return (
          <div className="animate-in fade-in duration-700">
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  Seja bem vindo(a) ao Vinculo Pei <span className="text-4xl">👋</span>
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    Visão geral completa do sistema educacional.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full xl:w-auto">

                <div className="relative group flex-1 xl:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    readOnly
                    onClick={() => setIsSearchModalOpen(true)}
                    placeholder="Pesquisar em todo o sistema..."
                    className="w-full xl:w-80 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium dark:text-white cursor-pointer"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <kbd className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-sans border border-slate-200">⌘</kbd>
                    <kbd className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-sans border border-slate-200">K</kbd>
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 hidden lg:block"></div>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm"
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-black text-slate-900 dark:text-white">Notificações</h4>
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Recentes</span>
                      </div>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? notifications.map((n) => (
                          <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-transparent hover:border-slate-200 transition-all cursor-pointer group relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveNotification(n.id); }}
                              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all"
                            >
                              <X size={12} className="text-slate-400" />
                            </button>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.description}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{n.time}</p>
                          </div>
                        )) : (
                          <div className="py-8 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma notificação</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearNotifications}
                          className="w-full mt-4 py-2 text-xs font-black text-slate-400 hover:text-primary transition-colors text-center border-t border-slate-50 dark:border-slate-700 pt-3"
                        >
                          Limpar todas as notificações
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-4 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center font-black">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col pr-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{user?.email}</p>
                    <p className="text-[10px] font-bold text-success uppercase tracking-widest">Premium Plan</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Grid de Estatísticas Refinado - Agora com 6 itens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} dark:bg-slate-700/50 flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <stat.icon size={22} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">{stat.label}</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.1] group-hover:scale-125 transition-transform duration-700">
                    <stat.icon size={100} />
                  </div>
                </div>
              ))}
            </div>

            {/* Seções Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Atividades Pendentes</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Você tem 3 tarefas importantes hoje</p>
                  </div>
                  <button className="text-xs font-black text-primary hover:text-secondary uppercase tracking-widest transition-colors flex items-center gap-2">
                    Ver histórico completo <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {pendingActivities.length > 0 ? pendingActivities.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-700/20 hover:bg-white dark:hover:bg-slate-700/40 border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="size-12 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-black text-primary border border-slate-100 dark:border-slate-600">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-all">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-4 sm:pt-0">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{item.time}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                          item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {item.status}
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-700/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-400 font-medium">Nenhuma atividade pendente no momento.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-primary dark:bg-primary/80 p-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="size-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/10 group-hover:rotate-12 transition-transform">
                    <TrendingUp size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight mb-4">Métricas de <br />Engajamento</h3>
                  <p className="text-white/70 text-sm font-medium leading-relaxed mb-auto">
                    A produtividade média da sua turma subiu 15% esta semana.
                  </p>

                  <div className="pt-8 mt-12 border-t border-white/10">
                    <div className="flex justify-between items-end gap-4">
                      <div className="h-24 flex-1 flex items-end gap-1.5">
                        {engagementMetrics.map((h, i) => (
                          <div key={i} className="flex-1 group/bar relative">
                            <div
                              style={{ height: `${h}%` }}
                              className="w-full bg-white/20 rounded-t-lg group-hover/bar:bg-white/40 transition-all duration-500"
                            />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] font-bold text-white">
                              {h}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Engajamento Atual</p>
                        <p className="text-4xl font-black text-white tracking-tighter">
                          {engagementMetrics.reduce((a, b) => a + b, 0) / engagementMetrics.length}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Abstract shape background */}
                <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 bg-white/5 rounded-full blur-3xl"></div>
              </div>
            </div>

          </div>
        );
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Mobile Header Refinado */}
      <div className={styles.mobileHeader}>
        <div className="flex items-center gap-3">
          <img src={logotipoHorizontal} alt="Logo" className="h-12 sm:h-14 w-auto object-contain" />
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay Glass */}
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar de Alto Nível */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 pb-4">
            {/* Header Sidebar */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <img src={logotipoHorizontal} alt="Logo" className="h-20 w-auto object-contain" />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 lg:hidden rounded-xl hovrer:bg-slate-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Principal */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Navegação</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', requiresPermission: null },
                { id: 'students', icon: Users, label: 'Alunos', requiresPermission: 'canViewStudents' },
                { id: 'management', icon: Briefcase, label: 'Gerenciamento', requiresPermission: 'canViewManagement' },
                { id: 'discipline', icon: BookOpen, label: 'Disciplinas', requiresPermission: 'canViewDisciplines' },
                { id: 'reports', icon: TrendingUp, label: 'Relatórios', requiresPermission: 'canViewReports' },
              ]
                .filter(item => {
                  if (!item.requiresPermission) return true;
                  return permissions?.[item.requiresPermission as keyof typeof permissions];
                })
                .map((item: any, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveView(item.id as ViewState);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-all group overflow-hidden relative ${activeView === item.id
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <item.icon size={18} className={`${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`} />
                      {item.label}
                    </div>
                    {activeView === item.id && <ChevronRight size={14} className="opacity-50" />}
                  </button>
                ))}
            </nav>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-4 ml-2">Suporte & App</p>
            <nav className="space-y-1">
              {[
                { id: 'settings', icon: Settings, label: 'Ajustes', requiresPermission: null },
                { id: 'help', icon: MessageSquare, label: 'Central de Ajuda', requiresPermission: null },
              ]
                .filter(item => {
                  if (!item.requiresPermission) return true;
                  return permissions?.[item.requiresPermission as keyof typeof permissions];
                })
                .map((item: any, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveView(item.id as ViewState);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl font-bold text-sm transition-all group ${activeView === item.id
                      ? 'bg-primary text-white shadow-xl shadow-primary/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-white'
                      }`}
                  >
                    <item.icon size={18} className={`${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`} />
                    {item.label}
                  </button>
                ))}
            </nav>
          </div>

          <div className="mt-auto p-8 pt-4">



            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-500 font-bold text-sm hover:text-red-500 transition-all w-full p-3 rounded-2xl mt-2 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo Principal Refinada */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
};