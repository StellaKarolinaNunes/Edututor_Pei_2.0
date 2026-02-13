import { useState, useEffect } from 'react';
import { Plus, BookOpen, User, Check, Trash2, X, Search, Info, Play, Loader2, Calendar, Layout, AlertTriangle, CheckCircle2, Edit3 } from 'lucide-react';
import { studentService } from '@/lib/studentService';
import { executionService } from '@/lib/executionService';
import { disciplinesService } from '@/lib/disciplinesService';
import { useAuth } from '@/lib/useAuth';

interface Teacher {
    id: string;
    nome: string;
    especialidade: string;
}

interface Discipline {
    id: string;
    nome: string;
    descricao?: string;
    ativa: boolean;
    professores: string[]; // IDs
}

export const DisciplinesTab = ({ studentId, studentName, studentData }: { studentId: string, studentName: string, studentData: any }) => {
    const { user: authUser } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [isExecuting, setIsExecuting] = useState<Discipline | null>(null);
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);


    const [execForm, setExecForm] = useState({
        data: new Date().toISOString().split('T')[0],
        atividade: '',
        nivel_suporte: 'sem suporte' as any,
        tipo_barreira: 'cognitiva' as any,
        status: 'andamento' as any,
        observacoes: ''
    });

    const [form, setForm] = useState<Partial<Discipline>>({
        nome: '',
        descricao: '',
        ativa: true,
        professores: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teachersData, disciplinesData] = await Promise.all([
                studentService.getAllProfessionals(authUser?.plataforma_id),
                disciplinesService.getAll(authUser?.plataforma_id)
            ]);

            setTeachers(teachersData.map((p: any) => ({
                id: p.Professor_ID.toString(),
                nome: p.Nome,
                especialidade: p.Especialidade
            })));

            setDisciplines(disciplinesData.map((d: any) => ({
                id: d.id,
                nome: d.nome,
                descricao: d.descricao,
                ativa: d.status === 'Ativo',
                professores: [] // In a real app, we'd fetch the links, for now empty
            })));
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const toggleTeacher = (id: string) => {
        const current = form.professores || [];
        if (current.includes(id)) {
            setForm({ ...form, professores: current.filter(t => t !== id) });
        } else {
            setForm({ ...form, professores: [...current, id] });
        }
    };

    const handleSaveDiscipline = async () => {
        if (!form.nome) return;
        try {
            if (editingDiscipline) {
                await disciplinesService.update(editingDiscipline.id, {
                    nome: form.nome,
                    descricao: form.descricao,
                    status: form.ativa ? 'Ativo' : 'Inativo',
                    plataforma_id: authUser?.plataforma_id
                });
            } else {
                await disciplinesService.create({
                    nome: form.nome,
                    descricao: form.descricao,
                    plataforma_id: authUser?.plataforma_id
                });
            }

            await fetchData();
            setIsAdding(false);
            setEditingDiscipline(null);
            setForm({ nome: '', descricao: '', ativa: true, professores: [] });
        } catch (error) {
            console.error('Erro ao salvar disciplina:', error);
            alert('Erro ao salvar disciplina.');
        }
    };

    const handleDeleteDiscipline = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta disciplina?')) return;
        try {
            await disciplinesService.delete(id);
            setDisciplines(disciplines.filter(d => d.id !== id));
        } catch (error) {
            console.error('Erro ao excluir disciplina:', error);
            alert('Erro ao excluir disciplina.');
        }
    };

    const handleEditDiscipline = (disc: Discipline) => {
        setEditingDiscipline(disc);
        setForm({
            nome: disc.nome,
            descricao: disc.descricao,
            ativa: disc.ativa,
            professores: disc.professores
        });
        setIsAdding(true);
    };


    const handleSaveExecution = async () => {
        if (!isExecuting) return;
        try {
            await executionService.create({
                student_id: studentId,
                disciplina_id: isExecuting.id,
                ...execForm
            });
            alert('Execução salva com sucesso!');
            setIsExecuting(null);
            setExecForm({
                data: new Date().toISOString().split('T')[0],
                atividade: '',
                nivel_suporte: 'sem suporte',
                tipo_barreira: 'cognitiva',
                status: 'andamento',
                observacoes: ''
            });
        } catch (error) {
            console.error('Erro ao salvar execução:', error);
            alert('Erro ao salvar execução. Verifique os dados e tente novamente.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-[1.5px] border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">Grade de <span className="text-primary">Disciplinas</span></h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gerencie as matérias e professores de {studentName}</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/25 hover:scale-[1.05] transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Nova Disciplina
                </button>
            </div>

            {/* List of Disciplines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full p-20 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-[2.5rem]">
                        <Loader2 className="text-primary animate-spin" size={40} />
                        <p className="text-[10px] font-black uppercase text-slate-400">Carregando disciplinas...</p>
                    </div>
                ) : disciplines.length > 0 ? (
                    disciplines.map((disc) => (
                        <div key={disc.id} className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-[1.5px] border-slate-100 dark:border-slate-700 hover:border-primary/20 transition-all relative flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <BookOpen size={28} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditDiscipline(disc)}
                                        className="p-3 text-slate-300 hover:text-primary transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDiscipline(disc.id)}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{disc.nome}</h4>
                                    {disc.descricao && <p className="text-sm font-medium text-slate-500 line-clamp-2 mt-1">{disc.descricao}</p>}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={12} className="text-primary" /> Professores
                                        </span>
                                        <span className="text-[10px] font-black text-primary lowercase">{disc.professores.length} profissional(is)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {disc.professores.length > 0 ? disc.professores.map(pid => {
                                            const t = teachers.find(x => x.id === pid);
                                            return (
                                                <div key={pid} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                                    {t?.nome || 'Prof. Visitante'}
                                                </div>
                                            );
                                        }) : <p className="text-[10px] text-slate-400 font-bold uppercase">Nenhum professor vinculado</p>}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsExecuting(disc)}
                                className="mt-6 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg"
                            >
                                <Play size={14} fill="currentColor" /> Executar Tarefa PEI
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-[1.5px] border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nenhuma disciplina cadastrada</p>
                    </div>
                )}
            </div>

            {/* Modal: Nova Disciplina */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl my-8 animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                        {editingDiscipline ? 'Editar' : 'Nova'} <span className="text-primary">Disciplina</span>
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {editingDiscipline ? 'Atualize as informações da disciplina' : 'Cadastre uma nova matéria na grade'}
                                    </p>
                                </div>

                                <button onClick={() => { setIsAdding(false); setEditingDiscipline(null); setForm({ nome: '', descricao: '', ativa: true, professores: [] }); }} className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>

                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Disciplina</label>
                                    <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold border-2 border-transparent focus:border-primary/20 outline-none transition-all" placeholder="Ex: Linguagem e Comunicação" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Objetivos</label>
                                    <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold border-2 border-transparent focus:border-primary/20 outline-none transition-all h-24" placeholder="Detalhes sobre a disciplina..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vincular Professores</label>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {teachers.map(t => (
                                            <button key={t.id} onClick={() => toggleTeacher(t.id)} className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${form.professores?.includes(t.id) ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 dark:bg-slate-900 border-transparent'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-[10px]">{t.nome.charAt(0)}</div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-none mb-1">{t.nome}</p>
                                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{t.especialidade}</p>
                                                    </div>
                                                </div>
                                                {form.professores?.includes(t.id) && <Check size={16} className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => { setIsAdding(false); setEditingDiscipline(null); setForm({ nome: '', descricao: '', ativa: true, professores: [] }); }} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button onClick={handleSaveDiscipline} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                                    {editingDiscipline ? 'Atualizar Grade' : 'Salvar Grade'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Executar Tarefa */}
            {isExecuting && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl my-8 animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">Executar <span className="text-primary">Tarefa PEI</span></h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registro de atividade: {isExecuting.nome}</p>
                                </div>
                                <button onClick={() => setIsExecuting(null)} className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2 items-center">
                                        <Calendar size={12} className="text-primary" /> Data (DD/MM/AAAA)
                                    </label>
                                    <input type="date" value={execForm.data} onChange={(e) => setExecForm({ ...execForm, data: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2 items-center">
                                        <CheckCircle2 size={12} className="text-primary" /> Status
                                    </label>
                                    <select value={execForm.status} onChange={(e) => setExecForm({ ...execForm, status: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20">
                                        <option value="concluido">Concluído ✅</option>
                                        <option value="andamento">Em Andamento 🔄</option>
                                        <option value="replanejar">Replanejar ⚠️</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2 items-center">
                                        <Layout size={12} className="text-primary" /> Atividade / Objetivo do PEI
                                    </label>
                                    <input type="text" value={execForm.atividade} onChange={(e) => setExecForm({ ...execForm, atividade: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20" placeholder="Qual objetivo está sendo trabalhado?" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2 items-center">
                                        <Info size={12} className="text-primary" /> Nível de Suporte
                                    </label>
                                    <select value={execForm.nivel_suporte} onChange={(e) => setExecForm({ ...execForm, nivel_suporte: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20">
                                        <option value="sem suporte">Sem Suporte</option>
                                        <option value="parcial">Suporte Parcial</option>
                                        <option value="total">Suporte Total</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2 items-center">
                                        <AlertTriangle size={12} className="text-primary" /> Tipo de Barreira
                                    </label>
                                    <select value={execForm.tipo_barreira} onChange={(e) => setExecForm({ ...execForm, tipo_barreira: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20">
                                        <option value="cognitiva">Cognitiva</option>
                                        <option value="motora">Motora</option>
                                        <option value="sensorial">Sensorial</option>
                                        <option value="comportamental">Comportamental</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações da Atividade</label>
                                    <textarea value={execForm.observacoes} onChange={(e) => setExecForm({ ...execForm, observacoes: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary/20 h-24" placeholder="Como o aluno se comportou? Houve evolução?" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsExecuting(null)} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button onClick={handleSaveExecution} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]">Salvar Execução</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
