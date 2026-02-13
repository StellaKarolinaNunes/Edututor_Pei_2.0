import { useState, useEffect } from 'react';
import { School, GraduationCap, Users, Building2, BookOpen } from 'lucide-react';
import { SchoolsTab } from './tabs/SchoolsTab';
import { TeachersTab } from './tabs/TeachersTab';
import { ClassesTab } from './tabs/ClassesTab';
import { schoolsService } from '@/lib/schoolsService';
import { studentService } from '@/lib/studentService';
import { classesService } from '@/lib/classesService';
import { useAuth } from '@/lib/useAuth';


type Tab = 'escolas' | 'professores' | 'profissionais' | 'turmas';

export const ManagementView = () => {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('escolas');
    const [schoolCount, setSchoolCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [specialistCount, setSpecialistCount] = useState(0);
    const [classCount, setClassCount] = useState(0);

    const fetchCounts = async () => {
        try {
            const [schools, allProfessionals, classes] = await Promise.all([
                schoolsService.getAll(authUser?.plataforma_id),
                studentService.getAllProfessionals(authUser?.plataforma_id),
                classesService.getAll(authUser?.plataforma_id)
            ]);

            setSchoolCount(schools.length);

            // Separar por Categoria
            const teachers = allProfessionals.filter((p: any) => p.Categoria === 'Professor');
            const specialists = allProfessionals.filter((p: any) => p.Categoria === 'Profissional de Saúde');

            setTeacherCount(teachers.length);
            setSpecialistCount(specialists.length);
            setClassCount(classes.length);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    useEffect(() => {
        if (authUser?.plataforma_id) {
            fetchCounts();
        }
    }, [authUser?.plataforma_id]);

    const handleUpdate = () => {
        fetchCounts();
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Gestão <span className="text-primary italic">Administrativa</span>
                    </h1>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-4 mt-2">
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full animate-pulse" />
                            Infraestrutura Ativa: {schoolCount} Unidades
                        </div>
                        <span className="hidden xl:block text-slate-200 dark:text-slate-700">|</span>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                            Corpo Docente: {teacherCount} Docentes
                        </div>
                        <span className="hidden xl:block text-slate-200 dark:text-slate-700">|</span>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                            Profissionais: {specialistCount} Especialistas
                        </div>
                        <span className="hidden xl:block text-slate-200 dark:text-slate-700">|</span>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                            Turmas: {classCount} Ativas
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Premium */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl border-[1.5px] border-slate-100 dark:border-slate-700 shadow-sm inline-flex flex-wrap gap-2">
                {[
                    { id: 'escolas' as const, label: 'Unidades / Escolas', icon: Building2 },
                    { id: 'professores' as const, label: 'Corpo Docente', icon: GraduationCap },
                    { id: 'profissionais' as const, label: 'Especialistas', icon: Users },
                    { id: 'turmas' as const, label: 'Turmas / Classes', icon: BookOpen },
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
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-sm min-h-[600px] overflow-hidden">
                <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                            {activeTab === 'escolas' ? 'Lista de Escolas' : activeTab === 'professores' ? 'Gestão de Professores' : activeTab === 'profissionais' ? 'Gestão de Profissionais de Saúde' : 'Turmas Ativas'}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Gerencie as informações detalhadas de {activeTab === 'escolas' ? 'suas unidades parceiras' : activeTab === 'professores' ? 'seus professores' : activeTab === 'profissionais' ? 'seus profissionais de saúde' : 'suas turmas cadastradas'}.</p>
                    </div>
                    {activeTab === 'escolas' && <SchoolsTab onUpdate={handleUpdate} />}
                    {activeTab === 'professores' && <TeachersTab onUpdate={fetchCounts} category="Professor" />}
                    {activeTab === 'profissionais' && <TeachersTab onUpdate={fetchCounts} category="Profissional de Saúde" />}
                    {activeTab === 'turmas' && <ClassesTab onUpdate={handleUpdate} />}
                </div>
            </div>
        </div>
    );
};
