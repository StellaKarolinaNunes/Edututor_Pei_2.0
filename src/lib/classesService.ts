import { supabase } from './supabase';

export interface ClassData {
    id?: string;
    nome: string;
    turno: string;
    ano_letivo: string;
    escola_id?: number | null;
    plataforma_id?: number;
}

export const classesService = {
    async getAll(plataforma_id?: number) {
        let query = supabase
            .from('Turmas')
            .select(`
                *,
                Escolas (Nome)
            `);

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query.order('Nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar turmas:', error);
            throw error;
        }

        return data.map((item: any) => ({
            id: item.Turma_ID,
            nome: item.Nome,
            turno: item.Turno,
            ano_letivo: item.Ano_Letivo,
            escola_id: item.Escola_ID,
            escola_nome: item.Escolas?.Nome
        }));
    },

    async create(classData: ClassData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('Turmas')
            .insert([{
                Nome: classData.nome,
                Turno: classData.turno,
                Ano_Letivo: classData.ano_letivo,
                Escola_ID: classData.escola_id,
                Plataforma_ID: classData.plataforma_id
            }])
            .select();

        if (error) {
            console.error('Erro ao criar turma:', error);
            throw error;
        }
        return data[0];
    },

    async update(id: string, classData: Partial<ClassData>) {
        const { data, error } = await supabase
            .from('Turmas')
            .update({
                Nome: classData.nome,
                Turno: classData.turno,
                Ano_Letivo: classData.ano_letivo,
                Escola_ID: classData.escola_id,
                Plataforma_ID: classData.plataforma_id
            })
            .eq('Turma_ID', id)
            .select();

        if (error) {
            console.error('Erro ao atualizar turma:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('Turmas')
            .delete()
            .eq('Turma_ID', id);

        if (error) {
            console.error('Erro ao excluir turma:', error);
            throw error;
        }
        return true;
    }
};
