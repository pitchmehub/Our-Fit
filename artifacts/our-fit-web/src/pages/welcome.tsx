import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();

  useEffect(() => {
    if (genderLoaded) {
      if (gender) {
        setLocation("/home");
      } else {
        setLocation("/onboarding");
      }
    }
  }, [genderLoaded, gender, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <h1 className="text-4xl font-bold tracking-widest text-primary font-mono">OUR FIT</h1>
      </div>
    </div>
  );
}
