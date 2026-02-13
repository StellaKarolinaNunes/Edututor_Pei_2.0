import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Layout, Info, AlertTriangle, CheckCircle2, Loader2, Clock, X } from 'lucide-react';
import { executionService } from '@/lib/executionService';

export const ExecutionTab = ({ studentId }: { studentId: string }) => {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [filters, setFilters] = useState({
        status: 'Todos',
        materia: 'Todos',
        suporte: 'Todos',
        barreira: 'Todos',
        startDate: '',
        endDate: ''
    });

    const [executions, setExecutions] = useState<any[]>([]);
    const [options, setOptions] = useState({
        materias: [] as string[],
        suportes: [] as string[],
        barreiras: [] as string[]
    });

    const fetchExecutions = async () => {
        setLoading(true);
        try {
            const data = await executionService.getAllByStudent(studentId);
            setExecutions(data);

            // Extract unique options for filters
            const materias = Array.from(new Set(data.map((ex: any) => ex.Disciplinas?.Nome).filter(Boolean))) as string[];
            const suportes = Array.from(new Set(data.map((ex: any) => ex.Nivel_suporte).filter(Boolean))) as string[];
            const barreiras = Array.from(new Set(data.map((ex: any) => ex.Tipo_barreira).filter(Boolean))) as string[];

            setOptions({ materias, suportes, barreiras });
        } catch (error) {
            console.error('Erro ao buscar acompanhamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutions();
    }, [studentId]);

    const filteredExecutions = executions.filter(ex => {
        const matchesSearch = ex.Atividade?.toLowerCase().includes(search.toLowerCase()) ||
            ex.Disciplinas?.Nome?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = filters.status === 'Todos' || ex.Status === filters.status;
        const matchesMateria = filters.materia === 'Todos' || ex.Disciplinas?.Nome === filters.materia;
        const matchesSuporte = filters.suporte === 'Todos' || ex.Nivel_suporte === filters.suporte;
        const matchesBarreira = filters.barreira === 'Todos' || ex.Tipo_barreira === filters.barreira;

        const exDate = new Date(ex.Data);
        const matchesDate = (!filters.startDate || exDate >= new Date(filters.startDate)) &&
            (!filters.endDate || exDate <= new Date(filters.endDate));

        return matchesSearch && matchesStatus && matchesMateria && matchesSuporte && matchesBarreira && matchesDate;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'concluido': return 'bg-emerald-100 text-emerald-600';
            case 'andamento': return 'bg-blue-100 text-blue-600';
            case 'replanejar': return 'bg-amber-100 text-amber-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const clearFilters = () => {
        setFilters({
            status: 'Todos',
            materia: 'Todos',
            suporte: 'Todos',
            barreira: 'Todos',
            startDate: '',
            endDate: ''
        });
        setSearch('');
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== 'Todos' && v !== '').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Main Search & Quick Toggle */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-[1.5px] border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex flex-col xl:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar por atividade ou disciplina..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-[1.5px] border-transparent focus:border-primary/20 transition-all outline-none font-bold text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showAdvanced ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500'
                            }`}
                    >
                        <Filter size={18} />
                        Filtros Avançados
                        {activeFilterCount > 0 && (
                            <span className="size-5 bg-white text-primary rounded-full flex items-center justify-center text-[10px] ml-1">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none cursor-pointer"
                            >
                                <option value="Todos">Todos os Status</option>
                                <option value="concluido">Concluído</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="replanejar">Replanejar</option>
                            </select>
                        </div>

                        {/* Materia Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Disciplina / Matéria</label>
                            <select
                                value={filters.materia}
                                onChange={(e) => setFilters({ ...filters, materia: e.target.value })}
                                className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none cursor-pointer"
                            >
                                <option value="Todos">Todas as Matérias</option>
                                {options.materias.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {/* Suporte Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Nível de Suporte</label>
                            <select
                                value={filters.suporte}
                                onChange={(e) => setFilters({ ...filters, suporte: e.target.value })}
                                className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none cursor-pointer"
                            >
                                <option value="Todos">Todos os Níveis</option>
                                {options.suportes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Barreira Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Tipo de Barreira</label>
                            <select
                                value={filters.barreira}
                                onChange={(e) => setFilters({ ...filters, barreira: e.target.value })}
                                className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none cursor-pointer"
                            >
                                <option value="Todos">Todas as Barreiras</option>
                                {options.barreiras.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        {/* Date Range Filters */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">De (Data)</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Até (Data)</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-[1.5px] border-transparent focus:border-primary/20 transition-all font-bold text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Clear Action */}
                        <div className="xl:col-span-3 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all"
                            >
                                <X size={14} /> Limpar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="grid grid-cols-1 gap-6 pb-20">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-[3rem]">
                        <Loader2 className="text-primary animate-spin" size={40} />
                        <p className="text-[10px] font-black uppercase text-slate-400">Processando registros...</p>
                    </div>
                ) : filteredExecutions.length > 0 ? (
                    filteredExecutions.map((ex) => (
                        <div key={ex.Acompanhamento_ID} className="group bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border-[1.5px] border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all shadow-sm">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl ${getStatusStyle(ex.Status)}`}>
                                            {ex.Status}
                                        </span>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <Calendar size={14} className="text-primary" />
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                {new Date(ex.Data).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                            <Layout size={14} className="text-primary" />
                                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                                                {ex.Disciplinas?.Nome}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                            {ex.Atividade}
                                        </h4>
                                        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                {ex.Observacoes || 'Nenhum registro descritivo para esta sessão.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                        <Metric icon={Info} label="Suporte" value={ex.Nivel_suporte} color="emerald" />
                                        <Metric icon={AlertTriangle} label="Barreira" value={ex.Tipo_barreira} color="rose" />
                                        <Metric icon={Clock} label="Duração" value={ex.Duracao || '45 min'} color="blue" />
                                        <Metric icon={CheckCircle2} label="Avaliação" value={ex.Avaliado ? 'Sim' : 'Pendente'} color="amber" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-32 text-center bg-white dark:bg-slate-800 rounded-[3.5rem] border-[1.5px] border-slate-100 dark:border-slate-700 shadow-inner">
                        <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Search size={40} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] max-w-xs mx-auto">
                            Nenhum registro encontrado para os filtros selecionados
                        </p>
                        <button onClick={clearFilters} className="mt-6 text-xs text-primary font-bold hover:underline">
                            Ver todos os registros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Metric = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'emerald' | 'rose' | 'blue' | 'amber' }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/10 dark:text-emerald-400',
        rose: 'bg-rose-50 text-rose-500 dark:bg-rose-900/10 dark:text-rose-400',
        blue: 'bg-blue-50 text-blue-500 dark:bg-blue-900/10 dark:text-blue-400',
        amber: 'bg-amber-50 text-amber-500 dark:bg-amber-900/10 dark:text-amber-400',
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all group">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${colors[color]}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{value}</p>
            </div>
        </div>
    );
};
