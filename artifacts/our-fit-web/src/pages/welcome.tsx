import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();
  const { user, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && user && genderLoaded) {
      setLocation(gender ? "/home" : "/onboarding");
    }
  }, [isLoading, user, genderLoaded, gender, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <h1 className="text-4xl font-bold tracking-widest text-primary font-mono">OUR FIT</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-widest text-primary font-mono mb-3">OUR FIT</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">streetwear powered by AI</p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-6">
          <Button
            size="lg"
            className="w-full h-14 text-base font-bold tracking-wider"
            onClick={() => login("/web/")}
          >
            Entrar
          </Button>
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Monte looks únicos a partir de qualquer peça do seu closet.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
