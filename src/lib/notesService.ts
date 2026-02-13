import { supabase } from './supabase';

export interface Note {
    id: string;
    student_id: string;
    tipo: 'Geral' | 'Comportamental' | 'Acadêmico' | 'Saúde' | 'Família';
    data: string;
    conteudo: string;
    created_at?: string;
}

const TYPE_MAP: Record<string, string> = {
    'Geral': 'GERAL',
    'Comportamental': 'COMPORTAMENTO',
    'Acadêmico': 'ACADEMICA',
    'Saúde': 'SAUDE',
    'Família': 'FAMILIA',
    'GERAL': 'Geral',
    'COMPORTAMENTO': 'Comportamental',
    'ACADEMICA': 'Acadêmico',
    'SAUDE': 'Saúde',
    'FAMILIA': 'Família'
};

export const notesService = {
    async getAllByStudent(studentId: string): Promise<Note[]> {
        const { data, error } = await supabase
            .from('Anotacoes')
            .select('*')
            .eq('Aluno_ID', studentId)
            .order('Data', { ascending: false });

        if (error) throw error;
        return (data || []).map(n => ({
            id: n.Anotacao_ID,
            student_id: n.Aluno_ID,
            tipo: (TYPE_MAP[n.Tipo] || 'Geral') as Note['tipo'],
            data: n.Data,
            conteudo: n.Conteudo
        }));
    },

    async create(note: Omit<Note, 'id'>) {
        const { data, error } = await supabase
            .from('Anotacoes')
            .insert([{
                Aluno_ID: note.student_id,
                Tipo: TYPE_MAP[note.tipo] || 'GERAL',
                Data: note.data,
                Conteudo: note.conteudo
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id: string, updates: Partial<Note>) {
        const { data, error } = await supabase
            .from('Anotacoes')
            .update({
                Tipo: updates.tipo ? TYPE_MAP[updates.tipo] : undefined,
                Data: updates.data,
                Conteudo: updates.conteudo
            })
            .eq('Anotacao_ID', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('Anotacoes')
            .delete()
            .eq('Anotacao_ID', id);

        if (error) throw error;
        return true;
    }
};
