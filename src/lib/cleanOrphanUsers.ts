import { supabase } from './supabase';

/**
 * Script para limpar usuários órfãos do sistema
 * Usuários órfãos = Existem no Supabase Auth mas não na tabela Usuarios
 * 
 * Execute este script quando houver erro de "e-mail já utilizado" 
 * mas o usuário não aparecer na lista
 */

export async function cleanOrphanAuthUsers() {


    try {
        // 1. Buscar todos os usuários da tabela Usuarios
        const { data: usuarios, error: usuariosError } = await supabase
            .from('Usuarios')
            .select('Email, auth_uid');

        if (usuariosError) {
            console.error('❌ Erro ao buscar usuários:', usuariosError);
            return;
        }

        const emailsRegistrados = new Set(usuarios?.map(u => u.Email.toLowerCase()) || []);





        return {
            usuariosCadastrados: emailsRegistrados.size,
            emails: Array.from(emailsRegistrados)
        };

    } catch (error) {
        console.error('❌ Erro na limpeza:', error);
    }
}

/**
 * Verifica se um e-mail específico tem conflito
 */
export async function checkEmailConflict(email: string) {
    const cleanEmail = email.trim().toLowerCase();



    // Verificar na tabela Usuarios
    const { data: usuarioData } = await supabase
        .from('Usuarios')
        .select('Usuario_ID, Nome, Email, Status')
        .eq('Email', cleanEmail)
        .maybeSingle();



    return { existeNaTabela: !!usuarioData, dados: usuarioData };
}

// Exportar funções para uso no console do navegador
if (typeof window !== 'undefined') {
    (window as any).cleanOrphanAuthUsers = cleanOrphanAuthUsers;
    (window as any).checkEmailConflict = checkEmailConflict;


}
