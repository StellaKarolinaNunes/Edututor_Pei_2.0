import { LoginForm } from "./src/components/LoginForm";
import { ForgotPassword } from "./src/components/ForgotPassword";
import { ResetPassword } from "./src/components/ResetPassword";
import { Dashboard } from "./src/components/Dashboard";
import { Logo } from "./src/components/Logo"
import { supabase } from "./src/lib/supabase";
import React, { useEffect, useState } from 'react'
import MarketingSection from "./src/components/MarketingSection/MarketingSection";
import styles from "./styles/App.module.css";




type View = 'login' | 'forgot-password' | 'reset-password' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [simulateError, setSimulateError] = useState(false);

  if (simulateError) {
    throw new Error("Simulação de Erro para Teste do ErrorBoundary");
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setView('dashboard');
      }
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setView('dashboard');
      } else {
        setUser(null);
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⏳ Loading
  if (loadingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="font-black text-primary text-[10px] uppercase tracking-widest">
            Carregando Vinculo PEI...
          </span>
        </div>
      </div>
    );
  }

  if (view === 'dashboard' && !user) {
    setView('login');
  }

  if (view === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={() => setView('login')} />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainPane}>

        <header className="mb-6 text-center">
          <Logo />
        </header>

        <div className="flex flex-col max-w-md mx-auto w-full gap-8">

          {view === 'login' && (
            <div className="flex flex-col gap-6">
              <div className="text-left">
                <div className={styles.badge}>
                  <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                  Gestão Multidisciplinar
                </div>
                <h1 className="text-3xl font-black tracking-tight mt-2 text-primary">
                  Bem-vindo de volta!
                </h1>
                <p className="mt-2 text-slate-500 text-sm">
                  Potencialize o ensino com nossa plataforma inteligente.
                </p>
              </div>

              <LoginForm onForgotPassword={() => setView('forgot-password')} />
            </div>
          )}

          {view === 'forgot-password' && (
            <ForgotPassword onBack={() => setView('login')} onSuccess={() => setView('reset-password')} />
          )}

          <div className="text-center mt-6">
            <p className="text-slate-400 text-xs font-semibold">
              Ainda não faz parte?{' '}
              <a href="https://instagram.com/edututorpei" className="text-primary font-black underline underline-offset-4">
                solicite uma demonstração
              </a>
            </p>
          </div>
        </div>

        {/* Footer fixado no final mas sem ocupar muito espaço */}
        <footer className="mt-auto pt-6 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            © 2026 Vinculo PEI
          </p>
          {/* Botão de Teste Temporário */}
          <button
            onClick={() => setSimulateError(true)}
            className="mt-2 text-[9px] text-red-300 hover:text-red-500 underline"
          >
            [TESTE] Simular Erro
          </button>
        </footer>
      </main>

      <div className={styles.marketingPane}>
        <MarketingSection />
      </div>
    </div>
  );
};

export default App;
