import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Clock, TrendingUp, Package, Timer } from "lucide-react";

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

interface HourOptionsProps {
  options: HourOption[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
}

export default function HourOptions({ options, selectedOption, onSelect }: HourOptionsProps) {
  // Group options by package
  const groupedOptions: Record<number, HourOption[]> = {};
  
  options.forEach(option => {
    if (!groupedOptions[option.packageId]) {
      groupedOptions[option.packageId] = [];
    }
    groupedOptions[option.packageId].push(option);
  });

  return (
    <Card className="bg-white shadow-md border-0">
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-primary mb-6 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Bolsas de Horas de Servicio
        </h2>

        <div className="space-y-8">
          {Object.entries(groupedOptions).map(([packageId, packageOptions]) => {
            const packageInfo = packageOptions[0]; // Get first item for package info
            const cashOptions = packageOptions.filter(o => o.type === "cash");
            const financedOptions = packageOptions.filter(o => o.type === "financed");
            
            return (
              <div key={packageId} className="rounded-lg border border-gray-100 overflow-hidden">
                <div className="bg-primary/10 p-4 border-b">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-bold text-lg text-primary-dark">
                      {packageInfo.packageName}
                    </h3>
                    <div className="ml-4 flex items-center bg-white px-3 py-1 rounded-full">
                      <Timer className="h-4 w-4 text-primary mr-1" />
                      <span className="text-sm font-medium">{packageInfo.hours} horas</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Cash option */}
                    {cashOptions.length > 0 && cashOptions.map(option => (
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-base text-gray-800">Pago único</h4>
                            <p className="text-sm text-gray-500">Sin intereses</p>
                          </div>
                          {selectedOption === option.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-2xl font-bold text-primary-dark">
                            {formatCurrency(option.total)}
                          </p>
                          <p className="text-sm text-gray-500">Precio final</p>
                        </div>

                        <div className="mt-3 flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="hour-option" 
                            value={option.id} 
                            checked={selectedOption === option.id}
                            onChange={() => onSelect(option.id)}
                            className="h-4 w-4 text-primary focus:ring-primary mr-2"
                          />
                          <span className="text-sm font-medium">Seleccionar</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Financed options */}
                    {financedOptions.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-base mb-3">Opciones de financiamiento</h4>
                        
                        <div className="space-y-3">
                          {financedOptions.map(option => (
                            <div 
                              key={option.id}
                              className={`
                                border rounded p-3 cursor-pointer transition-all
                                ${selectedOption === option.id 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : "border-gray-200 hover:border-primary/50"
                                }
                              `}
                              onClick={() => onSelect(option.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    <input 
                                      type="radio" 
                                      name="hour-option" 
                                      value={option.id} 
                                      checked={selectedOption === option.id}
                                      onChange={() => onSelect(option.id)}
                                      className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">{option.months} meses</p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Tasa: {option.rate}%
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold text-primary-dark">
                                    {formatCurrency(option.monthly!)}
                                    <span className="text-xs font-normal text-gray-500 ml-1">/mes</span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Total: {formatCurrency(option.total)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
