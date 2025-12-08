import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Trash2, Power, PowerOff, Clock, Send, Sparkles, Timer, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Schedule() {
  const [uc, setUc] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [scheduleType, setScheduleType] = useState<"once" | "daily">("once");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [multipleCount, setMultipleCount] = useState(1);
  const [intervalMinutes, setIntervalMinutes] = useState(3);

  const utils = trpc.useUtils();

  const { data: scheduledDispatches, isLoading } = trpc.invoice.listScheduled.useQuery();

  const scheduleMutation = trpc.invoice.schedule.useMutation({
    onSuccess: (data) => {
      const count = data.count || 1;
      toast.success(`${count} disparo(s) agendado(s) com sucesso!`, {
        icon: <Sparkles className="w-4 h-4 text-blue-400" />,
      });
      utils.invoice.listScheduled.invalidate();
      setUc("");
      setCpfCnpj("");
      setBirthDate("");
      setScheduleDate("");
      setScheduleTime("");
      setMultipleCount(1);
    },
    onError: (error) => {
      toast.error("Erro ao agendar: " + error.message);
    },
  });

  const deleteMutation = trpc.invoice.deleteScheduled.useMutation({
    onSuccess: () => {
      toast.success("Agendamento removido");
      utils.invoice.listScheduled.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const toggleMutation = trpc.invoice.toggleScheduled.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado");
      utils.invoice.listScheduled.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const sendNowMutation = trpc.invoice.request.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Envio realizado com sucesso!");
      } else {
        toast.error("Erro no envio: " + (data.error || "Erro desconhecido"));
      }
    },
    onError: (error) => {
      toast.error("Erro na requisição: " + error.message);
    },
  });

  const handleSendNow = () => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      toast.error("Data de nascimento deve estar no formato dd/mm/aaaa");
      return;
    }

    if (!uc || !cpfCnpj || !birthDate) {
      toast.error("Preencha todos os campos antes de enviar");
      return;
    }

    sendNowMutation.mutate({ uc, cpfCnpj, birthDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      toast.error("Data de nascimento deve estar no formato dd/mm/aaaa");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      toast.error("Selecione data e hora para o agendamento");
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    if (scheduledDateTime <= new Date()) {
      toast.error("A data/hora do agendamento deve ser no futuro");
      return;
    }

    if (multipleCount > 1) {
      scheduleMutation.mutate({
        uc,
        cpfCnpj,
        birthDate,
        scheduleType,
        scheduledTime: scheduledDateTime,
        multipleCount,
        intervalMinutes,
      });
    } else {
      scheduleMutation.mutate({
        uc,
        cpfCnpj,
        birthDate,
        scheduleType,
        scheduledTime: scheduledDateTime,
      });
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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeCount = scheduledDispatches?.filter(d => d.isActive).length || 0;
  const totalCount = scheduledDispatches?.length || 0;

  return (
    <div className="min-h-screen grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 gradient-animated opacity-5 pointer-events-none" />
      
      <div className="relative z-10 container py-12 md:py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent glow-text">
                Agendamentos
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Agende consultas automáticas de faturas com intervalos inteligentes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in-delay-1">
            <Card className="glass-card border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Agendado</p>
                    <p className="text-3xl font-bold text-foreground">{totalCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ativos</p>
                    <p className="text-3xl font-bold text-green-400">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                    <Power className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Inativos</p>
                    <p className="text-3xl font-bold text-muted-foreground">{totalCount - activeCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-slate-500/20 to-slate-600/20 rounded-xl">
                    <PowerOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Form */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                  <Timer className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-3xl font-bold">Novo Agendamento</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Configure disparos únicos ou recorrentes com intervalos automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 fade-in-delay-1">
                    <Label htmlFor="uc" className="text-sm font-semibold">Número da UC</Label>
                    <Input
                      id="uc"
                      value={uc}
                      onChange={(e) => setUc(e.target.value)}
                      placeholder="Digite o número da UC"
                      required
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-1">
                    <Label htmlFor="cpfCnpj" className="text-sm font-semibold">CPF/CNPJ</Label>
                    <Input
                      id="cpfCnpj"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00"
                      required
                      maxLength={18}
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-2">
                    <Label htmlFor="birthDate" className="text-sm font-semibold">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      value={birthDate}
                      onChange={(e) => setBirthDate(formatDate(e.target.value))}
                      placeholder="dd/mm/aaaa"
                      required
                      maxLength={10}
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-2">
                    <Label htmlFor="scheduleType" className="text-sm font-semibold">Tipo de Agendamento</Label>
                    <Select
                      value={scheduleType}
                      onValueChange={(value: "once" | "daily") => setScheduleType(value)}
                    >
                      <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        <SelectItem value="once">Uma vez</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 fade-in-delay-3">
                    <Label htmlFor="scheduleDate" className="text-sm font-semibold">Data</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-3">
                    <Label htmlFor="scheduleTime" className="text-sm font-semibold">Hora</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2 fade-in-delay-1">
                    <Label htmlFor="multipleCount" className="text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Quantidade de Envios
                    </Label>
                    <Input
                      id="multipleCount"
                      type="number"
                      min="1"
                      max="20"
                      value={multipleCount}
                      onChange={(e) => setMultipleCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {multipleCount > 1 
                        ? `✨ ${multipleCount} envios serão agendados com intervalo de ${intervalMinutes} minutos entre cada um`
                        : "1 envio único"}
                    </p>
                  </div>

                  {multipleCount > 1 && (
                    <div className="space-y-2 fade-in-delay-2">
                      <Label htmlFor="intervalMinutes" className="text-sm font-semibold flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Intervalo entre Envios (minutos)
                      </Label>
                      <Input
                        id="intervalMinutes"
                        type="number"
                        min="2"
                        max="10"
                        value={intervalMinutes}
                        onChange={(e) => setIntervalMinutes(Math.max(2, Math.min(10, parseInt(e.target.value) || 3)))}
                        className="input-focus h-12 bg-slate-800/50 border-slate-700/50"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        💡 Recomendado: 2-3 minutos para evitar sobrecarga no WhatsApp
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 fade-in-delay-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendNow}
                    className="flex-1 h-14 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
                    disabled={sendNowMutation.isPending || !uc || !cpfCnpj || !birthDate}
                  >
                    {sendNowMutation.isPending ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Enviar Agora
                      </>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-14 btn-primary font-semibold"
                    disabled={scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Agendando {multipleCount > 1 ? `${multipleCount} envios` : 'envio'}...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-3 h-5 w-5" />
                        Agendar {multipleCount > 1 ? `${multipleCount} Disparos` : 'Disparo'}
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Scheduled Dispatches List */}
          <Card className="glass-card border-white/10 shadow-2xl fade-in-up">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-3xl font-bold">Agendamentos Ativos</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Gerencie seus disparos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                </div>
              ) : scheduledDispatches && scheduledDispatches.length > 0 ? (
                <div className="space-y-4">
                  {scheduledDispatches.map((dispatch, index) => (
                    <div
                      key={dispatch.id}
                      className={`
                        glass-card border-white/10 p-6 rounded-2xl
                        card-hover fade-in-delay-${Math.min(index + 1, 3)}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="font-bold text-lg text-foreground">UC: {dispatch.uc}</span>
                            <span
                              className={`
                                text-xs px-3 py-1 rounded-full font-semibold
                                ${dispatch.scheduleType === "daily"
                                  ? "badge-info"
                                  : "badge-warning"
                                }
                              `}
                            >
                              {dispatch.scheduleType === "daily" ? "🔄 Diário" : "⚡ Uma vez"}
                            </span>
                            {dispatch.isActive ? (
                              <span className="badge-success text-xs px-3 py-1 rounded-full font-semibold">
                                ✓ Ativo
                              </span>
                            ) : (
                              <span className="badge-error text-xs px-3 py-1 rounded-full font-semibold">
                                ⏸ Inativo
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 pl-11">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">Próxima execução:</span>{" "}
                              {formatDateTime(dispatch.scheduledTime)}
                            </p>
                            {dispatch.lastExecuted && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Última execução:</span>{" "}
                                {formatDateTime(dispatch.lastExecuted)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: dispatch.id,
                                isActive: !dispatch.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                            className="h-10 w-10 p-0 border-slate-700/50 hover:bg-slate-800/50"
                          >
                            {dispatch.isActive ? (
                              <Power className="h-4 w-4 text-green-400" />
                            ) : (
                              <PowerOff className="h-4 w-4 text-red-400" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate({ id: dispatch.id })}
                            disabled={deleteMutation.isPending}
                            className="h-10 w-10 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-4">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Nenhum agendamento ativo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie seu primeiro agendamento usando o formulário acima
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
