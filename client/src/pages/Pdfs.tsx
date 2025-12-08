import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, RefreshCw, Sparkles, Receipt, FileBarChart, Eye, X, ArrowDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Pdfs() {
  const [newPdfCount, setNewPdfCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; filename: string } | null>(null);

  const { data: pdfs, isLoading, refetch } = trpc.pdf.list.useQuery(undefined, {
    refetchInterval: 25000,
  });

  const utils = trpc.useUtils();

  const deleteMutation = trpc.pdf.delete.useMutation({
    onSuccess: () => {
      toast.success("PDF removido");
      utils.pdf.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const faturas = pdfs?.filter(pdf => pdf.pdfType === "fatura") || [];
  const resumos = pdfs?.filter(pdf => pdf.pdfType === "resumo") || [];

  useEffect(() => {
    if (pdfs && pdfs.length > lastCount) {
      const newCount = pdfs.length - lastCount;
      setNewPdfCount(newCount);
      if (lastCount > 0) {
        toast.success(`${newCount} novo(s) PDF(s) recebido(s)!`, {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        });
      }
      setLastCount(pdfs.length);
    }
  }, [pdfs, lastCount]);

  const handleDownload = async (pdfId: number, filename: string) => {
    try {
      const result = await utils.pdf.getUrl.fetch({ id: pdfId });
      const downloadUrl = result.url;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Erro ao baixar PDF");
      console.error("Download error:", error);
    }
  };

  const handleView = async (pdfId: number) => {
    try {
      const result = await utils.pdf.getUrl.fetch({ id: pdfId });
      const pdf = pdfs?.find(p => p.id === pdfId);
      if (pdf) {
        setViewingPdf({ url: result.url, filename: pdf.filename });
      }
    } catch (error) {
      toast.error("Erro ao visualizar PDF");
      console.error("View error:", error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${kb.toFixed(2)} KB`;
  };

  const renderPdfList = (pdfList: typeof pdfs, emptyMessage: string, icon: React.ReactNode, type: "fatura" | "resumo") => {
    if (isLoading && !pdfs) {
      return (
        <div className="flex flex-col items-center justify-center py-20 fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <RefreshCw className="relative w-16 h-16 text-purple-400 animate-spin" />
          </div>
          <p className="text-muted-foreground text-lg">Carregando PDFs...</p>
        </div>
      );
    }

    if (!pdfList || pdfList.length === 0) {
      return (
        <Card className="glass-card border-white/10 fade-in">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-6">
              {icon}
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">{emptyMessage}</p>
            <p className="text-sm text-muted-foreground">
              O sistema está verificando a cada 25 segundos
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pdfList.map((pdf, index) => (
          <Card
            key={pdf.id}
            className={`
              glass-card border-white/10 shadow-xl
              card-hover fade-in-delay-${Math.min(index + 1, 3)}
            `}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${
                      type === "fatura" 
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20" 
                        : "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        type === "fatura" ? "text-blue-400" : "text-purple-400"
                      }`} />
                    </div>
                    <CardTitle className="text-lg font-bold truncate">
                      {pdf.filename}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {formatDateTime(pdf.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowDown className="w-4 h-4" />
                  <span className="font-medium">{formatFileSize(pdf.fileSize ?? undefined)}</span>
                </div>
                <span className="badge-success text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Disponível
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(pdf.id)}
                  className="flex-1 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(pdf.id, pdf.filename)}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white border-0 transition-all"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id: pdf.id })}
                  disabled={deleteMutation.isPending}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      <div className="relative z-10 container py-12 md:py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent glow-text">
                    PDFs Gerados
                  </h1>
                  {newPdfCount > 0 && (
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm font-semibold text-purple-300">
                        {newPdfCount} novo{newPdfCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Atualização automática a cada 25 segundos
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-12 px-6 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 fade-in-delay-1">
            <Card className="glass-card border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Faturas</p>
                    <p className="text-3xl font-bold text-blue-400">{faturas.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Resumos</p>
                    <p className="text-3xl font-bold text-purple-400">{resumos.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                    <FileBarChart className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardContent className="p-6">
              <Tabs defaultValue="faturas" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-slate-800/50">
                  <TabsTrigger 
                    value="faturas" 
                    className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all"
                  >
                    <Receipt className="w-5 h-5" />
                    Faturas ({faturas.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resumos" 
                    className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all"
                  >
                    <FileBarChart className="w-5 h-5" />
                    Resumos ({resumos.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="faturas" className="mt-0">
                  {renderPdfList(
                    faturas,
                    "Nenhuma fatura recebida ainda",
                    <Receipt className="w-10 h-10 text-blue-400" />,
                    "fatura"
                  )}
                </TabsContent>

                <TabsContent value="resumos" className="mt-0">
                  {renderPdfList(
                    resumos,
                    "Nenhum resumo recebido ainda",
                    <FileBarChart className="w-10 h-10 text-purple-400" />,
                    "resumo"
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPdf} onOpenChange={(open) => !open && setViewingPdf(null)}>
        <DialogContent className="max-w-7xl w-full h-[95vh] p-0 glass border-white/10">
          <DialogHeader className="px-8 pt-8 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <span className="font-bold">{viewingPdf?.filename}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingPdf(null)}
                className="h-10 w-10 p-0 hover:bg-slate-800/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-slate-900/50">
            {viewingPdf && (
              <iframe
                src={viewingPdf.url}
                className="w-full h-full border-0"
                title={viewingPdf.filename}
                style={{ minHeight: 'calc(95vh - 120px)' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
