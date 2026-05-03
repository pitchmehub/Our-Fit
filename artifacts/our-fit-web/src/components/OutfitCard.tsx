import { Heart } from "lucide-react";
import { Outfit } from "@/lib/api";

interface OutfitCardProps {
  outfit: Outfit;
  isLiked: boolean;
  onLike: (outfit: Outfit) => void;
  onClick: (outfit: Outfit) => void;
}

export function OutfitCard({ outfit, isLiked, onLike, onClick }: OutfitCardProps) {
  return (
    <div 
      className="group relative flex flex-col gap-2 rounded-xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors duration-300"
      onClick={() => onClick(outfit)}
    >
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {outfit.image ? (
          <img 
            src={outfit.image} 
            alt={outfit.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onLike(outfit);
          }}
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isLiked ? "fill-destructive text-destructive" : "text-white"}`} 
          />
        </button>
      </div>
      <div className="p-4 pt-2">
        <h3 className="font-bold text-base leading-tight mb-1 text-foreground line-clamp-1">{outfit.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{outfit.style}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {outfit.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-accent/10 text-accent font-medium">
              {tag}
            </span>
          ))}
          {outfit.tags.length > 2 && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
              +{outfit.tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
