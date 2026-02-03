
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TherapistPublicProfile } from "@/types/marketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, UserPlus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function FindTherapist() {
    const [profiles, setProfiles] = useState<TherapistPublicProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTherapist, setSelectedTherapist] = useState<TherapistPublicProfile | null>(null);
    const [message, setMessage] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [hasActiveConnection, setHasActiveConnection] = useState(false);

    useEffect(() => {
        fetchProfiles();
        checkExistingConnection();
    }, []);

    const checkExistingConnection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if patient already has an active link
        const { data } = await supabase
            .from('patient_therapist_relations')
            .select('id')
            .eq('patient_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (data) setHasActiveConnection(true);
    };

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("therapist_public_profiles")
            .select("*")
            .eq("is_visible", true)
            .eq("is_accepting_new", true);

        if (data) {
            // Randomize order for equity (Fisher-Yates shuffle)
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setProfiles(shuffled);
        }
        setLoading(false);
    };

    const handleRequestConnection = async () => {
        if (!selectedTherapist) return;
        setSendingRequest(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { error } = await (supabase as any).from("connection_requests").insert({
                patient_id: user.id,
                therapist_id: selectedTherapist.therapist_id,
                status: 'pending',
                message: message
            });

            if (error) throw error;

            toast.success("Solicitação enviada com sucesso!");
            setSelectedTherapist(null);
            setMessage("");

        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar solicitação.");
        } finally {
            setSendingRequest(false);
        }
    };

    const filteredProfiles = profiles.filter(p =>
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container max-w-5xl py-6 animate-in fade-in">
            <div className="mb-8 text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Encontre seu Terapeuta</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Conecte-se com profissionais qualificados de forma ética e segura.
                    Sem rankings, sem pressão.
                </p>

                <div className="relative max-w-md mx-auto mt-6">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Busque por nome ou especialidade..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.map((profile) => (
                        <Card key={profile.id} className="flex flex-col hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle>{profile.display_name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal">CRP: {profile.crp_number}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-1">
                                    {profile.specialties?.map((s, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-4">
                                    {profile.bio || "Sem biografia informada."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={hasActiveConnection}
                                    onClick={() => setSelectedTherapist(profile)}
                                >
                                    {hasActiveConnection ? "Você já possui terapeuta" : "Solicitar Atendimento"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {filteredProfiles.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    Nenhum terapeuta encontrado com os termos buscados.
                </div>
            )}

            <Dialog open={!!selectedTherapist} onOpenChange={(open) => !open && setSelectedTherapist(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Solicitar Atendimento</DialogTitle>
                        <DialogDescription>
                            Envie uma mensagem para <strong>{selectedTherapist?.display_name}</strong>.
                            Explique brevemente o motivo da sua busca.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Textarea
                            placeholder="Olá, gostaria de agendar uma consulta pois..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedTherapist(null)}>Cancelar</Button>
                        <Button onClick={handleRequestConnection} disabled={sendingRequest}>
                            {sendingRequest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Enviar Solicitação
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
