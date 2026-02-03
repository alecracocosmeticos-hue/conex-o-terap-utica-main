
import { useState } from "react";
import { NarrativeForm } from "@/components/patient/narrative/NarrativeForm";
import { NarrativeHistory } from "@/components/patient/narrative/NarrativeHistory";

export default function SelfView() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className="container max-w-4xl py-6 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary/80">Meu Espaço Pessoal</h1>
                <p className="text-muted-foreground text-lg">
                    Um lugar para você se conectar consigo mesmo. Sem julgamentos, apenas a sua verdade.
                </p>
            </div>

            <NarrativeForm onSuccess={handleSuccess} />

            <NarrativeHistory refreshTrigger={refreshTrigger} />
        </div>
    );
}
