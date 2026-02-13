import { supabase } from './supabase';

export interface Execution {
    id: string;
    student_id: string;
    disciplina_id: string;
    data: string;
    atividade: string;
    nivel_suporte: 'parcial' | 'total' | 'sem suporte';
    tipo_barreira: 'cognitiva' | 'motora' | 'sensorial' | 'comportamental';
    status: 'concluido' | 'andamento' | 'replanejar';
    observacoes?: string;
    created_at?: string;
}

export const executionService = {
    async getAllByStudent(studentId: string) {
        const { data, error } = await supabase
            .from('Acompanhamentos')
            .select(`
                *,
                Disciplinas (Nome)
            `)
            .eq('Aluno_ID', studentId)
            .order('Data', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(execution: Omit<Execution, 'id'>) {
        const { data, error } = await supabase
            .from('Acompanhamentos')
            .insert([{
                Aluno_ID: execution.student_id,
                Disciplina_ID: parseInt(execution.disciplina_id),
                Data: execution.data,
                Atividade: execution.atividade,
                Nivel_suporte: execution.nivel_suporte,
                Tipo_barreira: execution.tipo_barreira,
                Status: execution.status,
                Observacoes: execution.observacoes
            }])
            .select();

        if (error) throw error;
        return data[0];
    }
};
