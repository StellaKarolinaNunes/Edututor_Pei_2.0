import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, User, MapPin, School, BookOpen, Brain, Activity } from 'lucide-react';
import styles from './StudentRegistrationWizard.module.css';

interface WizardProps {
    onCancel: () => void;
    onComplete: (data: any) => void;
}

export const StudentRegistrationWizard: React.FC<WizardProps> = ({ onCancel, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Dados Pessoais
        nomeCompleto: '',
        dataNascimento: '',
        cpf: '',
        genero: '',
        // Step 2: Responsável
        responsavelNome: '',
        responsavelEmail: '',
        responsavelTelefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        // Step 3: Vínculo
        escola: '',
        turma: '',
        // Step 4: História
        gravidez: '',
        tipoParto: '',
        pesoNascer: '',
        apgar: '',
        internacaoNeonatal: '',
        // Step 5: Desenvolvimento
        marcosDesenvolvimento: '',
        producaoVerbal: '',
        entendeInstrucoes: '',
        contatoOcular: '',
        brincadeiraPreferida: '',
        // Step 6: Saúde e Rotinas
        doencas: '',
        medicacao: '',
        alergias: '',
        sono: '',
        alimentacao: '',
        observacoes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>Novo Aluno/PEI</h2>
                <p className={styles.subtitle}>Preencha as informações por etapas</p>
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
                        <h3 className={styles.sectionTitle}><User size={20} /> Dados Pessoais do Aluno</h3>
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
                                    <option value="SP">São Paulo</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="MG">Minas Gerais</option>
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
                                <select name="escola" value={formData.escola} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione uma escola...</option>
                                    <option value="Escola Municipal Exemplo">Escola Municipal Exemplo</option>
                                    <option value="Colégio Estadual Modelo">Colégio Estadual Modelo</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Turma <span className={styles.required}>*</span></label>
                                <select name="turma" value={formData.turma} onChange={handleChange} className={styles.input} required>
                                    <option value="">Selecione...</option>
                                    <option value="1a">1º Ano A</option>
                                    <option value="1b">1º Ano B</option>
                                    <option value="2a">2º Ano A</option>
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
                        <button type="submit" className={`${styles.button} ${styles.btnPrimary}`}>
                            Finalizar
                            <Check size={18} />
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
};
