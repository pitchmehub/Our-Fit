import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { batchProcess } from "@workspace/integrations-openai-ai-server/batch";

const router = Router();

interface OutfitConcept {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  imagePrompt: string;
}

interface OutfitResult {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  image: string;
}

async function generateOutfitImages(
  concepts: OutfitConcept[]
): Promise<OutfitResult[]> {
  return batchProcess(
    concepts,
    async (concept) => {
      const prompt = `Streetwear fashion lookbook flat lay photo. ${concept.imagePrompt}. Pinterest aesthetic. Clean white studio background. Overhead shot. No people. Professional fashion photography. High quality.`;
      const buffer = await generateImageBuffer(prompt, "1024x1024");
      const { imagePrompt: _imagePrompt, ...rest } = concept;
      return { ...rest, image: buffer.toString("base64") } as OutfitResult;
    },
    { concurrency: 2, retries: 3 }
  );
}

router.post("/outfits/analyze", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: "text",
            text: "Analyze this clothing item or accessory. Identify: type (sneaker, hoodie, jeans, jacket, etc.), color(s), and dominant aesthetic (streetwear, athletic, casual, luxury, etc.). Be concise, 2-3 sentences.",
          },
        ],
      },
    ],
  });

  const itemDescription =
    visionResponse.choices[0]?.message?.content ??
    "A streetwear clothing item";

  const conceptsResponse = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a streetwear stylist inspired by Pinterest trends. Based on this item: "${itemDescription}"

Generate 6 distinct streetwear outfit suggestions that incorporate or complement this item. Each outfit should be Pinterest-worthy, trendy, and complete.

Return ONLY a valid JSON array with exactly this structure:
[
  {
    "title": "Outfit name (2-3 words)",
    "style": "Brief style description (1 sentence)",
    "items": ["item 1", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Detailed visual description of how to arrange this outfit as a flat lay"
  }
]`,
      },
    ],
  });

  const conceptsText =
    conceptsResponse.choices[0]?.message?.content ?? "[]";
  const jsonMatch = conceptsText.match(/\[[\s\S]*\]/);
  let concepts: OutfitConcept[] = [];

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as Omit<OutfitConcept, "id">[];
      concepts = parsed.map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
      }));
    } catch {
      concepts = [];
    }
  }

  const outfits = await generateOutfitImages(concepts);

  res.json({ outfits, itemDescription });
});

router.post("/outfits/explore", async (req, res) => {
  const { itemDescription, selectedOutfit } = req.body as {
    itemDescription: string;
    selectedOutfit: OutfitResult;
  };

  if (!itemDescription || !selectedOutfit) {
    res.status(400).json({ error: "itemDescription and selectedOutfit are required" });
    return;
  }

  const conceptsResponse = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a streetwear stylist inspired by Pinterest. The user liked the outfit "${selectedOutfit.title}" (${selectedOutfit.style}) which goes with: "${itemDescription}".

Generate 6 MORE distinct streetwear outfit variations inspired by this selection. Keep the same energy but explore different directions — different silhouettes, color palettes, or sub-styles. All must work with the original item.

Return ONLY a valid JSON array:
[
  {
    "title": "Outfit name (2-3 words)",
    "style": "Brief style description (1 sentence)",
    "items": ["item 1", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Detailed visual description for a flat lay photo of this outfit"
  }
]`,
      },
    ],
  });

  const conceptsText =
    conceptsResponse.choices[0]?.message?.content ?? "[]";
  const jsonMatch = conceptsText.match(/\[[\s\S]*\]/);
  let concepts: OutfitConcept[] = [];

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as Omit<OutfitConcept, "id">[];
      concepts = parsed.map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
      }));
    } catch {
      concepts = [];
    }
  }

  const outfits = await generateOutfitImages(concepts);

  res.json({ outfits });
});

export default router;
