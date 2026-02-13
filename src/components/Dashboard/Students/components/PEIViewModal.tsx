import React from 'react';
import {
    X, UserCircle, History as HistoryIcon, Brain, ShieldAlert, Target, Layout, ClipboardCheck,
    Calendar, User, BookOpen, Download, Printer, UserCircle2, Clock
} from 'lucide-react';

interface PEIViewModalProps {
    pei: any;
    studentName: string;
    onClose: () => void;
}

export const PEIViewModal: React.FC<PEIViewModalProps> = ({ pei, studentName, onClose }) => {
    if (!pei) return null;

    const data = pei.data || pei.Dados || {};

    const sections = [
        {
            id: 'identificacao', label: 'Identificação', icon: UserCircle2, color: 'text-blue-500', bg: 'bg-blue-50', fields: [
                { label: 'Nome Completo', value: data.nomeCompleto },
                { label: 'Data de Nascimento', value: data.dataNascimento },
                { label: 'Sexo', value: data.sexo },
                { label: 'Série/Ano', value: data.serieAno },
                { label: 'Escola', value: data.escola },
                { label: 'Ano Letivo', value: data.anoLetivo },
                { label: 'Diagnóstico Médico', value: data.diagnosticoMedico },
                { label: 'CID', value: data.cid },
                { label: 'Profissionais que Acompanham', value: data.profissionaisAcompanham, full: true },
            ]
        },
        {
            id: 'historico', label: 'Histórico e Desenvolvimento', icon: HistoryIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', fields: [
                { label: 'Histórico de Desenvolvimento', value: data.historicoDesenvolvimento, full: true },
                { label: 'Pontos Fortes', value: data.pontosFortes, full: true },
                { label: 'Áreas que Necessitam Desenvolvimento', value: data.areasDesenvolvimento, full: true },
                { label: 'Interesses e Preferências', value: data.interessesPreferencias, full: true },
                { label: 'Estilo de Aprendizagem', value: data.estiloAprendizagem },
            ]
        },
        {
            id: 'habilidades', label: 'Análise de Habilidades', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', fields: [
                { label: 'Habilidades Acadêmicas', value: data.habilidadesAcademicas, full: true },
                { label: 'Habilidades de Comunicação', value: data.habilidadesComunicacao, full: true },
                { label: 'Habilidades Sociais e Emocionais', value: data.habilidadesSociais, full: true },
                { label: 'Habilidades Motoras', value: data.habilidadesMotoras, full: true },
                { label: 'Autonomia e AVDs', value: data.habilidadesAutonomia, full: true },
            ]
        },
        {
            id: 'sensibilidades', label: 'Sensibilidades e Barreiras', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50', fields: [
                { label: 'Sensibilidades Sensoriais', value: data.sensibilidadesSensoriais, full: true },
                { label: 'Preferências e Reforçadores', value: data.preferenciasReforcadores, full: true },
                { label: 'Barreiras para Aprendizagem', value: data.barreirasAprendizagem, full: true },
                { label: 'Apoios Necessários', value: data.apoiosNecessarios, full: true },
                { label: 'Estratégias Favoráveis', value: data.estrategiasFavoraveis, full: true },
            ]
        },
        {
            id: 'metas', label: 'Definição de Metas', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50', fields: [
                { label: 'Metas de Curto Prazo (Trimestral)', value: data.metasCurtoPrazo, full: true },
                { label: 'Metas de Médio Prazo (Semestral)', value: data.metasMedioPrazo, full: true },
                { label: 'Metas de Longo Prazo (Anual)', value: data.metasLongoPrazo, full: true },
            ]
        },
        {
            id: 'planejamento', label: 'Planejamento e Recursos', icon: Layout, color: 'text-cyan-500', bg: 'bg-cyan-50', fields: [
                { label: 'Metodologias e Práticas', value: data.metodologiasPraticas, full: true },
                { label: 'Adaptações Curriculares', value: data.adaptacoesCurriculares, full: true },
                { label: 'Recursos e Materiais', value: data.recursosMateriais, full: true },
                { label: 'Rotinas e Previsibilidade', value: data.rotinasPrevisibilidade, full: true },
                { label: 'Participação em Atividades Coletivas', value: data.atividadesColetivas, full: true },
                { label: 'Envolvimento da Família', value: data.envolvimentoFamilia, full: true },
            ]
        },
        {
            id: 'avaliacao', label: 'Avaliação e Revisão', icon: ClipboardCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', fields: [
                { label: 'Instrumentos de Avaliação', value: data.instrumentosAvaliacao, full: true },
                { label: 'Critérios de Sucesso', value: data.criteriosSucesso, full: true },
                { label: 'Periodicidade das Reavaliações', value: data.periodicidadeReavaliacoes },
                { label: 'Frequência de Revisão', value: data.frequenciaRevisao },
                { label: 'Data de Início', value: data.dataInicio },
                { label: 'Data de Fim Prevista', value: data.dataFimPrevista },
                { label: 'Observações Adicionais', value: data.observacoesAdicionais, full: true },
            ]
        },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-0 md:p-4 print:relative print:inset-auto print:bg-white print:p-0 print:z-0 print:block">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: A4 portrait; 
                        margin: 2cm; 
                    }
                    
                    body { 
                        background: white !important; 
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    nav, aside, footer, .no-print, button, .id-header-actions, .custom-scrollbar::-webkit-scrollbar { 
                        display: none !important; 
                    }

                    .print-container { 
                        position: relative !important;
                        display: block !important;
                        width: 100% !important;
                        max-height: none !important;
                        overflow: visible !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        animation: none !important;
                    }

                    .print-header {
                        display: block !important;
                        border-bottom: 2px solid #e2e8f0 !important;
                        margin-bottom: 3rem !important;
                        padding-bottom: 2rem !important;
                    }

                    .print-content { 
                        display: block !important;
                        overflow: visible !important;
                        height: auto !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    .print-section {
                        display: block !important;
                        page-break-inside: avoid;
                        margin-bottom: 3rem !important;
                        clear: both;
                    }

                    .print-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 1.5rem !important;
                    }

                    .print-field-full {
                        grid-column: span 2 !important;
                    }

                    .print-field {
                        page-break-inside: avoid;
                        margin-bottom: 1rem;
                    }

                    .print-item-box {
                        border: 1px solid #e2e8f0 !important;
                        padding: 1.5rem !important;
                        border-radius: 0.75rem !important;
                        background-color: #f8fafc !important;
                        min-height: auto !important;
                    }

                    .print-label {
                        color: #64748b !important;
                        font-weight: 800 !important;
                        font-size: 9pt !important;
                        margin-bottom: 0.25rem !important;
                    }

                    .print-value {
                        color: #1e293b !important;
                        font-size: 10pt !important;
                        font-weight: 600 !important;
                    }

                    h2, h3 { color: black !important; }
                }
            `}} />

            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[92vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20 print-container">

                {/* Header */}
                <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30 print:bg-white print:border-b-2 print:pb-8 print:mb-8 print-header">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner print:border print:border-slate-200">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <div className="hidden print:block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Documento Oficial de Acompanhamento</div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-2">
                                Plano Educacional Individualizado <span className="text-primary italic print:text-black"> (PEI)</span>
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 print:text-slate-600">
                                    <User size={12} className="text-primary" /> <strong>ALUNO:</strong> {studentName}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 print:text-slate-600">
                                    <Clock size={12} className="text-primary" /> <strong>VERSÃO:</strong> {pei.version}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto no-print">
                        <button
                            onClick={handlePrint}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Printer size={18} /> Imprimir
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                        >
                            <Download size={18} /> Exportar PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-50/20 dark:bg-transparent print-content">
                    <div className="max-w-4xl mx-auto space-y-12 pb-12">
                        {sections.map((section) => (
                            <div key={section.id} className="space-y-6 print-section">
                                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 print:border-b-2 print:border-slate-200">
                                    <div className={`p-3 rounded-2xl ${section.bg} ${section.color} shadow-sm print:bg-white print:text-black print:p-0`}>
                                        <section.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase print:text-primary">
                                        {section.label}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-2 print-grid">
                                    {section.fields.map((field, idx) => (
                                        <div key={idx} className={`${field.full ? 'md:col-span-2 print-field-full' : ''} space-y-2 print-field`}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 print-label">
                                                {field.label}
                                            </p>
                                            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm min-h-[56px] flex items-center print-item-box">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed print-value">
                                                    {field.value || <span className="text-slate-300 italic font-medium print:text-slate-400">Não informado</span>}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Signature area fixed for print */}
                        <div className="hidden print:block pt-20 mt-20 border-t-2 border-slate-200">
                            <div className="grid grid-cols-2 gap-20">
                                <div className="text-center space-y-3">
                                    <div className="border-b-2 border-slate-300 w-full h-12"></div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assinatura do Responsável Legal</p>
                                    <p className="text-[8px] text-slate-400">Data: ____/____/_______</p>
                                </div>
                                <div className="text-center space-y-3">
                                    <div className="border-b-2 border-slate-300 w-full h-12"></div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assinatura do Profissional Responsável</p>
                                    <p className="text-[8px] text-slate-400">Data: ____/____/_______</p>
                                </div>
                            </div>
                            <div className="mt-20 text-center">
                                <p className="text-[8px] text-slate-400 uppercase tracking-[0.5em] font-bold">VínculoTEA - Sistema de Gestão Especializada</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer no-print */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-center no-print">
                    <button
                        onClick={onClose}
                        className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl"
                    >
                        Fechar Visualização
                    </button>
                </div>
            </div>
        </div>
    );
};
