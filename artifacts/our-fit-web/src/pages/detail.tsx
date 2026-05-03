import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";
import { ArrowLeft, Heart, Share2, Info } from "lucide-react";

export default function DetailPage() {
  const { selectedOutfit, likedIds, toggleLike } = useFit();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!selectedOutfit) setLocation("/results");
  }, [selectedOutfit, setLocation]);

  if (!selectedOutfit) return null;

  const isLiked = likedIds.has(selectedOutfit.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Look: ${selectedOutfit.title} | OUR FIT`,
          text: selectedOutfit.style,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pb-safe">
      <header className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => toggleLike(selectedOutfit)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
          >
            <Heart size={18} className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
        </div>
      </header>

      <div className="w-full aspect-[3/4] md:aspect-square md:max-h-[60vh] bg-muted relative">
        <img src={selectedOutfit.image} alt={selectedOutfit.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedOutfit.tags.map((tag, i) => (
              <span key={i} className="text-xs uppercase tracking-widest px-2 py-1 rounded bg-primary/20 text-primary font-medium backdrop-blur-md border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-2 text-white">{selectedOutfit.title}</h1>
        </div>
      </div>

      <main className="flex-1 p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full -mt-2">
        <section>
          <p className="text-muted-foreground leading-relaxed text-lg">{selectedOutfit.style}</p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-primary" />
            <h2 className="font-bold text-lg">Peças do Look</h2>
          </div>
          <ul className="space-y-3">
            {selectedOutfit.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary font-mono font-bold mt-0.5">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="text-foreground leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="h-8" />
      </main>
    </div>
  );
}
