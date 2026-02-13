import { User, MapPin, School, BookOpen, Brain, Activity, Phone, Mail, Hash } from 'lucide-react';

interface Props {
    student: any;
}

export const DetailsTab = ({ student }: Props) => {
    const details = student.detalhes || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Responsável e Contato */}
            <Section title="Responsável e Contato" icon={User}>
                <div className="space-y-4">
                    <DetailItem label="Nome do Responsável" value={student.responsavel} />
                    <DetailItem label="Email" value={details.email_responsavel || 'Não informado'} />
                    <DetailItem label="Telefone" value={details.telefone_responsavel || 'Não informado'} />
                    <DetailItem label="Endereço" value={`${details.endereco?.logradouro || ''}, ${details.endereco?.numero || ''} - ${details.endereco?.bairro || ''}, ${details.endereco?.cidade || ''}/${details.endereco?.estado || ''}`} />
                    <DetailItem label="CEP" value={details.endereco?.cep || 'Não informado'} />
                </div>
            </Section>

            {/* História Pré/Peri/Neonatal */}
            <Section title="História de Vida" icon={BookOpen}>
                <div className="space-y-4">
                    <DetailItem label="Gestação" value={details.historia?.gravidez || 'Não informado'} />
                    <DetailItem label="Tipo de Parto" value={details.historia?.tipoParto || 'Não informado'} />
                    <DetailItem label="Peso ao Nascer" value={details.historia?.pesoNascer || 'Não informado'} />
                    <DetailItem label="APGAR" value={details.historia?.apgar || 'Não informado'} />
                    <DetailItem label="Internação Neonatal" value={details.historia?.internacaoNeonatal || 'Não informado'} />
                </div>
            </Section>

            {/* Desenvolvimento */}
            <Section title="Desenvolvimento" icon={Brain}>
                <div className="space-y-4">
                    <DetailItem label="Marcos do Desenvolvimento" value={details.desenvolvimento?.marcosDesenvolvimento || 'Não informado'} />
                    <DetailItem label="Produção Verbal" value={details.desenvolvimento?.producaoVerbal || 'Não informado'} />
                    <DetailItem label="Instruções Simples" value={details.desenvolvimento?.entendeInstrucoes || 'Não informado'} />
                    <DetailItem label="Contato Ocular/Nome" value={details.desenvolvimento?.contatoOcular || 'Não informado'} />
                    <DetailItem label="Brincadeiras" value={details.desenvolvimento?.brincadeiraPreferida || 'Não informado'} />
                </div>
            </Section>

            {/* Saúde e Rotinas */}
            <Section title="Saúde e Rotinas" icon={Activity}>
                <div className="space-y-4">
                    <DetailItem label="Doenças/Histórico" value={details.saude?.doencas || 'Não informado'} />
                    <DetailItem label="Medicação" value={details.saude?.medicacao || 'Não informado'} />
                    <DetailItem label="Alergias" value={details.saude?.alergias || 'Não informado'} />
                    <DetailItem label="Sono" value={details.saude?.sono || 'Não informado'} />
                    <DetailItem label="Alimentação" value={details.saude?.alimentacao || 'Não informado'} />
                    <DetailItem label="Observações" value={details.saude?.observacoes || 'Não informado'} />
                </div>
            </Section>
        </div>
    );
};

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-[1.5px] border-slate-100 dark:border-slate-700 p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary font-normal">
                <Icon size={18} />
            </div>
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
    </div>
);
