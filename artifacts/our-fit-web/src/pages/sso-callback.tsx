import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SsoCallbackPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Finalizando login...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
