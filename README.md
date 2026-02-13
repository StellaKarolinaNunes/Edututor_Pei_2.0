<p align="center">
  <img src="src/assets/images/logotipo_Horizontal.svg" alt="VínculoTEA" width="320" />
</p>

<h3 align="center">Sistema de Gestão Multidisciplinar para Educação Inclusiva</h3>

<p align="center">
  <strong>Centralizando o acompanhamento pedagógico e clínico de alunos com TEA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-RLS-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License" />
</p>

---

## Sobre o Projeto

O **VínculoTEA** é uma plataforma SaaS projetada para transformar a gestão educacional inclusiva. O sistema atua como uma ponte digital entre **escolas**, **famílias** e **especialistas** (psicólogos, fonoaudiólogos, terapeutas ocupacionais), centralizando todas as informações do **Plano Educacional Individualizado (PEI)** em um único ambiente seguro e acessível.

### O Problema

O acompanhamento pedagógico de alunos com TEA é frequentemente realizado de forma fragmentada — em papel, planilhas isoladas ou sistemas desconectados. Isso resulta em:

- Perda de dados históricos e dificuldade na análise de evolução
- Comunicação ineficiente entre profissionais e famílias
- Falta de visibilidade para gestores educacionais
- Dificuldade em cumprir requisitos legais de educação inclusiva

### A Solução

| Funcionalidade | Descrição |
| :--- | :--- |
| **Prontuário Centralizado** | Histórico clínico e pedagógico unificado por aluno |
| **PEI Automatizado** | Criação assistida com wizard de múltiplas etapas e validação integrada |
| **Central de Relatórios** | Dashboards com estatísticas em tempo real por aluno, profissional e escola |
| **Agenda Integrada** | Agendamento e acompanhamento de atendimentos multidisciplinares |
| **Gestão Administrativa** | Gerenciamento de escolas, turmas, professores e profissionais de saúde |
| **Controle de Acesso** | Permissões granulares por papel (Administrador, Profissional, Tutor, Família) |

---

## Funcionalidades Principais

### Gestão de Alunos
- Cadastro completo com dados pessoais, CID, gênero e detalhes clínicos
- Vinculação com família, escola e turma
- Upload de foto e documentação
- Histórico de PEIs e acompanhamentos

### Plano Educacional Individualizado (PEI)
- Wizard guiado com validação em cada etapa
- Definição de metas de curto e longo prazo
- Registro de pontos fortes, barreiras e estratégias
- Exportação em PDF com formatação profissional

### Central de Relatórios
- **Relatório Geral**: Visão consolidada com total de alunos, atendimentos e horas
- **Relatório Individual**: Frequência, evolução, atividades domiciliares e orientações
- Estatísticas por profissional e por aluno
- Exportação em PDF com cabeçalho institucional

### Gestão Administrativa
- Cadastro e gerenciamento de escolas da rede
- Gestão de turmas com turno e ano letivo
- Cadastro de professores e profissionais de saúde
- Gestão de disciplinas e especialidades

### Agenda de Atendimentos
- Calendário visual com navegação por mês
- Agendamento vinculado a profissional e aluno
- Classificação por tipo de evento (Normal, Importante, Agendamento)
- Acompanhamento de status dos atendimentos

### Segurança e Controle de Acesso
- Autenticação via Supabase Auth com JWT
- Row Level Security (RLS) em todas as tabelas
- Isolamento de dados por plataforma (multi-tenancy)
- Permissões baseadas em papel com 4 níveis de acesso

---

## Stack Tecnológica

A arquitetura foi projetada com foco em **segurança**, **performance** e **escalabilidade**.

| Camada | Tecnologia | Versão | Papel |
| :--- | :--- | :---: | :--- |
| **Frontend** | React | 18.2 | Interface reativa com componentes modulares |
| **Build Tool** | Vite | 7.3 | Build ultrarrápido com HMR |
| **Linguagem** | TypeScript | 5.9 | Tipagem estrita para robustez do código |
| **Backend (BaaS)** | Supabase | 2.91 | Auth, Database, Storage e Edge Functions |
| **Banco de Dados** | PostgreSQL | 17 | Banco relacional com RLS e triggers |
| **Animações** | Framer Motion | 12.x | Micro-animações e transições fluidas |
| **Ícones** | Lucide React | 0.284 | Sistema de ícones consistente |
| **PDF** | jsPDF + AutoTable | 4.1 | Geração de relatórios em PDF |
| **Testes** | Vitest + Testing Library | 4.0 | Testes unitários e de integração |

---

## Arquitetura do Sistema

### Padrão: Monolito Modular

Cada funcionalidade é um módulo independente, facilitando manutenção e evolução sem impacto lateral.

