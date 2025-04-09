import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/layout/admin-layout";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type UserStat = {
  name: string;
  company: string;
  quoteCount: number;
  lastActivity: string;
};

type Stats = {
  totalQuotes: number;
  activeUsers: number;
  monthlyQuotes: number;
  userStats: UserStat[];
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("users");
  const [reportFormat, setReportFormat] = useState("pdf");

  // Fetch statistics
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const handleGenerateReport = () => {
    toast({
      title: "Generación de informe",
      description: `El informe de ${reportType} en formato ${reportFormat} se ha generado correctamente.`,
    });
  };

  return (
    <AdminLayout activeItem="reports">
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-400">Total de Cotizaciones</h3>
                <span className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : stats?.totalQuotes || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-400">Usuarios Activos</h3>
                <span className="text-2xl font-bold text-blue-500">
                  {isLoading ? "..." : stats?.activeUsers || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-400">Cotizaciones Mensuales</h3>
                <span className="text-2xl font-bold text-pink-500">
                  {isLoading ? "..." : stats?.monthlyQuotes || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User Stats */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-primary-dark mb-4">Cotizaciones por Usuario</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cotizaciones</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Última Actividad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">Cargando estadísticas...</td>
                    </tr>
                  ) : stats?.userStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">No hay datos disponibles</td>
                    </tr>
                  ) : (
                    stats?.userStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.quoteCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.lastActivity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Generation */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-primary-dark mb-4">Exportar Informes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Informe</Label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Seleccionar tipo de informe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Usuarios Registrados</SelectItem>
                    <SelectItem value="quotes">Cotizaciones</SelectItem>
                    <SelectItem value="activity">Actividad de Usuarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-format">Formato</Label>
                <Select
                  value={reportFormat}
                  onValueChange={setReportFormat}
                >
                  <SelectTrigger id="report-format">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="mt-4" onClick={handleGenerateReport}>
              Generar Informe
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
