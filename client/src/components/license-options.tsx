import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface LicenseOption {
  id: string;
  type: "cash" | "financed";
  months?: number;
  rate?: number;
  total: number;
  monthly?: number;
}

interface LicenseOptionsProps {
  options: LicenseOption[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
}

export default function LicenseOptions({ options, selectedOption, onSelect }: LicenseOptionsProps) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-primary-dark mb-6">Opciones de Pago para Licencias</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Modalidad</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Plazo</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Tasa EA</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Precio Total</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cuota Mensual</th>
                <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Seleccionar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {options.map((option) => (
                <tr key={option.id} className={selectedOption === option.id ? "bg-primary bg-opacity-5" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {option.type === "cash" ? "Contado" : "Financiado"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {option.type === "cash" ? "N/A" : `${option.months} meses`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {option.type === "cash" ? "N/A" : `${option.rate}%`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">
                    {formatCurrency(option.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    {option.type === "cash" ? "N/A" : formatCurrency(option.monthly!)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="radio" 
                      name="license-option" 
                      value={option.id} 
                      checked={selectedOption === option.id}
                      onChange={() => onSelect(option.id)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
