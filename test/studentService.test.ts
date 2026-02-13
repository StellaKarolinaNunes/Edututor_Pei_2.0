import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentService } from '@/lib/studentService';
import { supabase } from '@/lib/supabase';

describe('StudentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAll returns data ordered by name', async () => {
        const mockData = [{ Aluno_ID: '1', Nome: 'Arthur' }];
        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        });

        const students = await studentService.getAll();
        expect(students).toEqual(mockData);
        expect(supabase.from).toHaveBeenCalledWith('Alunos');
    });

    it('create inserts new student and returns result', async () => {
        const student = {
            nome: 'Test Student',
            data_nascimento: '2020-01-01',
            genero: 'Masculino',
            familia_id: 1,
            escola_id: 1
        };
        const mockResult = [{ Aluno_ID: '2', ...student }];
        (supabase.from as any).mockReturnValue({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({ data: mockResult, error: null })
        });

        const result = await studentService.create(student);
        expect(result).toEqual(mockResult[0]);
    });

    it('delete calls supabase delete with correct ID', async () => {
        (supabase.from as any).mockReturnValue({
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null })
        });

        const result = await studentService.delete('123');
        expect(result).toBe(true);
    });
});
