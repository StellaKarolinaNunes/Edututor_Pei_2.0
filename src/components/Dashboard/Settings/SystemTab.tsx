import { useState, useEffect } from 'react';
import { Moon, Sun, Bell } from 'lucide-react';

export const SystemTab = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 max-w-4xl space-y-12">
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">Informações do <span className="text-primary">Sistema</span></h2>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Versão Atual', value: '2.4.0', status: 'Estável' },
                        { label: 'Ambiente', value: 'Produção', status: 'Online' },
                        { label: 'Sincronização', value: 'Ativa', status: '100%' }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent hover:border-primary/20 transition-all group">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.value}</p>
                            <span className="mt-3 inline-block px-2 py-0.5 bg-success/10 text-success text-[9px] font-black uppercase tracking-widest rounded-full">{item.status}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">Preferências de <span className="text-primary">Interface</span></h2>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent hover:border-primary/20 transition-all cursor-pointer group" onClick={toggleDarkMode}>
                        <div className="flex items-center gap-5">
                            <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-amber-100 text-amber-600 shadow-inner'}`}>
                                {isDarkMode ? <Moon size={24} strokeWidth={2.5} /> : <Sun size={24} strokeWidth={2.5} />}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">Modo Escuro (Dark Mode)</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Otimize a visualização para ambientes de baixa luminosidade</p>
                            </div>
                        </div>
                        <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            <div className={`size-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setNotifications(!notifications)}>
                        <div className="flex items-center gap-5">
                            <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${notifications ? 'bg-primary text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 text-slate-400 shadow-inner'}`}>
                                <Bell size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">Notificações Sonoras</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ative alertas auditivos para eventos críticos e agendamentos</p>
                            </div>
                        </div>
                        <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${notifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            <div className={`size-5 bg-white rounded-full shadow-md transition-all duration-300 ${notifications ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
