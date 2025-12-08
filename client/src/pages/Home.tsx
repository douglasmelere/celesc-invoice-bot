import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, AlertCircle, CheckCircle2, Zap, Sparkles, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [uc, setUc] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const requestMutation = trpc.invoice.request.useMutation({
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        toast.success("Fatura obtida com sucesso!", {
          icon: <Sparkles className="w-4 h-4 text-violet-400" />,
        });
        const history = JSON.parse(localStorage.getItem("invoiceHistory") || "[]");
        history.unshift({
          uc,
          cpfCnpj,
          birthDate,
          timestamp: Date.now(),
          success: true,
          data: data.data,
        });
        localStorage.setItem("invoiceHistory", JSON.stringify(history.slice(0, 50)));
      } else {
        toast.error("Erro ao obter fatura");
      }
    },
    onError: (error) => {
      toast.error("Erro na requisição: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      toast.error("Data de nascimento deve estar no formato dd/mm/aaaa");
      return;
    }

    requestMutation.mutate({ uc, cpfCnpj, birthDate });
  };

  const handleDownload = () => {
    if (result?.data?.pdf) {
      const link = document.createElement("a");
      link.href = result.data.pdf;
      link.download = `fatura_${uc}.pdf`;
      link.click();
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4}).*/, "$1");
  };

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden">
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      {/* Hero Section */}
      <div className="relative z-10 container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header with animated gradient */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-violet-500 to-blue-500 p-4 rounded-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text">
                CELESC Invoice Bot
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Sistema automatizado para consulta e envio de faturas CELESC via WhatsApp
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-violet-400" />
                </div>
                <CardTitle className="text-3xl font-bold">Consultar Fatura</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Preencha os dados abaixo para solicitar a segunda via da fatura e enviar via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 fade-in-delay-1">
                    <Label htmlFor="uc" className="text-sm font-semibold text-foreground">
                      Número da UC
                    </Label>
                    <Input
                      id="uc"
                      value={uc}
                      onChange={(e) => setUc(e.target.value)}
                      placeholder="Digite o número da unidade consumidora"
                      required
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50 text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-1">
                    <Label htmlFor="cpfCnpj" className="text-sm font-semibold text-foreground">
                      CPF/CNPJ
                    </Label>
                    <Input
                      id="cpfCnpj"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      required
                      maxLength={18}
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50 text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2 fade-in-delay-2">
                  <Label htmlFor="birthDate" className="text-sm font-semibold text-foreground">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(formatDate(e.target.value))}
                    placeholder="dd/mm/aaaa"
                    required
                    maxLength={10}
                    className="input-focus h-12 bg-slate-800/50 border-slate-700/50 text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>

                <div className="pt-4 fade-in-delay-3">
                  <Button
                    type="submit"
                    className="w-full h-14 btn-primary text-base font-semibold shadow-lg"
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Processando... (pode levar até 1 minuto)
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3 h-5 w-5" />
                        Enviar Agora
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Card
              className={`
                glass-card border-2 shadow-2xl mt-8 fade-in-up card-hover
                ${result.success
                  ? "border-green-500/30 bg-gradient-to-br from-green-950/20 to-emerald-950/20"
                  : "border-red-500/30 bg-gradient-to-br from-red-950/20 to-rose-950/20"
                }
              `}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  {result.success ? (
                    <>
                      <div className="p-2 bg-green-500/20 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Sucesso
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-red-500/20 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                        Erro
                      </span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.success ? (
                  <>
                    {result.data?.pdf ? (
                      <>
                        <p className="text-muted-foreground leading-relaxed">
                          Fatura encontrada e pronta para download. O PDF será enviado via WhatsApp automaticamente.
                        </p>
                        <Button 
                          onClick={handleDownload} 
                          className="w-full h-12 btn-primary font-semibold"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Baixar Fatura (PDF)
                        </Button>
                      </>
                    ) : (
                      <p className="text-foreground leading-relaxed">
                        {result.data?.message || "Processado com sucesso"}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 leading-relaxed">
                      {result.error || "Não foi encontrada uma segunda via para esta fatura"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
