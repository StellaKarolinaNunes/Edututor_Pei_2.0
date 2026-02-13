import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, User, MapPin, School, BookOpen, Brain, Activity, Camera, Loader2 } from 'lucide-react';
import styles from './StudentRegistrationWizard.module.css';
import { studentService } from '@/lib/studentService';
import { classesService } from '@/lib/classesService';
import { schoolsService } from '@/lib/schoolsService';
import { useAuth } from '@/lib/useAuth';

interface WizardProps {
    onCancel: () => void;
    onComplete: (data: any) => void;
    initialData?: any;
}

export const StudentRegistrationWizard: React.FC<WizardProps> = ({ onCancel, onComplete, initialData }) => {
    const { user: authUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string>('');
    const [schools, setSchools] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        // Step 1: Dados Pessoais
        nomeCompleto: initialData?.nome || '',
        dataNascimento: initialData?.dataNascimento || '',
        cpf: initialData?.detalhes?.cpf || '',
        genero: initialData?.genero === 'Masculino' ? 'M' : initialData?.genero === 'Feminino' ? 'F' : initialData?.genero === 'O' ? 'O' : '',
        cid: initialData?.cid || '',
        // Step 2: Responsável
        responsavelNome: initialData?.responsavel || '',
        responsavelEmail: initialData?.detalhes?.email_responsavel || '',
        responsavelTelefone: initialData?.detalhes?.telefone_responsavel || '',
        cep: initialData?.detalhes?.endereco?.cep || '',
        logradouro: initialData?.detalhes?.endereco?.logradouro || '',
        numero: initialData?.detalhes?.endereco?.numero || '',
        complemento: initialData?.detalhes?.endereco?.complemento || '',
        bairro: initialData?.detalhes?.endereco?.bairro || '',
        cidade: initialData?.detalhes?.endereco?.cidade || '',
        estado: initialData?.detalhes?.endereco?.estado || '',
        // Step 3: Vínculo
        escolaId: initialData?.escola_id?.toString() || '',
        turmaId: '', // To be matched with classes
        // Step 4: História
        gravidez: initialData?.detalhes?.historia?.gravidez || '',
        tipoParto: initialData?.detalhes?.historia?.tipoParto || '',
        pesoNascer: initialData?.detalhes?.historia?.pesoNascer || '',
        apgar: initialData?.detalhes?.historia?.apgar || '',
        internacaoNeonatal: initialData?.detalhes?.historia?.internacaoNeonatal || '',
        // Step 5: Desenvolvimento
        marcosDesenvolvimento: initialData?.detalhes?.desenvolvimento?.marcosDesenvolvimento || '',
        producaoVerbal: initialData?.detalhes?.desenvolvimento?.producaoVerbal || '',
        entendeInstrucoes: initialData?.detalhes?.desenvolvimento?.entendeInstrucoes || '',
        contatoOcular: initialData?.detalhes?.desenvolvimento?.contatoOcular || '',
        brincadeiraPreferida: initialData?.detalhes?.desenvolvimento?.brincadeiraPreferida || '',
        // Step 6: Saúde e Rotinas
        doencas: initialData?.detalhes?.saude?.doencas || '',
        medicacao: initialData?.detalhes?.saude?.medicacao || '',
        alergias: initialData?.detalhes?.saude?.alergias || '',
        sono: initialData?.detalhes?.saude?.sono || '',
        alimentacao: initialData?.detalhes?.saude?.alimentacao || '',
        observacoes: initialData?.detalhes?.saude?.observacoes || '',
        modulo: initialData?.detalhes?.modulo || '',
        periodo: initialData?.detalhes?.periodo || ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [schoolsData, classesData] = await Promise.all([
                    schoolsService.getAll(authUser?.plataforma_id),
                    classesService.getAll(authUser?.plataforma_id)
                ]);
                setSchools(schoolsData);
                setClasses(classesData);

                if (initialData?.serie && classesData.length > 0) {
                    const matchedClass = classesData.find((c: any) => c.nome === initialData.serie || c.Nome === initialData.serie);
                    if (matchedClass) {
                        setFormData(prev => ({ ...prev, turmaId: matchedClass.id.toString() }));
                    }
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
            }
        };
        loadInitialData();
    }, [initialData]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            handleCEP(value);
        }
    };

    const handleCEP = async (cepValue: string) => {
        const cleanCEP = cepValue.replace(/\D/g, '');
        if (cleanCEP.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logradouro: data.logradouro || prev.logradouro,
                    bairro: data.bairro || prev.bairro,
                    cidade: data.localidade || prev.cidade,
                    estado: data.uf || prev.estado
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const filteredClassesBySchool = useMemo(() => {
        if (!formData.escolaId) return [];
        return classes.filter(c => c.escola_id?.toString() === formData.escolaId);
    }, [classes, formData.escolaId]);

    const steps = [
        { id: 1, label: 'Dados Pessoais', icon: User },
        { id: 2, label: 'Responsável', icon: MapPin },
        { id: 3, label: 'Vínculo', icon: School },
        { id: 4, label: 'História', icon: BookOpen },
        { id: 5, label: 'Desenv.', icon: Brain },
        { id: 6, label: 'Saúde', icon: Activity },
    ];

    const handleNext = () => {
        // TODO: Add validation
        if (currentStep < 6) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else onCancel();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let uploadedPhotoUrl = '';
            if (photo) {
                uploadedPhotoUrl = await studentService.uploadPhoto(photo);
            }

            // 1. Get or Create Family
            const familyId = await studentService.getOrCreateFamily(
                formData.responsavelNome,
                formData.responsavelTelefone,
                formData.responsavelEmail,
                authUser?.plataforma_id
            );

            // 2. Prepare Student Data
            const studentDataToSave = {
                nome: formData.nomeCompleto,
                data_nascimento: formData.dataNascimento || null,
                genero: formData.genero,
                serie: classes.find(c => c.id.toString() === formData.turmaId)?.nome || '',
                status: initialData?.status || 'Ativo',
                foto: uploadedPhotoUrl || initialData?.foto,
                cid: formData.cid,
                detalhes: {
                    cpf: formData.cpf,
                    email_responsavel: formData.responsavelEmail,
                    telefone_responsavel: formData.responsavelTelefone,
                    endereco: {
                        cep: formData.cep,
                        logradouro: formData.logradouro,
                        numero: formData.numero,
                        complemento: formData.complemento,
                        bairro: formData.bairro,
                        cidade: formData.cidade,
                        estado: formData.estado
                    },
                    modulo: formData.modulo,
                    periodo: formData.periodo,
                    historia: {
                        gravidez: formData.gravidez,
                        tipoParto: formData.tipoParto,
                        pesoNascer: formData.pesoNascer,
                        apgar: formData.apgar,
                        internacaoNeonatal: formData.internacaoNeonatal
                    },
                    desenvolvimento: {
                        marcosDesenvolvimento: formData.marcosDesenvolvimento,
                        producaoVerbal: formData.producaoVerbal,
                        entendeInstrucoes: formData.entendeInstrucoes,
                        contatoOcular: formData.contatoOcular,
                        brincadeiraPreferida: formData.brincadeiraPreferida
                    },
                    saude: {
                        doencas: formData.doencas,
                        medicacao: formData.medicacao,
                        alergias: formData.alergias,
                        sono: formData.sono,
                        alimentacao: formData.alimentacao,
                        observacoes: formData.observacoes
                    }
                },
                familia_id: familyId,
                escola_id: parseInt(formData.escolaId) || 0,
                plataforma_id: authUser?.plataforma_id
            };

            if (initialData?.id) {
                await studentService.update(initialData.id, studentDataToSave);
            } else {
                await studentService.create(studentDataToSave);
            }
            onComplete(studentDataToSave);
        } catch (err: any) {
            console.error('Error saving student:', err);
            const errorMessage = err.message || 'Erro desconhecido';
            alert(`Erro ao salvar aluno: ${errorMessage}. Verifique os dados e tente novamente.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>{initialData ? 'Editar Aluno' : 'Novo Aluno/PEI'}</h2>
                <p className={styles.subtitle}>{initialData ? 'Atualize as informações do aluno' : 'Preencha as informações por etapas'}</p>
            </div>

            {/* Stepper */}
            <div className={styles.stepper}>
                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepCompleted : ''}`}
                        >
                            <div className={styles.stepCircle}>
                                {isCompleted ? <Check size={16} /> : step.id}
                            </div>
                            <div className={styles.stepLabel}>{step.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Form Content */}
            <form className={styles.form} onSubmit={handleSubmit}>

                {/* Step 1: Dados Pessoais */}
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-32 rounded-[2rem] bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Preview" className="size-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <Camera size={32} />
                                            <span className="text-[10px] font-bold uppercase mt-1">Foto</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer font-black text-[10px] uppercase tracking-widest">
                                        Alterar
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Imagem de Perfil</p>
                            </div>

                            <div className={styles.grid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Nome Completo <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="nomeCompleto"
                                        value={formData.nomeCompleto}
                                        onChange={handleChange}
                                        placeholder="Nome completo do aluno"
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Data de Nascimento <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        name="dataNascimento"
                                        value={formData.dataNascimento}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>CPF <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        placeholder="000.000.000-00"
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Gênero <span className={styles.required}>*</span></label>
                                    <select
                                        name="genero"
                                        value={formData.genero}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                        <option value="O">Outro</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Diagnóstico / CID</label>
                                    <input
                                        type="text"
                                        name="cid"
                                        value={formData.cid}
                                        onChange={handleChange}
                                        placeholder="Ex: F84.0"
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Responsável */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className={styles.sectionTitle}><MapPin size={20} /> Dados do Responsável e Endereço</h3>

                        <div className={styles.grid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nome do Responsável <span className={styles.required}>*</span></label>
                                <input type="text" name="responsavelNome" value={formData.responsavelNome} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email <span className={styles.required}>*</span></label>
                                <input type="email" name="responsavelEmail" value={formData.responsavelEmail} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Telefone <span className={styles.required}>*</span></label>
                                <input type="tel" name="responsavelTelefone" value={formData.responsavelTelefone} onChange={handleChange} placeholder="(00) 00000-0000" className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>CEP <span className={styles.required}>*</span></label>
                                <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Logradouro <span className={styles.required}>*</span></label>
                                <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Número <span className={styles.required}>*</span></label>
                                <input type="text" name="numero" value={formData.numero} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Complemento</label>
                                <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Apto, Bloco, etc." className={styles.input} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Bairro <span className={styles.required}>*</span></label>
                                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cidade <span className={styles.required}>*</span></label>
                                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estado <span className={styles.required}>*</span></label>
                                <select name="estado" value={formData.estado} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="AC">Acre</option>
                                    <option value="AL">Alagoas</option>
                                    <option value="AP">Amapá</option>
                                    <option value="AM">Amazonas</option>
                                    <option value="BA">Bahia</option>
                                    <option value="CE">Ceará</option>
                                    <option value="DF">Distrito Federal</option>
                                    <option value="ES">Espírito Santo</option>
                                    <option value="GO">Goiás</option>
                                    <option value="MA">Maranhão</option>
                                    <option value="MT">Mato Grosso</option>
                                    <option value="MS">Mato Grosso do Sul</option>
                                    <option value="MG">Minas Gerais</option>
                                    <option value="PA">Pará</option>
                                    <option value="PB">Paraíba</option>
                                    <option value="PR">Paraná</option>
                                    <option value="PE">Pernambuco</option>
                                    <option value="PI">Piauí</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="RN">Rio Grande do Norte</option>
                                    <option value="RS">Rio Grande do Sul</option>
                                    <option value="RO">Rondônia</option>
                                    <option value="RR">Roraima</option>
                                    <option value="SC">Santa Catarina</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="SE">Sergipe</option>
                                    <option value="TO">Tocantins</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Vínculo Escolar */}
                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className={styles.sectionTitle}><School size={20} /> Vínculo Escolar</h3>
                        <div className={styles.grid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Escola <span className={styles.required}>*</span></label>
                                <select name="escolaId" value={formData.escolaId} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione uma escola...</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.nome || s.Nome}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Turma <span className={styles.required}>*</span></label>
                                <select name="turmaId" value={formData.turmaId} onChange={handleChange} className={styles.input} required disabled={!formData.escolaId}>
                                    <option value="">{formData.escolaId ? 'Selecione a turma...' : 'Selecione uma escola primeiro'}</option>
                                    {filteredClassesBySchool.map(c => <option key={c.id} value={c.id}>{c.nome || c.Nome}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Módulo <span className={styles.required}>*</span></label>
                                <select name="modulo" value={formData.modulo} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="Fundamental I">Fundamental I</option>
                                    <option value="Fundamental II">Fundamental II</option>
                                    <option value="Ensino Médio">Ensino Médio</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Período (Turno) <span className={styles.required}>*</span></label>
                                <select name="periodo" value={formData.periodo} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="Matutino">Matutino</option>
                                    <option value="Vespertino">Vespertino</option>
                                    <option value="Integral">Integral</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: História */}
                {currentStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className={styles.sectionTitle}><BookOpen size={20} /> História Pré/Peri/Neonatal</h3>
                        <p className="text-slate-500 text-sm mb-6">💡 Avaliação Inicial: Estas informações são importantes para a criação do PEI. Preencha o que souber.</p>

                        <div className={styles.grid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Como foi a gravidez? <span className={styles.required}>*</span></label>
                                <textarea name="gravidez" value={formData.gravidez} onChange={handleChange} placeholder="Ex: Gravidez tranquila, sem intercorrências..." className={`${styles.input} ${styles.textarea}`} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tipo de Parto <span className={styles.required}>*</span></label>
                                <select name="tipoParto" value={formData.tipoParto} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Cesarea">Cesárea</option>
                                    <option value="Forceps">Fórceps</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Peso ao Nascer (kg) <span className={styles.required}>*</span></label>
                                <input type="text" name="pesoNascer" value={formData.pesoNascer} onChange={handleChange} placeholder="Ex: 3.2kg" className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>APGAR <span className={styles.required}>*</span></label>
                                <input type="text" name="apgar" value={formData.apgar} onChange={handleChange} placeholder="Ex: 9/10" className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Houve internação neonatal? <span className={styles.required}>*</span></label>
                                <input type="text" name="internacaoNeonatal" value={formData.internacaoNeonatal} onChange={handleChange} placeholder="Ex: Não / Sim, 3 dias na UTI" className={styles.input} required />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Desenvolvimento */}
                {currentStep === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className={styles.sectionTitle}><Brain size={20} /> Desenvolvimento e Comunicação</h3>
                        <p className="text-slate-500 text-sm mb-6">💡 Avaliação Inicial: Informações sobre o desenvolvimento e comunicação do aluno.</p>

                        <div className={styles.grid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Marcos do Desenvolvimento <span className={styles.required}>*</span></label>
                                <textarea name="marcosDesenvolvimento" value={formData.marcosDesenvolvimento} onChange={handleChange} placeholder="Ex: Começou a andar aos 14 meses, primeiras palavras aos 2 anos..." className={`${styles.input} ${styles.textarea}`} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Como é a produção verbal? <span className={styles.required}>*</span></label>
                                <textarea name="producaoVerbal" value={formData.producaoVerbal} onChange={handleChange} placeholder="Ex: Fala frases curtas, vocabulário limitado..." className={`${styles.input} ${styles.textarea}`} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Entende instruções simples? <span className={styles.required}>*</span></label>
                                <select name="entendeInstrucoes" value={formData.entendeInstrucoes} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="Sim">Sim</option>
                                    <option value="Nao">Não</option>
                                    <option value="AsVezes">Às vezes</option>
                                </select>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Contato ocular e resposta ao nome <span className={styles.required}>*</span></label>
                                <input type="text" name="contatoOcular" value={formData.contatoOcular} onChange={handleChange} placeholder="Ex: Mantém contato ocular, responde ao nome..." className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Tipo de brincadeira preferida <span className={styles.required}>*</span></label>
                                <input type="text" name="brincadeiraPreferida" value={formData.brincadeiraPreferida} onChange={handleChange} placeholder="Ex: Quebra-cabeças, jogos de encaixe, bola..." className={styles.input} required />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Saúde e Rotinas */}
                {currentStep === 6 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className={styles.sectionTitle}><Activity size={20} /> Saúde e Rotinas</h3>
                        <p className="text-slate-500 text-sm mb-6">💡 Avaliação Inicial: Informações sobre saúde e rotina diária do aluno.</p>

                        <div className={styles.grid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Doenças relevantes ou histórico médico <span className={styles.required}>*</span></label>
                                <textarea name="doencas" value={formData.doencas} onChange={handleChange} placeholder="Ex: Asma, epilepsia..." className={`${styles.input} ${styles.textarea}`} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Medicação atual <span className={styles.required}>*</span></label>
                                <input type="text" name="medicacao" value={formData.medicacao} onChange={handleChange} placeholder="Ex: Ritalina 10mg - 1x ao dia" className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Alergias <span className={styles.required}>*</span></label>
                                <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} placeholder="Ex: Alergia a amendoim, pólen..." className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Rotina de sono <span className={styles.required}>*</span></label>
                                <input type="text" name="sono" value={formData.sono} onChange={handleChange} placeholder="Ex: Dorme às 21h, acorda às 7h..." className={styles.input} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Alimentação <span className={styles.required}>*</span></label>
                                <textarea name="alimentacao" value={formData.alimentacao} onChange={handleChange} placeholder="Ex: Come bem, sem seletividade alimentar..." className={`${styles.input} ${styles.textarea}`} required />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Observações gerais <span className={styles.required}>*</span></label>
                                <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={`${styles.input} ${styles.textarea}`} required />
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    <button type="button" onClick={handleBack} className={`${styles.button} ${styles.btnSecondary}`}>
                        <ArrowLeft size={18} />
                        {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                    </button>

                    {currentStep < 6 ? (
                        <button type="button" onClick={handleNext} className={`${styles.button} ${styles.btnPrimary}`}>
                            Próximo
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button disabled={isLoading} type="submit" className={`${styles.button} ${styles.btnPrimary}`}>
                            {isLoading ? (
                                <>
                                    Salvando...
                                    <Loader2 size={18} className="animate-spin" />
                                </>
                            ) : (
                                <>
                                    Finalizar
                                    <Check size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
};
