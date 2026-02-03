
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { IntakeForm } from "@/types/intake";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IntakeViewerProps {
    patientId: string;
}

export function IntakeViewer({ patientId }: IntakeViewerProps) {
    const [data, setData] = useState<IntakeForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchIntake = async () => {
            setLoading(true);
            setError(false);

            const { data, error } = await (supabase as any)
                .from("patient_intake_forms")
                .select("*")
                .eq("user_id", patientId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code !== "PGRST116") { // Not found is fine
                    console.error("Error fetching intake:", error);
                    setError(true);
                }
            } else {
                setData(data);
                // Log access here if we want to be strict, but RLS logs are automatic at database level if configured with audit tool.
                // For application level logging:
                /*
                await supabase.from("audit_logs").insert({
                    action: "view_intake_form",
                    target_resource: data.id,
                    metadata: { patient_id: patientId }
                });
                */
            }
            setLoading(false);
        };

        if (patientId) {
            fetchIntake();
        }
    }, [patientId]);

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /> Carregando ficha...</div>;

    if (error) return <div className="text-destructive p-4">Erro ao carregar ficha.</div>;

    if (!data) return (
        <Card className="bg-muted/10 border-dashed">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>O paciente ainda não preencheu a Ficha Inicial.</p>
            </CardContent>
        </Card>
    );

    return (
        <Card className="border-l-4 border-l-primary/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Ficha Clínica Básica
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        Atualizado em: {new Date(data.created_at).toLocaleDateString()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Privacidade</AlertTitle>
                    <AlertDescription>
                        Estes dados foram fornecidos pelo paciente. Não substituem anamnese clínica.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Dados Pessoais</h4>
                        <div className="space-y-2">
                            <p><span className="font-medium">Nome Preferido:</span> {data.preferred_name || "-"}</p>
                            <p><span className="font-medium">Idade:</span> {data.age}</p>
                            <p><span className="font-medium">Gênero:</span> {data.gender_identity || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Segurança</h4>
                        <div className="space-y-2">
                            <p><span className="font-medium">Contato:</span> {data.emergency_contact_name || "-"}</p>
                            <p><span className="font-medium">Telefone:</span> {data.emergency_contact_phone || "-"}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Queixa Principal</h4>
                    <p className="bg-muted/30 p-3 rounded-md text-sm">{data.main_complaint || "Não informado."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Histórico Terapêutico</h4>
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                            <p className="mb-1"><strong>Já fez terapia?</strong> {data.has_therapy_history ? "Sim" : "Não"}</p>
                            {data.therapy_history_details && <p className="mt-2 text-muted-foreground">{data.therapy_history_details}</p>}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Medicação</h4>
                        <p className="bg-muted/30 p-3 rounded-md text-sm">{data.medications || "Não informado."}</p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
