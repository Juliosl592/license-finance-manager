import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
  username: z.string().min(1, "El correo electrónico es requerido").email("Ingrese un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  company: z.string().min(1, "La empresa es requerida"),
  isAdmin: z.boolean().default(false),
});

export default function RegisterPage() {
  const { user, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      company: "",
      isAdmin: false,
    },
  });

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    await registerMutation.mutateAsync(values);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">Crear Cuenta</h1>
            <p className="text-muted-foreground">Complete el formulario para registrarse</p>
          </div>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Nombre completo" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ejemplo@correo.com" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Nombre de su empresa" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-white"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tiene una cuenta?{" "}
              <Link href="/login">
                <a className="text-primary font-medium hover:underline">
                  Iniciar Sesión
                </a>
              </Link>
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex md:flex-col p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-lg justify-center">
          <h2 className="text-3xl font-bold mb-4">Únase a Nuestro Sistema</h2>
          <p className="mb-6 text-lg opacity-90">
            Cree una cuenta para comenzar a utilizar el Sistema de Cotización de Licencias y acceder a todas sus funcionalidades.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Registre sus datos personales y de su empresa</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Acceda a herramientas de cotización avanzadas</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Guarde y administre sus cotizaciones</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Reciba notificaciones sobre nuevas funcionalidades</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}