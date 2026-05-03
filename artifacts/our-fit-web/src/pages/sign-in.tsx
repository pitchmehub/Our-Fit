import { useEffect } from "react";
import { useAuth, SignIn } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();

  useEffect(() => {
    if (isLoaded && isSignedIn && genderLoaded) {
      if (gender) {
        setLocation("/home");
      } else {
        setLocation("/onboarding");
      }
    }
  }, [isLoaded, isSignedIn, genderLoaded, gender, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-widest text-primary font-mono mb-2">OUR FIT</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">streetwear powered by AI</p>
      </div>
      <div className="w-full max-w-md">
        <SignIn
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
    </div>
  );
}
