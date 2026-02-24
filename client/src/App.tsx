import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Builder from "@/pages/builder";
import Dashboard from "@/pages/dashboard";
import QuoteNormalizer from "@/pages/quote-normalizer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/builder" component={Builder}/>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/quote-normalizer" component={QuoteNormalizer}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;