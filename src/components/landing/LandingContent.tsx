import { Shield, Users, LifeBuoy, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const LandingContent = () => {
    const cards = [
        {
            icon: Shield,
            title: "Ambiente Seguro",
            description: "Seus dados estão protegidos. Seguimos rigorosamente a LGPD e garantimos total privacidade.",
        },
        {
            icon: Users,
            title: "Conexão com Profissionais",
            description: "Psicólogos verificados e comprometidos com a ética profissional.",
        },
        {
            icon: LifeBuoy,
            title: "Apoio em Momentos Difíceis",
            description: "Ferramentas para registrar suas emoções e compartilhar com seu terapeuta.",
        },
        {
            icon: Info,
            title: "Transparência e Limites",
            description: "Uma plataforma de apoio que complementa, mas não substitui, o atendimento de emergência.",
        },
    ];

    return (
        <div className="h-full flex flex-col justify-center p-8 lg:p-12 bg-muted/30">
            <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-primary">Acompanhamento terapêutico contínuo entre sessões</h2>
                    <p className="text-muted-foreground">
                        O 149PSI é um ambiente profissional para apoio psicológico, com segurança, ética e respeito a você.
                    </p>
                </div>

                <div className="grid gap-4">
                    {cards.map((card, index) => (
                        <Card key={index} className="border-none shadow-sm bg-background/50 hover:bg-background transition-colors">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
