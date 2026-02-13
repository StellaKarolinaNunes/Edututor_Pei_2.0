import { useState } from 'react';
import { Search, Plus, X, Building2, MapPin, Phone, GraduationCap } from 'lucide-react';

export const SchoolsTab = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">Nova <span className="text-primary">Unidade Escolar</span></h2>
                        <p className="text-xs font-medium text-slate-500">Registre uma nova instituição no sistema</p>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Instituição</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none" placeholder="Ex: Escola Municipal Paulo Freire" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ / Identificador</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none" placeholder="00.000.000/0000-00" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefone de Contato</label>
                        <input type="tel" className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none" placeholder="(00) 0000-0000" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/50 transition-all outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <button onClick={() => setIsCreating(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Descartar</button>
                    <button className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">Salvar Unidade</button>
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
                        placeholder="Pesquisar unidades..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-sm font-bold"
                    />
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-black/10"
                >
                    <Plus size={18} strokeWidth={3} />
                    Adicionar Escola
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { name: 'Escola Municipal Paulo Freire', address: 'Av. das Nações, 1200 - Centro', phones: '(11) 4002-8922', teachers: 12, classes: 8 },
                    { name: 'Colégio Estadual Santos Dumont', address: 'Rua Santos Dumont, 45 - Vila Jardim', phones: '(11) 4002-8923', teachers: 24, classes: 15 },
                ].map((school, i) => (
                    <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Building2 size={80} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="size-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                <Building2 className="text-primary" size={28} />
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{school.name}</h3>
                                <div className="flex items-center gap-2 text-slate-400 mt-1 font-medium text-xs">
                                    <MapPin size={14} />
                                    {school.address}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <GraduationCap size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{school.teachers} Profs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <Phone size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Contato</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
