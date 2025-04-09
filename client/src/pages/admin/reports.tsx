import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/layout/admin-layout";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";
import { FileDown, FileText, Table, Users, Activity } from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Fetch statistics
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const getReportTitle = () => {
    switch (reportType) {
      case "users": return "Usuarios Registrados";
      case "quotes": return "Cotizaciones";
      case "activity": return "Actividad de Usuarios";
      default: return "Informe";
    }
  };

  const getReportIcon = () => {
    switch (reportType) {
      case "users": return <Users className="h-4 w-4 mr-2" />;
      case "quotes": return <FileText className="h-4 w-4 mr-2" />;
      case "activity": return <Activity className="h-4 w-4 mr-2" />;
      default: return <FileDown className="h-4 w-4 mr-2" />;
    }
  };

  // Función para exportar como CSV
  const exportAsCSV = () => {
    if (!stats || !stats.userStats.length) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Nombre,Empresa,Cotizaciones,Última Actividad\n";
    
    // Datos
    stats.userStats.forEach(stat => {
      csvContent += `${stat.name},${stat.company},${stat.quoteCount},${stat.lastActivity}\n`;
    });
    
    // Crear link para descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `informe_${reportType}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar como Excel (en realidad CSV con extensión .xlsx)
  const exportAsExcel = () => {
    if (!stats || !stats.userStats.length) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Nombre,Empresa,Cotizaciones,Última Actividad\n";
    
    // Datos
    stats.userStats.forEach(stat => {
      csvContent += `${stat.name},${stat.company},${stat.quoteCount},${stat.lastActivity}\n`;
    });
    
    // Crear link para descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `informe_${reportType}_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar como PDF
  const exportAsPDF = () => {
    if (!stats || !stats.userStats.length) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    if (!tableRef.current) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
      return;
    }

    const exportElement = document.createElement('div');
    exportElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 15px;">
          <h1 style="color: #2563eb; margin-bottom: 5px; font-size: 22px;">Informe: ${getReportTitle()}</h1>
          <p style="color: #666; margin: 0; font-size: 14px;">Fecha: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <p style="margin: 5px 0;"><strong>Total de cotizaciones:</strong> ${stats.totalQuotes}</p>
              <p style="margin: 5px 0;"><strong>Usuarios activos:</strong> ${stats.activeUsers}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Cotizaciones mensuales:</strong> ${stats.monthlyQuotes}</p>
              <p style="margin: 5px 0;"><strong>Referencia:</strong> REP-${new Date().getTime().toString().slice(-6)}</p>
            </div>
          </div>
        </div>
        
        <div>
          ${tableRef.current.outerHTML}
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>Informe generado automáticamente por el sistema de cotización.</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `informe_${reportType}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(exportElement).set(opt).save().then(() => {
      toast({
        title: "PDF Exportado",
        description: "El informe ha sido exportado como PDF",
      });
    }).catch(error => {
      console.error("Error al exportar PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    });
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);

    try {
      switch (reportFormat) {
        case "pdf":
          exportAsPDF();
          break;
        case "excel":
          exportAsExcel();
          break;
        case "csv":
          exportAsCSV();
          break;
        default:
          exportAsPDF();
      }

      toast({
        title: "Generación de informe",
        description: `El informe de ${getReportTitle()} en formato ${reportFormat.toUpperCase()} se ha generado correctamente.`,
      });
    } catch (error) {
      console.error("Error al generar informe:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
              <table ref={tableRef} className="min-w-full divide-y divide-neutral-200">
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
            
            <Button 
              className="mt-4 flex items-center gap-2" 
              onClick={handleGenerateReport}
              disabled={isGenerating || isLoading || !stats?.userStats.length}
            >
              {getReportIcon()}
              {isGenerating ? "Generando..." : "Generar Informe"}
            </Button>
            
            <div className="mt-2 text-sm text-gray-500">
              {isLoading ? 
                "Cargando datos..." : 
                !stats?.userStats.length ? 
                  "No hay datos suficientes para generar informes" : 
                  `Se generará un informe de ${getReportTitle()} en formato ${reportFormat.toUpperCase()}`
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