```
src/
├── assets/                    # Imagens e recursos estáticos
│   └── images/                # Logotipos e ícones da marca
├── components/                # Componentes da Interface
│   ├── Auth/                  # Autenticação (Login, Registro)
│   ├── Dashboard/             # Módulos Principais
│   │   ├── Students/          # Gestão de Alunos
│   │   │   ├── components/    # AgendaView, StudentDetailView
│   │   │   ├── Tabs/          # PEIsTab, DisciplinesTab, NotesTab
│   │   │   └── wizards/       # PEIWizard, StudentRegistrationWizard
│   │   ├── Management/        # Gestão Administrativa
│   │   │   └── tabs/          # SchoolsTab, TeachersTab, ClassesTab
│   │   ├── Reports/           # Central de Relatórios
│   │   ├── Discipline/        # Gestão de Disciplinas
│   │   ├── Settings/          # Configurações e Usuários
│   │   └── Dashboard.tsx      # Layout principal e navegação
│   └── Erro/                  # Tratamento de erros (ErrorBoundary)
├── lib/                       # Camada de Serviços
│   ├── supabase.ts            # Cliente Supabase configurado
│   ├── useAuth.ts             # Hook de autenticação e permissões
│   ├── studentService.ts      # CRUD de alunos, famílias e profissionais
│   ├── schoolsService.ts      # CRUD de escolas
│   ├── classesService.ts      # CRUD de turmas
│   ├── disciplinesService.ts  # CRUD de disciplinas
│   ├── userService.ts         # Gestão de contas de usuário
│   └── peisService.ts         # CRUD de planos PEI
├── styles/                    # Design System (CSS Modules)
└── App.tsx                    # Entry point e roteamento
```

### Modelo de Dados

```
Plataformas ──┬── Escolas ──┬── Turmas
              │             ├── Professores ── Agenda
              │             └── Alunos ──┬── PEIs
              ├── Familias               ├── Acompanhamentos
              ├── Disciplinas            └── Anotacoes
              └── Usuarios
```

### Controle de Acesso (RBAC)

| Permissão | Admin | Profissional | Tutor | Família |
| :--- | :---: | :---: | :---: | :---: |
| Visualizar Alunos | ✅ | ✅ | ✅ | ✅* |
| Editar Alunos | ✅ | ✅ | ❌ | ❌ |
| Gestão Administrativa | ✅ | ✅** | ❌ | ❌ |
| Gerenciar Escolas | ✅ | ❌ | ❌ | ❌ |
| Central de Relatórios | ✅ | ✅ | ✅ | ✅* |
| Configurações/Usuários | ✅ | ❌ | ❌ | ❌ |

> *\* Apenas dados dos próprios filhos — \*\* Acesso parcial*

---

## Instalação e Configuração

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Git](https://git-scm.com/)
- Conta gratuita no [Supabase](https://supabase.com/)

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/StellaKarolinaNunes/Edututor_Pei_2.0.git
cd Edututor_Pei_2.0

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

> As credenciais estão disponíveis em: **Supabase Dashboard → Project Settings → API**

```bash
# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

O sistema estará disponível em **http://localhost:5173**

### Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript e gera o bundle de produção |
| `npm run preview` | Pré-visualiza o build de produção localmente |

---

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com políticas que garantem:

- **Autenticação obrigatória**: Apenas usuários autenticados acessam dados
- **Isolamento por plataforma**: Cada organização acessa apenas seus próprios dados
- **Triggers seguros**: Funções com `SECURITY DEFINER` e `search_path` fixo

### Multi-Tenancy

O sistema opera em modelo multi-tenant, onde cada plataforma (organização) possui seus dados completamente isolados através da coluna `Plataforma_ID` presente em todas as tabelas de domínio.

### Conformidade

- Alinhamento com requisitos da **LGPD** (Lei Geral de Proteção de Dados)
- Comunicação exclusivamente via **HTTPS**
- Tokens **JWT** com expiração automática

---

## Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel.

### Docker

```bash
docker-compose up --build
```

---

## Contribuindo

1. Faça um **Fork** do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-melhoria`
3. Faça commit das suas alterações: `git commit -m "feat: descrição da melhoria"`
4. Envie para a branch: `git push origin feature/minha-melhoria`
5. Abra um **Pull Request** para revisão

### Convenções de Commit

| Prefixo | Uso |
| :--- | :--- |
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação (sem mudança de lógica) |
| `refactor:` | Refatoração de código |
| `test:` | Adição ou correção de testes |

---

## Licença

Este projeto é proprietário e desenvolvido por **Stella Karolina Nunes**. Todos os direitos reservados.

---

<p align="center">
  <sub>Desenvolvido com dedicação para a educação inclusiva brasileira</sub>
</p>
