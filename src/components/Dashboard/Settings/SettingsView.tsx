import { useState } from 'react';
import { Users, Settings as SystemIcon, Shield } from 'lucide-react';
import { UsersTab } from './UsersTab';
import { SystemTab } from './SystemTab';
import { SecurityTab } from './SecurityTab';


type Tab = 'users' | 'system' | 'security';

export const SettingsView = () => {
    const [activeTab, setActiveTab] = useState<Tab>('users');

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Ajustes do <span className="text-primary italic">Sistema</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                        <div className="size-2 bg-amber-500 rounded-full animate-pulse" />
                        Gerencie as configurações globais e preferências
                    </p>
                </div>
            </div>

            {/* Tabs Premium */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl border-[1.5px] border-slate-100 dark:border-slate-700 shadow-sm inline-flex flex-wrap gap-2">
                {[
                    { id: 'users', icon: Users, label: 'Usuários' },
                    { id: 'system', icon: SystemIcon, label: 'Sistema' },
                    { id: 'security', icon: Shield, label: 'Segurança' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary'
                                }`}
                        >
                            <tab.icon size={18} strokeWidth={isActive ? 3 : 2} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area - No overflow-hidden to prevent cutting */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-[1.5px] border-slate-100 dark:border-slate-700 shadow-sm min-h-[500px]">
                <div className="p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'system' && <SystemTab />}
                    {activeTab === 'security' && <SecurityTab />}
                </div>
            </div>
        </div>
    );
};
