import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, BookOpen, GraduationCap, ArrowRight, Loader2, FileText, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
    id: string;
    type: 'Alunos' | 'Disciplinas' | 'Escolas' | 'Professores' | 'Turmas' | 'PEIs' | 'Atendimentos' | 'Notas';
    title: string;
    subtitle: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectResult: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const [alunos, disciplinas, escolas, professores, turmas, peis, acompanhamentos, anotacoes] = await Promise.all([
                    supabase.from('Alunos').select('Aluno_ID, Nome, Serie').ilike('Nome', `%${query}%`).limit(5),
                    supabase.from('Disciplinas').select('Disciplina_ID, Nome, Categoria').ilike('Nome', `%${query}%`).limit(3),
                    supabase.from('Escolas').select('Escola_ID, Nome').ilike('Nome', `%${query}%`).limit(2),
                    supabase.from('Professores').select('Professor_ID, Nome, Especialidade').ilike('Nome', `%${query}%`).limit(3),
                    supabase.from('Turmas').select('Turma_ID, Nome, Turno').ilike('Nome', `%${query}%`).limit(3),
                    supabase.from('PEIs').select('PEI_ID, Alunos(Nome), Status').ilike('Alunos.Nome', `%${query}%`).limit(3),
                    supabase.from('Acompanhamentos').select('Acompanhamento_ID, Atividade, Alunos(Nome)').ilike('Atividade', `%${query}%`).limit(3),
                    supabase.from('Anotacoes').select('Anotacao_ID, Conteudo, Alunos(Nome)').ilike('Conteudo', `%${query}%`).limit(3)
                ]);

                const formattedResults: SearchResult[] = [
                    ...(alunos.data || []).map(a => ({
                        id: a.Aluno_ID.toString(),
                        type: 'Alunos' as const,
                        title: a.Nome,
                        subtitle: a.Serie
                    })),
                    ...(disciplinas.data || []).map(d => ({
                        id: d.Disciplina_ID.toString(),
                        type: 'Disciplinas' as const,
                        title: d.Nome,
                        subtitle: d.Categoria
                    })),
                    ...(escolas.data || []).map(e => ({
                        id: e.Escola_ID.toString(),
                        type: 'Escolas' as const,
                        title: e.Nome,
                        subtitle: 'Instituição'
                    })),
                    ...(professores.data || []).map(p => ({
                        id: p.Professor_ID.toString(),
                        type: 'Professores' as const,
                        title: p.Nome,
                        subtitle: p.Especialidade
                    })),
                    ...(turmas.data || []).map(t => ({
                        id: t.Turma_ID.toString(),
                        type: 'Turmas' as const,
                        title: t.Nome,
                        subtitle: t.Turno
                    })),
                    ...(peis.data || []).map((p: any) => ({
                        id: p.PEI_ID.toString(),
                        type: 'PEIs' as const,
                        title: `PEI - ${p.Alunos?.Nome || 'Sem Nome'}`,
                        subtitle: p.Status
                    })),
                    ...(acompanhamentos.data || []).map((a: any) => ({
                        id: a.Acompanhamento_ID.toString(),
                        type: 'Atendimentos' as const,
                        title: a.Atividade,
                        subtitle: a.Alunos?.Nome || 'Paciente N/A'
                    })),
                    ...(anotacoes.data || []).map((n: any) => ({
                        id: n.Anotacao_ID.toString(),
                        type: 'Notas' as const,
                        title: n.Conteudo?.substring(0, 40) + '...',
                        subtitle: n.Alunos?.Nome || 'Relacionado'
                    }))
                ];

                setResults(formattedResults);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'Alunos': return <Users size={18} />;
            case 'Disciplinas': return <BookOpen size={18} />;
            case 'Escolas': return <GraduationCap size={18} />;
            case 'Professores': return <Users size={18} className="text-orange-500" />;
            case 'Turmas': return <GraduationCap size={18} className="text-emerald-500" />;
            case 'PEIs': return <FileText size={18} className="text-violet-500" />;
            case 'Atendimentos': return <Clock size={18} className="text-blue-500" />;
            case 'Notas': return <MessageSquare size={18} className="text-amber-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <Search className="text-slate-400" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Pesquise alunos, disciplinas ou instituições..."
                        className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={32} className="text-primary animate-spin" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Buscando...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => onSelectResult(result)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{result.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.type} • {result.subtitle}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="py-16 text-center">
                            <p className="text-slate-400 font-bold italic">Nenhum resultado encontrado para "{query}"</p>
                        </div>
                    ) : (
                        <div className="py-12 text-center space-y-4">
                            <div className="flex justify-center flex-wrap gap-4">
                                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Atalho Ctrl + K</span>
                                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Busca Integrada</span>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Digite pelo menos 2 caracteres para começar</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px] font-bold">ESC</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fechar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px] font-bold">↵</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Selecionar</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
