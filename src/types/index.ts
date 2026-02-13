export interface Student {
    id: string;
    nome: string;
    escola: string;
    status: 'Ativo' | 'Inativo';
    responsavel: string;
    foto?: string;
    cid?: string;
    serie?: string;
    dataNascimento?: string;
    genero?: string;
    dataCadastro?: string;
    detalhes?: any;
    escola_id?: number;
    familia_id?: number;
}

export interface School {
    id: number;
    nome: string;
    cnpj?: string;
    telefone?: string;
    endereco?: string;
    created_at?: string;
}

export interface Professional {
    id: number;
    professor_id?: number;
    nome: string;
    email: string;
    especialidade: string;
    registro?: string;
    telefone?: string;
    escola_id?: number;
    avatar?: string;
    cid?: string;
    categoria?: 'Professor' | 'Profissional de Saúde';
}

export interface AgendaEvent {
    id: number;
    titulo: string;
    data: string;
    horario: string;
    professor_id: number;
    professor_nome?: string;
    tipo_evento: 'Agendamento' | 'Importante' | 'Normal';
    descricao: string;
    status: string;
}

export interface Family {
    id: number;
    nome_responsavel: string;
    telefone_responsavel?: string;
    email_responsavel?: string;
}
