import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useFit } from "@/contexts/FitContext";
import { Outfit, getLikedOutfits } from "@/lib/api";
import { OutfitCard } from "@/components/OutfitCard";
import { ArrowLeft, HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SavedPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { likedIds, toggleLike, setSelectedOutfit } = useFit();
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSavedOutfits();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadSavedOutfits = async () => {
    try {
      if (!user?.id) return;
      const outfits = await getLikedOutfits(user.id);
      // Filter out any unliked items that might still be in the DB but not in local state
      const actualSaved = outfits.filter(o => likedIds.has(o.id));
      setSavedOutfits(actualSaved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-sync if local likedIds changes
  useEffect(() => {
    setSavedOutfits(prev => prev.filter(o => likedIds.has(o.id)));
  }, [likedIds]);

  const handleOutfitClick = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setLocation("/detail");
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pb-safe">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center p-4 gap-4">
        <button 
          onClick={() => setLocation("/home")}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold font-mono tracking-widest text-primary">FAVORITOS</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
            {savedOutfits.length} look{savedOutfits.length !== 1 && 's'} salvo{savedOutfits.length !== 1 && 's'}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : savedOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <HeartOff size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhum look salvo</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Os looks que você curtir aparecerão aqui para você se inspirar depois.
            </p>
            <Button size="lg" onClick={() => setLocation("/home")}>
              Gerar Looks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {savedOutfits.map((outfit) => (
              <OutfitCard 
                key={outfit.id} 
                outfit={outfit} 
                isLiked={true} 
                onLike={(o) => user?.id && toggleLike(o, user.id)}
                onClick={handleOutfitClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
