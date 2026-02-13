import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { supabase } from '@/lib/supabase';

// Mock views to avoid complex child rendering if necessary, 
// but for integration we might want to keep some
vi.mock('@/components/MarketingSection/MarketingSection', () => ({
    default: () => <div data-testid="marketing-section">Marketing</div>
}));

describe('VínculoTEA Integration Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('Authentication Flow', () => {
        it('renders login form by default', async () => {
            render(<App />);
            await waitFor(() => expect(screen.queryByText(/Carregando Vinculo PEI/i)).not.toBeInTheDocument());
            expect(screen.getByText(/Bem-vindo de volta!/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/nome@instituicao.com.br/i)).toBeInTheDocument();
        });

        it('shows error message on invalid credentials', async () => {
            (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid login credentials' }
            });

            // Mock the check for existing email in Usuarios table
            (supabase.from as any).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            });

            render(<App />);
            await waitFor(() => expect(screen.queryByText(/Carregando Vinculo PEI/i)).not.toBeInTheDocument());

            const emailInput = screen.getByPlaceholderText(/nome@instituicao.com.br/i);
            const passwordInput = screen.getByPlaceholderText(/••••••••/i);
            const submitBtn = screen.getByText(/Entrar na plataforma/i);

            fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(screen.getByText(/Esta conta não existe em nosso sistema/i)).toBeInTheDocument();
            });
        });

        it('navigates to dashboard after successful login', async () => {
            // We use 'correctpassword' which is handled by our global mock in setup.ts
            // and triggers the auth event.

            // Mock User Profile Check
            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'Usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: { Usuario_ID: 'u1', Nome: 'Test User', Email: 'test@test.com', Tipo: 'Administrador', Status: 'Ativo' },
                            error: null
                        }),
                        single: vi.fn().mockResolvedValue({
                            data: { Usuario_ID: 'u1', Nome: 'Test User', Email: 'test@test.com', Tipo: 'Administrador', Status: 'Ativo' },
                            error: null
                        })
                    };
                }
                // Mock stats for dashboard
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    count: vi.fn().mockResolvedValue({ count: 10, error: null })
                };
            });

            // Mock useAuth return value for Dashboard
            vi.mock('@/lib/useAuth', () => ({
                useAuth: () => ({
                    user: { id: 'u1', nome: 'Test User', email: 'test@test.com', tipo: 'Administrador' },
                    permissions: {
                        canViewStudents: true,
                        canViewManagement: true,
                        canViewDisciplines: true,
                        canViewReports: true,
                        canViewSettings: true
                    },
                    loading: false
                })
            }));

            render(<App />);
            await waitFor(() => expect(screen.queryByText(/Carregando Vinculo PEI/i)).not.toBeInTheDocument());

            const emailInput = screen.getByPlaceholderText(/nome@instituicao.com.br/i);
            const passwordInput = screen.getByPlaceholderText(/••••••••/i);
            const submitBtn = screen.getByText(/Entrar na plataforma/i);

            fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
            fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
            fireEvent.click(submitBtn);

            // In real App.tsx, the onAuthStateChange would trigger a state change and show Dashboard
            // Since we mocked supabase, we can simulate the listener calling setView('dashboard') 
            // or just check if the session check in profile worked.

            await waitFor(() => {
                expect(screen.getByText(/Seja bem vindo\(a\) ao Vinculo Pei/i)).toBeInTheDocument();
            });
        });
    });

    describe('Dashboard Sidebar & Navigation', () => {
        it('changes views when clicking sidebar buttons', async () => {
            // Direct render of Dashboard to test subviews
            const { Dashboard } = await import('@/components/Dashboard/Dashboard');
            const mockUser = { email: 'admin@test.com' };

            render(<Dashboard user={mockUser} onLogout={() => { }} />);

            // Initially on Dashboard view
            expect(screen.getByText(/Visão geral completa do sistema educacional/i)).toBeInTheDocument();

            // Navigate to Students
            const studentsBtn = screen.getByRole('button', { name: /Alunos/i });
            fireEvent.click(studentsBtn);

            // Check if StudentsView is rendered (assuming it has some identifiable text)
            // Since it's lazy/imported, we might need to mock or just check if the "Dashboard" text is gone
            await waitFor(() => {
                expect(screen.queryByText(/Visão geral completa do sistema educacional/i)).not.toBeInTheDocument();
            });

            // Navigate back to Dashboard
            const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i });
            fireEvent.click(dashboardBtn);

            await waitFor(() => {
                expect(screen.getByText(/Visão geral completa do sistema educacional/i)).toBeInTheDocument();
            });
        });
    });

    describe('Security & Permissions', () => {
        it('restricts sidebar items based on user type', async () => {
            // Mock useAuth for a "Família" user (limited permissions)
            const { useAuth } = await import('@/lib/useAuth');
            vi.mock('@/lib/useAuth', () => ({
                useAuth: () => ({
                    user: { id: 'u2', nome: 'Parent User', email: 'parent@test.com', tipo: 'Família' },
                    permissions: {
                        canViewStudents: true,
                        canViewManagement: false,
                        canViewDisciplines: false,
                        canViewReports: true,
                        canViewSettings: false
                    },
                    loading: false
                })
            }));

            const { Dashboard } = await import('@/components/Dashboard/Dashboard');
            render(<Dashboard user={{ email: 'parent@test.com' }} onLogout={() => { }} />);

            // Should see Alunos and Relatórios
            expect(screen.getByRole('button', { name: /Alunos/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Relatórios/i })).toBeInTheDocument();

            // Should NOT see Gerenciamento or Disciplinas
            expect(screen.queryByRole('button', { name: /Gerenciamento/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Disciplinas/i })).not.toBeInTheDocument();
        });
    });
});
