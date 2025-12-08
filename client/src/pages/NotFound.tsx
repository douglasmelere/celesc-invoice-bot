import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      <div className="relative z-10 container px-4">
        <Card className="glass-card border-white/10 shadow-2xl max-w-2xl mx-auto fade-in">
          <CardContent className="pt-12 pb-12 px-8 text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full">
                  <AlertCircle className="relative h-20 w-20 text-red-400" />
                </div>
              </div>
            </div>

            <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent mb-4 glow-text">
              404
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Página Não Encontrada
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto">
              Desculpe, a página que você está procurando não existe.
              <br />
              Ela pode ter sido movida ou removida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGoHome}
                className="h-12 px-8 btn-primary font-semibold text-base"
              >
                <Home className="mr-2 h-5 w-5" />
                Voltar ao Início
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="h-12 px-8 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all font-semibold text-base"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
