import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";
import { analyzeOutfitConcepts, generateOutfitImage, exploreOutfitConcepts, OutfitConcept } from "@/lib/api";
import { OutfitCard } from "@/components/OutfitCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const [, setLocation] = useLocation();
  const {
    capturedImage, gender, currentOutfits, setCurrentOutfits,
    updateOutfit, likedIds, toggleLike, setSelectedOutfit,
    itemDescription, setItemDescription, selectedOutfit
  } = useFit();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!capturedImage) {
      setLocation("/home");
      return;
    }
    if (currentOutfits.length === 0 && !loading && !error) {
      handleGenerate();
    }
  }, [capturedImage]);

  const generateImagesForConcepts = async (concepts: OutfitConcept[]) => {
    const skeletons = concepts.map(c => ({
      id: c.id, title: c.title, style: c.style,
      items: c.items, tags: c.tags, image: ""
    }));
    setCurrentOutfits(skeletons);

    await Promise.allSettled(
      concepts.map(async (concept) => {
        try {
          const outfitWithImage = await generateOutfitImage(concept);
          updateOutfit(outfitWithImage);
        } catch (err) {
          console.error(`Failed to generate image for ${concept.id}`, err);
        }
      })
    );
  };

  const handleGenerate = async () => {
    if (!capturedImage) return;
    setLoading(true);
    setError(null);
    setCurrentOutfits([]);
    try {
      const { concepts, itemDescription: desc } = await analyzeOutfitConcepts(capturedImage, gender);
      setItemDescription(desc);
      await generateImagesForConcepts(concepts);
    } catch (err) {
      setError("Não foi possível gerar looks. Verifique a imagem e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleExploreMore = async () => {
    if (!selectedOutfit) return;
    setLoading(true);
    setError(null);
    setCurrentOutfits([]);
    try {
      const { concepts } = await exploreOutfitConcepts(itemDescription, selectedOutfit, gender);
      await generateImagesForConcepts(concepts);
    } catch (err) {
      setError("Não foi possível explorar mais looks.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-destructive mb-4" />
        <p className="text-lg mb-6">{error}</p>
        <Button onClick={handleGenerate} className="gap-2">
          <RefreshCw size={16} /> Tentar Novamente
        </Button>
        <button className="mt-4 text-muted-foreground hover:text-foreground underline text-sm" onClick={() => setLocation("/home")}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pb-safe">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center p-4 gap-4">
        <button
          onClick={() => setLocation("/home")}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold font-mono tracking-widest text-primary">OUR FIT</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
            {loading ? "Criando seus looks..." : `${currentOutfits.filter(o => o.image).length} de ${currentOutfits.length} looks prontos`}
          </p>
        </div>
        {capturedImage && (
          <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0">
            <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured" className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6">
        {loading && currentOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Criando o seu estilo...</h2>
              <p className="text-muted-foreground text-sm">Avaliando caimentos e paletas de cores</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentOutfits.map((outfit, i) =>
                outfit.image === "" ? (
                  <SkeletonCard key={`skel-${i}`} />
                ) : (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    isLiked={likedIds.has(outfit.id)}
                    onLike={(o) => toggleLike(o)}
                    onClick={(o) => { setSelectedOutfit(o); setLocation("/detail"); }}
                  />
                )
              )}
            </div>

            {!loading && currentOutfits.length > 0 && selectedOutfit && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg" className="w-full max-w-sm gap-2" onClick={handleExploreMore}>
                  <RefreshCw size={16} /> Explorar Mais Looks
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
