
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuoteSettings {
  yearMonth: string;
  currentSequence: number;
  currency: string;
  exchangeRate: number;
}

export default function QuoteSettingsPage() {
  const { toast } = useToast();
  const [exchangeRate, setExchangeRate] = useState("");

  const { data: settings, isLoading } = useQuery<QuoteSettings>({
    queryKey: ["/api/quote-settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<QuoteSettings>) => {
      const res = await apiRequest("PATCH", "/api/quote-settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-settings"] });
      toast({
        title: "Configuración actualizada",
        description: "Los parámetros de cotización han sido actualizados",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    },
  });

  const handleUpdateExchangeRate = () => {
    const rate = parseFloat(exchangeRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Error",
        description: "La tasa de cambio debe ser un número positivo",
        variant: "destructive",
      });
      return;
    }
    
    updateSettingsMutation.mutate({ exchangeRate: rate });
  };

  return (
    <AdminLayout activeItem="quote-settings">
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-primary-dark mb-4">Configuración de Cotizaciones</h2>
            
            {settings && (
              <div className="space-y-4">
                <div>
                  <p><strong>Consecutivo Actual:</strong> {settings.yearMonth}-{settings.currentSequence}</p>
                  <p className="text-sm text-muted-foreground">
                    El consecutivo se reinicia automáticamente cada mes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="exchange-rate">Tasa de Cambio (USD)</Label>
                    <Input 
                      id="exchange-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      placeholder={settings.exchangeRate.toString()}
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateExchangeRate}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? "Actualizando..." : "Actualizar Tasa"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
