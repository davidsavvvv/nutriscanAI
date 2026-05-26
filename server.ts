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

      const prompt = `You are NutriScan AI, an expert AI nutrition product scanner specialized in industrial food products, fitness snacks, energy drinks, sugar-free beverages, and packaged foods.
Analyze the provided product image and identify its details.

Please work extremely well with:
- Monster Energy (Ultra series, original, etc.)
- Coca-Cola Zero / Pepsi Max / zero sugar sodas
- Protein bars (Quest, Grenade, Barebells, Clif, etc.)
- Protein shakes / pre-made fitness drinks
- Zero sugar drinks and electrolyte formulations
- Gym snacks (beef jerky, rice cakes, nuts)
- Supermarket packaged foods and processed items

Rules:
1. Be fast, direct, and sporty. Keep explanations highly concise and fitness-oriented.
2. Prefer realistic, accurate estimations from well-known commercial database metrics if you can identify the exact product.
3. Detect "zero sugar", "diet", "light", "ultra", or similar health terms if present.
4. Explain health concerns simply, detailing artificial sweeteners, heavy sodium, or preservative impacts.
5. Provide a realistic better_alternative that matches the physical item category (e.g. if scan is Monster, suggest natural tea or sparkling water + light caffeine; if standard high-fat potato chips, suggest high-protein crisps or roasted chickpeas).
6. health_score logic: 9-10 = excellent (unprocessed, perfect diet food), 7-8 = good (decent, mild sweeteners), 5-6 = acceptable (typical fitness bars/drinks, heavily sweetened), 3-4 = poor (lots of empty carbs and preservatives), 1-2 = very unhealthy (full sugar sodas, processed trans-fats snack).
7. fitness_score logic: High protein, low sugar, low fats, clean energy compounds increase this score. Heavy sugar, zero protein, high trans-fats lower it.

Return the response EXACTLY in this JSON format:
{
  "brand": "Brand Name",
  "product_name": "Product Name",
  "flavor": "Flavor/version info",
  "category": "Product Category (e.g. Energy Drink, Protein Bar, Carbonated Beverage)",
  "estimated_weight_or_volume": "Estimated size/weight (e.g. 500ml, 60g)",
  "calories": "Calories (e.g. 10 kcal, 220 kcal)",
  "protein": "Protein (e.g. 0g, 20g)",
  "carbs": "Total Carbs (e.g. 3g, 15g)",
  "sugar": "Sugar (e.g. 0g, 2g)",
  "fat": "Fat content (e.g. 0g, 7g)",
  "caffeine": "Caffeine content if applicable (e.g. 150mg, 0mg, or 'N/A')",
  "sweeteners": ["Sweetener1", "Sweetener2"],
  "health_score": "X/10",
  "fitness_score": "Y/10",
  "summary": "1-2 sentences in a sharp, modern, gym-friendly tone.",
  "better_alternative": "Name of healthier or cleaner alternative product",
  "confidence": "95%"
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
              brand: { type: Type.STRING },
              product_name: { type: Type.STRING },
              flavor: { type: Type.STRING },
              category: { type: Type.STRING },
              estimated_weight_or_volume: { type: Type.STRING },
              calories: { type: Type.STRING },
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              sugar: { type: Type.STRING },
              fat: { type: Type.STRING },
              caffeine: { type: Type.STRING },
              sweeteners: { type: Type.ARRAY, items: { type: Type.STRING } },
              health_score: { type: Type.STRING },
              fitness_score: { type: Type.STRING },
              summary: { type: Type.STRING },
              better_alternative: { type: Type.STRING },
              confidence: { type: Type.STRING },
            },
            required: [
              "brand",
              "product_name",
              "flavor",
              "category",
              "estimated_weight_or_volume",
              "calories",
              "protein",
              "carbs",
              "sugar",
              "fat",
              "caffeine",
              "sweeteners",
              "health_score",
              "fitness_score",
              "summary",
              "better_alternative",
              "confidence",
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
