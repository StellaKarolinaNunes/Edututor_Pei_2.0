import { useEffect, useState } from 'react';
import { Search, Plus, Filter, Users, MoreHorizontal, Eye, Edit3, Trash2, CheckCircle2, XCircle, ArrowUpDown, Loader2 } from 'lucide-react';
import { StudentRegistrationWizard } from './wizards/StudentRegistrationWizard';
import { StudentDetailView } from './StudentDetailView';
import { studentService } from '@/lib/studentService';
import { schoolsService } from '@/lib/schoolsService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { AgendaView } from './components/AgendaView';
import { classesService } from '@/lib/classesService';
import { useAuth } from '@/lib/useAuth';

interface Student {
    id: string;
    nome: string;
    escola: string;
    status: 'Ativo' | 'Inativo';
    responsavel: string;
    foto?: string;
    cid?: string;
    serie: string;
    dataNascimento: string;
    genero: string;
    dataCadastro: string;
    detalhes?: any;
    escola_id: number;
    familia_id: number;
}

export const StudentsView = () => {
    const { user: authUser } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');

    // Advanced Filters State
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);
    const [filterSchool, setFilterSchool] = useState('');
    const [filterSerie, setFilterSerie] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterModulo, setFilterModulo] = useState('');
    const [filterPeriodo, setFilterPeriodo] = useState('');
    const [filterTurma, setFilterTurma] = useState('');
    const [allClasses, setAllClasses] = useState<any[]>([]);

    const fetchInitialData = async () => {
        try {
            const [schoolsData, classesData] = await Promise.all([
                schoolsService.getAll(authUser?.plataforma_id),
                classesService.getAll(authUser?.plataforma_id)
            ]);
            setSchools(schoolsData);
            setAllClasses(classesData);
        } catch (error) {
            console.error('Erro ao buscar dados iniciais:', error);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await studentService.getAll(authUser?.plataforma_id);
            const mappedStudents: Student[] = data.map((s: any) => ({
                id: s.Aluno_ID,
                nome: s.Nome,
                escola: s.Escolas?.Nome || 'Não atribuída',
                status: s.Status as 'Ativo' | 'Inativo',
                responsavel: s.Familias?.Nome_responsavel || 'Não informado',
                foto: s.Foto,
                cid: s.CID,
                serie: s.Serie,
                dataNascimento: s.Data_nascimento,
                genero: s.Genero === 'M' ? 'Masculino' : s.Genero === 'F' ? 'Feminino' : 'Outro',
                dataCadastro: new Date(s.Data_criacao || s.Created_at).toLocaleDateString('pt-BR'),
                detalhes: s.Detalhes,
                escola_id: s.Escola_ID,
                familia_id: s.Familia_ID
            }));
            setStudents(mappedStudents);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser?.plataforma_id) {
            fetchStudents();
            fetchInitialData();
        }
    }, [authUser?.plataforma_id]);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.responsavel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.cid || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
        const matchesSchool = !filterSchool || s.escola === filterSchool;
        const matchesSerie = !filterSerie || s.serie === filterSerie;
        const matchesGender = !filterGender || s.genero === filterGender;

        // Advanced filters from details
        const matchesModulo = !filterModulo || s.detalhes?.modulo === filterModulo;
        const matchesPeriodo = !filterPeriodo || s.detalhes?.periodo === filterPeriodo;
        const matchesTurma = !filterTurma || s.serie === filterTurma; // serie is often used as turma name

        return matchesSearch && matchesStatus && matchesSchool && matchesSerie && matchesGender && matchesModulo && matchesPeriodo && matchesTurma;
    });

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const now = new Date().toLocaleString('pt-BR');

        // Header Decoration
        doc.setFillColor(20, 57, 109);
        doc.rect(0, 0, 297, 40, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório Geral de Alunos', 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Plataforma Vinculo PEI - Gestão Educacional Especializada`, 14, 32);
        doc.text(`Gerado em: ${now}`, 240, 32);

        // Summary Cards
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo da Listagem:', 14, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total de Registros: ${filteredStudents.length}`, 14, 62);
        doc.text(`Alunos Ativos: ${filteredStudents.filter(s => s.status === 'Ativo').length}`, 60, 62);
        doc.text(`Alunos Inativos: ${filteredStudents.filter(s => s.status === 'Inativo').length}`, 110, 62);

        const tableData = filteredStudents.map(s => [
            s.nome,
            s.escola,
            s.serie,
            s.responsavel,
            s.dataNascimento,
            s.genero,
            s.status,
            s.cid || 'N/A'
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['Nome Completo', 'Instituição', 'Série', 'Responsável', 'Nascimento', 'Gênero', 'Status', 'CID']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [20, 57, 109],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [50, 50, 50]
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { top: 70 },
            didDrawPage: (data) => {
                // Footer
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const str = `Página ${doc.getNumberOfPages()}`;
                doc.text(str, 280, 200, { align: 'right' });
                doc.text('© Vinculo PEI - Documento Oficial Reservado', 14, 200);
            }
        });

        doc.save(`relatorio_detalhado_alunos_${new Date().getTime()}.pdf`);
    };

    if (isRegistering) {
        return (
            <StudentRegistrationWizard
                onCancel={() => setIsRegistering(false)}
                onComplete={() => {
                    setIsRegistering(false);
                    fetchStudents();
                }}
            />
        );
    }

    if (selectedStudent) {
        return <StudentDetailView
            student={selectedStudent}
            onBack={(refresh) => {
                setSelectedStudent(null);
                if (refresh) fetchStudents();
            }}
        />;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Gestão de <span className="text-primary italic">Alunos</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                            <Users size={12} strokeWidth={3} />
                            {students.length} Registros
                        </span>
                        <p className="text-slate-400 text-xs font-medium italic">Base de dados sincronizada em tempo real</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <button
                        onClick={handleExportPDF}
                        disabled={filteredStudents.length === 0}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-300 hover:border-primary transition-all uppercase tracking-widest shadow-sm disabled:opacity-50"
                    >
                        Relatórios PDF
                    </button>
                    <button
                        onClick={() => setIsRegistering(true)}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        Matricular Novo
                    </button>
                </div>
            </header>

            {/* List Content */}

            <div className="bg-white dark:bg-slate-800/80 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-6 items-end">
                    <div className="flex-1 w-full relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Filtro de busca inteligente</label>
                        <Search className="absolute left-4 top-[46px] text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar por nome, responsável ou diagnóstico..."
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold dark:text-white transition-all outline-none"
                        />
                    </div>

                    <div className="w-full lg:w-72">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Estado Civil Escolar</label>
                        <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl border-2 border-transparent">
                            {['Todos', 'Ativo', 'Inativo'].map((st: any) => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    data-active={statusFilter === st}
                                    className="flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary data-[active=true]:bg-white dark:data-[active=true]:bg-slate-800 data-[active=true]:text-primary data-[active=true]:shadow-sm"
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAdvancedFiltersOpen(true)}
                        className={`h-[52px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${filterSchool || filterSerie || filterGender || filterModulo || filterPeriodo || filterTurma
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        <Filter size={18} />
                        {filterSchool || filterSerie || filterGender || filterModulo || filterPeriodo || filterTurma ? 'Filtros Ativos' : 'Filtros Avançados'}
                    </button>
                </div>

                {/* Advanced Filters Modal Popover */}
                {isAdvancedFiltersOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-2xl p-8 max-w-2xl mx-auto ring-4 ring-black/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary font-normal">
                                        <Filter size={18} />
                                    </div>
                                    Filtros Avançados
                                </h3>
                                <button onClick={() => setIsAdvancedFiltersOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escola</label>
                                    <select
                                        value={filterSchool}
                                        onChange={(e) => setFilterSchool(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todas as Escolas</option>
                                        {schools.map(s => <option key={s.id} value={s.nome || s.Nome}>{s.nome || s.Nome}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Série / Ciclo</label>
                                    <select
                                        value={filterSerie}
                                        onChange={(e) => setFilterSerie(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todas as Séries</option>
                                        {Array.from(new Set(students.map(s => s.serie))).map(serie => (
                                            <option key={serie} value={serie}>{serie}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma</label>
                                    <select
                                        value={filterTurma}
                                        onChange={(e) => setFilterTurma(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todas as Turmas</option>
                                        {allClasses.map(c => <option key={c.id} value={c.nome || c.Nome}>{c.nome || c.Nome}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Módulo</label>
                                    <select
                                        value={filterModulo}
                                        onChange={(e) => setFilterModulo(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todos os Módulos</option>
                                        <option value="Fundamental I">Fundamental I</option>
                                        <option value="Fundamental II">Fundamental II</option>
                                        <option value="Ensino Médio">Ensino Médio</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período (Turno)</label>
                                    <select
                                        value={filterPeriodo}
                                        onChange={(e) => setFilterPeriodo(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todos os Turnos</option>
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                        <option value="Integral">Integral</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gênero</label>
                                    <select
                                        value={filterGender}
                                        onChange={(e) => setFilterGender(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-xl py-3 px-4 text-sm font-bold dark:text-white outline-none"
                                    >
                                        <option value="">Todos</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-10 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                                <button
                                    onClick={() => {
                                        setFilterSchool('');
                                        setFilterSerie('');
                                        setFilterGender('');
                                        setFilterModulo('');
                                        setFilterPeriodo('');
                                        setFilterTurma('');
                                    }}
                                    className="flex-1 py-3.5 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
                                >
                                    Limpar Filtros
                                </button>
                                <button
                                    onClick={() => setIsAdvancedFiltersOpen(false)}
                                    className="flex-[2] py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-left">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                        Aluno / Identificação <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituição</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">CID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 size={40} className="text-primary animate-spin" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sincronizando dados...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id} className="group hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform relative overflow-hidden">
                                                {student.foto ? <img src={student.foto} alt={student.nome} className="size-full object-cover" /> : student.nome.charAt(0)}
                                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors text-base leading-tight mb-1">{student.nome}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded text-slate-500">{student.serie}</span>
                                                    • Cadastrado em {student.dataCadastro}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="max-w-[200px]">
                                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 line-clamp-1 group-hover:text-slate-900 transition-colors">{student.escola}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Rede Municipal</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-300">{student.responsavel}</p>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Matriz Parental</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${student.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                            }`}>
                                            <div className={`size-1.5 rounded-full ${student.status === 'Ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7">
                                        {student.cid ? (
                                            <span className="text-[10px] font-black text-primary px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 w-fit inline-flex items-center gap-2">
                                                <div className="size-1 bg-primary rounded-full" />
                                                CID: {student.cid}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Não informado</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-2.5 transition-all duration-300">
                                            <button
                                                className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/20 active:scale-95"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedStudent(student);
                                                }}
                                            >
                                                Ver Aluno
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum aluno encontrado.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
