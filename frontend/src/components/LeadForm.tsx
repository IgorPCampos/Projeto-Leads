import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, AlertCircle } from "lucide-react"; 
import { type Quote } from "@/lib/interfaces"; 
import { api } from "@/lib/api"; 
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
});

interface Props {
  quote: Quote;
  intentionId: string | null;
  onSaved: (name: string, email: string) => void;
}

export default function LeadForm({ quote, intentionId, onSaved }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const result = schema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    try {
      const lead = await api.createLead(result.data.name, result.data.email);

      if (intentionId) {
        await api.associateLeadToIntention(intentionId, lead.id);
      } else {
        console.warn(
          "Salvando lead sem vincular a intenção (ID da intenção não disponível)",
        );
      }

      onSaved(result.data.name, result.data.email);
    } catch (error) {
      console.error(error);
      setApiError("Ocorreu um erro ao salvar seus dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-center text-muted-foreground">
        Salve sua cotação informando seus dados
      </p>

      {apiError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="lead-name" className="text-sm">
          Nome
        </Label>
        <Input
          id="lead-name"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors({});
          }}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lead-email" className="text-sm">
          E-mail
        </Label>
        <Input
          id="lead-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saving ? "Salvando..." : "Salvar Cotação"}
      </Button>
    </form>
  );
}
