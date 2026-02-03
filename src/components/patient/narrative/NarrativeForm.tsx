
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, Lock, Share2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Use local integration if available, or direct client

// Define Schema
const formSchema = z.object({
    self_description: z.string().optional(),
    current_concerns: z.string().optional(),
    therapy_expectations: z.string().optional(),
    emotional_scale: z.array(z.number()).default([3]), // Slider returns array
    emotional_text: z.string().optional(),
});

interface NarrativeFormProps {
    onSuccess?: () => void;
}

export function NarrativeForm({ onSuccess }: NarrativeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            self_description: "",
            current_concerns: "",
            therapy_expectations: "",
            emotional_scale: [3],
            emotional_text: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>, isShared: boolean) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const content = {
                self_description: values.self_description,
                current_concerns: values.current_concerns,
                therapy_expectations: values.therapy_expectations,
                emotional_status: {
                    scale: values.emotional_scale[0],
                    text: values.emotional_text,
                },
            };

            const { error } = await (supabase as any).from("patient_narratives").insert({
                user_id: user.id,
                content: content,
                shared_with_therapist: isShared,
                shared_at: isShared ? new Date().toISOString() : null,
            });

            if (error) throw error;

            toast.success(isShared ? "Perfil atualizado e compartilhado!" : "Rascunho salvo com sucesso.");
            form.reset();
            setIsShareSheetOpen(false);
            onSuccess?.();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar suas informações.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = (values: z.infer<typeof formSchema>) => {
        onSubmit(values, false);
    };

    const handleOpenShare = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setPendingValues(form.getValues());
            setIsShareSheetOpen(true);
        }
    };

    const confirmShare = () => {
        if (pendingValues) {
            onSubmit(pendingValues, true);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-sm border-muted">
            <CardHeader>
                <CardTitle className="text-2xl font-light text-primary">Sobre mim, do meu jeito</CardTitle>
                <CardDescription>
                    Este é seu espaço seguro. Escreva livremente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-8">

                        <FormField
                            control={form.control}
                            name="self_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Quem sou eu hoje?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Como você se descreveria neste momento da sua vida?"
                                            className="min-h-[120px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="current_concerns"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">O que está na minha mente?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="O que tem tirado seu sono ou ocupado seus pensamentos?"
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="therapy_expectations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">O que espero da terapia?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Se a terapia fosse uma viagem, onde você gostaria de chegar?"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                            <FormLabel className="text-lg block">Como tenho me sentido (Termômetro)</FormLabel>
                            <FormField
                                control={form.control}
                                name="emotional_scale"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                            <span>Difícil</span>
                                            <span>Neutro</span>
                                            <span>Ótimo</span>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={1}
                                                max={5}
                                                step={1}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="py-4"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="emotional_text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Quer detalhar um pouco mais? (Opcional)"
                                                className="h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 bg-muted/10">
                <Button
                    variant="ghost"
                    onClick={form.handleSubmit(handleSaveDraft)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Salvar Rascunho (Privado)
                </Button>

                <Button
                    onClick={handleOpenShare}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    Salvar e Atualizar
                </Button>

                <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
                    <SheetContent side="bottom" className="h-[40vh] sm:h-auto rounded-t-xl">
                        <SheetHeader>
                            <SheetTitle>Compartilhar com seu terapeuta?</SheetTitle>
                            <SheetDescription>
                                Ao confirmar, seu terapeuta terá acesso à <strong>versão atual</strong> deste texto.
                                <br />
                                Você pode revogar ou criar uma nova versão privada a qualquer momento.
                            </SheetDescription>
                        </SheetHeader>
                        <SheetFooter className="mt-8 gap-4 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsShareSheetOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={confirmShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Sim, compartilhar agora
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </CardFooter>
        </Card>
    );
}
