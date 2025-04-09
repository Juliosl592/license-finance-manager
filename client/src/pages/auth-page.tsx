import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "El correo electrónico es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z.object({
  username: z.string().min(1, "El correo electrónico es requerido").email("Ingrese un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  company: z.string().min(1, "La empresa es requerida"),
  isAdmin: z.boolean().default(false),
});

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

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

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await loginMutation.mutateAsync(values);
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    await registerMutation.mutateAsync(values);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!showRegister ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-primary mb-2">Sistema de Cotización</h1>
                <p className="text-muted-foreground">Ingrese sus credenciales para continuar</p>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  ¿No tiene una cuenta?{" "}
                  <Button 
                    variant="link" 
                    className="text-primary p-0"
                    onClick={() => setShowRegister(true)}
                  >
                    Registrarse
                  </Button>
                </p>
              </div>
            </>
          ) : (
            <>
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
                          <Input placeholder="Nombre completo" {...field} />
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
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
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
                          <Input placeholder="Nombre de su empresa" {...field} />
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
                          <Input type="password" {...field} />
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
                  <Button 
                    variant="link" 
                    className="text-primary p-0"
                    onClick={() => setShowRegister(false)}
                  >
                    Iniciar Sesión
                  </Button>
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="hidden md:flex md:flex-col p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-lg justify-center">
          <h2 className="text-3xl font-bold mb-4">Sistema de Cotización de Licencias</h2>
          <p className="mb-6 text-lg opacity-90">
            Administre y calcule opciones de financiamiento para sus licencias y servicios de manera eficiente.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cálculo de precios para licencias individuales y en volumen</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Opciones de financiamiento a diferentes plazos</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bolsas de horas de servicio flexibles</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Exportación de cotizaciones a PDF</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
