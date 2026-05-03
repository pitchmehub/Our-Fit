import { useEffect, useState } from "react";
import { useAuth, SignIn } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && genderLoaded) {
      if (gender) {
        setLocation("/home");
      } else {
        setLocation("/onboarding");
      }
    }
  }, [isLoaded, isSignedIn, genderLoaded, gender, setLocation]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isLoaded) setTimedOut(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-widest text-primary font-mono mb-2">OUR FIT</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">streetwear powered by AI</p>
      </div>

      {timedOut ? (
        <div className="w-full max-w-md text-center space-y-4 bg-card border border-border rounded-2xl p-8">
          <p className="text-lg font-semibold text-foreground">Erro ao carregar login</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O serviço de autenticação não respondeu. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full h-12 rounded-xl bg-primary text-background font-bold text-sm tracking-widest hover:opacity-90 transition-opacity"
          >
            RECARREGAR
          </button>
        </div>
      ) : !isLoaded ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Carregando...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <SignIn
            forceRedirectUrl="/web/"
            fallbackRedirectUrl="/web/"
            appearance={{
              elements: {
                card: "bg-card border border-border shadow-xl rounded-xl",
                headerTitle: "text-foreground font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border border-border hover:bg-muted text-foreground bg-card",
                socialButtonsBlockButtonText: "font-semibold",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formFieldLabel: "text-foreground",
                formFieldInput: "bg-input border-border text-foreground focus:ring-primary",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
