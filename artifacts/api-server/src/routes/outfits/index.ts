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

function getGenderContext(gender: string | undefined): string {
  if (gender === "masculino") {
    return "masculino (homem). Use peças tipicamente masculinas: calças cargo, hoodies oversized, tênis, jaquetas, bonés, correntes.";
  }
  if (gender === "feminino") {
    return "feminino (mulher). Use peças tipicamente femininas: calças cintura alta, tops cropped, saias mini, plataformas, bolsas, acessórios femininos.";
  }
  return "neutro/unissex. Priorize peças versáteis de streetwear.";
}

async function generateOutfitImages(
  concepts: OutfitConcept[],
  basePieceDescription: string
): Promise<OutfitResult[]> {
  return batchProcess(
    concepts,
    async (concept) => {
      const prompt = `High-end streetwear fashion editorial flat lay on clean white background. Overhead bird's eye view shot. Must prominently include: ${basePieceDescription}. ${concept.imagePrompt}. All clothing items neatly arranged with the main hero piece centered. No people, no mannequins, no faces. Professional fashion photography, Pinterest aesthetic, perfect lighting, hyper-realistic fabrics. Shot for a luxury streetwear magazine.`;
      try {
        const buffer = await generateImageBuffer(prompt, "1024x1024");
        const { imagePrompt: _imagePrompt, ...rest } = concept;
        return { ...rest, image: buffer.toString("base64") } as OutfitResult;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("safety") || errMsg.includes("400")) {
          const safePrompt = `Clean white background flat lay of streetwear clothing items. ${concept.imagePrompt}. Minimal arrangement, fashion lookbook style. No people.`;
          try {
            const buffer2 = await generateImageBuffer(safePrompt, "1024x1024");
            const { imagePrompt: _imagePrompt, ...rest } = concept;
            return { ...rest, image: buffer2.toString("base64") } as OutfitResult;
          } catch {
            const { imagePrompt: _imagePrompt, ...rest } = concept;
            return { ...rest, image: "" } as OutfitResult;
          }
        }
        const { imagePrompt: _imagePrompt, ...rest } = concept;
        return { ...rest, image: "" } as OutfitResult;
      }
    },
    { concurrency: 2, retries: 2 }
  );
}

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
            text: "Analyze this clothing item or accessory. Identify: type (sneaker, hoodie, jeans, jacket, etc.), color(s), material if visible, and dominant aesthetic (streetwear, athletic, casual, luxury, etc.). Be specific about the exact piece — color, cut, style details. 2-3 sentences max.",
          },
        ],
      },
    ],
  });

  const itemDescription =
    visionResponse.choices[0]?.message?.content ??
    "A streetwear clothing item";

  const genderCtx = getGenderContext(gender);

  const conceptsResponse = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_completion_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Você é um stylist de streetwear especializado em looks Pinterest-worthy para público ${genderCtx}

A PEÇA BASE (item fotografado pelo usuário): "${itemDescription}"

REGRA OBRIGATÓRIA: Em TODOS os 6 looks, a peça base DEVE aparecer como protagonista do look — ela é o item âncora. Os outros itens completam o look ao redor dela.

Gere 6 looks streetwear distintos e completos. Cada look deve ser diferente em paleta de cores ou silhueta, mas SEMPRE ter a peça base como peça principal.

Retorne APENAS um JSON válido com exatamente esta estrutura:
[
  {
    "title": "Nome do look (2-3 palavras)",
    "style": "Descrição do estilo (1 frase)",
    "items": ["${itemDescription} (peça base)", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Descrição visual detalhada para flat lay: inclua a peça base no centro, rodeada pelas outras peças do look"
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

  const outfits = await generateOutfitImages(concepts, itemDescription);

  res.json({ outfits, itemDescription });
});

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

A PEÇA BASE do usuário: "${itemDescription}"
O look que o usuário gostou: "${selectedOutfit.title}" — ${selectedOutfit.style}

REGRA OBRIGATÓRIA: Em TODOS os 6 novos looks, a peça base DEVE estar presente como protagonista. Explore variações diferentes em cores, camadas ou acessórios, mas mantendo a peça base no centro do look.

Gere 6 NOVOS looks inspirados nessa seleção, com estilos e paletas diferentes mas sempre com a peça base.

Retorne APENAS um JSON válido:
[
  {
    "title": "Nome do look",
    "style": "Estilo em 1 frase",
    "items": ["${itemDescription} (peça base)", "item 2", "item 3", "item 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "imagePrompt": "Flat lay com a peça base centralizada e os outros itens ao redor"
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

  const outfits = await generateOutfitImages(concepts, itemDescription);

  res.json({ outfits });
});

export default router;
