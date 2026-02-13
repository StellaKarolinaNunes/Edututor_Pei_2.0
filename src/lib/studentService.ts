import { supabase } from './supabase';

export interface StudentData {
    nome: string;
    data_nascimento: string;
    genero: string;
    serie?: string;
    status?: string;
    foto?: string;
    cid?: string;
    detalhes?: any;
    familia_id: number;
    escola_id: number;
    plataforma_id?: number;
}

export interface SchoolData {
    nome: string;
    cnpj?: string;
    telefone?: string;
    endereco?: string;
}

export interface ProfessionalData {
    nome: string;
    email: string;
    especialidade: string;
    registro?: string;
    telefone?: string;
    escola_id?: number;
    avatar?: string;
    cid?: string;
    plataforma_id?: number;
    categoria?: string;
}

export const studentService = {
    // --- ALUNOS ---
    async getAll(plataforma_id?: number) {
        let query = supabase
            .from('Alunos')
            .select(`
                *,
                Escolas (Nome),
                Familias (Nome_responsavel)
            `);

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query.order('Nome', { ascending: true });

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<StudentData>) {
        const { data, error } = await supabase
            .from('Alunos')
            .update({
                Nome: updates.nome,
                Data_nascimento: updates.data_nascimento,
                Serie: updates.serie,
                Status: updates.status,
                Foto: updates.foto,
                CID: updates.cid,
                Genero: updates.genero,
                Detalhes: updates.detalhes,
                Familia_ID: updates.familia_id,
                Escola_ID: updates.escola_id,
                Plataforma_ID: updates.plataforma_id
            })
            .eq('Aluno_ID', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async create(student: StudentData) {
        const { data, error } = await supabase
            .from('Alunos')
            .insert([{
                Nome: student.nome,
                Data_nascimento: student.data_nascimento,
                Genero: student.genero,
                Serie: student.serie,
                Status: student.status || 'Ativo',
                Foto: student.foto,
                CID: student.cid,
                Detalhes: student.detalhes,
                Familia_ID: student.familia_id,
                Escola_ID: student.escola_id,
                Plataforma_ID: student.plataforma_id
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('Alunos')
            .delete()
            .eq('Aluno_ID', id);

        if (error) throw error;
        return true;
    },

    async uploadPhoto(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('student-photos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('student-photos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async getOrCreateFamily(nomeResponsavel: string, telefone: string, email: string, plataforma_id?: number) {
        // Primeiro tenta buscar por email
        const { data: existing } = await supabase
            .from('Familias')
            .select('Familia_ID')
            .eq('Email', email)
            .single();

        if (existing) return existing.Familia_ID;

        // Se não existir, cria
        const { data, error } = await supabase
            .from('Familias')
            .insert([{
                Nome_responsavel: nomeResponsavel,
                Telefone: telefone,
                Email: email,
                Plataforma_ID: plataforma_id
            }])
            .select()
            .single();

        if (error) throw error;
        return data.Familia_ID;
    },

    async getOrCreateSchool(nomeEscola: string, plataforma_id?: number) {
        const { data: existing } = await supabase
            .from('Escolas')
            .select('Escola_ID')
            .eq('Nome', nomeEscola)
            .single();

        if (existing) return existing.Escola_ID;

        const { data, error } = await supabase
            .from('Escolas')
            .insert([{
                Nome: nomeEscola,
                Status: 'Ativo',
                Plataforma_ID: plataforma_id
            }])
            .select()
            .single();

        if (error) throw error;
        return data.Escola_ID;
    },

    // --- ESCOLAS ---
    async getAllSchools(plataforma_id?: number) {
        let query = supabase
            .from('Escolas')
            .select('*');

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query.order('Nome', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createSchool(school: SchoolData & { Plataforma_ID?: number }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('Escolas')
            .insert([{ ...school }])
            .select();

        if (error) throw error;
        return data[0];
    },

    // --- PROFISSIONAIS ---
    async getAllProfessionals(plataforma_id?: number) {
        let query = supabase
            .from('Professores')
            .select(`
                *,
                Usuarios (Nome, Email, Foto),
                Escolas (Nome)
            `);

        if (plataforma_id) {
            query = query.eq('Plataforma_ID', plataforma_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.map(p => ({
            ...p,
            Nome: p.Nome || p.Usuarios?.Nome || 'Sem Nome',
            Email: p.Email || p.Usuarios?.Email || 'Sem Email',
            CID: p.CID || ''
        }));
    },

    async createProfessional(professional: ProfessionalData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('Professores')
            .insert([{
                Nome: professional.nome,
                Email: professional.email,
                Especialidade: professional.especialidade,
                Registro_Profissional: professional.registro,
                Telefone: professional.telefone,
                Escola_ID: professional.escola_id,
                CID: professional.cid,
                Plataforma_ID: professional.plataforma_id,
                Categoria: professional.categoria || 'Professor'
            }])
            .select();

        if (error) throw error;

        // If we want to handle avatar/password, this would involve auth.signUp 
        // and updating Usuarios table, which requires admin privileges or specific flow.

        return data[0];
    },

    async updateProfessional(id: string, updates: Partial<ProfessionalData>) {
        const { data, error } = await supabase
            .from('Professores')
            .update({
                Nome: updates.nome,
                Email: updates.email,
                Especialidade: updates.especialidade,
                Registro_Profissional: updates.registro,
                Telefone: updates.telefone,
                Escola_ID: updates.escola_id,
                CID: updates.cid,
                Plataforma_ID: updates.plataforma_id,
                Categoria: updates.categoria
            })
            .eq('Professor_ID', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteProfessional(id: string) {
        const { error } = await supabase
            .from('Professores')
            .delete()
            .eq('Professor_ID', id);

        if (error) throw error;
        return true;
    }
};
