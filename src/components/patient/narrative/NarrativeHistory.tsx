
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Eye, EyeOff, Lock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PatientNarrative } from "@/types/narrative";

interface NarrativeHistoryProps {
    refreshTrigger: number;
}

export function NarrativeHistory({ refreshTrigger }: NarrativeHistoryProps) {
    const [history, setHistory] = useState<PatientNarrative[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (supabase as any)
            .from("patient_narratives")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
            toast.error("Erro ao carregar histórico");
        } else {
            setHistory((data as any[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const toggleShare = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const { error } = await (supabase as any)
            .from("patient_narratives")
            .update({
                shared_with_therapist: newStatus,
                shared_at: newStatus ? new Date().toISOString() : null
            })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao atualizar status");
        } else {
            toast.success(newStatus ? "Versão compartilhada" : "Compartilhamento revogado");
            fetchHistory();
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    if (history.length === 0) return (
        <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
            Nenhuma versão salva ainda.
        </div>
    );

    return (
        <Card className="mt-8 border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <CardTitle className="text-xl font-light">Histórico de Versões</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                <div className="space-y-1 mb-4 sm:mb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            às {format(new Date(item.created_at), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.shared_with_therapist ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                                                <Share2 className="w-3 h-3" /> Compartilhado
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="flex items-center gap-1 text-muted-foreground">
                                                <Lock className="w-3 h-3" /> Privado
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleShare(item.id, item.shared_with_therapist)}
                                    >
                                        {item.shared_with_therapist ? (
                                            <>
                                                <EyeOff className="w-4 h-4 mr-2" />
                                                Revogar
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Compartilhar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
