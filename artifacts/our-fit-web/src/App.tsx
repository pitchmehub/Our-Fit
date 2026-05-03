import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/clerk-react";
import { FitProvider } from "@/contexts/FitContext";
import { Component, ReactNode } from "react";

import NotFound from "@/pages/not-found";
import SignInPage from "@/pages/sign-in";
import SsoCallbackPage from "@/pages/sso-callback";
import OnboardingPage from "@/pages/onboarding";
import HomePage from "@/pages/home";
import ResultsPage from "@/pages/results";
import DetailPage from "@/pages/detail";
import SavedPage from "@/pages/saved";

const queryClient = new QueryClient();

class ClerkErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#0A0A0A", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", color: "#fff", textAlign: "center", gap: "1rem" }}>
          <h1 style={{ color: "#E8FF00", fontFamily: "monospace", fontSize: "2rem", letterSpacing: "0.3em" }}>OUR FIT</h1>
          <p style={{ color: "#888", fontSize: "0.875rem" }}>Erro ao carregar autenticação.</p>
          <p style={{ color: "#888", fontSize: "0.875rem" }}>Verifique sua conexão e recarregue a página.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", background: "#E8FF00", color: "#0A0A0A", border: "none", borderRadius: "0.75rem", padding: "0.75rem 2rem", fontWeight: "bold", fontSize: "0.875rem", cursor: "pointer" }}>
            RECARREGAR
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SignInPage} />
      <Route path="/sso-callback" component={SsoCallbackPage} />
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
    <ClerkErrorBoundary>
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
    </ClerkErrorBoundary>
  );
}

export default App;
