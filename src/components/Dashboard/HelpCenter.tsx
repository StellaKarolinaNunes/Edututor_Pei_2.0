import React, { useState, useMemo } from 'react';
import {
    Search, HelpCircle, Book, MessageSquare,
    Video, Phone, Mail, ChevronRight,
    ExternalLink, FileText, Shield, Zap, Clock, Instagram, X, ArrowLeft,
    CheckCircle2, AlertCircle, Info, Lock, Globe, Users, Settings, Filter
} from 'lucide-react';

interface Article {
    title: string;
    content: React.ReactNode;
}

interface Category {
    id: string;
    icon: any;
    title: string;
    desc: string;
    color: string;
    bg: string;
    articles: Article[];
}

export const HelpCenter: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const categories: Category[] = [
        {
            id: 'start',
            icon: Book,
            title: 'Primeiros Passos',
            desc: 'Aprenda o básico do VínculoTEA de forma simples',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            articles: [
                {
                    title: 'Como navegar no sistema',
                    content: (
                        <div className="space-y-6">
                            <p className="text-lg">O VínculoTEA foi desenhado para ser intuitivo. No lado esquerdo, você encontrará o menu principal:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2 font-black text-slate-800 uppercase text-[10px] tracking-widest text-primary">
                                        <Users size={16} /> Alunos
                                    </div>
                                    <p className="text-sm">Gestão completa dos seus pacientes/alunos, fichas técnicas e histórico.</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2 font-black text-slate-800 uppercase text-[10px] tracking-widest text-violet-500">
                                        <FileText size={16} /> Relatórios
                                    </div>
                                    <p className="text-sm">Central de documentos onde você gera o PEI e outros relatórios clínicos.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                                <h4 className="font-black text-blue-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={18} /> Dica de Ouro
                                </h4>
                                <p className="text-blue-800 text-sm">Sempre comece cadastrando os dados básicos da sua Instituição nos <strong>Ajustes</strong>. Isso fará com que seu logotipo apareça automaticamente nos PDFs gerados.</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Fluxo de Trabalho Ideal',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal pl-5 space-y-4 text-slate-600 font-medium">
                                <li><strong>Cadastro do Aluno:</strong> Preencha o perfil, anexe o CID e os contatos dos pais.</li>
                                <li><strong>Criação do PEI:</strong> Defina as barreiras e metas pedagógicas/terapêuticas.</li>
                                <li><strong>Acompanhamento Diário:</strong> Registre as atividades realizadas em cada sessão.</li>
                                <li><strong>Geração de Relatório:</strong> Compile tudo em um clique para a devolutiva.</li>
                            </ol>
                        </div>
                    )
                }
            ]
        },
        {
            id: 'reports',
            icon: FileText,
            title: 'Relatórios e PEIs',
            desc: 'Aprenda a gerar documentos que encantam as famílias',
            color: 'text-violet-500',
            bg: 'bg-violet-50',
            articles: [
                {
                    title: 'O Poder do PEI (Plano Educacional Individualizado)',
                    content: (
                        <div className="space-y-6">
                            <p>O PEI não é apenas um documento legal; é o mapa para o desenvolvimento do seu aluno. No VínculoTEA, desenvolvemos um gerador que se adapta às necessidades reais.</p>
                            <div className="space-y-3">
                                <h4 className="font-black text-slate-900">Seções do PEI:</h4>
                                <div className="space-y-2">
                                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <p className="font-bold text-slate-800">1. Identificação e Diagnóstico</p>
                                        <p className="text-xs text-slate-500">Dados cadastrais, CID-10 e histórico médico.</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <p className="font-bold text-slate-800">2. Mapeamento de Barreiras</p>
                                        <p className="text-xs text-slate-500">Onde o aluno tem mais dificuldade? (Comunicação, Social, Cognitivo).</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <p className="font-bold text-slate-800">3. Plano de Metas</p>
                                        <p className="text-xs text-slate-500">Objetivos mensuráveis para o próximo período.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Personalização de PDF',
                    content: (
                        <div className="space-y-4">
                            <p>Nossos PDFs são gerados com uma estética SaaS Premium. Para garantir a melhor qualidade:</p>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                <li>Use fotos de perfil nítidas para os alunos.</li>
                                <li>Preencha o campo "Resumo" com observações humanizadas.</li>
                                <li>Verifique se o período de análise está selecionado corretamente antes de exportar.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },
        {
            id: 'prod',
            icon: Zap,
            title: 'Dicas de Produtividade',
            desc: 'Trabalhe menos e entregue muito mais',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            articles: [
                {
                    title: 'Atalhos de Alta Velocidade',
                    content: (
                        <div className="space-y-4">
                            <p>Ganhe horas no seu dia usando estes recursos:</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-lg">
                                    <div>
                                        <p className="font-black text-xs uppercase text-primary mb-1">Busca Global</p>
                                        <p className="text-sm font-medium">Pesquise alunos, notas ou PEIs</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <kbd className="px-2 py-1 bg-white/20 rounded-lg border border-white/20 text-xs font-black">⌘</kbd>
                                        <kbd className="px-2 py-1 bg-white/20 rounded-lg border border-white/20 text-xs font-black">K</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                                    <div>
                                        <p className="font-black text-xs uppercase text-slate-400 mb-1">Multitasking</p>
                                        <p className="text-sm font-medium">Troque de abas sem carregar a página</p>
                                    </div>
                                    <div className="size-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-300">
                                        ⚡
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            id: 'security',
            icon: Shield,
            title: 'Privacidade e Segurança',
            desc: 'Seus dados clínicos protegidos por nível bancário',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            articles: [
                {
                    title: 'Proteção de Dados e LGPD',
                    content: (
                        <div className="space-y-6">
                            <p>Sabemos que você lida com informações sensíveis. Por isso, o VínculoTEA adota as seguintes medidas:</p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">Criptografia em Repouso</p>
                                        <p className="text-sm text-slate-500">Os dados são embaralhados no banco de dados, tornando-os ilegíveis para intrusos.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                    <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">Backup Automático Diário</p>
                                        <p className="text-sm text-slate-500">Nunca perca um registro. Realizamos cópias de segurança a cada 24 horas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]
        }
    ];

    const faqs = [
        { q: 'Como criar um novo PEI?', a: 'Vá na aba Alunos, selecione o aluno desejado e clique no botão "Novo PEI" no canto superior direito. Você poderá preencher metas, áreas de desenvolvimento e responsáveis.' },
        { q: 'Posso exportar relatórios em Excel?', a: 'Atualmente oferecemos exportação premium em PDF otimizada para impressão. O suporte para exportação de dados brutos em CSV/Excel está planejado para a próxima versão.' },
        { q: 'Como alterar minha senha?', a: 'Acesse Ajustes > Segurança. Lá você encontrará a opção de alterar senha atual ou configurar autenticação em dois fatores.' },
        { q: 'O sistema funciona offline?', a: 'O VínculoTEA é uma plataforma cloud para garantir a sincronia de dados em tempo real entre escola, clínica e família, exigindo conexão estável.' },
        { q: 'Como adicionar outros professores?', a: 'Administradores podem adicionar novos usuários na aba Ajustes > Usuários. Cada usuário terá permissões específicas baseadas em seu cargo.' },
        { q: 'O que fazer se o aluno não tiver CID ainda?', a: 'No campo CID, você pode preencher como "Em Investigação". O sistema permite o cadastro para que o acompanhamento comece imediatamente.' },
        { q: 'Como funciona o acesso da família?', a: 'Você pode criar um usuário do tipo "Família" e vinculá-lo ao aluno. Eles terão acesso a uma versão simplificada do dashboard focada no progresso e orientações.' },
        { q: 'O sistema emite alertas de faltas?', a: 'Sim, na aba Relatórios você consegue ver a assiduidade do aluno. Se ele faltar mais de 25% das aulas, o sistema marcará o status como "Atenção".' },
        { q: 'Como excluir um registro de aula errado?', a: 'Acesse a aba de Detalhes do Aluno, vá em "Evolução" ou "Acompanhamento", localize o registro e clique no ícone de lixeira (se tiver permissão de edição).' },
        { q: 'Posso usar o sistema no celular?', a: 'Sim! O VínculoTEA é 100% responsivo e funciona perfeitamente em tablets e smartphones através do navegador.' }
    ];

    const filteredFaqs = useMemo(() => {
        if (!searchQuery) return faqs;
        const q = searchQuery.toLowerCase();
        return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    }, [searchQuery]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.desc.toLowerCase().includes(q) ||
            c.articles.some(a => a.title.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    if (selectedCategory) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-primary transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Voltar para Central
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className={`p-12 ${selectedCategory.id === 'start' ? 'bg-blue-50' :
                        selectedCategory.id === 'reports' ? 'bg-violet-50' :
                            selectedCategory.id === 'prod' ? 'bg-amber-50' : 'bg-emerald-50'} border-b border-slate-100 dark:border-slate-700 relative overflow-hidden`}>
                        <selectedCategory.icon className={`${selectedCategory.color} absolute -top-8 -right-8 size-64 opacity-10 rotate-12`} />
                        <div className="relative z-10">
                            <div className={`size-16 rounded-3xl bg-white dark:bg-slate-900 ${selectedCategory.color} flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-white dark:border-slate-700`}>
                                <selectedCategory.icon size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{selectedCategory.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{selectedCategory.desc}</p>
                        </div>
                    </div>

                    <div className="p-12 space-y-16">
                        {selectedCategory.articles.map((article, i) => (
                            <section key={i} className="max-w-4xl">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                    <span className={`size-3 rounded-full ${selectedCategory.color.replace('text', 'bg')}`} />
                                    {article.title}
                                </h2>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {article.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-12 mb-12 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Central de Ajuda</h1>
                    <p className="text-slate-400 text-lg mb-8 font-medium">Estamos aqui para garantir que você tenha a melhor experiência possível. Como podemos ajudar hoje?</p>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-transform group-focus-within:scale-110" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquise por suporte, atalhos ou dúvidas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all backdrop-blur-md font-medium"
                        />
                    </div>
                </div>

                <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-1000" />
                <HelpCircle className="absolute -right-10 -bottom-10 size-64 text-white/[0.03] rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-6px] transition-all text-left group"
                            >
                                <div className={`size-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm`}>
                                    <cat.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{cat.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{cat.desc}</p>
                                <div className="mt-8 flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                    Explorar artigos <ChevronRight size={14} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dúvidas Frequentes</h2>
                        </div>
                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
                                <details key={i} className="group border-b border-slate-50 dark:border-slate-700 last:border-0 pb-4">
                                    <summary className="flex items-center justify-between cursor-pointer py-4 list-none outline-none">
                                        <span className="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors pr-8">{faq.q}</span>
                                        <div className="size-8 rounded-full bg-slate-50 group-hover:bg-primary/5 dark:bg-slate-700 flex items-center justify-center transition-colors">
                                            <ChevronRight size={18} className="text-slate-300 group-open:rotate-90 transition-transform" />
                                        </div>
                                    </summary>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pb-4 animate-in slide-in-from-top-2 duration-300 font-medium">
                                        {faq.a}
                                    </p>
                                </details>
                            )) : (
                                <div className="py-16 text-center">
                                    <Info className="text-slate-300 mx-auto mb-4 scale-150" size={48} />
                                    <p className="text-slate-500 font-bold mb-2">Ops! Nada encontrado.</p>
                                    <p className="text-sm text-slate-400 font-medium">Tente usar palavras-chave mais simples como "PEI", "Aluno" ou "Senha".</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative group">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 relative z-10">Suporte Direto</h3>
                        <div className="space-y-4 relative z-10">
                            <a href="https://wa.me/550000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all group/item shadow-sm">
                                <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/item:rotate-12 transition-transform">
                                    <Phone size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-emerald-400">WhatsApp</p>
                                    <p className="text-sm font-bold">Falar com Consultor</p>
                                </div>
                                <ExternalLink size={16} className="opacity-40" />
                            </a>

                            <a href="mailto:suporte@vinculotea.com" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group/item shadow-sm">
                                <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/item:rotate-12 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-blue-400">E-mail</p>
                                    <p className="text-sm font-bold">suporte@vinculotea.com</p>
                                </div>
                                <ExternalLink size={16} className="opacity-40" />
                            </a>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                            <MessageSquare size={120} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                <Instagram size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-2 leading-tight text-white">Siga-nos no Instagram</h3>
                            <p className="text-white/70 text-sm font-medium mb-6 leading-relaxed">Fique por dentro das novidades e confira dicas rápidas de como usar o VínculoTEA diariamente.</p>
                            <a
                                href="https://www.instagram.com/edututor.pei/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-white text-pink-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:scale-[1.02] transition-all text-center"
                            >
                                Acessar Perfil
                            </a>
                        </div>
                        <Instagram className="absolute -right-6 -bottom-6 size-48 text-white/10 group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4 text-slate-400 font-medium font-bold uppercase text-[10px] tracking-widest">
                    <Clock size={18} className="text-primary" />
                    <p>Tempo de resposta: <span className="text-slate-900 dark:text-white">15 minutos</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-500 font-bold italic hidden md:block">Não encontrou o que procurava?</p>
                    <button className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all border border-transparent hover:scale-105 active:scale-95">
                        Abrir Ticket de Suporte
                    </button>
                </div>
            </div>
        </div>
    );
};
