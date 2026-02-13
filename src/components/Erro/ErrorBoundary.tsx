import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn, ArrowRight } from 'lucide-react';
import styles from './ErrorBoundary.module.css';
import { supabase } from '../../lib/supabase';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleLoginRedirect = async () => {
        // Tenta limpar a sessão antes de recarregar
        try {
            await supabase.auth.signOut();
            localStorage.clear();
        } catch (e) {
            console.warn('Failed to sign out on error boundary', e);
        }
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    {/* Lado Esquerdo: Identidade e Ação */}
                    <div className={styles.leftPane}>
                        <div className={styles.tag}>
                            {this.state.error?.name || 'Sistema'} • Erro {(this.state.error as any)?.status || (this.state.error as any)?.code || '500'}
                        </div>

                        <h1 className={styles.title}>
                            Ops! Algo <span className="italic">deu errado</span>
                        </h1>

                        <p className={styles.message}>
                            Encontramos uma interrupção técnica inesperada. Fique tranquilo, nossa equipe já foi notificada e seus dados estão em segurança.
                        </p>

                        <div className="flex flex-col gap-4 items-start">
                            <button onClick={this.handleReload} className={styles.buttonLink}>
                                <RefreshCw size={20} className="animate-spin-slow" />
                                Tentar novamente
                            </button>

                            <button onClick={this.handleLoginRedirect} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2 mt-4">
                                <ArrowRight size={14} className="rotate-180" />
                                Voltar ao início
                            </button>
                        </div>

                        {/* Detalhes Técnicos em DEV */}

                    </div>

                    {/* Lado Direito: Ilustração de Alta Tecnologia */}
                    <div className={styles.rightPane}>
                        <div className={styles.patternOverlay} />
                        <img
                            src="/src/assets/error-tech.png"
                            alt="Conexão Tech Interrompida"
                            className={styles.techIllustration}
                        />

                        <div className="absolute bottom-12 left-12">
                            <p className={styles.footerText}>© 2026 Vinculo PEI • Sistema de Inteligência Pedagógica</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
