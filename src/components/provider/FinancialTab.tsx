import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Hash, BarChart3, FileText, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointmentsByProvider } from "@/hooks/useAppointments";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface CompletedAppointment {
  id: string;
  appointment_date: string;
  service: { name: string; price: number } | null;
}

interface FinancialTabProps {
  providerId: string;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' });
};

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#EAB308', '#3B82F6', '#8B5CF6', '#EC4899'];

export function FinancialTab({ providerId }: FinancialTabProps) {
  const { data: allAppointments = [], isLoading } = useAppointmentsByProvider(providerId);

  const [timeRange, setTimeRange] = useState("this_month");
  const [chartType, setChartType] = useState<"monthly" | "daily">("daily");

  const completedAppointments = useMemo(() => {
    return allAppointments
      .filter((apt) => apt.status === "completed")
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()) as unknown as CompletedAppointment[];
  }, [allAppointments]);

  // Filter based on selected time range
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); // all time
    
    if (timeRange === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    return completedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date + "T00:00:00");
        return aptDate >= startDate;
    });
  }, [completedAppointments, timeRange]);

  // General Aggregations
  const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.service?.price ?? 0), 0);
  const totalServices = filteredAppointments.length;
  const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

  // Pie Chart Data: Revenue by Service
  const revenueByService = useMemo(() => {
    const map = new Map<string, number>();
    filteredAppointments.forEach(apt => {
      const name = apt.service?.name || "Outros";
      const price = apt.service?.price || 0;
      map.set(name, (map.get(name) || 0) + price);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // sort by highest revenue
  }, [filteredAppointments]);

  const topService = revenueByService.length > 0 ? revenueByService[0] : null;

  // Time Series Chart Data (Daily or Monthly)
  const timeSeriesData = useMemo(() => {
    const map = new Map<string, number>();
    
    filteredAppointments.forEach((apt) => {
      const d = new Date(apt.appointment_date + "T00:00:00");
      let key = "";
      if (chartType === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      } else {
        key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      map.set(key, (map.get(key) ?? 0) + (apt.service?.price ?? 0));
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        let label = key;
        if (chartType === "monthly") {
            const [, monthIdx] = key.split("-");
            label = MONTH_LABELS[parseInt(monthIdx)];
        }
        return { label, Faturamento: value };
      });
  }, [filteredAppointments, chartType]);

  const recentActivity = filteredAppointments.slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Faturamento Detalhado
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Acompanhe a saúde financeira no período selecionado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-12 rounded-xl bg-card border-border/60 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 shadow-medium">
              <SelectItem value="7d" className="rounded-lg cursor-pointer">Últimos 7 dias</SelectItem>
              <SelectItem value="30d" className="rounded-lg cursor-pointer">Últimos 30 dias</SelectItem>
              <SelectItem value="this_month" className="rounded-lg cursor-pointer">Este mês</SelectItem>
              <SelectItem value="this_year" className="rounded-lg cursor-pointer">Este ano</SelectItem>
              <SelectItem value="all" className="rounded-lg cursor-pointer">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-card/60 backdrop-blur-md border border-border/60 shadow-sm hover:shadow-medium hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground w-full">Faturamento Total</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground tracking-tight">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border/60 shadow-sm hover:shadow-medium hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-accent/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground w-full">Serviços Realizados</span>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Hash className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground tracking-tight">
              {totalServices}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border/60 shadow-sm hover:shadow-medium hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground w-full">Ticket Médio</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground tracking-tight">
              {formatCurrency(averageTicket)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border/60 shadow-sm hover:shadow-medium hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground line-clamp-1 w-full" title="Mais Lucrativo">Mais Lucrativo</span>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                <PieChartIcon className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-display font-bold text-foreground truncate" title={topService?.name || "Nenhum"}>
                {topService?.name || "N/A"}
              </p>
              {topService && (
                <span className="text-sm font-medium text-green-500 mt-1">
                  {formatCurrency(topService.value)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2 border border-border/60 shadow-soft bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-5 bg-card/60">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground text-xl">
                <BarChart3 className="h-5 w-5 text-primary" />
                Evolução do Faturamento
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Visualização da receita no período</p>
            </div>
            <div className="flex bg-muted p-1 rounded-lg mt-4 sm:mt-0">
              <button 
                onClick={() => setChartType("daily")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === 'daily' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Diário
              </button>
              <button 
                onClick={() => setChartType("monthly")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Mensal
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {timeSeriesData.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(v) => `R$ ${v}`}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-medium)",
                        color: "hsl(var(--foreground))"
                      }}
                      formatter={(val: number) => [formatCurrency(val), "Faturamento"]}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
                    />
                    <Bar
                      dataKey="Faturamento"
                      fill="url(#colorFaturamento)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                  <p>Não há dados suficientes para gerar o gráfico neste período.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="border border-border/60 shadow-soft bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-5 bg-card/60">
            <CardTitle className="flex items-center gap-2 text-foreground text-xl">
              <PieChartIcon className="h-5 w-5 text-accent" />
              Receita por Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {revenueByService.length > 0 ? (
               <div className="h-[320px] w-full flex flex-col items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "var(--shadow-medium)",
                          color: "hsl(var(--foreground))"
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                     />
                     <Pie
                       data={revenueByService}
                       cx="50%"
                       cy="45%"
                       innerRadius={70}
                       outerRadius={95}
                       paddingAngle={5}
                       dataKey="value"
                       animationDuration={1500}
                     >
                       {revenueByService.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                      />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            ) : (
               <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <PieChartIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>Não há serviços concluídos neste período.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="border border-border/60 shadow-soft bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-card/60">
          <CardTitle className="flex items-center gap-2 text-foreground text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Entradas Recentes
            <div className="ml-auto text-sm font-normal text-muted-foreground">
              Últimos 10 serviços
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground opacity-60" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">
                Nenhum serviço concluído
              </h3>
              <p className="text-muted-foreground">
                Finalize os agendamentos para vê-los no histórico.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="pl-6 h-12">Data</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right pr-6">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-muted/40 transition-colors border-border/40">
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-foreground">{formatDate(apt.appointment_date)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                         <span className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                           {apt.service?.name ?? "—"}
                         </span>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <span className="inline-flex items-center font-bold text-green-600 dark:text-green-500 bg-green-500/10 px-3 py-1 rounded-lg">
                          + {formatCurrency(apt.service?.price ?? 0)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
