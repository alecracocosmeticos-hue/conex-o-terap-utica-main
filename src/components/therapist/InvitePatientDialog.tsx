import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Key, Copy, Check, Loader2 } from 'lucide-react';

interface InvitePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const InvitePatientDialog: React.FC<InvitePatientDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  const inviteByEmail = useMutation({
    mutationFn: async (inviteEmail: string) => {
      const code = generateInvitationCode();

      const { error } = await supabase
        .from('patient_therapist_relations')
        .insert({
          therapist_id: user!.id,
          patient_id: user!.id, // Placeholder, will be updated when patient accepts
          status: 'pending',
          invitation_code: code,
          invitation_email: inviteEmail.toLowerCase().trim(),
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um convite pendente para este email');
        }
        throw error;
      }

      return code;
    },
    onSuccess: (code) => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      toast({
        title: 'Convite enviado!',
        description: 'O paciente receberá o convite ao fazer login.',
      });
      setGeneratedCode(code);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      const code = generateInvitationCode();

      const { error } = await supabase
        .from('patient_therapist_relations')
        .insert({
          therapist_id: user!.id,
          patient_id: user!.id, // Placeholder
          status: 'pending',
          invitation_code: code,
        });

      if (error) throw error;
      return code;
    },
    onSuccess: (code) => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      setGeneratedCode(code);
      toast({
        title: 'Código gerado!',
        description: 'Compartilhe este código com seu paciente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao gerar código',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setGeneratedCode(null);
    setCopied(false);
    setActiveTab('email');
    onOpenChange(false);
  };

  const handleSendEmail = () => {
    if (!email.trim()) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite o email do paciente.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Digite um email válido.',
        variant: 'destructive',
      });
      return;
    }

    inviteByEmail.mutate(email);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Paciente</DialogTitle>
          <DialogDescription>
            Envie um convite por email ou gere um código para compartilhar.
          </DialogDescription>
        </DialogHeader>

        {generatedCode ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {activeTab === 'email'
                  ? 'Convite enviado! O código também pode ser compartilhado:'
                  : 'Compartilhe este código com seu paciente:'}
              </p>
              <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                <span className="text-2xl font-mono font-bold tracking-widest">
                  {generatedCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O paciente pode inserir este código na seção "Meu Terapeuta"
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Por Email
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Key className="h-4 w-4" />
                Por Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do paciente</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="paciente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O paciente receberá o convite ao fazer login com este email.
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSendEmail}
                  disabled={inviteByEmail.isPending}
                  className="w-full"
                >
                  {inviteByEmail.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar Convite
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Gere um código único para compartilhar diretamente com seu paciente.
                </p>
                <p className="text-xs text-muted-foreground">
                  O código pode ser usado uma única vez e não expira.
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => generateCode.mutate()}
                  disabled={generateCode.isPending}
                  className="w-full"
                >
                  {generateCode.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Gerar Código
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
