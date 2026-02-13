import { supabase } from './supabase';

export interface Discipline {
    id: string;
    nome: string;
    descricao?: string;
    status: string;
}

export const disciplinesService = {
    async getAll(plataforma_id?: number) {
        let query = supabase
            .from('Disciplinas')
            .select('*');

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query.order('Nome', { ascending: true });

        if (error) throw error;
        return data.map(d => ({
            id: d.Disciplina_ID.toString(),
            nome: d.Nome,
            descricao: d.Descricao,
            status: d.Status
        }));
    },

    async create(discipline: { nome: string; descricao?: string; plataforma_id?: number }) {
        const { data, error } = await supabase
            .from('Disciplinas')
            .insert([{
                Nome: discipline.nome,
                Descricao: discipline.descricao,
                Status: 'Ativo',
                Plataforma_ID: discipline.plataforma_id
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id: string, discipline: { nome: string; descricao?: string; status?: string; plataforma_id?: number }) {
        const { data, error } = await supabase
            .from('Disciplinas')
            .update({
                Nome: discipline.nome,
                Descricao: discipline.descricao,
                Status: discipline.status,
                Plataforma_ID: discipline.plataforma_id
            })
            .eq('Disciplina_ID', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('Disciplinas')
            .delete()
            .eq('Disciplina_ID', id);

        if (error) throw error;
    },

    async fetchCount(plataforma_id?: number) {
        let query = supabase
            .from('Disciplinas')
            .select('*', { count: 'exact', head: true });

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
    }
};
