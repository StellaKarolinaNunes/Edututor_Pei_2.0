/**
 * Script para criar o primeiro administrador do sistema
 * Execute no Console do Navegador (F12)
 * 
 * IMPORTANTE: Só execute se a tabela Usuarios estiver vazia!
 */

import { supabase } from './supabase';

async function criarPrimeiroAdmin() {
    const email = prompt("Digite o e-mail do administrador:", "admin@vinculotea.com");
    const senha = prompt("Digite a senha (mínimo 6 caracteres):", "");
    const nome = prompt("Digite o nome completo:", "Administrador Geral");

    if (!email || !senha || senha.length < 6) {
        console.error("❌ E-mail ou senha inválidos!");
        return;
    }



    try {
        // 1. Criar na tabela Usuarios PRIMEIRO

        const { data: usuario, error: usuarioError } = await supabase
            .from('Usuarios')
            .insert([{
                Nome: nome,
                Email: email.toLowerCase().trim(),
                Tipo: 'Administrador',
                Status: 'Ativo',
                auth_uid: null
            }])
            .select()
            .single();

        if (usuarioError) {
            console.error("❌ Erro ao criar na tabela Usuarios:", usuarioError);
            return;
        }



        // 2. Criar conta de autenticação

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password: senha,
            options: {
                data: {
                    nome: nome,
                    role: 'Administrador'
                }
            }
        });

        if (authError) {
            console.error("❌ Erro ao criar conta Auth:", authError);
            // Rollback
            await supabase.from('Usuarios').delete().eq('Usuario_ID', usuario.Usuario_ID);
            return;
        }



        // 3. Atualizar com auth_uid
        if (authData.user) {

            await supabase
                .from('Usuarios')
                .update({ auth_uid: authData.user.id })
                .eq('Usuario_ID', usuario.Usuario_ID);
        }



    } catch (error) {
        console.error("❌ Erro geral:", error);
    }
}

// Disponibilizar no console
declare global {
    interface Window {
        criarPrimeiroAdmin: typeof criarPrimeiroAdmin;
    }
}

if (typeof window !== 'undefined') {
    window.criarPrimeiroAdmin = criarPrimeiroAdmin;


}
