import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, DollarSign, Clock, TrendingUp } from "lucide-react";

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
  const cashOptions = options.filter(option => option.type === "cash");
  const financedOptions = options.filter(option => option.type === "financed");

  return (
    <Card className="bg-white shadow-md border-0">
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-primary mb-6 flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-primary" />
          Opciones de Pago para Licencias
        </h2>
        
        <div className="space-y-6">
          {/* Cash options section */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-primary-dark border-b pb-2">Pago de contado</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {cashOptions.map((option) => (
                <div 
                  key={option.id} 
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all 
                    ${selectedOption === option.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
                    }
                  `}
                  onClick={() => onSelect(option.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">Pago único</h4>
                      <p className="text-sm text-gray-500">Sin intereses</p>
                    </div>
                    {selectedOption === option.id && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-primary-dark">
                      {formatCurrency(option.total)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Precio final</p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="license-option" 
                      value={option.id} 
                      checked={selectedOption === option.id}
                      onChange={() => onSelect(option.id)}
                      className="h-4 w-4 text-primary focus:ring-primary mr-2"
                    />
                    <span className="text-sm font-medium">Seleccionar opción</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Financed options section */}
          {financedOptions.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3 text-primary-dark border-b pb-2">Opciones de financiamiento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financedOptions.map((option) => (
                  <div 
                    key={option.id} 
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedOption === option.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
                      }
                    `}
                    onClick={() => onSelect(option.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{option.months} meses</h4>
                        <p className="text-sm text-gray-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Tasa: {option.rate}% EA
                        </p>
                      </div>
                      {selectedOption === option.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Cuota mensual</p>
                        <p className="text-xl font-bold text-primary-dark">
                          {formatCurrency(option.monthly!)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Precio final</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {formatCurrency(option.total)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="license-option" 
                        value={option.id} 
                        checked={selectedOption === option.id}
                        onChange={() => onSelect(option.id)}
                        className="h-4 w-4 text-primary focus:ring-primary mr-2"
                      />
                      <span className="text-sm font-medium">Seleccionar opción</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
