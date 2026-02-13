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

    console.log("🚀 Criando primeiro administrador...");

    try {
        // 1. Criar na tabela Usuarios PRIMEIRO
        console.log("📝 Criando registro na tabela Usuarios...");
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

        console.log("✅ Usuário criado na tabela. ID:", usuario.Usuario_ID);

        // 2. Criar conta de autenticação
        console.log("🔐 Criando conta de autenticação...");
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

        console.log("✅ Conta de autenticação criada!");

        // 3. Atualizar com auth_uid
        if (authData.user) {
            console.log("🔗 Vinculando auth_uid...");
            await supabase
                .from('Usuarios')
                .update({ auth_uid: authData.user.id })
                .eq('Usuario_ID', usuario.Usuario_ID);
        }

        console.log("🎉 ADMINISTRADOR CRIADO COM SUCESSO!");
        console.log("📧 E-mail:", email);
        console.log("👤 Nome:", nome);
        console.log("🔑 Tipo: Administrador");
        console.log("");
        console.log("Agora você pode:");
        console.log("1. Fazer login com essas credenciais");
        console.log("2. Ir em Ajustes → Usuários");
        console.log("3. Criar outros usuários normalmente");

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

    console.log("🛠️ Ferramenta carregada!");
    console.log("💡 Para criar o primeiro admin, execute:");
    console.log("   criarPrimeiroAdmin()");
}
