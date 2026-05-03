import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useFit } from "@/contexts/FitContext";
import { Camera, Image as ImageIcon, Heart, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { setCapturedImage, gender, setGender } = useFit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        const base64Data = base64String.split(",")[1] || base64String;
        setCapturedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-safe">
      <header className="flex items-center justify-between p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-primary font-mono">OUR FIT</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">streetwear powered by AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/saved" className="h-10 w-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
            <Heart size={18} />
          </Link>
          <button
            onClick={() => { setGender(null); setLocation("/onboarding"); }}
            className="h-10 px-4 rounded-full border border-border bg-card text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            {gender || "Gênero"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        <div className="w-full aspect-square max-w-[300px] mx-auto relative mb-8">
          {preview ? (
            <div className="w-full h-full rounded-full border-2 border-primary overflow-hidden relative">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" onClick={() => { setPreview(null); setCapturedImage(null); }}>
                  Trocar
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground p-8 text-center cursor-pointer hover:border-primary hover:text-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={48} className="opacity-50" />
              <p className="text-sm leading-snug">Fotografe ou selecione uma peça do seu closet</p>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />

        <div className="flex items-center justify-center gap-6 mb-4 w-full">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
          >
            <ImageIcon size={24} />
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(232,255,0,0.4)] hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-background border-[3px] border-primary flex items-center justify-center">
              <Camera size={24} className="text-primary" />
            </div>
          </button>

          <Link href="/saved" className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
            <Grid size={24} />
          </Link>
        </div>

        <p className="text-sm text-muted-foreground tracking-wide">Toque para fotografar sua peça</p>

        {preview && (
          <div className="w-full mt-8">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={() => setLocation("/results")}
            >
              Gerar Looks
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
