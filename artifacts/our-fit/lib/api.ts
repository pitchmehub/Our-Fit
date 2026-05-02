import { Outfit } from "@/contexts/FitContext";

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

export async function analyzeOutfit(
  imageBase64: string,
  gender?: string | null
): Promise<{ outfits: Outfit[]; itemDescription: string }> {
  const response = await fetch(`${getBaseUrl()}/api/outfits/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, gender: gender ?? undefined }),
  });
  if (!response.ok) {
    throw new Error(`Failed to analyze outfit: ${response.status}`);
  }
  return response.json() as Promise<{ outfits: Outfit[]; itemDescription: string }>;
}

export async function exploreOutfits(
  itemDescription: string,
  selectedOutfit: Outfit,
  gender?: string | null
): Promise<{ outfits: Outfit[] }> {
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
  if (!response.ok) {
    throw new Error(`Failed to explore outfits: ${response.status}`);
  }
  return response.json() as Promise<{ outfits: Outfit[] }>;
}
