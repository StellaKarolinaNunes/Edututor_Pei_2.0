import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    nome: string;
    email: string;
    tipo: 'Administrador' | 'Profissional' | 'Tutor' | 'Família';
    escola_id?: number;
    escola_nome?: string;
    plataforma_id?: number;
    foto?: string;
}

export interface Permissions {
    canViewStudents: boolean;
    canEditStudents: boolean;
    canDeleteStudents: boolean;
    canViewManagement: boolean;
    canEditSchools: boolean;
    canEditTeachers: boolean;
    canEditClasses: boolean;
    canViewReports: boolean;
    canExportReports: boolean;
    canViewSettings: boolean;
    canManageUsers: boolean;
    canViewDisciplines: boolean;
    canEditDisciplines: boolean;
    canViewAllSchools: boolean; // Apenas Admin
}

const ROLE_PERMISSIONS: Record<string, Permissions> = {
    'Administrador': {
        canViewStudents: true,
        canEditStudents: true,
        canDeleteStudents: true,
        canViewManagement: true,
        canEditSchools: true,
        canEditTeachers: true,
        canEditClasses: true,
        canViewReports: true,
        canExportReports: true,
        canViewSettings: true,
        canManageUsers: true,
        canViewDisciplines: true,
        canEditDisciplines: true,
        canViewAllSchools: true
    },
    'Profissional': {
        canViewStudents: true,
        canEditStudents: true,
        canDeleteStudents: false, // Profissionais não podem excluir
        canViewManagement: true,
        canEditSchools: false,
        canEditTeachers: false,
        canEditClasses: true,
        canViewReports: true,
        canExportReports: true,
        canViewSettings: false,
        canManageUsers: false,
        canViewDisciplines: true,
        canEditDisciplines: true,
        canViewAllSchools: false // Apenas sua escola
    },
    'Tutor': {
        canViewStudents: true,
        canEditStudents: false, // Tutores apenas visualizam
        canDeleteStudents: false,
        canViewManagement: false,
        canEditSchools: false,
        canEditTeachers: false,
        canEditClasses: false,
        canViewReports: true,
        canExportReports: false,
        canViewSettings: false,
        canManageUsers: false,
        canViewDisciplines: true,
        canEditDisciplines: false,
        canViewAllSchools: false
    },
    'Família': {
        canViewStudents: true, // Apenas seus filhos
        canEditStudents: false,
        canDeleteStudents: false,
        canViewManagement: false,
        canEditSchools: false,
        canEditTeachers: false,
        canEditClasses: false,
        canViewReports: true, // Apenas de seus filhos
        canExportReports: false,
        canViewSettings: false,
        canManageUsers: false,
        canViewDisciplines: false,
        canEditDisciplines: false,
        canViewAllSchools: false
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    setUser(null);
                    setPermissions(null);
                    setLoading(false);
                    return;
                }

                // Buscar perfil completo do usuário
                const { data: profileData } = await supabase
                    .from('Usuarios')
                    .select('*, Professores(Escola_ID, Escolas(Nome))')
                    .eq('auth_uid', authUser.id)
                    .single();

                if (profileData) {
                    const userProfile: UserProfile = {
                        id: profileData.Usuario_ID,
                        nome: profileData.Nome,
                        email: profileData.Email,
                        tipo: profileData.Tipo,
                        escola_id: profileData.Professores?.[0]?.Escola_ID,
                        escola_nome: profileData.Professores?.[0]?.Escolas?.Nome,
                        plataforma_id: profileData.Plataforma_ID,
                        foto: profileData.Foto
                    };

                    setUser(userProfile);
                    setPermissions(ROLE_PERMISSIONS[profileData.Tipo] || ROLE_PERMISSIONS['Família']);
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUserProfile();
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, permissions, loading };
};

export const getPermissions = (tipo: string): Permissions => {
    return ROLE_PERMISSIONS[tipo] || ROLE_PERMISSIONS['Família'];
};
