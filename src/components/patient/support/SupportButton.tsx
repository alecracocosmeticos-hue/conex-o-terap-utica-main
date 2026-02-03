
import { useState, useEffect } from "react";
import { LifeBuoy, HeartHandshake, AlertOctagon, CheckCircle2, UserCheck, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmergencyFallback } from "./EmergencyFallback";
import { SUPPORT_BUTTON_TERMS, SUPPORT_BUTTON_TERMS_VERSION } from "@/constants/supportTerms";

export function SupportButton() {
    const [open, setOpen] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [therapistId, setTherapistId] = useState<string | null>(null);

    // Check consent on open
    const handleOpenChange = async (isOpen: boolean) => {
        if (isOpen) {
            // Check local storage primarily for UX speed, verifying DB in background could be an enhancement
            const hasConsented = localStorage.getItem(`support_terms_v${SUPPORT_BUTTON_TERMS_VERSION}`);
            if (!hasConsented) {
                setShowTerms(true);
            } else {
                setOpen(true);
                fetchActiveTherapist();
            }
        } else {
            setOpen(false);
        }
    };

    const fetchActiveTherapist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("patient_therapist_relations")
            .select("therapist_id")
            .eq("patient_id", user.id)
            .eq("status", "active")
            .single();

        if (data) setTherapistId(data.therapist_id);
    };

    const confirmTerms = () => {
        if (acceptedTerms) {
            localStorage.setItem(`support_terms_v${SUPPORT_BUTTON_TERMS_VERSION}`, "true");
            setShowTerms(false);
            setOpen(true);
            fetchActiveTherapist();

            // Log consent in background
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    // We can log this to a user_consents table if it exists, or just rely on the UI gate for now as per MVP
                }
            });
        }
    };

    const handleAction = async (type: 'therapist_notify' | 'find_professional') => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await (supabase as any).from("support_requests").insert({
                user_id: user.id,
                type,
                target_therapist_id: type === 'therapist_notify' ? therapistId : null,
                user_ip: "client-side", // In a real app we'd want this from edge function headers
            });

            if (error) throw error;

            if (type === 'therapist_notify') {
                toast.success("Seu terapeuta foi notificado.", {
                    description: "Lembre-se: ele pode não responder imediatamente."
                });
            } else {
                toast.info("Abrindo lista de profissionais...", {
                    description: "Funcionalidade demonstrativa: redirecionando para busca."
                });
                // Redirect logic would go here
            }
            setOpen(false);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <Button
                onClick={() => handleOpenChange(true)}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-indigo-700 bg-white shadow-sm"
            >
                <LifeBuoy className="w-4 h-4" />
                Precisa de ajuda agora?
            </Button>

            {/* Safety Terms Modal (First Time) */}
            <Dialog open={showTerms} onOpenChange={setShowTerms}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5 text-amber-600" />
                            Importante: Limites do Aplicativo
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="whitespace-pre-line text-sm text-muted-foreground bg-muted p-4 rounded-md">
                            {SUPPORT_BUTTON_TERMS}
                        </p>
                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Li e compreendo que este aplicativo não é um serviço de emergência.
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowTerms(false)}>Cancelar</Button>
                        <Button disabled={!acceptedTerms} onClick={confirmTerms}>Entendi, continuar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Support Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="h-[90vh] md:h-auto rounded-t-xl">
                    <SheetHeader className="text-left mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            <HeartHandshake className="text-primary w-6 h-6" />
                            Como podemos te apoiar?
                        </SheetTitle>
                        <SheetDescription className="text-lg">
                            Se você está passando por um momento difícil, escolha uma das opções abaixo.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-4 max-w-2xl mx-auto pb-8">

                        {/* Option 1: Therapist */}
                        <div className={`border rounded-lg p-4 transition-all ${!therapistId ? 'opacity-50 grayscale bg-muted' : 'bg-card hover:border-primary/50'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-indigo-600" />
                                    Falar com meu terapeuta
                                </h3>
                                {!therapistId && <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded">Indisponível (Sem vínculo)</span>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Enviaremos um aviso ao seu terapeuta informando que você precisa de acolhimento.
                            </p>
                            {therapistId && (
                                <div className="bg-amber-50 text-amber-900 text-xs p-2 rounded mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 shrink-0" />
                                    Atenção: Seu terapeuta será notificado, mas pode não responder imediatamente.
                                </div>
                            )}
                            <Button
                                className="w-full"
                                disabled={!therapistId || loading}
                                onClick={() => handleAction('therapist_notify')}
                            >
                                {loading ? "Enviando..." : "Notificar meu Terapeuta"}
                            </Button>
                        </div>

                        {/* Option 2: Find Professional (Placeholder for now) */}
                        <div className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-all">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                Buscar profissional disponível
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Encontre psicólogos disponíveis para acolhimento pontual (sujeito a disponibilidade).
                            </p>
                            <Button variant="secondary" className="w-full" onClick={() => handleAction('find_professional')} disabled={true}>
                                Ver lista de acolhimento (Em breve)
                            </Button>
                        </div>

                        {/* Option 3: External Help (CVV) */}
                        <EmergencyFallback />

                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
