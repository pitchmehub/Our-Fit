export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card border border-border overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-muted flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50"></div>
      </div>
      <div className="p-4 pt-2">
        <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded-md w-full mb-1"></div>
        <div className="h-3 bg-muted rounded-md w-5/6"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-5 bg-accent/10 rounded-md w-16"></div>
          <div className="h-5 bg-accent/10 rounded-md w-20"></div>
        </div>
      </div>
    </div>
  );
}
