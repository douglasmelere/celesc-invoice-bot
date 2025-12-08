import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, BellOff, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Settings() {
  const { permission, requestPermission, sendNotification, isSupported, isGranted } =
    useNotifications();

  const handleTestNotification = () => {
    sendNotification("Notificação de Teste", {
      body: "As notificações estão funcionando corretamente!",
      tag: "test",
    });
  };

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      <div className="relative z-10 container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-slate-500 to-slate-600 p-4 rounded-2xl">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 bg-clip-text text-transparent glow-text">
                Configurações
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Gerencie suas preferências e notificações do sistema
            </p>
          </div>

          {/* Notifications Settings */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-3xl font-bold">Notificações Push</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Receba notificações quando seus agendamentos forem executados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSupported ? (
                <div className="p-6 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-amber-950/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-400 mb-1">
                        Navegador não suportado
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Seu navegador não suporta notificações push. Tente usar Chrome, Firefox ou Edge.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="glass-card border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold text-foreground text-lg">Status das Notificações</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {permission === "granted" && "✓ Notificações ativadas e funcionando"}
                          {permission === "denied" && "✗ Notificações bloqueadas pelo navegador"}
                          {permission === "default" && "⚠ Permissão ainda não foi solicitada"}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isGranted ? (
                          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          </div>
                        ) : permission === "denied" ? (
                          <div className="p-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl">
                            <BellOff className="w-8 h-8 text-red-400" />
                          </div>
                        ) : (
                          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl">
                            <Bell className="w-8 h-8 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isGranted && permission !== "denied" && (
                    <Button 
                      onClick={requestPermission} 
                      className="w-full h-14 btn-primary font-semibold text-base"
                    >
                      <Bell className="mr-3 h-5 w-5" />
                      Ativar Notificações
                    </Button>
                  )}

                  {permission === "denied" && (
                    <div className="p-6 border-2 border-red-500/30 bg-gradient-to-br from-red-950/20 to-rose-950/20 rounded-2xl">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-400 mb-2">
                            Notificações bloqueadas
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            Para ativar as notificações, siga estes passos:
                          </p>
                        </div>
                      </div>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                        <li>Clique no ícone de cadeado na barra de endereço do navegador</li>
                        <li>Encontre a configuração de "Notificações"</li>
                        <li>Altere para "Permitir"</li>
                        <li>Recarregue esta página</li>
                      </ol>
                    </div>
                  )}

                  {isGranted && (
                    <Button
                      variant="outline"
                      onClick={handleTestNotification}
                      className="w-full h-12 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Enviar Notificação de Teste
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* About */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Info className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-3xl font-bold">Sobre o Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                Sistema automatizado para consulta de faturas CELESC através de integração
                com bot via WhatsApp. O sistema permite agendar consultas automáticas e
                receber notificações quando os processos forem concluídos.
              </p>
              <p>
                Os agendamentos são executados automaticamente em segundo plano, mesmo com
                a aba fechada, e você receberá notificações quando as consultas forem
                concluídas com sucesso.
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-foreground mb-2">Recursos principais:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Consulta instantânea de faturas</li>
                  <li>Agendamento de disparos automáticos</li>
                  <li>Notificações push em tempo real</li>
                  <li>Histórico completo de consultas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
