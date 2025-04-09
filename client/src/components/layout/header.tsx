import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-medium text-xl">Sistema de Cotización</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block">{user.name}</span>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="focus:outline-none p-1 hover:bg-primary-dark rounded-full"
                >
                  <Avatar className="h-8 w-8 bg-primary-light text-white">
                    <AvatarFallback>
                      {user.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm text-muted-foreground cursor-default">
                  {user.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin/parameters")}>
                      Configuración de Parámetros
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/users")}>
                      Gestión de Usuarios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                      Informes y Reportes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate("/")}>
                  Calculadora de Cotización
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
