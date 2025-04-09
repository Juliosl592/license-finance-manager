import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { FileDown, Check, CalendarDays, DollarSign, Receipt, CreditCard, Layers } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";

interface LicenseOption {
  id: string;
  type: "cash" | "financed";
  months?: number;
  rate?: number;
  total: number;
  monthly?: number;
}

interface HourOption {
  id: string;
  packageId: number;
  packageName: string;
  hours: number;
  type: "cash" | "financed";
  months?: number;
  rate?: number;
  total: number;
  monthly?: number;
}

interface SummaryTableProps {
  licenseQty: number;
  licensePrice: number;
  licenseOption: LicenseOption;
  hourOption: HourOption;
}

export default function SummaryTable({ 
  licenseQty, 
  licensePrice, 
  licenseOption, 
  hourOption 
}: SummaryTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  // Save quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quotes", {
        licenseQty,
        licensePrice,
        selectedLicenseOption: licenseOption.id,
        selectedHourOption: hourOption.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Cotización guardada",
        description: "La cotización ha sido guardada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización",
        variant: "destructive",
      });
    },
  });

  const exportPDF = () => {
    saveQuoteMutation.mutate();
    
    if (!tableRef.current) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
      return;
    }

    // Creamos un div que contendrá la tabla para exportar
    const exportElement = document.createElement('div');
    exportElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 5px;">Cotización de Licencias y Servicios</h1>
          <p style="color: #666; margin: 0;">Resumen de selección y costos</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <p><strong>Cliente:</strong> ${user?.name || 'Cliente'}</p>
            <p><strong>Empresa:</strong> ${user?.company || 'Empresa'}</p>
          </div>
          <div>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Referencia:</strong> COT-${new Date().getTime().toString().slice(-6)}</p>
          </div>
        </div>
        
        <div>
          ${tableRef.current.outerHTML}
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
          <p><strong>Condiciones:</strong></p>
          <ul style="padding-left: 20px;">
            <li>Esta cotización tiene validez por 30 días a partir de la fecha de emisión.</li>
            <li>Los precios incluyen impuestos aplicables según la legislación vigente.</li>
            <li>Las condiciones de financiamiento están sujetas a aprobación crediticia.</li>
          </ul>
          <p style="margin-top: 20px; text-align: center; font-style: italic;">Gracias por confiar en nuestros servicios.</p>
        </div>
      </div>
    `;

    // Configuración para el PDF
    const opt = {
      margin: 10,
      filename: `cotizacion_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generamos el PDF
    html2pdf().from(exportElement).set(opt).save().then(() => {
      toast({
        title: "PDF Exportado",
        description: "La cotización ha sido exportada como PDF",
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

  // Helper functions for summary details
  const getLicenseDetails = () => {
    return `${licenseQty} licencias x ${formatCurrency(licensePrice)} c/u`;
  };

  const getLicenseModalidad = () => {
    return licenseOption.type === "cash" ? "Contado" : "Financiado";
  };

  const getLicensePlazo = () => {
    return licenseOption.type === "cash" ? "N/A" : `${licenseOption.months} meses`;
  };

  const getHourDetails = () => {
    return `${hourOption.packageName} - ${hourOption.hours} horas`;
  };

  const getHourModalidad = () => {
    return hourOption.type === "cash" ? "Contado" : "Financiado";
  };

  const getHourPlazo = () => {
    return hourOption.type === "cash" ? "N/A" : `${hourOption.months} meses`;
  };

  const getLicenseMensual = () => {
    return licenseOption.type === "cash" ? "N/A" : formatCurrency(licenseOption.monthly!);
  };

  const getHourMensual = () => {
    return hourOption.type === "cash" ? "N/A" : formatCurrency(hourOption.monthly!);
  };

  const getTotalMensual = () => {
    const licenseMensual = licenseOption.type === "cash" ? 0 : licenseOption.monthly!;
    const hourMensual = hourOption.type === "cash" ? 0 : hourOption.monthly!;
    return formatCurrency(licenseMensual + hourMensual);
  };

  const finalTotal = licenseOption.total + hourOption.total;

  return (
    <Card className="bg-white shadow-md border-0">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
        <div className="flex items-center">
          <Receipt className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold">Resumen de Selección</h2>
        </div>
        <p className="text-white/80 mt-1">Cotización completa con opciones seleccionadas</p>
      </div>
      
      <CardContent className="pt-6">
        <div className="flex justify-end mb-6">
          <Button 
            onClick={exportPDF}
            disabled={saveQuoteMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2"
            size="lg"
          >
            <FileDown className="h-4 w-4" />
            {saveQuoteMutation.isPending ? "Exportando..." : "Guardar y Exportar PDF"}
          </Button>
        </div>
        
        <div ref={tableRef} className="space-y-6" id="summary-content">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-lg border border-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Check className="h-4 w-4 mr-1 text-primary" />
                Datos del Cliente
              </h3>
              <p className="font-medium text-lg">{user?.name || 'Cliente'}</p>
              <p className="text-gray-700">{user?.company || 'Empresa'}</p>
              <p className="text-gray-500 text-sm mt-2">{user?.email}</p>
            </div>
            
            <div className="rounded-lg border border-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-primary" />
                Información de la Cotización
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Fecha</p>
                  <p className="text-gray-700">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Referencia</p>
                  <p className="text-gray-700">COT-{new Date().getTime().toString().slice(-6)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Licenses Row */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <div className="flex items-center">
                <Layers className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-bold text-gray-800">Licencias de Software</h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Detalle</p>
                  <p className="font-medium">{getLicenseDetails()}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Modalidad</p>
                  <p className="font-medium">{getLicenseModalidad()}</p>
                  {licenseOption.type === "financed" && (
                    <p className="text-xs text-gray-500 mt-1">Tasa: {licenseOption.rate}% EA</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Plazo</p>
                  <p className="font-medium">{getLicensePlazo()}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Precio Total</p>
                  <p className="font-bold text-primary-dark">{formatCurrency(licenseOption.total)}</p>
                  {licenseOption.type === "financed" && (
                    <p className="text-xs font-medium text-primary mt-1">
                      {getLicenseMensual()}/mes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Hours Row */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-bold text-gray-800">Bolsa de Horas</h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Detalle</p>
                  <p className="font-medium">{getHourDetails()}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Modalidad</p>
                  <p className="font-medium">{getHourModalidad()}</p>
                  {hourOption.type === "financed" && (
                    <p className="text-xs text-gray-500 mt-1">Tasa: {hourOption.rate}% EA</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Plazo</p>
                  <p className="font-medium">{getHourPlazo()}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Precio Total</p>
                  <p className="font-bold text-primary-dark">{formatCurrency(hourOption.total)}</p>
                  {hourOption.type === "financed" && (
                    <p className="text-xs font-medium text-primary mt-1">
                      {getHourMensual()}/mes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Summary */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-1" />
                  Total de la cotización
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Incluye licencias y bolsa de horas
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-primary-dark">
                    {formatCurrency(finalTotal)}
                  </span>
                  
                  {(licenseOption.type === "financed" || hourOption.type === "financed") && (
                    <span className="text-sm font-medium text-primary mt-1">
                      Cuota mensual: {getTotalMensual()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="text-sm text-gray-500 p-4 border-t border-gray-100 mt-4">
            <p>Esta cotización tiene validez de 30 días a partir de la fecha de emisión.</p>
            <p>Los precios están sujetos a cambio sin previo aviso.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
