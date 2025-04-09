import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeItem: "parameters" | "users" | "reports" | null;
}

export default function AdminLayout({ children, activeItem }: AdminLayoutProps) {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar activeItem={activeItem} />
        
        <main className="flex-1 p-6 overflow-auto bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
