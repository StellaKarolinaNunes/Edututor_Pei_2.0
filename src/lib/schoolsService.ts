import { supabase } from './supabase';

export interface SchoolData {
    id?: string;
    nome: string;
    cnpj?: string;
    telefone?: string;
    endereco?: string;
    status?: string;
    plataforma_id?: number;
}

export const schoolsService = {
    async getAll(plataforma_id?: number) {
        let query = supabase
            .from('Escolas')
            .select('*');

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query.order('Nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar escolas:', error);
            throw error;
        }

        // Map capitalized columns to camelCase for the frontend
        return data.map((item: any) => ({
            id: item.Escola_ID,
            nome: item.Nome,
            cnpj: item.CNPJ,
            telefone: item.Telefone,
            endereco: item.Endereco,
            status: item.Status || 'Ativo'
        }));
    },

    async create(school: SchoolData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado. Faça login novamente.');

        // Map camelCase to capitalized columns
        const { data, error } = await supabase
            .from('Escolas')
            .insert([{
                Nome: school.nome,
                CNPJ: school.cnpj || null,
                Telefone: school.telefone || null,
                Endereco: school.endereco,
                Status: 'Ativo',
                Plataforma_ID: school.plataforma_id
            }])
            .select();

        if (error) {
            console.error('Erro ao criar escola:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async update(id: string, school: Partial<SchoolData>) {
        const { data, error } = await supabase
            .from('Escolas')
            .update({
                Nome: school.nome,
                CNPJ: school.cnpj,
                Telefone: school.telefone,
                Endereco: school.endereco,
                Status: school.status,
                Plataforma_ID: school.plataforma_id
            })
            .eq('Escola_ID', id)
            .select();

        if (error) {
            console.error('Erro ao atualizar escola:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async delete(id: string) {
        // First, nullify references in related tables to avoid FK constraint errors
        await Promise.all([
            supabase.from('Professores').update({ Escola_ID: null }).eq('Escola_ID', id),
            supabase.from('Turmas').update({ Escola_ID: null }).eq('Escola_ID', id),
            supabase.from('Alunos').update({ Escola_ID: null }).eq('Escola_ID', id)
        ]);

        const { error } = await supabase
            .from('Escolas')
            .delete()
            .eq('Escola_ID', id);

        if (error) {
            console.error('Erro ao excluir escola:', error);
            throw error;
        }
        return true;
    }
};
