import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Download, Trash2, CheckCircle2, XCircle, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  uc: string;
  cpfCnpj: string;
  birthDate: string;
  timestamp: number;
  success: boolean;
  data?: any;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem("invoiceHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("invoiceHistory");
    setHistory([]);
    toast.success("Histórico limpo");
  };

  const deleteItem = (timestamp: number) => {
    const newHistory = history.filter((item) => item.timestamp !== timestamp);
    localStorage.setItem("invoiceHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
    toast.success("Item removido");
  };

  const handleDownload = (item: HistoryItem) => {
    if (item.data?.pdf) {
      const link = document.createElement("a");
      link.href = item.data.pdf;
      link.download = `fatura_${item.uc}.pdf`;
      link.click();
    }
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const successCount = history.filter(item => item.success).length;
  const errorCount = history.length - successCount;

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      <div className="relative z-10 container py-12 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl">
                    <HistoryIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent glow-text">
                  Histórico
                </h1>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Visualize suas consultas anteriores e resultados
              </p>
            </div>
            {history.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={clearHistory}
                className="h-12 px-6"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Limpar Histórico
              </Button>
            )}
          </div>

          {/* Stats */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in-delay-1">
              <Card className="glass-card border-white/10 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-3xl font-bold text-foreground">{history.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl">
                      <HistoryIcon className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sucessos</p>
                      <p className="text-3xl font-bold text-green-400">{successCount}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Erros</p>
                      <p className="text-3xl font-bold text-red-400">{errorCount}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History List */}
          {history.length === 0 ? (
            <Card className="glass-card border-white/10 fade-in">
              <CardContent className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full mb-6">
                  <HistoryIcon className="w-10 h-10 text-orange-400" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma consulta realizada ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Seu histórico de consultas aparecerá aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 fade-in-up">
              {history.map((item, index) => (
                <Card
                  key={item.timestamp}
                  className={`
                    glass-card border-2 shadow-xl card-hover
                    fade-in-delay-${Math.min(index + 1, 3)}
                    ${item.success
                      ? "border-green-500/30 bg-gradient-to-br from-green-950/20 to-emerald-950/20"
                      : "border-red-500/30 bg-gradient-to-br from-red-950/20 to-rose-950/20"
                    }
                  `}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {item.success ? (
                            <div className="p-2 bg-green-500/20 rounded-xl">
                              <CheckCircle2 className="w-6 h-6 text-green-400" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-500/20 rounded-xl">
                              <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                          )}
                          <CardTitle className="text-xl font-bold">
                            UC: {item.uc}
                          </CardTitle>
                          {item.success && (
                            <span className="badge-success text-xs px-3 py-1 rounded-full font-semibold">
                              ✓ Sucesso
                            </span>
                          )}
                          {!item.success && (
                            <span className="badge-error text-xs px-3 py-1 rounded-full font-semibold">
                              ✗ Erro
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {formatDateTime(item.timestamp)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.success && item.data?.pdf && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(item)}
                            className="border-slate-700/50 hover:bg-slate-800/50"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItem(item.timestamp)}
                          className="h-10 w-10 p-0 hover:bg-slate-800/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                          CPF/CNPJ
                        </span>
                        <p className="font-medium text-foreground">{item.cpfCnpj}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                          Data de Nascimento
                        </span>
                        <p className="font-medium text-foreground">{item.birthDate}</p>
                      </div>
                      {!item.success && item.data?.message && (
                        <div className="col-span-2 space-y-1">
                          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                            Mensagem de Erro
                          </span>
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="font-medium text-red-400 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              {item.data.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
