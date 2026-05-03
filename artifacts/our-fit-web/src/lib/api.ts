const BASE = import.meta.env.VITE_API_DOMAIN
  ? `https://${import.meta.env.VITE_API_DOMAIN}`
  : "";

export interface Outfit {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  image: string;
}

// Single combined call: analyze + generate images server-side
export async function generateOutfits(
  imageBase64: string,
  gender?: string | null,
): Promise<{ outfits: Outfit[]; itemDescription: string }> {
  const res = await fetch(`${BASE}/api/outfits/generate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, gender: gender || undefined }),
  });
  if (!res.ok) throw new Error("Falha ao gerar looks");
  return res.json();
}

export async function exploreOutfits(
  itemDescription: string,
  selectedOutfit: Outfit,
  gender?: string | null,
): Promise<{ outfits: Outfit[]; itemDescription: string }> {
  const res = await fetch(`${BASE}/api/outfits/explore`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemDescription, selectedOutfit, gender: gender || undefined }),
  });
  if (!res.ok) throw new Error("Falha ao explorar looks");
  return res.json();
}

export async function likeOutfit(outfit: Outfit): Promise<void> {
  const res = await fetch(`${BASE}/api/outfits/like`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outfit }),
  });
  if (!res.ok) throw new Error("Failed to like outfit");
}

export async function unlikeOutfit(outfitId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/outfits/like/${outfitId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to unlike outfit");
}

export async function getLikedOutfits(): Promise<Outfit[]> {
  const res = await fetch(`${BASE}/api/outfits/liked`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get liked outfits");
  const data = await res.json();
  return data.outfits || [];
}
