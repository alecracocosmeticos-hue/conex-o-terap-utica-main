
import { AlertTriangle, Info, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function EmergencyFallback() {
    return (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 mt-6">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-700 font-bold ml-2">Precisa de ajuda imediata?</AlertTitle>
            <AlertDescription className="mt-2 text-red-800">
                <p className="mb-3">
                    Se você corre risco de vida ou precisa de apoio urgente, não espere.
                </p>
                <Button
                    variant="destructive"
                    className="w-full font-bold text-lg gap-2 shadow-sm hover:bg-red-700"
                    onClick={() => window.open('tel:188', '_self')}
                >
                    <Phone className="h-5 w-5" />
                    LIGAR 188 (CVV)
                </Button>
                <p className="text-xs mt-2 text-center opacity-80">
                    Disponível 24h, gratuito e sigiloso.
                </p>
            </AlertDescription>
        </Alert>
    );
}
