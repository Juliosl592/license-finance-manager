import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { FileDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  const tableRef = useRef<HTMLTableElement>(null);

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
    
    // In a real implementation, this would generate a PDF file
    // For now, we'll just simulate the PDF export
    toast({
      title: "PDF Exportado",
      description: "La cotización ha sido exportada como PDF",
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

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-primary-dark">Resumen de Selección</h2>
          
          <Button 
            onClick={exportPDF}
            disabled={saveQuoteMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {saveQuoteMutation.isPending ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-neutral-200" id="summary-table">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Detalles</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Modalidad</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Plazo</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Precio Total</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cuota Mensual</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium">Licencias</td>
                <td className="px-6 py-4 whitespace-nowrap">{getLicenseDetails()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getLicenseModalidad()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getLicensePlazo()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">{formatCurrency(licenseOption.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{getLicenseMensual()}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium">Bolsa de Horas</td>
                <td className="px-6 py-4 whitespace-nowrap">{getHourDetails()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getHourModalidad()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getHourPlazo()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">{formatCurrency(hourOption.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{getHourMensual()}</td>
              </tr>
              <tr className="bg-neutral-100">
                <td className="px-6 py-4 whitespace-nowrap font-bold" colSpan={4}>TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold">{formatCurrency(licenseOption.total + hourOption.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold">{getTotalMensual()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
