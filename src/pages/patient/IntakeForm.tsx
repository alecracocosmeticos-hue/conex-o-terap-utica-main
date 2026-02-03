
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Toaster, toast } from "sonner"; // Assuming sonner is available
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, FileText, Lock } from "lucide-react";
import { IntakeForm } from "@/types/intake";

const formSchema = z.object({
    preferred_name: z.string().optional(),
    age: z.coerce.number().min(1, "Idade é obrigatória"),
    gender_identity: z.string().optional(),
    main_complaint: z.string().optional(),
    has_therapy_history: z.boolean().default(false),
    therapy_history_details: z.string().optional(),
    medications: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
});

export default function IntakeFormPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [lastVersionDate, setLastVersionDate] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            preferred_name: "",
            age: 0,
            gender_identity: "",
            main_complaint: "",
            has_therapy_history: false,
            therapy_history_details: "",
            medications: "",
            emergency_contact_name: "",
            emergency_contact_phone: "",
        },
    });

    useEffect(() => {
        const fetchLatest = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from("patient_intake_forms")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                form.reset({
                    preferred_name: data.preferred_name || "",
                    age: data.age || 0,
                    gender_identity: data.gender_identity || "",
                    main_complaint: data.main_complaint || "",
                    has_therapy_history: data.has_therapy_history || false,
                    therapy_history_details: data.therapy_history_details || "",
                    medications: data.medications || "",
                    emergency_contact_name: data.emergency_contact_name || "",
                    emergency_contact_phone: data.emergency_contact_phone || "",
                });
                setLastVersionDate(data.created_at);
            }
            setLoading(false);
        };

        fetchLatest();
    }, [form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { error } = await (supabase as any).from("patient_intake_forms").insert({
                user_id: user.id,
                ...values
            });

            if (error) throw error;

            toast.success("Ficha atualizada com sucesso!");
            setLastVersionDate(new Date().toISOString());

        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar ficha.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container max-w-3xl py-6 animate-in fade-in">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary/80">Ficha Clínica Básica</h1>
                <p className="text-muted-foreground text-lg">
                    Ajude seu terapeuta a conhecer você melhor. Esses dados são privados entre você e seu terapeuta.
                </p>

                {lastVersionDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 p-2 bg-muted/20 rounded w-fit">
                        <FileText className="w-4 h-4" />
                        Última atualização: {new Date(lastVersionDate).toLocaleDateString()}
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>Sobre Você</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="preferred_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Como gosta de ser chamado?</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome ou apelido preferido" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Idade <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="gender_identity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Identidade de Gênero (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Como você se identifica" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contexto Clínico</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="main_complaint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>O que te traz à terapia neste momento?</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Descreva brevemente sua queixa principal ou motivo da busca." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-4 border p-4 rounded-md">
                                <FormField
                                    control={form.control}
                                    name="has_therapy_history"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-2">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Já fez terapia antes?</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {form.watch("has_therapy_history") && (
                                    <FormField
                                        control={form.control}
                                        name="therapy_history_details"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Comente brevemente sobre sua experiência anterior</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Como foi? Por que parou?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="medications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Faz uso de alguma medicação contínua?</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Liste medicamentos e dosagens se sentir confortável." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Segurança</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="emergency_contact_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Contato</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome de alguém de confiança" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emergency_contact_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormDescription>
                                Este contato será usado <strong>apenas</strong> em situações de risco iminente à vida, seguindo rigorosos protocolos éticos.
                            </FormDescription>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar e Compartilhar com Terapeuta
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Seus dados são criptografados e visíveis apenas para você e seu terapeuta vinculado.
                    </p>

                </form>
            </Form>
        </div>
    );
}
