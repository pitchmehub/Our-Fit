import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/clerk-react";
import { FitProvider } from "@/contexts/FitContext";

import NotFound from "@/pages/not-found";
import SignInPage from "@/pages/sign-in";
import OnboardingPage from "@/pages/onboarding";
import HomePage from "@/pages/home";
import ResultsPage from "@/pages/results";
import DetailPage from "@/pages/detail";
import SavedPage from "@/pages/saved";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={SignInPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/detail" component={DetailPage} />
      <Route path="/saved" component={SavedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <FitProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </FitProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
