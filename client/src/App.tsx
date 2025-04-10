import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ParametersPage from "@/pages/admin/parameters";
import UsersPage from "@/pages/admin/users";
import ReportsPage from "@/pages/admin/reports";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/admin/parameters" component={ParametersPage} />
      <ProtectedRoute path="/admin/users" component={UsersPage} />
      <ProtectedRoute path="/admin/reports" component={ReportsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/auth">
        {() => {
          window.location.href = "/login";
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
