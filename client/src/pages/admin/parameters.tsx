import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinancingTerm, HourPackage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import AdminLayout from "@/components/layout/admin-layout";

export default function ParametersPage() {
  const { toast } = useToast();
  const [newTerm, setNewTerm] = useState<{ months: string; rate: string }>({
    months: "",
    rate: "",
  });
  const [newPackage, setNewPackage] = useState<{ name: string; hours: string; price: string }>({
    name: "",
    hours: "",
    price: "",
  });

  // Fetch financing terms
  const { data: financingTerms = [] } = useQuery<FinancingTerm[]>({
    queryKey: ["/api/financing-terms"],
  });

  // Fetch hour packages
  const { data: hourPackages = [] } = useQuery<HourPackage[]>({
    queryKey: ["/api/hour-packages"],
  });

  // Add financing term mutation
  const [editingTerm, setEditingTerm] = useState<{ id?: number; months: string; rate: string }>({
    months: "",
    rate: ""
  });
  
  const [editingPackage, setEditingPackage] = useState<{ id?: number; name: string; hours: string; price: string }>({
    name: "",
    hours: "",
    price: ""
  });

  const addOrUpdateTermMutation = useMutation({
    mutationFn: async (term: { id?: number; months: number; rate: number }) => {
      const method = term.id ? "PUT" : "POST";
      const url = term.id ? `/api/financing-terms/${term.id}` : "/api/financing-terms";
      const res = await apiRequest(method, url, term);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financing-terms"] });
      setNewTerm({ months: "", rate: "" });
      toast({
        title: "Plazo agregado",
        description: "El plazo de financiamiento ha sido agregado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el plazo de financiamiento",
        variant: "destructive",
      });
    },
  });

  // Delete financing term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/financing-terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financing-terms"] });
      toast({
        title: "Plazo eliminado",
        description: "El plazo de financiamiento ha sido eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plazo de financiamiento",
        variant: "destructive",
      });
    },
  });

  // Add hour package mutation
  const addPackageMutation = useMutation({
    mutationFn: async (pkg: { name: string; hours: number; price: number }) => {
      const res = await apiRequest("POST", "/api/hour-packages", pkg);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hour-packages"] });
      setNewPackage({ name: "", hours: "", price: "" });
      toast({
        title: "Bolsa de horas agregada",
        description: "La bolsa de horas ha sido agregada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar la bolsa de horas",
        variant: "destructive",
      });
    },
  });

  // Delete hour package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/hour-packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hour-packages"] });
      toast({
        title: "Bolsa de horas eliminada",
        description: "La bolsa de horas ha sido eliminada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la bolsa de horas",
        variant: "destructive",
      });
    },
  });

  const handleSaveTerm = () => {
    const months = parseInt(editingTerm.months);
    const rate = parseFloat(editingTerm.rate);
    
    if (isNaN(months) || isNaN(rate) || months <= 0 || rate <= 0) {
      toast({
        title: "Error",
        description: "Los valores ingresados no son válidos",
        variant: "destructive",
      });
      return;
    }
    
    addOrUpdateTermMutation.mutate({ 
      id: editingTerm.id,
      months, 
      rate 
    });
    setEditingTerm({ months: "", rate: "" });
  };

  const handleEditTerm = (term: FinancingTerm) => {
    setEditingTerm({
      id: term.id,
      months: term.months.toString(),
      rate: term.rate.toString()
    });
  };

  const handleDeleteTerm = (id: number) => {
    deleteTermMutation.mutate(id);
  };

  const handleAddPackage = () => {
    const hours = parseInt(newPackage.hours);
    const price = parseInt(newPackage.price);
    
    if (!newPackage.name || isNaN(hours) || isNaN(price) || hours <= 0 || price <= 0) {
      toast({
        title: "Error",
        description: "Los valores ingresados no son válidos",
        variant: "destructive",
      });
      return;
    }
    
    addPackageMutation.mutate({ 
      name: newPackage.name,
      hours,
      price,
    });
  };

  const handleDeletePackage = (id: number) => {
    deletePackageMutation.mutate(id);
  };

  return (
    <AdminLayout activeItem="parameters">
      <div className="space-y-8">
        {/* Financing Terms */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-primary-dark mb-4">Plazos de Financiamiento</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Plazo (meses)</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Tasa EA (%)</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {financingTerms.map((term) => (
                    <tr key={term.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{term.months}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{term.rate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 p-2"
                          onClick={() => handleDeleteTerm(term.id)}
                          disabled={deleteTermMutation.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="new-term-months">Plazo (meses)</Label>
                <Input 
                  id="new-term-months" 
                  type="number" 
                  min="1"
                  value={newTerm.months}
                  onChange={(e) => setNewTerm({ ...newTerm, months: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-term-rate">Tasa EA (%)</Label>
                <Input 
                  id="new-term-rate" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTerm.rate}
                  onChange={(e) => setNewTerm({ ...newTerm, rate: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddTerm}
                disabled={addTermMutation.isPending}
              >
                {addTermMutation.isPending ? "Agregando..." : "Agregar Plazo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hour Packages */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-primary-dark mb-4">Bolsas de Horas</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Horas</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Precio Base</th>
                    <th className="px-6 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {hourPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{pkg.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{pkg.hours}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{formatCurrency(pkg.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 p-2"
                          onClick={() => handleDeletePackage(pkg.id)}
                          disabled={deletePackageMutation.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="new-package-name">Nombre</Label>
                <Input 
                  id="new-package-name" 
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-package-hours">Horas</Label>
                <Input 
                  id="new-package-hours" 
                  type="number"
                  min="1"
                  value={newPackage.hours}
                  onChange={(e) => setNewPackage({ ...newPackage, hours: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-package-price">Precio Base</Label>
                <Input 
                  id="new-package-price" 
                  type="number"
                  min="0"
                  step="1000"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddPackage}
                disabled={addPackageMutation.isPending}
              >
                {addPackageMutation.isPending ? "Agregando..." : "Agregar Bolsa de Horas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
