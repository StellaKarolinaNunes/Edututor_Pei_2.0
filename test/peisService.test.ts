import { describe, it, expect, vi, beforeEach } from 'vitest';
import { peisService } from '@/lib/peisService';
import { supabase } from '@/lib/supabase';

describe('PEIService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAllByStudent returns formatted PEI list', async () => {
        const mockData = [{ PEI_ID: 1, Aluno_ID: 10, Status: 'Ativo', Dados: { note: 'test' }, Data_Criacao: '2023-01-01' }];
        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        });

        const peis = await peisService.getAllByStudent('10');
        expect(peis[0]).toEqual({
            id: '1',
            student_id: '10',
            status: 'Ativo',
            dados: { note: 'test' },
            data_criacao: '2023-01-01'
        });
    });

    it('create inserts new PEI correctly', async () => {
        const dados = { pedagogico: 'bom' };
        const mockResult = [{ PEI_ID: 1, Aluno_ID: 10, Status: 'Ativo', Dados: dados }];
        (supabase.from as any).mockReturnValue({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({ data: mockResult, error: null })
        });

        const result = await peisService.create('10', dados);
        expect(result.Status).toBe('Ativo');
        expect(result.Dados).toEqual(dados);
    });

    it('delete calls supabase with numeric ID', async () => {
        (supabase.from as any).mockReturnValue({
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null })
        });

        const result = await peisService.delete('123');
        expect(result).toBe(true);
    });
});
