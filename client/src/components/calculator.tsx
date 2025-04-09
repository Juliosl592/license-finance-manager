import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    const value = parseInt(e.target.value) || 0;
    onChange(key, value);
  };

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <h1 className="text-2xl font-medium text-neutral-700 mb-6">Calculadora de Cotización</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="license-qty">Cantidad de Licencias</Label>
            <Input 
              id="license-qty" 
              type="number" 
              min="1" 
              value={calculator.licenseQty}
              onChange={(e) => handleInputChange(e, "licenseQty")}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="license-price">Precio Unitario</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">$</span>
              </div>
              <Input 
                id="license-price" 
                type="number" 
                min="0" 
                step="1000" 
                value={calculator.licensePrice}
                onChange={(e) => handleInputChange(e, "licensePrice")}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onCalculate} 
          className="mt-6 bg-primary text-white hover:bg-primary/90"
        >
          Calcular Opciones
        </Button>
      </CardContent>
    </Card>
  );
}
