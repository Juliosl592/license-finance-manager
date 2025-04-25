import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase-config";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login successful", description: `Welcome back!` });
    } catch (err: any) {
      setError(err);
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Registration successful", description: `Welcome!` });
    } catch (err: any) {
      setError(err);
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      toast({ title: "Logged out", description: "You have successfully logged out." });
    } catch (err: any) {
      setError(err);
      toast({ title: "Logout failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
