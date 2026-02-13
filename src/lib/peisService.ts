import { supabase } from './supabase';

export interface PEI {
    id: string;
    student_id: string;
    status: 'Rascunho' | 'Ativo' | 'Arquivado';
    dados: any; // Store the full wizard state here
    data_criacao?: string;
}

export const peisService = {
    async getAllByStudent(studentId: string) {
        const { data, error } = await supabase
            .from('PEIs')
            .select('*')
            .eq('Aluno_ID', studentId)
            .order('Data_Criacao', { ascending: false });

        if (error) throw error;
        return data.map(p => ({
            id: p.PEI_ID.toString(),
            student_id: p.Aluno_ID.toString(),
            status: p.Status,
            dados: p.Dados || {},
            data_criacao: p.Data_Criacao
        }));
    },

    async create(studentId: string, dados: any) {
        const { data, error } = await supabase
            .from('PEIs')
            .insert([{
                Aluno_ID: parseInt(studentId),
                Status: 'Ativo',
                Dados: dados
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id: string, updates: { status?: string; dados?: any }) {
        const updateObj: any = {};
        if (updates.status) updateObj.Status = updates.status;
        if (updates.dados) updateObj.Dados = updates.dados;

        const { data, error } = await supabase
            .from('PEIs')
            .update(updateObj)
            .eq('PEI_ID', parseInt(id))
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('PEIs')
            .delete()
            .eq('PEI_ID', parseInt(id));

        if (error) throw error;
        return true;
    }
};
