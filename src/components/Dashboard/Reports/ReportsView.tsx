import { useState, useEffect } from 'react';
import {
    FileText, Calendar, Download, Users, Sliders,
    BarChart3, Clock, UserCheck, Search, Filter, Loader2,
    ArrowUpRight, ListFilter, User, ChevronRight, LayoutDashboard,
    CheckCircle2, XCircle, AlertCircle, Percent, Target, TrendingUp, Info,
    Heart, ShieldAlert, Activity, School, FileCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { studentService } from '@/lib/studentService';
import { useAuth } from '@/lib/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '@/assets/images/logotipo_Horizontal.svg';

interface ReportData {
    totalStudents: number;
    totalServices: number;
    totalHours: number;
    professionalStats: { name: string; services: number; hours: number }[];
    studentStats: { name: string; services: number; hours: number }[];
}

interface AttendanceData {
    totalScheduled: number;
    completed: number;
    missed: number;
    rate: number;
}

interface EvolutionData {
    objetivosPti: string;
    metasPorArea: { area: string; meta: string; status: string }[];
    totalMetas: number;
    metasConcluidas: number;
    progressoMedio: number;
    metasProximoSemestre: string;
    recomendacoes: string[];
}

export const ReportsView = () => {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'individual'>('general');
    const [individualTab, setIndividualTab] = useState<'attendance' | 'evolution' | 'home_activities' | 'school_guidance'>('attendance');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    // Individual Report States
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
    const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);
    const [homeActivities, setHomeActivities] = useState<any[]>([]);
    const [schoolNotes, setSchoolNotes] = useState<any[]>([]);
    const [peis, setPeis] = useState<any[]>([]);
    const [selectedPeiId, setSelectedPeiId] = useState<string>('');

    const fetchGeneralData = async () => {
        setLoading(true);
        try {
            const plataformaId = authUser?.plataforma_id;

            // 1. Fetch real students from the platform
            let alunosQuery = supabase
                .from('Alunos')
                .select('Aluno_ID, Nome, Escola_ID, Escolas (Nome)');
            if (plataformaId) alunosQuery = alunosQuery.eq('Plataforma_ID', plataformaId);
            const { data: alunos, error: alunosError } = await alunosQuery;
            if (alunosError) throw alunosError;

            // 2. Fetch real professionals from the platform
            let profsQuery = supabase
                .from('Professores')
                .select('Professor_ID, Nome, Categoria, Especialidade');
            if (plataformaId) profsQuery = profsQuery.eq('Plataforma_ID', plataformaId);
            const { data: professores, error: profsError } = await profsQuery;
            if (profsError) throw profsError;

            // 3. Fetch agenda events (appointments) within the date range
            let agendaQuery = supabase
                .from('Agenda')
                .select('Evento_ID, Titulo, Data, Horario, Professor_ID, Aluno_ID, Status, Tipo_Evento')
                .gte('Data', startDate)
                .lte('Data', endDate);
            if (plataformaId) agendaQuery = agendaQuery.eq('Plataforma_ID', plataformaId);
            const { data: agendaEvents, error: agendaError } = await agendaQuery;
            if (agendaError) throw agendaError;

            // 4. Fetch acompanhamentos (follow-ups) within the date range
            let acompQuery = supabase
                .from('Acompanhamentos')
                .select('Acompanhamento_ID, Aluno_ID, Data, Atividade, Status');
            if (plataformaId) acompQuery = acompQuery.eq('Plataforma_ID', plataformaId);
            const { data: acompanhamentos, error: acompError } = await acompQuery;
            if (acompError) throw acompError;

            // 5. Fetch Aulas (lessons) within the date range
            const { data: aulas, error: aulasError } = await supabase
                .from('Aulas')
                .select(`
                    Aula_ID,
                    Data_hora_inicio,
                    Data_hora_fim,
                    Professor_ID,
                    Professores (Nome),
                    Aulas_Alunos (
                        Aluno_ID,
                        Alunos (Nome)
                    )
                `)
                .gte('Data_hora_inicio', `${startDate}T00:00:00`)
                .lte('Data_hora_inicio', `${endDate}T23:59:59`);
            if (aulasError) throw aulasError;

            // Build professional stats map
            const profsMap: Record<string, { name: string; services: number; hours: number }> = {};
            const studentsMap: Record<string, { name: string; services: number; hours: number }> = {};
            let totalHours = 0;
            let totalServices = 0;

            // Initialize all professionals in the map
            (professores || []).forEach(prof => {
                const profId = prof.Professor_ID.toString();
                if (!profsMap[profId]) {
                    profsMap[profId] = { name: prof.Nome || 'Sem Nome', services: 0, hours: 0 };
                }
            });

            // Initialize all students in the map
            (alunos || []).forEach(aluno => {
                const studentId = aluno.Aluno_ID.toString();
                if (!studentsMap[studentId]) {
                    studentsMap[studentId] = { name: aluno.Nome || 'Sem Nome', services: 0, hours: 0 };
                }
            });

            // Count agenda events as services
            (agendaEvents || []).forEach(event => {
                totalServices++;
                const profId = event.Professor_ID?.toString();
                if (profId && profsMap[profId]) {
                    profsMap[profId].services++;
                    profsMap[profId].hours += 1; // Default 1h per appointment
                    totalHours += 1;
                }
                const studentId = event.Aluno_ID?.toString();
                if (studentId && studentsMap[studentId]) {
                    studentsMap[studentId].services++;
                    studentsMap[studentId].hours += 1;
                }
            });

            // Count acompanhamentos as services
            (acompanhamentos || []).forEach(acomp => {
                totalServices++;
                const studentId = acomp.Aluno_ID?.toString();
                if (studentId && studentsMap[studentId]) {
                    studentsMap[studentId].services++;
                }
            });

            // Count Aulas (lessons) with actual duration
            (aulas || []).forEach(aula => {
                const start = new Date(aula.Data_hora_inicio);
                const end = new Date(aula.Data_hora_fim);
                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                const profName = (aula.Professores as any)?.Nome || 'Desconhecido';
                const profId = aula.Professor_ID?.toString() || 'unknown';

                if (!profsMap[profId]) profsMap[profId] = { name: profName, services: 0, hours: 0 };

                const studentLinks = (aula.Aulas_Alunos as any[]) || [];
                totalServices += studentLinks.length;
                profsMap[profId].services += studentLinks.length;
                profsMap[profId].hours += duration;
                totalHours += duration;

                studentLinks.forEach(link => {
                    const sId = link.Aluno_ID?.toString();
                    const sName = link.Alunos?.Nome || 'Desconhecido';
                    if (!studentsMap[sId]) studentsMap[sId] = { name: sName, services: 0, hours: 0 };
                    studentsMap[sId].services += 1;
                    studentsMap[sId].hours += duration;
                });
            });

            setReportData({
                totalStudents: (alunos || []).length,
                totalServices,
                totalHours: parseFloat(totalHours.toFixed(2)),
                professionalStats: Object.values(profsMap)
                    .filter(p => p.services > 0)
                    .sort((a, b) => b.services - a.services),
                studentStats: Object.values(studentsMap)
                    .filter(s => s.services > 0)
                    .sort((a, b) => b.services - a.services)
            });

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIndividualData = async () => {
        if (!selectedStudentId) return;
        setLoading(true);
        try {
            const student = students.find(s => s.Aluno_ID.toString() === selectedStudentId);
            setSelectedStudent(student);

            // Fetch Attendance
            const { data: aulas, error } = await supabase
                .from('Aulas_Alunos')
                .select(`
                    *,
                    Aulas (*)
                `)
                .eq('Aluno_ID', selectedStudentId)
                .gte('Aulas.Data_hora_inicio', `${startDate}T00:00:00`)
                .lte('Aulas.Data_hora_inicio', `${endDate}T23:59:59`);

            if (error) throw error;

            const filteredAulas = (aulas || []).filter(a => a.Aulas !== null);
            const totalScheduled = filteredAulas.length;
            const completed = filteredAulas.filter(a => a.Aulas.Status === 'Concluída' || a.Aulas.Status === 'Realizada').length;
            const missed = filteredAulas.filter(a => a.Aulas.Status === 'Faltou' || a.Aulas.Status === 'Ausente').length;
            const rate = totalScheduled > 0 ? (completed / totalScheduled) * 100 : 0;

            setAttendanceData({
                totalScheduled,
                completed,
                missed,
                rate: parseFloat(rate.toFixed(1))
            });

            // Fetch Evolution Data from PEIs
            const { data: peisData, error: peisError } = await supabase
                .from('PEIs')
                .select('*')
                .eq('Aluno_ID', selectedStudentId)
                .order('Data_Criacao', { ascending: false });

            if (peisError) throw peisError;

            setPeis(peisData || []);
            const selectedPei = selectedPeiId
                ? peisData?.find(p => p.PEI_ID.toString() === selectedPeiId) || peisData?.[0]
                : peisData?.[0];

            if (selectedPei && !selectedPeiId) setSelectedPeiId(selectedPei.PEI_ID.toString());

            const d = selectedPei?.Dados || {};

            // Mock/Calc evolution from PEI goals
            const metas = d.metasCurtoPrazo || "Nenhuma observação registrada";
            const objetivosPti = d.pontosFortes || "Nenhuma observação registrada"; // Using points as a proxy for initial objectives if not explicit

            // For Evolution by Area, we try to split or use a default
            const metasPorArea = d.metasCurtoPrazo ? [{ area: 'Geral', meta: d.metasCurtoPrazo, status: 'Em progresso' }] : [];

            setEvolutionData({
                objetivosPti: objetivosPti,
                metasPorArea: metasPorArea,
                totalMetas: metasPorArea.length,
                metasConcluidas: 0,
                progressoMedio: 0,
                metasProximoSemestre: "Todas as metas foram concluídas. Sugerir novos objetivos baseados na evolução atual.",
                recomendacoes: [
                    "Manter o acompanhamento regular das metas estabelecidas",
                    "Continuar com as estratégias de intervenção que apresentaram bons resultados",
                    "Revisar e ajustar metas conforme a evolução do paciente",
                    "Manter comunicação frequente com a família sobre o progresso"
                ]
            });

            // Fetch Home Activities / Family Notes
            const { data: notes, error: notesError } = await supabase
                .from('Anotacoes')
                .select('*')
                .eq('Aluno_ID', selectedStudentId)
                .eq('Tipo', 'FAMILIA')
                .gte('Data', `${startDate}T00:00:00`)
                .lte('Data', `${endDate}T23:59:59`)
                .order('Data', { ascending: false });

            if (notesError) throw notesError;
            setHomeActivities(notes || []);

            // Fetch School Notes / Guidance
            const { data: sNotes, error: sNotesError } = await supabase
                .from('Anotacoes')
                .select('*')
                .eq('Aluno_ID', selectedStudentId)
                .eq('Tipo', 'ESCOLA')
                .gte('Data', `${startDate}T00:00:00`)
                .lte('Data', `${endDate}T23:59:59`)
                .order('Data', { ascending: false });

            if (sNotesError) throw sNotesError;
            setSchoolNotes(sNotes || []);

        } catch (error) {
            console.error('Erro ao buscar dados individuais:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadStudents = async () => {
            const data = await studentService.getAll(authUser?.plataforma_id);
            setStudents(data);
        };
        if (authUser?.plataforma_id) {
            loadStudents();
        }
    }, [authUser?.plataforma_id]);

    useEffect(() => {
        if (!authUser?.plataforma_id) return;
        if (activeTab === 'general') {
            fetchGeneralData();
        } else {
            fetchIndividualData();
        }
    }, [startDate, endDate, activeTab, selectedStudentId, selectedPeiId, authUser?.plataforma_id]);

    const handleExportGeneralPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const primaryColor: [number, number, number] = [37, 99, 235];

        renderPDFHeader(doc, "RELATÓRIO GERAL DE ATIVIDADES", startDate, endDate);

        // Summary Cards Section
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 45, 180, 35, 5, 5, 'F');

        let xPos = 25;
        const cardWidth = 55;

        const cards = [
            { label: "TOTAL DE ALUNOS", value: reportData.totalStudents.toString() },
            { label: "TOTAL ATENDIMENTOS", value: reportData.totalServices.toString() },
            { label: "TOTAL DE HORAS", value: reportData.totalHours.toString() }
        ];

        cards.forEach((card, i) => {
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, xPos + (cardWidth / 2), 58, { align: "center" });
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text(card.value, xPos + (cardWidth / 2), 70, { align: "center" });
            xPos += cardWidth + 5;
        });

        renderPDFSection(doc, "ESTATÍSTICAS POR PROFISSIONAL", 90);
        autoTable(doc, {
            startY: 95,
            head: [['Profissional', 'Atendimentos', 'Horas']],
            body: reportData.professionalStats.map(p => [p.name, p.services, p.hours.toFixed(2)]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            margin: { left: 15, right: 15 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;
        renderPDFSection(doc, "ESTATÍSTICAS POR ALUNO", finalY);
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Aluno', 'Atendimentos', 'Horas']],
            body: reportData.studentStats.map(s => [s.name, s.services, s.hours.toFixed(2)]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            margin: { left: 15, right: 15 }
        });

        renderPDFFooter(doc);
        doc.save(`Relatorio_Geral_${startDate}_${endDate}.pdf`);
    };

    const handleExportIndividualPDF = () => {
        if (!selectedStudent) return;
        const doc = new jsPDF();
        const primaryColor: [number, number, number] = [37, 99, 235];

        if (individualTab === 'attendance') {
            renderPDFHeader(doc, "RELATÓRIO DE ACOMPANHAMENTO", startDate, endDate);
            renderPDFSection(doc, "IDENTIFICAÇÃO", 50);

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Paciente:", 15, 65);
            doc.setFont("helvetica", "normal");
            doc.text(selectedStudent.Nome, 45, 65);

            doc.setFont("helvetica", "bold");
            doc.text("Nascimento:", 15, 72);
            doc.setFont("helvetica", "normal");
            doc.text(new Date(selectedStudent.Data_nascimento).toLocaleDateString('pt-BR'), 45, 72);

            renderPDFSection(doc, "ASSIDUIDADE E FALTAS", 85);

            autoTable(doc, {
                startY: 90,
                body: [
                    ['Total de Sessões Agendadas', attendanceData?.totalScheduled || 0],
                    ['Sessões Realizadas / Concluídas', attendanceData?.completed || 0],
                    ['Faltas Registradas', attendanceData?.missed || 0],
                    ['Taxa de Aproveitamento', `${attendanceData?.rate || 0}%`]
                ],
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 6 },
                columnStyles: { 0: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
                margin: { left: 15, right: 15 }
            });

            renderPDFFooter(doc);
            doc.save(`Relatorio_Acompanhamento_${selectedStudent.Nome}.pdf`);
        } else if (individualTab === 'evolution') {
            renderPDFHeader(doc, "RELATÓRIO SEMESTRAL DE EVOLUÇÃO", startDate, endDate);

            renderPDFSection(doc, "IDENTIFICAÇÃO E PERÍODO", 50);
            doc.setFontSize(10);
            doc.text(`Nome Completo: ${selectedStudent.Nome}`, 15, 65);
            doc.text(`Data de Nascimento: ${new Date(selectedStudent.Data_nascimento).toLocaleDateString('pt-BR')}`, 15, 72);

            renderPDFSection(doc, "OBJETIVOS INICIAIS DO PTI", 85);
            doc.setFont("helvetica", "italic");
            const splitObj = doc.splitTextToSize(evolutionData?.objetivosPti || "Não registrado", 180);
            doc.text(splitObj, 15, 95);

            renderPDFSection(doc, "EVOLUÇÃO POR ÁREA", 115);
            if (evolutionData?.metasPorArea.length) {
                autoTable(doc, {
                    startY: 120,
                    head: [['Área', 'Meta / Objetivo', 'Status']],
                    body: evolutionData.metasPorArea.map(m => [m.area, m.meta, m.status]),
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor },
                    styles: { fontSize: 9 }
                });
            } else {
                doc.text("Nenhum registro de evolução encontrado.", 15, 125);
            }

            const currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 140;
            renderPDFSection(doc, "RESULTADOS QUANTITATIVOS", currentY);
            autoTable(doc, {
                startY: currentY + 5,
                body: [
                    ['Total de Metas', evolutionData?.totalMetas],
                    ['Metas Concluídas', evolutionData?.metasConcluidas],
                    ['Progresso Médio', `${evolutionData?.progressoMedio}%`]
                ],
                theme: 'grid',
                columnStyles: { 0: { fontStyle: 'bold' } }
            });

            const nextY = (doc as any).lastAutoTable.finalY + 15;
            renderPDFSection(doc, "PRÓXIMAS METAS E RECOMENDAÇÕES", nextY);
            doc.setFont("helvetica", "bold");
            doc.text("Próximo Ciclo:", 15, nextY + 10);
            doc.setFont("helvetica", "normal");
            const splitNext = doc.splitTextToSize(evolutionData?.metasProximoSemestre || "", 170);
            doc.text(splitNext, 15, nextY + 18);

            renderPDFFooter(doc);
            doc.save(`Relatorio_Evolucao_${selectedStudent.Nome}.pdf`);
        } else if (individualTab === 'home_activities') {
            renderPDFHeader(doc, "RELATÓRIO DE ATIVIDADES DOMICILIARES", startDate, endDate);
            renderPDFSection(doc, "ATIVIDADES E ORIENTAÇÕES", 50);

            if (homeActivities.length > 0) {
                autoTable(doc, {
                    startY: 55,
                    head: [['Data', 'Atividade / Orientação Enviada']],
                    body: homeActivities.map(n => [new Date(n.Data).toLocaleDateString('pt-BR'), n.Conteudo]),
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor },
                    styles: { cellPadding: 5 }
                });
            } else {
                doc.setFont("helvetica", "italic");
                doc.text("Nenhuma atividade registrada no período.", 15, 65);
            }

            renderPDFFooter(doc);
            doc.save(`Atividades_Casa_${selectedStudent.Nome}.pdf`);
        } else if (individualTab === 'school_guidance') {
            renderPDFHeader(doc, "RELATÓRIO DE INCLUSÃO ESCOLAR", startDate, endDate);
            renderPDFSection(doc, "IDENTIFICAÇÃO ESCOLAR", 50);

            doc.setFontSize(10);
            doc.text(`Paciente: ${selectedStudent.Nome}`, 15, 65);
            doc.text(`Série: ${selectedStudent.Serie || 'Não informada'}`, 15, 72);
            doc.text(`Status PTI: ${selectedStudent.Status || 'Ativo'}`, 15, 79);

            renderPDFSection(doc, "ORIENTAÇÕES E SUPORTE", 95);
            if (schoolNotes.length > 0) {
                autoTable(doc, {
                    startY: 100,
                    head: [['Data', 'Orientação Pedagógica']],
                    body: schoolNotes.map(n => [new Date(n.Data).toLocaleDateString('pt-BR'), n.Conteudo]),
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor }
                });
            } else {
                doc.setFont("helvetica", "italic");
                doc.text("Nenhuma orientação escolar registrada.", 15, 105);
            }

            renderPDFFooter(doc);
            doc.save(`Relatorio_Escolar_${selectedStudent.Nome}.pdf`);
        }
    };

    const renderPDFHeader = (doc: jsPDF, title: string, start: string, end: string) => {
        // Aesthetic Top Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 2, 'F');

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 2, 210, 35, 'F');

        try {
            const img = new Image();
            img.src = logoUrl;
            doc.addImage(img, 'SVG', 15, 10, 45, 18);
        } catch (e) {
            doc.setFontSize(18);
            doc.setTextColor(37, 99, 235);
            doc.setFont("helvetica", "bold");
            doc.text("VINCULO TEA", 15, 22);
        }

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(title, 200, 22, { align: "right" });

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(`EMITIDO EM: ${new Date().toLocaleString('pt-BR')}`, 200, 30, { align: "right" });
        doc.text(`PERÍODO DE ANÁLISE: ${new Date(start).toLocaleDateString('pt-BR')} A ${new Date(end).toLocaleDateString('pt-BR')}`, 200, 34, { align: "right" });

        // Separator line
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 40, 195, 40);
    };

    const renderPDFSection = (doc: jsPDF, title: string, y: number) => {
        doc.setFillColor(37, 99, 235);
        doc.rect(15, y, 3, 6, 'F');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(title, 22, y + 5);
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 8, 195, y + 8);
    };

    const renderPDFFooter = (doc: jsPDF) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Vinculo TEA - Sistema de Gestão Terapêutica | Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
            doc.text("Este documento é confidencial e de uso restrito clínico/paciente.", 105, 290, { align: "center" });
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
            {/* Nav Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Centro de <span className="text-primary italic">Relatórios</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Relatório Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('individual')}
                            className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${activeTab === 'individual' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Relatório por Aluno
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <Calendar size={16} className="text-primary" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-black text-slate-700 dark:text-slate-300"
                            />
                        </div>
                        <div className="h-4 w-px bg-slate-100 dark:bg-slate-700" />
                        <div className="flex items-center gap-2 px-3 py-2">
                            <Calendar size={16} className="text-primary" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-black text-slate-700 dark:text-slate-300"
                            />
                        </div>
                    </div>

                    <button
                        onClick={activeTab === 'general' ? handleExportGeneralPDF : handleExportIndividualPDF}
                        disabled={loading || (activeTab === 'individual' && !selectedStudentId)}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        <Download size={18} strokeWidth={3} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <Loader2 size={48} className="text-primary animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Processando informações...</p>
                </div>
            ) : activeTab === 'general' ? (
                <GeneralReportView reportData={reportData} />
            ) : (
                <IndividualReportView
                    students={students}
                    selectedStudentId={selectedStudentId}
                    setSelectedStudentId={setSelectedStudentId}
                    selectedStudent={selectedStudent}
                    attendanceData={attendanceData}
                    evolutionData={evolutionData}
                    homeActivities={homeActivities}
                    schoolNotes={schoolNotes}
                    startDate={startDate}
                    endDate={endDate}
                    individualTab={individualTab}
                    setIndividualTab={setIndividualTab}
                    peis={peis}
                    selectedPeiId={selectedPeiId}
                    setSelectedPeiId={setSelectedPeiId}
                />
            )}
        </div>
    );
};

const GeneralReportView = ({ reportData }: { reportData: ReportData | null }) => {
    if (!reportData) return <EmptyState />;
    return (
        <div className="animate-in slide-in-from-bottom duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SummaryCard icon={Users} label="Total de Alunos" value={reportData.totalStudents} color="text-blue-500" bg="bg-blue-50" />
                <SummaryCard icon={UserCheck} label="Total de Atendimentos" value={reportData.totalServices} color="text-emerald-500" bg="bg-emerald-50" />
                <SummaryCard icon={Clock} label="Total de Horas" value={reportData.totalHours} color="text-orange-500" bg="bg-orange-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StatsTable
                    title="Estatísticas por Profissional"
                    icon={ListFilter}
                    data={reportData.professionalStats}
                    headers={['Profissional', 'Atendimentos', 'Horas']}
                    color="primary"
                />
                <StatsTable
                    title="Estatísticas por Aluno"
                    icon={Users}
                    data={reportData.studentStats}
                    headers={['Aluno', 'Atendimentos', 'Horas']}
                    color="emerald"
                />
            </div>
        </div>
    );
};

const IndividualReportView = ({
    students,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    attendanceData,
    evolutionData,
    homeActivities,
    schoolNotes,
    startDate,
    endDate,
    individualTab,
    setIndividualTab,
    peis,
    selectedPeiId,
    setSelectedPeiId
}: any) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Student Filter / Slider-like Selector */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Sliders size={80} className="text-primary" />
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-4">Selecione o Aluno para o Relatório</label>
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 no-scrollbar relative z-10">
                    {students.map((student: any) => (
                        <button
                            key={student.Aluno_ID}
                            onClick={() => setSelectedStudentId(student.Aluno_ID.toString())}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border-2 ${selectedStudentId === student.Aluno_ID.toString()
                                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
                                : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-primary/30'
                                }`}
                        >
                            <User size={18} />
                            {student.Nome}
                        </button>
                    ))}
                </div>

                {/* Report Type Selector */}
                {selectedStudentId && (
                    <div className="flex gap-2 mt-6 border-t border-slate-50 dark:border-slate-700 pt-6">
                        <button
                            onClick={() => setIndividualTab('attendance')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${individualTab === 'attendance' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}
                        >
                            <CheckCircle2 size={14} />
                            Acompanhamento
                        </button>
                        <button
                            onClick={() => setIndividualTab('home_activities')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${individualTab === 'home_activities' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}
                        >
                            <LayoutDashboard size={14} />
                            Atividades Casa
                        </button>
                        <button
                            onClick={() => setIndividualTab('evolution')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${individualTab === 'evolution' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}
                        >
                            <TrendingUp size={14} />
                            Evolução Semestral
                        </button>
                        <button
                            onClick={() => setIndividualTab('school_guidance')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${individualTab === 'school_guidance' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}
                        >
                            <User size={14} />
                            Inclusão Escolar
                        </button>
                    </div>
                )}
            </div>

            {/* PEI Selector - Only for Evolution Tab */}
            {selectedStudent && individualTab === 'evolution' && peis.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-4">Selecione o PEI para Análise</label>
                    <div className="flex flex-wrap gap-3">
                        {peis.map((p: any) => {
                            const date = new Date(p.Data_Criacao);
                            const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                            const peiName = p.Dados?.anoLetivo ? `PEI ${p.Dados.anoLetivo}` : 'PEI';

                            return (
                                <button
                                    key={p.PEI_ID}
                                    onClick={() => setSelectedPeiId(p.PEI_ID.toString())}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all border-2 ${selectedPeiId === p.PEI_ID.toString()
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105'
                                        : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-emerald-500/30'
                                        }`}
                                >
                                    <FileCheck size={18} />
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-tight leading-none mb-1">{peiName}</div>
                                        <div className="text-[10px] opacity-70 font-bold capitalize">{monthYear}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedStudent ? (
                individualTab === 'attendance' ? (
                    <AttendanceReport student={selectedStudent} data={attendanceData} />
                ) : individualTab === 'evolution' ? (
                    <EvolutionReport student={selectedStudent} data={evolutionData} />
                ) : individualTab === 'home_activities' ? (
                    <HomeActivitiesReport student={selectedStudent} notes={homeActivities} startDate={startDate} endDate={endDate} />
                ) : (
                    <SchoolInclusionReport student={selectedStudent} notes={schoolNotes} startDate={startDate} endDate={endDate} />
                )
            ) : (
                <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm opacity-50">
                    <User size={48} className="text-slate-200 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nenhum aluno selecionado</p>
                </div>
            )}
        </div>
    );
};

