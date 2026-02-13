import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Separate client for creating users without logging out the current admin
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'sb-admin-management-auth'
    }
});

export interface UserProfile {
    id: string;
    nome: string;
    email: string;
    role: 'Admin' | 'Tutor' | 'Profissional';
    foto?: string;
    escola_id?: number;
}

export const userService = {
    async getAll() {
        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .order('Nome', { ascending: true });

        if (error) throw error;
        // Map 'Tipo' to 'Tipo_Acesso' for frontend consistency
        return data.map(u => ({
            ...u,
            Tipo_Acesso: u.Tipo
        }));
    },

    async create(userData: any) {
        if (!userData.email || typeof userData.email !== 'string') {
            throw new Error('E-mail é obrigatório.');
        }

        const cleanEmail = userData.email.trim().toLowerCase();



        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            throw new Error(`Formato de e-mail inválido: "${cleanEmail}". Use o formato: nome@dominio.com`);
        }

        // Validate password
        if (!userData.senha || userData.senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }



        // VERIFICAÇÃO PRÉVIA: Checar se já existe na tabela Usuarios

        const { data: existingUser } = await supabase
            .from('Usuarios')
            .select('Usuario_ID, Nome, Email')
            .eq('Email', cleanEmail)
            .maybeSingle();

        if (existingUser) {

            throw new Error(`Este e-mail já está cadastrado para o usuário: ${existingUser.Nome}`);
        }



        try {
            // ETAPA 1: Criar conta de autenticação usando client isolado (não desloga o admin)

            const { data: authData, error: authError } = await authClient.auth.signUp({
                email: cleanEmail,
                password: userData.senha,
                options: {
                    data: {
                        nome: userData.nome,
                        role: userData.role
                    }
                }
            });

            if (authError) {
                console.error('❌ Erro ao criar conta de autenticação:', authError.message);

                if (authError.message.includes('already registered')) {
                    throw new Error('Este e-mail já está sendo utilizado por outro usuário no sistema.');
                }
                if (authError.message.includes('Database error')) {
                    // The trigger handle_new_auth_user may have failed, but the auth user
                    // might still have been created. Check if we got a user back.
                    console.warn('⚠️ Erro de banco no trigger. Verificando se o auth user foi criado...');
                    if (!authData?.user?.id) {
                        throw new Error(`Erro ao criar conta: ${authError.message}`);
                    }
                    // Auth user was created despite the trigger error. Continue.

                } else {
                    throw new Error(`Erro ao criar conta: ${authError.message}`);
                }
            }



            // ETAPA 2: Verificar se o trigger já criou o registro na tabela Usuarios
            const { data: triggerCreated } = await supabase
                .from('Usuarios')
                .select('Usuario_ID')
                .eq('Email', cleanEmail)
                .maybeSingle();

            if (triggerCreated) {
                // O trigger já criou o registro, só precisa atualizar com os dados corretos

                const { error: updateError } = await supabase
                    .from('Usuarios')
                    .update({
                        auth_uid: authData.user?.id,
                        Nome: userData.nome,
                        Tipo: userData.role,
                        Foto: userData.avatar,
                        Status: 'Ativo',
                        Plataforma_ID: userData.plataforma_id
                    })
                    .eq('Usuario_ID', triggerCreated.Usuario_ID);

                if (updateError) {
                    console.error('⚠️ Erro ao atualizar registro do trigger:', updateError);
                }
            } else {
                // ETAPA 2b: Criar registro na tabela Usuarios manualmente

                const { data: newUser, error: profileError } = await supabase
                    .from('Usuarios')
                    .insert([{
                        auth_uid: authData.user?.id,
                        Nome: userData.nome,
                        Email: cleanEmail,
                        Tipo: userData.role,
                        Foto: userData.avatar,
                        Status: 'Ativo',
                        Plataforma_ID: userData.plataforma_id
                    }])
                    .select()
                    .single();

                if (profileError) {
                    console.error('❌ Erro ao criar perfil:', profileError);
                    throw new Error(`Erro ao salvar perfil do usuário: ${profileError.message}`);
                }



                // ETAPA 3: Se for profissional, criar vínculo com escola
                if (userData.role === 'Profissional' && userData.escola_id) {

                    const { error: teacherError } = await supabase
                        .from('Professores')
                        .insert([{
                            Usuario_ID: newUser.Usuario_ID,
                            Nome: userData.nome,
                            Email: cleanEmail,
                            Escola_ID: userData.escola_id,
                            Especialidade: 'Educação Regular',
                            Plataforma_ID: userData.plataforma_id
                        }]);

                    if (teacherError) {
                        console.error('⚠️ Erro ao criar vínculo de professor:', teacherError);
                    }
                }
            }


            return authData.user;

        } catch (error: any) {
            console.error('❌ Erro geral na criação:', error);
            throw error;
        }
    },

    async update(id: string, updates: any) {
        const { error } = await supabase
            .from('Usuarios')
            .update({
                Nome: updates.nome,
                Tipo: updates.role,
                Foto: updates.avatar
            })
            .eq('Usuario_ID', id);

        if (error) throw error;

        // Update school link if professional
        if (updates.role === 'Profissional' && updates.escola_id) {
            await supabase
                .from('Professores')
                .update({ Escola_ID: updates.escola_id })
                .eq('Usuario_ID', id);
        }

        return true;
    },

    async delete(id: string) {
        // 1. Check if user is a teacher
        const { data: teacher } = await supabase
            .from('Professores')
            .select('Professor_ID')
            .eq('Usuario_ID', id)
            .single();

        if (teacher) {
            const profId = teacher.Professor_ID;

            // 2. Cascade cleanup for teacher dependent data
            // nullify or delete depending on business importance
            await supabase.from('Disponibilidade').delete().eq('Professor_ID', profId);
            await supabase.from('Turmas').update({ Professor_ID: null }).eq('Professor_ID', profId);
            await supabase.from('Aulas').update({ Professor_ID: null }).eq('Professor_ID', profId);
            await supabase.from('Relatorios_PEI').update({ Professor_ID: null }).eq('Professor_ID', profId);
            await supabase.from('Avaliacoes').update({ Professor_ID: null }).eq('Professor_ID', profId);

            // 3. Delete from Professors table
            await supabase.from('Professores').delete().eq('Professor_ID', profId);
        }

        // 4. Cleanup User level data
        await supabase.from('Anotacoes').delete().eq('Usuario_ID', id);

        // 5. Finally delete from Usuarios
        const { error } = await supabase
            .from('Usuarios')
            .delete()
            .eq('Usuario_ID', id);

        if (error) throw error;
        return true;
    }
};
