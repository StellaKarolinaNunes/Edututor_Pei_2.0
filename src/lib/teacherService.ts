import { supabase } from './supabase';

export interface ProfessionalData {
    id?: string;
    nome: string;
    email: string;
    especialidade: string;
    registro?: string;
    telefone?: string;
    escola_id?: number | null;
}

export const teachersService = {
    async getAll() {
        const { data, error } = await supabase
            .from('Professores')
            .select(`
                *,
                Escolas (Nome)
            `)
            .order('Nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar profissionais:', error);
            throw error;
        }

        return data.map((item: any) => ({
            id: item.Professor_ID,
            nome: item.Nome,
            email: item.Email || '',
            especialidade: item.Especialidade,
            registro: item.Registro_Profissional,
            telefone: item.Telefone,
            escola_id: item.Escola_ID,
            escola_nome: item.Escolas?.Nome
        }));
    },

    async create(professional: ProfessionalData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado. Faça login novamente.');

        const payload: any = {
            Nome: professional.nome,
            Email: professional.email,
            Especialidade: professional.especialidade,
            Registro_Profissional: professional.registro,
            Telefone: professional.telefone,
            Escola_ID: professional.escola_id
        };

        const { data, error } = await supabase
            .from('Professores')
            .insert([payload])
            .select();

        if (error) {
            console.error('Erro ao criar profissional:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async update(id: string, professional: Partial<ProfessionalData>) {
        const payload: any = {
            Nome: professional.nome,
            Email: professional.email,
            Especialidade: professional.especialidade,
            Registro_Profissional: professional.registro,
            Telefone: professional.telefone,
            Escola_ID: professional.escola_id
        };

        const { data, error } = await supabase
            .from('Professores')
            .update(payload)
            .eq('Professor_ID', id)
            .select();

        if (error) {
            console.error('Erro ao atualizar profissional:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('Professores')
            .delete()
            .eq('Professor_ID', id);

        if (error) {
            console.error('Erro ao excluir profissional:', error);
            throw error;
        }
        return true;
    }
};
