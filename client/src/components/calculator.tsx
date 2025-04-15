import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, Users, CreditCard, BadgeDollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CalculatorProps {
  calculator: {
    licenseQty: number;
    licensePrice: number;
  };
  onChange: (key: string, value: number) => void;
  onCalculate: () => void;
}

export default function Calculator({ calculator, onChange, onCalculate }: CalculatorProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value === '' ? '' : (parseInt(e.target.value) || 0);
    onChange(key, value);
  };

  // Calculate the total without formatting
  const totalRaw = calculator.licenseQty * calculator.licensePrice;
  // Format for display
  const total = formatCurrency(totalRaw);

  return (
    <Card className="bg-white shadow-md border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
        <div className="flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Calculadora de Cotización</h1>
        </div>
        <p className="text-white/80 mt-1">Ingrese los datos para calcular opciones de pago</p>
      </div>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="license-qty" className="text-sm font-medium flex items-center text-gray-700">
              <Users className="h-4 w-4 mr-1 text-primary" />
              Cantidad de Licencias
            </Label>
            <div className="relative">
              <Input 
                id="license-qty" 
                type="number" 
                min="1" 
                value={calculator.licenseQty}
                onChange={(e) => handleInputChange(e, "licenseQty")}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="license-price" className="text-sm font-medium flex items-center text-gray-700">
              <BadgeDollarSign className="h-4 w-4 mr-1 text-primary" />
              Precio Unitario
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">$</span>
              </div>
              <Input 
                id="license-price" 
                type="number" 
                min="0" 
                step="1000" 
                value={calculator.licensePrice}
                onChange={(e) => handleInputChange(e, "licensePrice")}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total sin financiamiento:</p>
              <p className="text-2xl font-bold text-primary-dark">{total}</p>
            </div>
            <Button 
              onClick={onCalculate} 
              className="bg-primary text-white hover:bg-primary/90 shadow-sm flex items-center gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              Calcular Opciones de Pago
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
