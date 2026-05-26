import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for larger visual payload uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Initialize GoogleGenAI client lazily or safely
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // API health/status endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Route for nutrition scanning
  app.post("/api/scan", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      let client;
      try {
        client = getGeminiClient();
      } catch (keyError: any) {
        console.warn("Key error in NutriScan AI:", keyError.message);
        return res.status(503).json({
          error: "API Key Not Found",
          message: "Please add your GEMINI_API_KEY in the Settings > Secrets tab to activate real-time AI scanning.",
        });
      }

      // Base64 cleanup
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const resolvedMimeType = mimeType || "image/jpeg";

      const prompt = `Tu es un expert en nutrition et en science alimentaire, spécialisé dans les produits vendus en France.
Quand l'utilisateur envoie une photo d'un aliment (produit industriel, fruit, légume, viande, plat cuisiné...), tu dois analyser et retourner une fiche nutritionnelle complète et détaillée.

- Toujours répondre en français
- Si c'est un produit industriel français utilise les vraies valeurs nutritionnelles connues
- Si c'est un aliment brut utilise les valeurs officielles du Ciqual
- Ne jamais inventer des données, toujours être précis et honnête
- Mentionner les allergènes présents dans la composition

Return the response EXACTLY in this JSON format mapping exactly to the concepts requested:
{
  "product_name": "Nom exact du produit ou de l'aliment détecté",
  "nutrition_100g": {
    "calories": "XX kcal",
    "protein": "XX g",
    "carbs": "XX g",
    "sugar": "XX g",
    "fat": "XX g",
    "saturated_fat": "XX g",
    "fiber": "XX g",
    "salt": "XX g",
    "water": "XX g"
  },
  "composition": "Liste tous les ingrédients détectés ou connus. Mentionne les additifs et allergènes.",
  "benefits": ["bienfait 1", "bienfait 2", "bienfait 3"],
  "alerts": ["point de vigilance 1", "point de vigilance 2"],
  "vitamins_minerals": ["Vitamine X → rôle dans le corps"],
  "objectives": {
    "weight_loss": "✅ Oui / ⚠️ Avec modération / ❌ Non",
    "muscle_gain": "✅ Oui / ⚠️ Avec modération / ❌ Non",
    "general_health": "✅ Oui / ⚠️ Avec modération / ❌ Non",
    "sport": "✅ Oui / ⚠️ Avec modération / ❌ Non",
    "kids": "✅ Oui / ⚠️ Avec modération / ❌ Non"
  },
  "origin": "France / Europe / Monde",
  "transformation_level": "🟢 Peu transformé / 🟡 Transformé / 🔴 Ultra-transformé",
  "health_score": "Donne un score de 1 à 5 sous la forme ⭐ 1/5 à ⭐⭐⭐⭐⭐ 5/5",
  "health_score_explanation": "Explication du score",
  "custom_advice": "Une phrase drôle et motivante adaptée au score.",
  "brand": "Marque (si applicable)",
  "category": "Catégorie",
  "confidence": "Pourcentage de confiance en l'analyse"
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: resolvedMimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product_name: { type: Type.STRING },
              nutrition_100g: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.STRING },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  sugar: { type: Type.STRING },
                  fat: { type: Type.STRING },
                  saturated_fat: { type: Type.STRING },
                  fiber: { type: Type.STRING },
                  salt: { type: Type.STRING },
                  water: { type: Type.STRING },
                },
                required: ["calories", "protein", "carbs", "sugar", "fat", "saturated_fat", "fiber", "salt", "water"],
              },
              composition: { type: Type.STRING },
              benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
              alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
              vitamins_minerals: { type: Type.ARRAY, items: { type: Type.STRING } },
              objectives: {
                type: Type.OBJECT,
                properties: {
                  weight_loss: { type: Type.STRING },
                  muscle_gain: { type: Type.STRING },
                  general_health: { type: Type.STRING },
                  sport: { type: Type.STRING },
                  kids: { type: Type.STRING },
                },
                required: ["weight_loss", "muscle_gain", "general_health", "sport", "kids"],
              },
              origin: { type: Type.STRING },
              transformation_level: { type: Type.STRING },
              health_score: { type: Type.STRING },
              health_score_explanation: { type: Type.STRING },
              custom_advice: { type: Type.STRING },
              brand: { type: Type.STRING },
              category: { type: Type.STRING },
              confidence: { type: Type.STRING },
            },
            required: [
              "product_name",
              "nutrition_100g",
              "composition",
              "benefits",
              "alerts",
              "vitamins_minerals",
              "objectives",
              "origin",
              "transformation_level",
              "health_score",
              "health_score_explanation",
              "custom_advice",
              "brand",
              "category",
              "confidence"
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from Gemini.");
      }

      const parsed = JSON.parse(text);
      return res.json(parsed);

    } catch (err: any) {
      console.error("AI Scan Error:", err);
      return res.status(500).json({
        error: "Scanning failed",
        message: err.message || "An unexpected error occurred during item analysis.",
      });
    }
  });

  // Setup Vite Dev Server / Prod Fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NutriScan AI Server] Listening on http://localhost:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
