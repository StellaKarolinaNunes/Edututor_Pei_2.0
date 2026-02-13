import { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Calendar, BookOpen, FileText, ClipboardList, Info, GraduationCap, Building2, User, Activity, Clock } from 'lucide-react';
import { PEIsTab } from './Tabs/PEIsTab';
import { NotesTab } from './Tabs/NotesTab';
import { DisciplinesTab } from './Tabs/DisciplinesTab';
import { DetailsTab } from './Tabs/DetailsTab';
import { ExecutionTab } from './Tabs/ExecutionTab';
import { PEIWizard } from './wizards/PEIWizard';
import { StudentRegistrationWizard } from './wizards/StudentRegistrationWizard';
import { studentService } from '@/lib/studentService';
import { Loader2 } from 'lucide-react';
import { AgendaView } from './components/AgendaView';

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

interface Props {
    student: Student;
    onBack: (refresh?: boolean) => void;
}

export const StudentDetailView = ({ student: initialStudent, onBack }: Props) => {
    const [activeTab, setActiveTab] = useState<'peis' | 'notes' | 'disciplines' | 'details' | 'accompaniment' | 'agenda'>('peis');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isCreatingPEI, setIsCreatingPEI] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [student, setStudent] = useState(initialStudent);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm(`Tem certeza que deseja excluir o prontuário de ${student.nome}? Esta ação não pode ser desfeita.`)) {
            setIsDeleting(true);
            try {
                await studentService.delete(student.id);
                alert('Aluno excluído com sucesso!');
                onBack(true);
            } catch (error) {
                console.error('Erro ao excluir aluno:', error);
                alert('Erro ao excluir aluno. Tente novamente.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (isEditing) {
        return (
            <StudentRegistrationWizard
                initialData={student}
                onCancel={() => setIsEditing(false)}
                onComplete={(updatedData) => {
                    setStudent({ ...student, ...updatedData });
                    setIsEditing(false);
                }}
            />
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-8 pb-20">
            {/* Top Bar with Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => onBack()}
                    className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para Listagem
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-4 bg-white dark:bg-slate-800 border-[1.5px] border-slate-100 dark:border-slate-700 text-slate-500 hover:text-primary rounded-2xl transition-all shadow-sm"
                    >
                        <Edit3 size={20} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-4 bg-white dark:bg-slate-800 border-[1.5px] border-slate-100 dark:border-slate-700 text-slate-500 hover:text-red-500 rounded-2xl transition-all shadow-sm disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Student Profile Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] border-[1.5px] border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none p-10">
                <div className="flex flex-col xl:flex-row items-start gap-10">
                    {/* Avatar with Status */}
                    <div className="relative">
                        <div className="size-40 rounded-[3rem] bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl rotate-3">
                            {student.foto ? <img src={student.foto} alt={student.nome} className="size-full object-cover" /> : student.nome.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 px-6 py-2 rounded-2xl border-4 border-white dark:border-slate-800 text-[10px] font-black uppercase tracking-widest shadow-xl ${student.status === 'Ativo' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                            }`}>
                            {student.status}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">
                                {student.nome}
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                <Info size={14} className="text-primary" /> Condição Especial: Autismo (TEA)
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <InfoBox icon={Building2} label="Escola" value={student.escola} />
                            <InfoBox icon={Activity} label="CID" value={student.cid || 'N/A'} />
                            <InfoBox icon={GraduationCap} label="Série/Turma" value={student.serie} />
                            <InfoBox icon={Calendar} label="Data Nascimento" value={student.dataNascimento} />
                            <InfoBox icon={User} label="Responsável" value={student.responsavel} />
                            <InfoBox icon={User} label="Gênero" value={student.genero} />
                            <InfoBox icon={Clock} label="Data de Cadastro" value={student.dataCadastro} />
                            <InfoBox icon={GraduationCap} label="Professores" value="3 Profissionais" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-[2rem] gap-2 max-w-fit border-[1.5px] border-slate-100/50 dark:border-slate-800">
                <TabButton
                    active={activeTab === 'peis'}
                    onClick={() => setActiveTab('peis')}
                    icon={BookOpen}
                    label="Planos (PEIs)"
                />
                <TabButton
                    active={activeTab === 'notes'}
                    onClick={() => setActiveTab('notes')}
                    icon={FileText}
                    label="Anotações"
                />
                <TabButton
                    active={activeTab === 'disciplines'}
                    onClick={() => setActiveTab('disciplines')}
                    icon={ClipboardList}
                    label="Disciplinas"
                />
                <TabButton
                    active={activeTab === 'details'}
                    onClick={() => setActiveTab('details')}
                    icon={Info}
                    label="Detalhes"
                />
                <TabButton
                    active={activeTab === 'accompaniment'}
                    onClick={() => setActiveTab('accompaniment')}
                    icon={Activity}
                    label="Acompanhamento"
                />
                <TabButton
                    active={activeTab === 'agenda'}
                    onClick={() => setActiveTab('agenda')}
                    icon={Calendar}
                    label="Agenda"
                />
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in zoom-in-95 duration-500">
                {activeTab === 'peis' && (
                    <PEIsTab
                        key={`peis-${refreshKey}`}
                        studentId={student.id}
                        studentName={student.nome}
                        studentData={{ ...student }}
                        onOpenWizard={() => setIsCreatingPEI(true)}
                    />
                )}
                {activeTab === 'notes' && <NotesTab key={`notes-${refreshKey}`} studentId={student.id} />}
                {activeTab === 'disciplines' && <DisciplinesTab key={`disc-${refreshKey}`} studentId={student.id} studentName={student.nome} studentData={student} />}
                {activeTab === 'details' && <DetailsTab student={student} />}
                {activeTab === 'accompaniment' && <ExecutionTab key={`exec-${refreshKey}`} studentId={student.id} />}
                {activeTab === 'agenda' && <AgendaView key={`agenda-${refreshKey}`} studentId={student.id} />}
            </div>

            {/* Render Wizard outside tab container to prevent position:fixed trap */}
            {isCreatingPEI && (
                <PEIWizard
                    studentName={student.nome}
                    studentData={student}
                    onCancel={() => setIsCreatingPEI(false)}
                    onComplete={() => {
                        setIsCreatingPEI(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}
        </div>
    );
};

const InfoBox = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Icon size={12} className="text-primary" /> {label}
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${active
            ? 'bg-white dark:bg-slate-800 text-primary shadow-lg shadow-primary/10'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);
