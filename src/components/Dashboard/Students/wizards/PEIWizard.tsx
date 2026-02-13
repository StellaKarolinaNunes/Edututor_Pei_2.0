import { useState, useEffect } from 'react';
import {
    X, ArrowLeft, ArrowRight, Check, Save,
    User, History as HistoryIcon, Brain, ShieldAlert, Target, Layout, ClipboardCheck,
    Calendar, Building2, UserCircle, Activity, Info,
    BookOpen, Loader2
} from 'lucide-react';
import { peisService, PEI } from '@/lib/peisService';
import { studentService } from '@/lib/studentService';
import { useAuth } from '@/lib/useAuth';

interface Props {
    studentName: string;
    studentData: any;
    initialData?: PEI; // If provided, we are in edit mode
    onCancel: () => void;
    onComplete: () => void;
}

export const PEIWizard = ({ studentName, studentData, initialData, onCancel, onComplete }: Props) => {
    const { user: authUser } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);

    // Initial state matching the structure collected in the wizard
    const [formData, setFormData] = useState({
        // 1. Identificação
        nomeCompleto: studentName || '',
        dataNascimento: studentData?.dataNascimento || '',
        sexo: '',
        serieAno: studentData?.serie || '',
        escola: studentData?.escola || '',
        anoLetivo: new Date().getFullYear().toString(),
        diagnosticoMedico: '',
        cid: studentData?.cid || '',
        profissionaisAcompanham: '',

        // 2. Histórico e Desenvolvimento
        historicoDesenvolvimento: '',
        pontosFortes: '',
        areasDesenvolvimento: '',
        interessesPreferencias: '',
        estiloAprendizagem: '',

        // 3. Habilidades
        habilidadesAcademicas: '',
        habilidadesComunicacao: '',
        habilidadesSociais: '',
        habilidadesMotoras: '',
        habilidadesAutonomia: '',

        // 4. Sensibilidades e Barreiras
        sensibilidadesSensoriais: '',
        preferenciasReforcadores: '',
        barreirasAprendizagem: '',
        apoiosNecessarios: '',
        estrategiasFavoraveis: '',

        // 5. Metas
        metasCurtoPrazo: '',
        metasMedioPrazo: '',
        metasLongoPrazo: '',

        // 6. Planejamento
        metodologiasPraticas: '',
        adaptacoesCurriculares: '',
        recursosMateriais: '',
        rotinasPrevisibilidade: '',
        atividadesColetivas: '',
        envolvimentoFamilia: '',

        // 7. Avaliação
        instrumentosAvaliacao: '',
        criteriosSucesso: '',
        periodicidadeReavaliacoes: '',
        frequenciaRevisao: 'Trimestral',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFimPrevista: '',
        observacoesAdicionais: '',
    });

    // Fill form if editing and fetch schools
    useEffect(() => {
        if (initialData?.dados) {
            setFormData(prev => ({ ...prev, ...initialData.dados }));
        }

        const fetchSchools = async () => {
            try {
                const data = await studentService.getAllSchools(authUser?.plataforma_id);
                setSchools(data || []);
            } catch (error) {
                console.error('Erro ao buscar escolas:', error);
            }
        };
        fetchSchools();
    }, [initialData]);

    const steps = [
        { id: 1, label: 'Identificação', icon: UserCircle },
        { id: 2, label: 'Histórico', icon: HistoryIcon },
        { id: 3, label: 'Habilidades', icon: Brain },
        { id: 4, label: 'Sensibilidades', icon: ShieldAlert },
        { id: 5, label: 'Metas', icon: Target },
        { id: 6, label: 'Planejamento', icon: Layout },
        { id: 7, label: 'Avaliação', icon: ClipboardCheck },
    ];

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const next = () => setStep(s => Math.min(s + 1, 7));
    const back = () => setStep(s => Math.max(s - 1, 1));

    const handleFinalize = async () => {
        setIsLoading(true);
        try {
            if (initialData) {
                // Edit mode
                await peisService.update(initialData.id, { dados: formData });
                alert('PEI atualizado com sucesso!');
            } else {
                // Create mode
                await peisService.create(studentData.id, formData);
                alert('PEI criado e ativado com sucesso!');
            }
            onComplete();
        } catch (error) {
            console.error('Erro ao salvar PEI:', error);
            alert('Erro ao salvar PEI. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-primary tracking-tight">{initialData ? 'Editar' : 'Novo'} <span className="italic">PEI Completo</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Aluno: {studentName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-4 rounded-3xl bg-white dark:bg-slate-800 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-10 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <button
                                    onClick={() => setStep(s.id)}
                                    className={`size-10 rounded-xl flex items-center justify-center transition-all duration-500 border-4 ${s.id === step ? 'bg-primary text-white border-primary/20 scale-125 shadow-lg' :
                                        s.id < step ? 'bg-primary text-white border-primary/10' :
                                            'bg-white dark:bg-slate-800 text-slate-300 border-slate-100 dark:border-slate-800'
                                        }`}>
                                    <s.icon size={18} />
                                </button>
                                <span className={`text-[9px] font-black uppercase tracking-tighter hidden md:block ${s.id === step ? 'text-primary' : 'text-slate-400'
                                    }`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-12">

                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Identificação do Aluno" subtitle="Dados gerais e diagnósticos laboratoriais/médicos." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Field label="Nome Completo *" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} />
                                    <Field label="Data de Nascimento *" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} type="date" />
                                    <Select label="Sexo *" name="sexo" value={formData.sexo} onChange={handleChange} options={['Feminino', 'Masculino', 'Outro']} />
                                    <Field label="Série/Ano *" name="serieAno" value={formData.serieAno} onChange={handleChange} placeholder="Ex: 3º ano" />
                                    <Select
                                        label="Escola *"
                                        name="escola"
                                        value={formData.escola}
                                        onChange={handleChange}
                                        options={schools.map(s => s.Nome)}
                                    />
                                    <Field label="Ano Letivo *" name="anoLetivo" value={formData.anoLetivo} onChange={handleChange} />
                                    <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-8 mt-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Diagnóstico Médico" name="diagnosticoMedico" value={formData.diagnosticoMedico} onChange={handleChange} isTextArea />
                                            <Field label="CID" name="cid" value={formData.cid} onChange={handleChange} />
                                        </div>
                                        <Field label="Profissionais que Acompanham" name="profissionaisAcompanham" value={formData.profissionaisAcompanham} onChange={handleChange} isTextArea />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Histórico e Desenvolvimento" subtitle="Marcos importantes e áreas de foco." />
                                <div className="space-y-8">
                                    <Field label="Histórico de Desenvolvimento *" name="historicoDesenvolvimento" value={formData.historicoDesenvolvimento} onChange={handleChange} isTextArea help="Incluir marcos importantes, diagnósticos, tratamentos anteriores, etc." />
                                    <Field label="Pontos Fortes *" name="pontosFortes" value={formData.pontosFortes} onChange={handleChange} isTextArea />
                                    <Field label="Áreas que Necessitam Desenvolvimento *" name="areasDesenvolvimento" value={formData.areasDesenvolvimento} onChange={handleChange} isTextArea />
                                    <Field label="Interesses e Preferências *" name="interessesPreferencias" value={formData.interessesPreferencias} onChange={handleChange} isTextArea />
                                    <Select label="Estilo de Aprendizagem *" name="estiloAprendizagem" value={formData.estiloAprendizagem} onChange={handleChange} options={['Visual', 'Auditivo', 'Cinestésico', 'Multimodal']} />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Análise de Habilidades" subtitle="Avaliação das competências atuais do aluno." />
                                <div className="space-y-8">
                                    <Field label="Habilidades Acadêmicas *" name="habilidadesAcademicas" value={formData.habilidadesAcademicas} onChange={handleChange} isTextArea />
                                    <Field label="Habilidades de Comunicação *" name="habilidadesComunicacao" value={formData.habilidadesComunicacao} onChange={handleChange} isTextArea />
                                    <Field label="Habilidades Sociais e Emocionais *" name="habilidadesSociais" value={formData.habilidadesSociais} onChange={handleChange} isTextArea />
                                    <Field label="Habilidades Motoras *" name="habilidadesMotoras" value={formData.habilidadesMotoras} onChange={handleChange} isTextArea />
                                    <Field label="Autonomia e AVDs *" name="habilidadesAutonomia" value={formData.habilidadesAutonomia} onChange={handleChange} isTextArea />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Sensibilidades e Barreiras" subtitle="Identificando desafios e facilitadores." />
                                <div className="space-y-8">
                                    <Field label="Sensibilidades Sensoriais *" name="sensibilidadesSensoriais" value={formData.sensibilidadesSensoriais} onChange={handleChange} isTextArea />
                                    <Field label="Preferências e Reforçadores *" name="preferenciasReforcadores" value={formData.preferenciasReforcadores} onChange={handleChange} isTextArea />
                                    <Field label="Barreiras para Aprendizagem *" name="barreirasAprendizagem" value={formData.barreirasAprendizagem} onChange={handleChange} isTextArea />
                                    <Field label="Apoios Necessários *" name="apoiosNecessarios" value={formData.apoiosNecessarios} onChange={handleChange} isTextArea />
                                    <Field label="Estratégias Favoráveis *" name="estrategiasFavoraveis" value={formData.estrategiasFavoraveis} onChange={handleChange} isTextArea />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Definição de Metas" subtitle="Objetivos escalonados por período." />
                                <div className="space-y-8">
                                    <Field label="Metas de Curto Prazo *" name="metasCurtoPrazo" value={formData.metasCurtoPrazo} onChange={handleChange} isTextArea />
                                    <Field label="Metas de Médio Prazo *" name="metasMedioPrazo" value={formData.metasMedioPrazo} onChange={handleChange} isTextArea />
                                    <Field label="Metas de Longo Prazo *" name="metasLongoPrazo" value={formData.metasLongoPrazo} onChange={handleChange} isTextArea />
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Planejamento e Recursos" subtitle="Metodologias e suporte pedagógico." />
                                <div className="space-y-8">
                                    <Field label="Metodologias e Práticas Pedagógicas *" name="metodologiasPraticas" value={formData.metodologiasPraticas} onChange={handleChange} isTextArea />
                                    <Field label="Adaptações Curriculares *" name="adaptacoesCurriculares" value={formData.adaptacoesCurriculares} onChange={handleChange} isTextArea />
                                    <Field label="Recursos e Materiais Necessários *" name="recursosMateriais" value={formData.recursosMateriais} onChange={handleChange} isTextArea />
                                    <Field label="Rotinas e Previsibilidade *" name="rotinasPrevisibilidade" value={formData.rotinasPrevisibilidade} onChange={handleChange} isTextArea />
                                    <Field label="Participação em Atividades Coletivas *" name="atividadesColetivas" value={formData.atividadesColetivas} onChange={handleChange} isTextArea />
                                    <Field label="Envolvimento da Família *" name="envolvimentoFamilia" value={formData.envolvimentoFamilia} onChange={handleChange} isTextArea />
                                </div>
                            </div>
                        )}

                        {step === 7 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                                <StepTitle title="Avaliação e Revisão" subtitle="Como o progresso será medido e reavaliado." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-8">
                                        <Field label="Instrumentos de Avaliação *" name="instrumentosAvaliacao" value={formData.instrumentosAvaliacao} onChange={handleChange} isTextArea />
                                        <Field label="Critérios de Sucesso *" name="criteriosSucesso" value={formData.criteriosSucesso} onChange={handleChange} isTextArea />
                                    </div>
                                    <Field label="Periodicidade das Reavaliações" name="periodicidadeReavaliacoes" value={formData.periodicidadeReavaliacoes} onChange={handleChange} />
                                    <Select label="Frequência de Revisão" name="frequenciaRevisao" value={formData.frequenciaRevisao} onChange={handleChange} options={['Mensal', 'Bimestral', 'Trimestral', 'Semestral']} />
                                    <Field label="Data de Início" name="dataInicio" value={formData.dataInicio} onChange={handleChange} type="date" />
                                    <Field label="Data de Fim Prevista" name="dataFimPrevista" value={formData.dataFimPrevista} onChange={handleChange} type="date" />
                                    <div className="md:col-span-2">
                                        <Field label="Observações Adicionais" name="observacoesAdicionais" value={formData.observacoesAdicionais} onChange={handleChange} isTextArea />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/10 dark:bg-slate-900/10">
                    <button
                        onClick={back}
                        disabled={step === 1}
                        className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${step === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <ArrowLeft size={18} /> Anterior
                    </button>

                    <div className="flex gap-4">
                        {step < 7 ? (
                            <button
                                onClick={next}
                                className="flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] transition-all"
                            >
                                Próximo <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinalize}
                                disabled={isLoading}
                                className="flex items-center gap-4 px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                                {isLoading ? 'Salvando...' : initialData ? 'Atualizar PEI' : 'Finalizar e Ativar PEI'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="space-y-1">
        <h3 className="text-2xl font-black text-primary tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>
    </div>
);

const Field = ({ label, name, value, onChange, placeholder, type = 'text', isTextArea = false, help }: any) => (
    <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        {isTextArea ? (
            <textarea
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-[2px] border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 rounded-[1.5rem] p-6 text-sm font-bold outline-none transition-all shadow-inner min-h-[120px]"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-[2px] border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 rounded-3xl px-6 py-5 text-sm font-bold outline-none transition-all shadow-inner"
            />
        )}
        {help && <p className="text-[10px] text-slate-400 font-bold italic ml-1">💡 {help}</p>}
    </div>
);

const Select = ({ label, name, value, onChange, options }: any) => (
    <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-[2px] border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 rounded-3xl px-6 py-5 text-sm font-black outline-none transition-all shadow-inner appearance-none"
            >
                <option value="">Selecione...</option>
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <ArrowRight size={18} className="rotate-90" />
            </div>
        </div>
    </div>
);
