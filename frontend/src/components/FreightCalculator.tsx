import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  MapPin,
  Package,
  ChevronDown,
  Truck,
  CheckCircle,
  User,
  AlertCircle,
} from "lucide-react";
import { fetchCep, calculateFreight, type CepData } from "@/lib/viacep";
import { type QuoteDimensions, type Quote } from "@/lib/interfaces";
import { api } from "@/lib/api";
import LeadForm from "./LeadForm";

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

interface SessionLead {
  name: string;
  email: string;
}

export default function FreightCalculator() {
  const [originCep, setOriginCep] = useState("");
  const [destCep, setDestCep] = useState("");
  const [originData, setOriginData] = useState<CepData | null>(null);
  const [destData, setDestData] = useState<CepData | null>(null);
  const [originError, setOriginError] = useState("");
  const [destError, setDestError] = useState("");
  const [generalError, setGeneralError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [dimensions, setDimensions] = useState<QuoteDimensions>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [saved, setSaved] = useState(false);
  const [sessionLead, setSessionLead] = useState<SessionLead | null>(null);

  const [intentionId, setIntentionId] = useState<string | null>(null);

  const handleCalculate = async () => {
    setOriginError("");
    setDestError("");
    setGeneralError("");
    setQuote(null);
    setSaved(false);
    setIntentionId(null);
    setLoading(true);

    try {
      const [origin, dest] = await Promise.all([
        fetchCep(originCep).catch((e) => {
          setOriginError(e.message);
          return null;
        }),
        fetchCep(destCep).catch((e) => {
          setDestError(e.message);
          return null;
        }),
      ]);

      if (!origin || !dest) return;

      setOriginData(origin);
      setDestData(dest);

      try {
        const intention = await api.createIntention(originCep, destCep);
        setIntentionId(intention.id);
        console.log("Intenção criada:", intention.id);
      } catch (error) {
        console.error("Back recusou a intenção:", error);
        setGeneralError("Erro ao validar solicitação no servidor.");
        return; 
      }

      const hasDimensions =
        dimensions.weight ||
        dimensions.width ||
        dimensions.height ||
        dimensions.depth;

      const value = calculateFreight(
        origin,
        dest,
        hasDimensions ? dimensions : undefined,
      );

      const newQuote: Quote = {
        id: crypto.randomUUID(),
        originCep: origin.cep,
        destCep: dest.cep,
        originCity: origin.localidade,
        originState: origin.uf,
        destCity: dest.localidade,
        destState: dest.uf,
        value,
        dimensions: hasDimensions ? dimensions : undefined,
        createdAt: new Date().toISOString(),
      };

      setQuote(newQuote);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSaved = (name: string, email: string) => {
    setSessionLead({ name, email });
    setSaved(true);
  };

  const canCalculate =
    originCep.replace(/\D/g, "").length === 8 &&
    destCep.replace(/\D/g, "").length === 8;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {sessionLead && (
        <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
          <User className="h-4 w-4 text-primary" />
          <span>
            Cotando como{" "}
            <span className="font-medium text-foreground">
              {sessionLead.name}
            </span>
          </span>
        </div>
      )}

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Truck className="h-6 w-6 text-primary" />
            Calcular Frete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {generalError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {generalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="origin"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" /> CEP Origem
              </Label>
              <Input
                id="origin"
                placeholder="00000-000"
                value={originCep}
                onChange={(e) => {
                  setOriginCep(formatCep(e.target.value));
                  setOriginError("");
                  setGeneralError("");
                }}
              />
              {originError && (
                <p className="text-sm text-destructive">{originError}</p>
              )}
              {originData && !originError && (
                <p className="text-xs text-muted-foreground">
                  {originData.localidade} - {originData.uf}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="dest"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <MapPin className="h-3.5 w-3.5 text-destructive" /> CEP Destino
              </Label>
              <Input
                id="dest"
                placeholder="00000-000"
                value={destCep}
                onChange={(e) => {
                  setDestCep(formatCep(e.target.value));
                  setDestError("");
                  setGeneralError("");
                }}
              />
              {destError && (
                <p className="text-sm text-destructive">{destError}</p>
              )}
              {destData && !destError && (
                <p className="text-xs text-muted-foreground">
                  {destData.localidade} - {destData.uf}
                </p>
              )}
            </div>
          </div>

          <Collapsible open={dimensionsOpen} onOpenChange={setDimensionsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground px-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" /> Dimensões (opcional)
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${dimensionsOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Peso (kg)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                    value={dimensions.weight ?? ""}
                    onChange={(e) =>
                      setDimensions((d) => ({
                        ...d,
                        weight: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Largura (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={dimensions.width ?? ""}
                    onChange={(e) =>
                      setDimensions((d) => ({
                        ...d,
                        width: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Altura (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={dimensions.height ?? ""}
                    onChange={(e) =>
                      setDimensions((d) => ({
                        ...d,
                        height: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Profundidade (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={dimensions.depth ?? ""}
                    onChange={(e) =>
                      setDimensions((d) => ({
                        ...d,
                        depth: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            className="w-full h-12 text-base font-semibold"
            disabled={!canCalculate || loading}
            onClick={handleCalculate}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Truck className="h-5 w-5 mr-2" />
            )}
            {loading ? "Consultando..." : "Calcular Frete"}
          </Button>
        </CardContent>
      </Card>

      {quote && (
        <Card className="glass-card border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {quote.originCity}/{quote.originState} → {quote.destCity}/
                {quote.destState}
              </p>
              <p className="text-4xl font-bold text-primary font-display">
                {quote.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Valor estimado para envio
              </p>
            </div>

            {!saved ? (
              <div className="mt-6 pt-6 border-t border-border">
                <LeadForm
                  quote={quote}
                  intentionId={intentionId}
                  onSaved={handleLeadSaved}
                />
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-border text-center space-y-2 animate-in fade-in">
                <CheckCircle className="h-10 w-10 text-success mx-auto" />
                <p className="font-semibold text-success">
                  Cotação salva com sucesso!
                </p>
                {sessionLead && (
                  <p className="text-sm text-muted-foreground">
                    Associada a {sessionLead.email}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
