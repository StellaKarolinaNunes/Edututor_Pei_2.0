import { supabase } from './supabase';

/**
 * Script para limpar usuários órfãos do sistema
 * Usuários órfãos = Existem no Supabase Auth mas não na tabela Usuarios
 * 
 * Execute este script quando houver erro de "e-mail já utilizado" 
 * mas o usuário não aparecer na lista
 */

export async function cleanOrphanAuthUsers() {
    console.log('🧹 Iniciando limpeza de usuários órfãos...');

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

        console.log(`📊 Total de usuários na tabela Usuarios: ${emailsRegistrados.size}`);
        console.log(`📋 E-mails cadastrados:`, Array.from(emailsRegistrados).join(', '));

        console.log('⚠️ ATENÇÃO: Este script requer privilégios de administrador para listar usuários do Auth.');
        console.log('💡 Para limpar usuários órfãos, você precisa:');
        console.log('   1. Acessar o painel do Supabase (dashboard.supabase.com)');
        console.log('   2. Ir em Authentication → Users');
        console.log('   3. Comparar com a lista acima');
        console.log('   4. Excluir manualmente usuários que não estão na lista');

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

    console.log(`🔍 Verificando conflito para: ${cleanEmail}`);

    // Verificar na tabela Usuarios
    const { data: usuarioData } = await supabase
        .from('Usuarios')
        .select('Usuario_ID, Nome, Email, Status')
        .eq('Email', cleanEmail)
        .maybeSingle();

    console.log('📊 Resultado da verificação:');
    console.log(`   • Na tabela Usuarios: ${usuarioData ? '✅ SIM' : '❌ NÃO'}`);

    if (usuarioData) {
        console.log(`   • Nome: ${usuarioData.Nome}`);
        console.log(`   • Status: ${usuarioData.Status}`);
        console.log(`   • ID: ${usuarioData.Usuario_ID}`);
    } else {
        console.log('⚠️ E-mail NÃO encontrado na tabela Usuarios');
        console.log('💡 Possível causa: Usuário órfão no Supabase Auth');
        console.log('🔧 Solução:');
        console.log('   1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/auth/users');
        console.log(`   2. Procure pelo e-mail: ${cleanEmail}`);
        console.log('   3. Exclua o usuário do Auth');
        console.log('   4. Tente criar novamente');
    }

    return { existeNaTabela: !!usuarioData, dados: usuarioData };
}

// Exportar funções para uso no console do navegador
if (typeof window !== 'undefined') {
    (window as any).cleanOrphanAuthUsers = cleanOrphanAuthUsers;
    (window as any).checkEmailConflict = checkEmailConflict;

    console.log('🛠️ Ferramentas de diagnóstico carregadas!');
    console.log('💡 Uso:');
    console.log('   • cleanOrphanAuthUsers() - Lista usuários cadastrados');
    console.log('   • checkEmailConflict("email@exemplo.com") - Verifica conflito de e-mail');
}
