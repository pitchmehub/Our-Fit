import type { Outfit } from "@/contexts/FitContext";

export interface OutfitConcept {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  imagePrompt: string;
  basePieceDescription: string;
}

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

// Step 1: get concepts fast (no images)
export async function analyzeOutfitConcepts(
  imageBase64: string,
  gender?: string | null
): Promise<{ concepts: OutfitConcept[]; itemDescription: string }> {
  const response = await fetch(`${getBaseUrl()}/api/outfits/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, gender: gender ?? undefined }),
  });
  if (!response.ok) throw new Error(`analyze failed: ${response.status}`);
  return response.json() as Promise<{ concepts: OutfitConcept[]; itemDescription: string }>;
}

// Step 2: generate one image for a concept
export async function generateOutfitImage(
  concept: OutfitConcept
): Promise<Outfit> {
  const response = await fetch(`${getBaseUrl()}/api/outfits/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concept }),
  });
  if (!response.ok) throw new Error(`image gen failed: ${response.status}`);
  const data = await response.json() as { outfit: Outfit };
  return data.outfit;
}

// Explore: get more concepts
export async function exploreOutfitConcepts(
  itemDescription: string,
  selectedOutfit: Outfit,
  gender?: string | null
): Promise<{ concepts: OutfitConcept[]; itemDescription: string }> {
  const { image: _image, ...outfitWithoutImage } = selectedOutfit;
  const response = await fetch(`${getBaseUrl()}/api/outfits/explore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemDescription,
      selectedOutfit: { ...outfitWithoutImage, image: "" },
      gender: gender ?? undefined,
    }),
  });
  if (!response.ok) throw new Error(`explore failed: ${response.status}`);
  return response.json() as Promise<{ concepts: OutfitConcept[]; itemDescription: string }>;
}

// Likes
export async function likeOutfit(userId: string, outfit: Outfit): Promise<void> {
  await fetch(`${getBaseUrl()}/api/outfits/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, outfit }),
  });
}

export async function unlikeOutfit(userId: string, outfitId: string): Promise<void> {
  await fetch(`${getBaseUrl()}/api/outfits/like/${outfitId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

export async function getLikedOutfits(userId: string): Promise<Outfit[]> {
  const response = await fetch(`${getBaseUrl()}/api/outfits/liked?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) return [];
  const data = await response.json() as { outfits: Outfit[] };
  return data.outfits;
}
