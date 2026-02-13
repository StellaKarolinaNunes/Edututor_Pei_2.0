import { useState } from 'react';
import { Search, Plus, X, Users, Building, Calendar, ArrowRight } from 'lucide-react';

export const ClassesTab = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">Nova <span className="text-primary">Turma</span></h2>
                        <p className="text-xs font-medium text-slate-500">Organize os alunos em novos agrupamentos</p>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-red-50 hover:text-red-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identificação da Turma</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none" placeholder="Ex: 5º Ano B - Matutino" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unidade Escolar</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none appearance-none">
                            <option>Selecione a escola</option>
                            <option>Escola Municipal Paulo Freire</option>
                            <option>Colégio Estadual Santos Dumont</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Período Letivo</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none appearance-none">
                            <option>Manhã</option>
                            <option>Tarde</option>
                            <option>Noite</option>
                            <option>Integral</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <button onClick={() => setIsCreating(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Descartar</button>
                    <button className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">Criar Turma</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar turmas..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-sm font-bold"
                    />
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.05] shadow-xl transition-all"
                >
                    <Plus size={18} strokeWidth={3} />
                    Nova Turma
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: '1º Ano A', school: 'E.M. Paulo Freire', period: 'Manhã', students: 24 },
                    { name: '5º Ano B', school: 'E.M. Paulo Freire', period: 'Tarde', students: 18 },
                    { name: '3ª Série C', school: 'C.E. Santos Dumont', period: 'Manhã', students: 32 },
                ].map((cls, i) => (
                    <div key={i} className="group p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent hover:border-primary/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${cls.period === 'Manhã' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {cls.period}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{cls.name}</h3>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tight">
                                <Building size={12} /> {cls.school}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500">{cls.students} Alunos</span>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
