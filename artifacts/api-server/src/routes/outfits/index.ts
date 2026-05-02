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

// Step 1: analyze photo → return concepts only (fast ~5-8s)
router.post("/outfits/analyze", async (req, res) => {
  const { imageBase64, gender } = req.body as {
    imageBase64: string;
    gender?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_completion_tokens: 400,
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
            text: "Analyze this clothing item or accessory. Identify: type, color(s), material if visible, aesthetic (streetwear, athletic, etc.). Be specific. 2-3 sentences max.",
          },
        ],
      },
    ],
  });

  const itemDescription =
    visionResponse.choices[0]?.message?.content ?? "A streetwear clothing item";

  const genderCtx = getGenderContext(gender);

  const conceptsResponse = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_completion_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Você é um stylist de streetwear para público ${genderCtx}

A PEÇA BASE (item fotografado): "${itemDescription}"

REGRA: Em TODOS os 6 looks, a peça base DEVE aparecer como protagonista. Os outros itens completam o look ao redor dela.

Gere 6 looks streetwear distintos. Retorne APENAS um JSON válido:
[
  {
    "title": "Nome do look (2-3 palavras)",
    "style": "Estilo em 1 frase",
    "items": ["peça base aqui", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Flat lay overhead: a peça base centralizada, rodeada pelas outras peças. Descreva as cores e disposição"
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
      concepts = parsed.map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
        basePieceDescription: itemDescription,
      }));
    } catch {
      concepts = [];
    }
  }

  res.json({ concepts, itemDescription });
});

// Step 2: generate one outfit image (called per-concept from client)
router.post("/outfits/generate-image", async (req, res) => {
  const { concept } = req.body as { concept: OutfitConcept };

  if (!concept) {
    res.status(400).json({ error: "concept is required" });
    return;
  }

  const prompt = `High-end streetwear fashion flat lay on clean white background. Overhead bird's eye view. Must include: ${concept.basePieceDescription}. ${concept.imagePrompt}. Main piece centered, others arranged around. No people, no mannequins. Professional fashion photography, Pinterest aesthetic, perfect lighting.`;

  try {
    const buffer = await generateImageBuffer(prompt, "1024x1024");
    const { imagePrompt: _ip, basePieceDescription: _bp, ...rest } = concept;
    const result: OutfitResult = { ...rest, image: buffer.toString("base64") };
    res.json({ outfit: result });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("safety") || errMsg.includes("400")) {
      try {
        const safePrompt = `Fashion flat lay photography. ${concept.imagePrompt}. Clean white background. No people. Streetwear clothing items arranged neatly.`;
        const buffer2 = await generateImageBuffer(safePrompt, "1024x1024");
        const { imagePrompt: _ip, basePieceDescription: _bp, ...rest } = concept;
        const result: OutfitResult = { ...rest, image: buffer2.toString("base64") };
        res.json({ outfit: result });
        return;
      } catch {
        // fall through
      }
    }
    const { imagePrompt: _ip, basePieceDescription: _bp, ...rest } = concept;
    res.json({ outfit: { ...rest, image: "" } });
  }
});

// Explore: generate 6 more concepts (client fetches images individually)
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
    model: "gpt-4.1",
    max_completion_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Você é um stylist de streetwear para público ${genderCtx}

Peça base do usuário: "${itemDescription}"
Look que o usuário gostou: "${selectedOutfit.title}" — ${selectedOutfit.style}

REGRA: Em TODOS os 6 novos looks, a peça base DEVE estar presente como protagonista.

Gere 6 NOVOS looks com estilos e paletas diferentes. Retorne APENAS JSON:
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
      concepts = parsed.map((c, i) => ({
        ...c,
        id: `outfit-${Date.now()}-${i}`,
        basePieceDescription: itemDescription,
      }));
    } catch {
      concepts = [];
    }
  }

  res.json({ concepts, itemDescription });
});

// Like an outfit
router.post("/outfits/like", async (req, res) => {
  const { userId, outfit } = req.body as { userId: string; outfit: OutfitResult };

  if (!userId || !outfit) {
    res.status(400).json({ error: "userId and outfit are required" });
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
  const { outfitId } = req.params;
  const { userId } = req.body as { userId: string };

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  await db
    .delete(likedOutfits)
    .where(and(eq(likedOutfits.userId, userId), eq(likedOutfits.outfitId, outfitId)));

  res.json({ liked: false });
});

// Get liked outfits
router.get("/outfits/liked", async (req, res) => {
  const { userId } = req.query as { userId: string };

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

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
