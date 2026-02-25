import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { type User } from "@shared/schema";

type AuthCredentials = { username: string; password: string };

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  loginMutation: UseMutationResult<User, Error, AuthCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, AuthCredentials>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem("demoMode") === "true");

  const enterDemoMode = () => {
    localStorage.setItem("demoMode", "true");
    setIsDemoMode(true);
  };

  const exitDemoMode = () => {
    localStorage.removeItem("demoMode");
    setIsDemoMode(false);
  };

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation<User, Error, AuthCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      exitDemoMode();
      queryClient.setQueryData(["/api/user"], user);
    },
  });

  const registerMutation = useMutation<User, Error, AuthCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      exitDemoMode();
      queryClient.setQueryData(["/api/user"], user);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/auth");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
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
