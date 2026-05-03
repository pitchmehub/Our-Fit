import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();
  const [timedOut, setTimedOut] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && genderLoaded) {
      setLocation(gender ? "/home" : "/onboarding");
    }
  }, [isLoaded, isSignedIn, genderLoaded, gender, setLocation]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isLoaded) setTimedOut(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  const handleGoogleSignIn = async () => {
    if (!signIn || signing) return;
    setSigning(true);
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/web/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/web/`,
      });
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError("Erro ao iniciar login. Tente novamente.");
      setSigning(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-widest text-primary font-mono mb-3">OUR FIT</h1>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">streetwear powered by AI</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4">
        {timedOut ? (
          <div className="text-center space-y-4 bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Falha ao conectar com o serviço de login.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-12 rounded-xl bg-primary text-background font-bold text-sm tracking-widest"
            >
              RECARREGAR
            </button>
          </div>
        ) : !isLoaded ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Carregando...</p>
          </div>
        ) : (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={signing}
              className="w-full h-14 rounded-2xl bg-white text-gray-800 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              {signing ? (
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {signing ? "Entrando..." : "Continuar com Google"}
            </button>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
              Monte looks únicos a partir de qualquer peça do seu closet.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