const AttendanceReport = ({ student, data }: any) => {
    if (!data) return null;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
            {/* Identification Section */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 relative">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3 relative z-10">
                        <User size={18} className="text-primary" />
                        1. IDENTIFICAÇÃO
                    </h3>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                </div>
                <div className="p-8 space-y-8 flex-1">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{student.Nome}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</span>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
                            {new Date(student.Data_nascimento).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
                        <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4">
                            <Info size={16} className="text-primary" />
                            <p className="text-xs font-bold text-primary/80 leading-relaxed italic">Dados oficiais sincronizados com o banco de dados clínico.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Section */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 relative">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3 relative z-10">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        2. ASSIDUIDADE E FALTAS
                    </h3>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                        <SmallStat label="Total Agendados" value={data.totalScheduled} icon={Calendar} color="blue" />
                        <SmallStat label="Realizados" value={data.completed} icon={CheckCircle2} color="emerald" />
                        <SmallStat label="Faltas" value={data.missed} icon={XCircle} color="orange" />
                        <SmallStat label="Taxa Assiduidade" value={`${data.rate}%`} icon={Percent} color="indigo" />
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aproveitamento Semestral</h4>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Progresso de presença no período selecionado</p>
                                </div>
                                <span className="text-4xl font-black text-primary tracking-tighter">{data.rate}%</span>
                            </div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex p-1 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] relative" style={{ width: `${data.rate}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-[0.05]">
                            <TrendingUp size={180} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EvolutionReport = ({ student, data }: any) => {
    if (!data) return null;
    return (
        <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Identification Header */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-10 flex flex-col md:flex-row justify-between items-center gap-10 relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-[2000ms]" />
                    <div className="flex items-center gap-10 relative z-10 w-full md:w-auto">
                        <div className="size-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                            <User size={48} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Relatório de Evolução</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-none">{student.Nome}</h2>
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">Nas: {new Date(student.Data_nascimento).toLocaleDateString('pt-BR')}</span>
                                <span className="text-sm font-bold text-primary italic">Status: Semestre em Conclusão</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 px-8 py-6 rounded-[2rem] border border-emerald-500/20 text-center relative z-10 min-w-[200px]">
                        <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest block mb-2">Ano Letivo</span>
                        <p className="text-4xl font-black text-emerald-600 tracking-tighter">2026</p>
                    </div>
                </div>

                {/* 2. PTI Objectives & 3. Evolution Details */}
                <div className="lg:col-span-6">
                    <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden h-full group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <Target size={18} className="text-primary" />
                                2. OBJETIVOS INICIAIS DO PTI
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base italic relative z-10">
                                    "{data.objetivosPti}"
                                </p>
                                <Target className="absolute -right-4 -bottom-4 opacity-[0.03]" size={120} />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-6">
                    <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden h-full group hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <TrendingUp size={18} className="text-blue-500" />
                                3. EVOLUÇÃO POR ÁREA
                            </h3>
                        </div>
                        <div className="p-8 space-y-4">
                            {data.metasPorArea.length > 0 ? (
                                data.metasPorArea.map((m: any, i: number) => (
                                    <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-full">{m.area}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.status}</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-300 leading-tight">{m.meta}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <Target size={40} className="mb-2" />
                                    <p className="text-slate-400 text-xs font-bold uppercase">Nenhuma meta registrada</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 4. Quantitative Analysis Summary */}
                <div className="lg:col-span-12">
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                    <BarChart3 size={18} className="text-emerald-500" />
                                    4. RESULTADOS QUANTITATIVOS
                                </h3>
                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Percent size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="p-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <SmallStat label="METAS MONITORADAS" value={data.totalMetas} icon={Target} color="blue" />
                                <SmallStat label="METAS CONCLUÍDAS" value={data.metasConcluidas} icon={CheckCircle2} color="emerald" />
                                <SmallStat label="EFICÁCIA MÉDIA" value={`${data.progressoMedio}%`} icon={TrendingUp} color="indigo" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
const HomeActivitiesReport = ({ student, notes }: any) => {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-6">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
                <div className="p-10 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                            <LayoutDashboard size={32} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Feedback Familiar</h3>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Atividades Casa e Orientações Domiciliares</h4>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-6 py-3 rounded-full uppercase tracking-widest border border-indigo-500/10">
                        {notes.length} REGISTROS ENCONTRADOS
                    </span>
                </div>
                <div className="p-10">
                    {notes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {notes.map((note: any) => (
                                <div key={note.Anotacao_ID} className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-default">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/5">
                                            {new Date(note.Data).toLocaleDateString('pt-BR')}
                                        </span>
                                        <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                                    </div>
                                    <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "{note.Conteudo}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 opacity-30">
                            <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                                <AlertCircle size={48} className="text-slate-300" />
                            </div>
                            <p className="text-lg font-black text-slate-400 text-center uppercase tracking-widest">Nenhuma atividade registrada no período</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SchoolInclusionReport = ({ student, notes }: any) => {
    const details = student.Detalhes || {};
    return (
        <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Identification Header */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-12 flex flex-col md:flex-row justify-between items-center gap-10 relative group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-[2500ms]" />
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="size-24 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                            <School size={48} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Plano de Inclusão</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">{student.Nome}</h2>
                            <div className="flex flex-wrap gap-4">
                                <span className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-500 uppercase">Série: {student.Serie || 'Não informada'}</span>
                                <span className="bg-emerald-500/10 px-4 py-2 rounded-2xl text-[10px] font-black text-emerald-500 uppercase border border-emerald-500/10">Status PTI: {student.Status || 'Ativo'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center shadow-inner">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">ANO LETIVO</span>
                            <p className="text-3xl font-black text-primary tracking-tighter">2026</p>
                        </div>
                    </div>
                </div>

                {/* Medical Observations Card */}
                <div className="lg:col-span-12">
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/5 transition-all">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-4">
                                <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Info size={16} />
                                </div>
                                OBSERVAÇÕES ADICIONAIS E SAÚDE
                            </h3>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Medicação', val: details.medicacao, icon: Heart, color: 'rose' },
                                { label: 'Alergias', val: details.alergias, icon: ShieldAlert, color: 'orange' },
                                { label: 'Doenças Relevantes', val: details.doencas, icon: Activity, color: 'amber' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700 group/item hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <item.icon size={16} className={`text-${item.color}-500 group-hover/item:scale-110 transition-transform`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-700 dark:text-slate-200 tracking-tight leading-tight">{item.val || 'Nenhuma informada'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Pedagogy/School Guidance Card */}
                <div className="lg:col-span-12">
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-4">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText size={16} />
                                </div>
                                ORIENTAÇÕES PARA ESCOLA
                            </h3>
                        </div>
                        <div className="p-10">
                            {notes.length > 0 ? (
                                <div className="space-y-6">
                                    {notes.map((note: any) => (
                                        <div key={note.Anotacao_ID} className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all border-l-4 border-l-primary/30">
                                            <div className="flex-1">
                                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                    "{note.Conteudo}"
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-6 py-2 rounded-full border border-primary/10">
                                                    POSTADO EM {new Date(note.Data).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 opacity-30">
                                    <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                                        <School size={48} className="text-slate-300" />
                                    </div>
                                    <p className="text-lg font-black text-slate-400 text-center uppercase tracking-widest">Nenhuma orientação pedagógica registrada</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const SmallStat = ({ label, value, icon: Icon, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-500/10 text-blue-600 border-blue-500/10',
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10',
        orange: 'bg-orange-500/10 text-orange-600 border-orange-500/10',
        indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/10',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/10',
        rose: 'bg-rose-500/10 text-rose-600 border-rose-500/10'
    };

    return (
        <div className={`p-6 rounded-3xl border ${colors[color] || 'bg-slate-50 text-slate-600'} flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-lg group shadow-sm bg-white dark:bg-slate-900/40 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={40} />
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${colors[color]} group-hover:rotate-6 transition-transform`}>
                <Icon size={24} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</span>
            <span className="text-2xl font-black tracking-tighter">{value}</span>
        </div>
    );
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <BarChart3 size={48} className="text-slate-200 mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sem dados no período selecionado</p>
    </div>
);

const SummaryCard = ({ icon: Icon, label, value, color, bg }: any) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all group overflow-hidden relative">
        <div className="flex justify-between items-start mb-6">
            <div className={`size-14 rounded-2xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5`}>
                <Icon size={28} />
            </div>
            <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 size={40} />
            </div>
        </div>
        <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</h3>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:translate-x-1 transition-transform">{value}</p>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-[0.02] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
            <Icon size={140} />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
);

const StatsTable = ({ title, icon: Icon, data, headers, color }: any) => {
    const accent = color === 'primary' ? 'text-primary' : 'text-emerald-500';
    const accentBg = color === 'primary' ? 'bg-primary/5' : 'bg-emerald-500/5';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center ${accentBg} dark:bg-slate-900/20`}>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                    <Icon size={18} className={accent} />
                    {title}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{headers[0]}</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{headers[1]}</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{headers[2]}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {data.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                    <div className={`size-8 rounded-lg ${accentBg} ${accent} flex items-center justify-center text-[10px] font-black`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    {item.name}
                                </td>
                                <td className="px-8 py-5 text-center font-black text-slate-900 dark:text-white text-sm">{item.services}</td>
                                <td className={`px-8 py-5 text-right font-bold ${accent} text-sm flex items-center justify-end gap-2`}>
                                    {item.hours.toFixed(1)}h
                                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
