import { useLocation } from "wouter";
import { useFit, Gender } from "@/contexts/FitContext";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { setGender } = useFit();

  const handleSelect = (selectedGender: Gender) => {
    setGender(selectedGender);
    setLocation("/home");
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-widest text-primary font-mono">OUR FIT</h1>
          <p className="text-lg font-semibold tracking-tight">Como você se identifica?</p>
          <p className="text-muted-foreground text-sm">
            Isso ajuda a IA a gerar caimentos mais precisos.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 hover:border-primary hover:text-primary transition-colors"
            onClick={() => handleSelect("Masculino")}
          >
            Masculino
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 hover:border-primary hover:text-primary transition-colors"
            onClick={() => handleSelect("Feminino")}
          >
            Feminino
          </Button>
        </div>
      </div>
    </div>
  );
}
