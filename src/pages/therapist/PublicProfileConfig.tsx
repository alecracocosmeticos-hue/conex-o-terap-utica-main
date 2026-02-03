
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Globe } from "lucide-react";
import { toast } from "sonner";
import { TherapistPublicProfile } from "@/types/marketplace";

const profileSchema = z.object({
    display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    crp_number: z.string().min(4, "CRP inválido"),
    bio: z.string().optional(),
    specialties: z.string().optional(), // Comma separated for input
    is_accepting_new: z.boolean(),
    is_visible: z.boolean(),
});

export default function PublicProfileConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            display_name: "",
            crp_number: "",
            bio: "",
            specialties: "",
            is_accepting_new: true,
            is_visible: false,
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from("therapist_public_profiles")
                .select("*")
                .eq("therapist_id", user.id)
                .maybeSingle();

            if (data) {
                form.reset({
                    display_name: data.display_name,
                    crp_number: data.crp_number,
                    bio: data.bio || "",
                    specialties: data.specialties?.join(", ") || "",
                    is_accepting_new: data.is_accepting_new,
                    is_visible: data.is_visible,
                });
            } else if (!data) {
                // If no public profile, try to pre-fill from private profile
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (profile) form.setValue('display_name', profile.full_name || "");
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const specialtiesArray = values.specialties
                ?.split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0) || [];

            const payload = {
                therapist_id: user.id,
                display_name: values.display_name,
                crp_number: values.crp_number,
                bio: values.bio,
                specialties: specialtiesArray,
                is_accepting_new: values.is_accepting_new,
                is_visible: values.is_visible,
                updated_at: new Date().toISOString(),
            };

            // Upsert
            const { error } = await (supabase as any)
                .from("therapist_public_profiles")
                .upsert(payload, { onConflict: "therapist_id" });

            if (error) throw error;
            toast.success("Perfil público atualizado!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar perfil.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container max-w-3xl py-6 animate-in fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Meu Perfil Público</h1>
                <p className="text-muted-foreground">
                    Gerencie como você aparece na busca de terapeutas.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Dados Visíveis
                            </CardTitle>
                            <CardDescription>
                                Estas informações ficarão visíveis para todos os pacientes na busca.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="display_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Profissional</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Como você quer ser conhecido" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="crp_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registro Profissional (CRP)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="00/00000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="specialties"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Especialidades / Abordagens</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: TCC, Psicanálise, Ansiedade (separe por vírgulas)" {...field} />
                                        </FormControl>
                                        <FormDescription>Separe as tags por vírgula.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sobre mim</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Conte um pouco sobre sua formação e como você atende..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibilidade e Agenda</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="is_accepting_new"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Aceitando novos pacientes</FormLabel>
                                            <FormDescription>
                                                Indica se você tem vagas disponíveis.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_visible"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base font-semibold">Perfil Publicado</FormLabel>
                                            <FormDescription>
                                                Ative para aparecer na busca de terapeutas.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Configurações
                    </Button>
                </form>
            </Form>
        </div>
    );
}
