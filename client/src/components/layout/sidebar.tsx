import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem: "parameters" | "users" | "reports" | null;
}

export default function Sidebar({ activeItem }: SidebarProps) {
  const [location, navigate] = useLocation();

  const menuItems = [
    {
      id: "parameters",
      label: "Configuración de Parámetros",
      icon: <SliderIcon />,
      href: "/admin/parameters",
    },
    {
      id: "users",
      label: "Gestión de Usuarios",
      icon: <UsersIcon />,
      href: "/admin/users",
    },
    {
      id: "reports",
      label: "Informes y Reportes",
      icon: <ReportsIcon />,
      href: "/admin/reports",
    },
    {
      id: null,
      label: "Calculadora de Cotización",
      icon: <CalculatorIcon />,
      href: "/",
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md z-10 hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-medium text-primary">Panel de Administración</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.href);
            }}
          >
            <a 
              className={cn(
                "block py-3 px-4 text-neutral-400 hover:bg-primary-light hover:bg-opacity-10 hover:text-primary cursor-pointer",
                item.id === activeItem && "bg-primary-light bg-opacity-10 text-primary border-r-4 border-primary"
              )}
            >
              <span className="w-6 inline-block">
                {item.icon}
              </span>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function SliderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
