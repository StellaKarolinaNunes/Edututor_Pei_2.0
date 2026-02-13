import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Cliente temporário para criar usuários sem deslogar o admin atual
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

export interface UserData {
    id?: string;
    nome: string;
    email: string;
    tipo: 'GESTOR' | 'PROFISSIONAL' | 'FAMILIA';
    status?: string;
    plataforma_id?: number | null;
}

export const usersService = {
    async getAll() {
        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .order('Nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }

        return data.map((item: any) => ({
            id: item.Usuario_ID,
            nome: item.Nome,
            email: item.Email,
            tipo: item.Tipo,
            status: item.Status || 'Ativo',
            plataforma_id: item.Plataforma_ID
        }));
    },

    async create(user: UserData & { senha?: string }) {
        if (!user.senha) throw new Error('A senha é obrigatória para criar um novo acesso.');

        // 1. Criar o usuário no Supabase Auth
        const { data: authData, error: authError } = await authClient.auth.signUp({
            email: user.email,
            password: user.senha,
            options: {
                data: {
                    full_name: user.nome,
                    role: user.tipo
                }
            }
        });

        if (authError) {
            console.error('Erro no Auth:', authError);
            throw new Error(`Erro ao criar credenciais de login: ${authError.message}`);
        }

        // 2. Criar o registro na tabela Usuarios (pública)
        const { data, error } = await supabase
            .from('Usuarios')
            .insert([{
                auth_uid: authData.user?.id, // Vincula com o ID real do Auth (UUID)
                Nome: user.nome,
                Email: user.email,
                Tipo: user.tipo,
                Status: 'Ativo',
                Plataforma_ID: user.plataforma_id
            }])
            .select();

        if (error) {
            console.error('Erro ao salvar perfil:', error);
            // Se o auth funcionou mas o perfil não, o usuário existe mas não tem perfil.
            // O ideal seria deletar o auth user ou avisar.
            throw new Error(`Login criado, mas houve erro no perfil: ${error.message}`);
        }

        return data ? data[0] : null;
    },

    async update(id: string, user: Partial<UserData>) {
        const { data, error } = await supabase
            .from('Usuarios')
            .update({
                Nome: user.nome,
                Email: user.email,
                Tipo: user.tipo,
                Status: user.status
            })
            .eq('Usuario_ID', id)
            .select();

        if (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
        return data ? data[0] : null;
    },

    async delete(id: string) {
        // Nota: Apenas deleta da tabela Usuarios. 
        // Deletar do Auth exigiria service_role ou o próprio usuário logado.
        const { error } = await supabase
            .from('Usuarios')
            .delete()
            .eq('Usuario_ID', id);

        if (error) {
            console.error('Erro ao excluir usuário:', error);
            throw error;
        }
        return true;
    }
};
