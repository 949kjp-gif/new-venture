import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import AppHome from "@/pages/app-home";
import Builder from "@/pages/builder";
import Dashboard from "@/pages/dashboard";
import QuoteNormalizer from "@/pages/quote-normalizer";
import Planning from "@/pages/planning";
import Notes from "@/pages/notes";
import Guests from "@/pages/guests";
import Vendors from "@/pages/vendors";
import AuthPage from "@/pages/auth-page";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isDemoMode } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && !isDemoMode) {
      setLocation("/auth");
    }
  }, [user, isLoading, isDemoMode, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user && !isDemoMode) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/home">
        <ProtectedRoute component={AppHome} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/builder">
        <ProtectedRoute component={Builder} />
      </Route>
      <Route path="/quote-normalizer">
        <ProtectedRoute component={QuoteNormalizer} />
      </Route>
      <Route path="/planning">
        <ProtectedRoute component={Planning} />
      </Route>
      <Route path="/notes">
        <ProtectedRoute component={Notes} />
      </Route>
      <Route path="/guests">
        <ProtectedRoute component={Guests} />
      </Route>
      <Route path="/vendors">
        <ProtectedRoute component={Vendors} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
