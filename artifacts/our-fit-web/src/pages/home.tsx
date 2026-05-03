import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useFit } from "@/contexts/FitContext";
import { Camera, Image as ImageIcon, Heart, User, LogOut, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { setCapturedImage, gender, setGender } = useFit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/");
  }, [isLoaded, isSignedIn, setLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        // remove data:image/jpeg;base64, prefix if needed by API, but let's keep it for preview
        // The API might expect raw base64 or data uri. Let's pass the data URI and API can handle it or we strip it.
        const base64Data = base64String.split(",")[1] || base64String;
        setCapturedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (preview) setLocation("/results");
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full border border-border bg-card relative overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-muted-foreground" />
                )}
                <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-background ${gender === "Feminino" ? "bg-pink-500" : "bg-blue-500"}`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem className="text-muted-foreground">
                Gênero: {gender || "Não definido"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setGender(null); setLocation("/onboarding"); }} className="cursor-pointer">
                Trocar gênero
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        <div className="w-full aspect-square max-w-[320px] mx-auto relative mb-8">
          {preview ? (
            <div className="w-full h-full rounded-full border-2 border-primary overflow-hidden relative animate-in zoom-in duration-300">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" onClick={() => { setPreview(null); setCapturedImage(null); }}>Trocar Foto</Button>
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-full rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground p-6 text-center cursor-pointer hover:border-primary hover:text-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={48} className="opacity-50" />
              <p>Fotografe ou selecione uma peça do seu closet</p>
            </div>
          )}
        </div>

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          ref={cameraInputRef} 
          onChange={handleFileChange}
        />

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
          <div className="w-full mt-8 animate-in slide-in-from-bottom-4 duration-300">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold" 
              onClick={handleGenerate}
            >
              Gerar Looks
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
