import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { db } from "@workspace/db";
import { likedOutfits } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

export interface OutfitConcept {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  imagePrompt: string;
  basePieceDescription: string;
}

export interface OutfitResult {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  image: string;
}

function getGenderContext(gender: string | undefined): string {
  if (gender === "masculino") {
    return "masculino (homem). Use peças tipicamente masculinas: calças cargo, hoodies oversized, tênis, jaquetas, bonés, correntes.";
  }
  if (gender === "feminino") {
    return "feminino (mulher). Use peças tipicamente femininas: calças cintura alta, tops cropped, saias mini, plataformas, bolsas, acessórios femininos.";
  }
  return "neutro/unissex. Priorize peças versáteis de streetwear.";
}

async function generateSingleImage(concept: OutfitConcept): Promise<OutfitResult> {
  const { imagePrompt: _ip, basePieceDescription: _bp, ...rest } = concept;
  const prompt = `Streetwear fashion flat lay, perfectly centered overhead top-down view on a clean white background. All clothing items fully visible, nothing cropped or cut off. ${concept.imagePrompt}. Items neatly arranged: main piece prominently in center, supporting pieces spread around it. No people, no mannequins, no body parts. Professional studio fashion photography, sharp and bright lighting, Pinterest aesthetic.`;

  try {
    const buffer = await generateImageBuffer(prompt, "512x512", "dall-e-2");
    return { ...rest, image: buffer.toString("base64") };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("safety") || errMsg.includes("400") || errMsg.includes("content")) {
      try {
        const safePrompt = `Fashion flat lay, overhead view on white background. ${concept.imagePrompt}. All items fully visible. No people.`;
        const buffer2 = await generateImageBuffer(safePrompt, "512x512", "dall-e-2");
        return { ...rest, image: buffer2.toString("base64") };
      } catch {
        // fall through
      }
    }
    return { ...rest, image: "" };
  }
}

// Generate images in batches to respect DALL-E rate limits (max 2 concurrent)
async function generateImagesInBatches(concepts: OutfitConcept[], batchSize = 2): Promise<OutfitResult[]> {
  const results: OutfitResult[] = [];
  for (let i = 0; i < concepts.length; i += batchSize) {
    const batch = concepts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(generateSingleImage));
    results.push(...batchResults);
  }
  return results;
}

// Combined: analyze photo + generate images in one call (no rate limit issues)
router.post("/outfits/generate", async (req, res) => {
  const { imageBase64, gender } = req.body as {
    imageBase64: string;
    gender?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const genderCtx = getGenderContext(gender);

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 1200,
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
            text: `Você é um stylist de streetwear para público ${genderCtx}

Analise a peça de roupa na imagem e crie 4 looks streetwear distintos usando ela como base.

Retorne APENAS um JSON válido com este formato exato:
{
  "itemDescription": "descrição curta da peça (cor, tipo, material, estética) em 1-2 frases",
  "concepts": [
    {
      "title": "Nome do look (2-3 palavras)",
      "style": "Estilo em 1 frase",
      "items": ["a peça fotografada aqui", "item 2", "item 3", "item 4"],
      "tags": ["tag1", "tag2", "tag3"],
      "imagePrompt": "Flat lay top-down: [descreva a peça base centralizada e os outros itens dispostos ao redor, com cores exatas de cada peça]"
    }
  ]
}`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let itemDescription = "A streetwear clothing item";
  let concepts: OutfitConcept[] = [];

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        itemDescription: string;
        concepts: Omit<OutfitConcept, "id" | "basePieceDescription">[];
      };
      itemDescription = parsed.itemDescription ?? itemDescription;
      concepts = (parsed.concepts ?? []).slice(0, 4).map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
        basePieceDescription: itemDescription,
      }));
    } catch {
      concepts = [];
    }
  }

  // Generate images server-side in batches of 2 — respects DALL-E rate limits
  const outfits = await generateImagesInBatches(concepts, 2);

  res.json({ outfits, itemDescription });
});

// Explore: generate 4 more concepts + images in one call
router.post("/outfits/explore", async (req, res) => {
  const { itemDescription, selectedOutfit, gender } = req.body as {
    itemDescription: string;
    selectedOutfit: OutfitResult;
    gender?: string;
  };

  if (!itemDescription || !selectedOutfit) {
    res.status(400).json({ error: "itemDescription and selectedOutfit are required" });
    return;
  }

  const genderCtx = getGenderContext(gender);

  const conceptsResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `Você é um stylist de streetwear para público ${genderCtx}

Peça base do usuário: "${itemDescription}"
Look que o usuário gostou: "${selectedOutfit.title}" — ${selectedOutfit.style}

REGRA: Em TODOS os 4 novos looks, a peça base DEVE estar presente como protagonista.

Gere 4 NOVOS looks com estilos e paletas diferentes. Retorne APENAS JSON:
[
  {
    "title": "Nome do look",
    "style": "Estilo em 1 frase",
    "items": ["peça base aqui", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Flat lay com a peça base centralizada e os outros itens ao redor"
  }
]`,
      },
    ],
  });

  const conceptsText = conceptsResponse.choices[0]?.message?.content ?? "[]";
  const jsonMatch = conceptsText.match(/\[[\s\S]*\]/);
  let concepts: OutfitConcept[] = [];

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as Omit<OutfitConcept, "id" | "basePieceDescription">[];
      concepts = parsed.slice(0, 4).map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
        basePieceDescription: itemDescription,
      }));
    } catch {
      concepts = [];
    }
  }

  const outfits = await generateImagesInBatches(concepts, 2);

  res.json({ outfits, itemDescription });
});

// Like an outfit
router.post("/outfits/like", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { outfit } = req.body as { outfit: OutfitResult };
  const userId = req.user.id;

  if (!outfit) {
    res.status(400).json({ error: "outfit is required" });
    return;
  }

  const existing = await db
    .select()
    .from(likedOutfits)
    .where(and(eq(likedOutfits.userId, userId), eq(likedOutfits.outfitId, outfit.id)));

  if (existing.length > 0) {
    res.json({ liked: true, id: existing[0].id });
    return;
  }

  const [inserted] = await db.insert(likedOutfits).values({
    userId,
    outfitId: outfit.id,
    title: outfit.title,
    style: outfit.style,
    items: JSON.stringify(outfit.items),
    tags: JSON.stringify(outfit.tags),
    image: outfit.image,
  }).returning();

  res.json({ liked: true, id: inserted.id });
});

// Unlike an outfit
router.delete("/outfits/like/:outfitId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { outfitId } = req.params;
  const userId = req.user.id;

  await db
    .delete(likedOutfits)
    .where(and(eq(likedOutfits.userId, userId), eq(likedOutfits.outfitId, outfitId)));

  res.json({ liked: false });
});

// Get liked outfits
router.get("/outfits/liked", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.json({ outfits: [] });
    return;
  }
  const userId = req.user.id;

  const rows = await db
    .select()
    .from(likedOutfits)
    .where(eq(likedOutfits.userId, userId))
    .orderBy(likedOutfits.createdAt);

  const outfits: OutfitResult[] = rows.map((r) => ({
    id: r.outfitId,
    title: r.title,
    style: r.style,
    items: JSON.parse(r.items) as string[],
    tags: JSON.parse(r.tags) as string[],
    image: r.image,
  }));

  res.json({ outfits });
});

export default router;
