import { SampleProduct } from "./types";

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: "monster-ultra",
    brand: "Monster Energy",
    product_name: "Ultra White",
    flavor: "Citrus / Classic Gray Can",
    category: "Sugar-free Energy Drink",
    illustrationType: "energy",
    estimated_weight_or_volume: "500ml",
    calories: "10 kcal",
    protein: "0g",
    carbs: "3g",
    sugar: "0g",
    fat: "0g",
    caffeine: "150mg",
    sweeteners: ["Erythritol", "Sucralose", "Acesulfame K"],
    health_score: "6/10",
    fitness_score: "8/10",
    summary: "A reliable calorie-free energy boost. Zero sugar keeps insulin spike absent, making it perfect for rapid fat-cutting cycles, though artificial sweeteners and high caffeine remain as chemical load details.",
    better_alternative: "Unsweetened Yerba Mate or Organic Black Coffee",
    confidence: "99%",
    badge: "Zero Sugar",
    accentColor: "#E2E8F0", // Slate gray / white
  },
  {
    id: "coke-zero",
    brand: "Coca-Cola",
    product_name: "Zero Sugar",
    flavor: "Original Taste Zero Sugar",
    category: "Carbonated Diet Soda",
    illustrationType: "cola",
    estimated_weight_or_volume: "330ml",
    calories: "1 kcal",
    protein: "0g",
    carbs: "0g",
    sugar: "0g",
    fat: "0g",
    caffeine: "32mg",
    sweeteners: ["Aspartame", "Acesulfame K"],
    health_score: "5/10",
    fitness_score: "7/10",
    summary: "Perfect sugar alternative that satisfies sweet cravings without the caloric overhead. Excellent for strict ketogenic macros, but contains phosphoric acid and artificial sweeteners which can disrupt raw gut biome health over long-term habits.",
    better_alternative: "Prebiotic Sparkling Water (e.g., Olipop) or Stevia-sweetened Cola",
    confidence: "98%",
    badge: "Diet Staple",
    accentColor: "#EF4444", // Red
  },
  {
    id: "quest-cookie",
    brand: "Quest Nutrition",
    product_name: "Chocolate Chip Cookie Dough Bar",
    flavor: "Choc Chip Cookie Dough",
    category: "High Protein Fitness Bar",
    illustrationType: "bar",
    estimated_weight_or_volume: "60g",
    calories: "200 kcal",
    protein: "21g",
    carbs: "22g",
    sugar: "1g",
    fat: "9g",
    caffeine: "0mg",
    sweeteners: ["Erythritol", "Sucralose", "Soluble Corn Fiber"],
    health_score: "7/10",
    fitness_score: "9/10",
    summary: "Incredible macronutrient distribution for active lifestyles! Loaded with 21 grams of highly bioavailable whey and milk protein isolates. High dietary fiber content lowers net impact carbohydrates to a harmless 4g.",
    better_alternative: "Homemade almond meal bars with grass-fed whey isolates",
    confidence: "96%",
    badge: "21g Protein",
    accentColor: "#3B82F6", // Athletic blue
  },
  {
    id: "fairlife-elite",
    brand: "Fairlife",
    product_name: "Core Power Elite",
    flavor: "Chocolate High Protein Shake",
    category: "Packaged High Protein Shake",
    illustrationType: "shake",
    estimated_weight_or_volume: "414ml",
    calories: "230 kcal",
    protein: "42g",
    carbs: "8g",
    sugar: "8g",
    fat: "3.5g",
    caffeine: "0mg",
    sweeteners: ["Monk Fruit Extract", "Stevia Leaf Extract", "Sucralose"],
    health_score: "8/10",
    fitness_score: "10/10",
    summary: "An elite fluid anabolic refeed packed with an outstanding 42g of filtered milk protein. Contains naturally high calcium and is lactose-free. Extremely clean recovery profile for powerlifters and bodybuilders.",
    better_alternative: "Fresh organic grass-fed milk with cold-pressed pasture eggs",
    confidence: "97%",
    badge: "Anabolic Elite",
    accentColor: "#F59E0B", // Amber gold
  },
  {
    id: "lays-chips",
    brand: "Lay's",
    product_name: "Classic Potato Chips",
    flavor: "Salted Classic",
    category: "Processed Supermarket Snack",
    illustrationType: "chips",
    estimated_weight_or_volume: "150g",
    calories: "536 kcal",
    protein: "7g",
    carbs: "53g",
    sugar: "1.2g",
    fat: "35g",
    caffeine: "0mg",
    sweeteners: ["None"],
    health_score: "2/10",
    fitness_score: "1/10",
    summary: "A high glycaemic index processed carb trap. Deep fried in inflammatory seed oils, leading to high fat concentrations and empty calories that spike insulin and store fat aggressively.",
    better_alternative: "Air-popped popcorn, baked seaweed sheets, or baked sweet potato disks",
    confidence: "98%",
    badge: "Avoid Snack",
    accentColor: "#10B981", // Emerald green
  }
];

// Simple helper to generate dummy custom image representations of the products using clean absolute scalable SVGs
export function getProductSVG(type: "energy" | "cola" | "bar" | "shake" | "chips", brand?: string, name?: string) {
  switch (type) {
    case "energy":
      return `
        <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-h-56">
          <rect x="25" y="15" width="70" height="170" rx="12" fill="url(#bg-energy)" stroke="#38BDF8" stroke-width="2"/>
          <rect x="35" y="5" width="50" height="10" rx="4" fill="#64748B"/>
          <line x1="30" y1="35" x2="90" y2="35" stroke="#475569" stroke-width="2"/>
          <path d="M60 55 L45 105 L65 105 L55 155 L85 95 L65 95 Z" fill="#38BDF8" filter="drop-shadow(0px 0px 4px #0ea5e9)"/>
          <text x="60" y="165" font-family="monospace" font-size="7" fill="#E2E8F0" text-anchor="middle" font-weight="bold">ULTRA</text>
          <text x="60" y="30" font-family="sans-serif" font-size="9" fill="#94A3B8" text-anchor="middle" letter-spacing="1">MONSTER</text>
          <defs>
            <linearGradient id="bg-energy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0F172A"/>
              <stop offset="100%" stop-color="#1E293B"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    case "cola":
      return `
        <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-h-56">
          <rect x="25" y="15" width="70" height="170" rx="14" fill="#1E2022" stroke="#EF4444" stroke-width="2"/>
          <rect x="35" y="5" width="50" height="10" rx="4" fill="#94A3B8"/>
          <circle cx="60" cy="100" r="30" fill="#EF4444"/>
          <path d="M40 100 Q60 85 80 100 T120 100" stroke="#FFFFFF" stroke-width="3" fill="none"/>
          <text x="60" y="165" font-family="sans-serif" font-size="8" fill="#FFFFFF" text-anchor="middle" font-weight="extra-bold" letter-spacing="1">ZERO SUGAR</text>
          <text x="60" y="50" font-family="serif" font-size="14" fill="#FFFFFF" text-anchor="middle" font-style="italic" font-weight="900">Coca-Cola</text>
        </svg>
      `;
    case "bar":
      return `
        <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-h-36">
          <rect x="10" y="20" width="180" height="60" rx="6" fill="#2563EB" stroke="#60A5FA" stroke-width="2"/>
          <rect x="10" y="20" width="40" height="60" rx="4" fill="#1D4ED8"/>
          <text x="100" y="50" font-family="sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle" font-weight="bold" letter-spacing="1">QUEST PROTEIN</text>
          <text x="100" y="65" font-family="sans-serif" font-size="8" fill="#93C5FD" text-anchor="middle">21g PROTEIN | 1g SUGAR</text>
          <!-- small cookie chip dots -->
          <circle cx="30" cy="40" r="3" fill="#1E293B"/>
          <circle cx="45" cy="65" r="2.5" fill="#1E293B"/>
          <circle cx="160" cy="35" r="4" fill="#1E293B"/>
          <circle cx="170" cy="60" r="3" fill="#1E293B"/>
        </svg>
      `;
    case "shake":
      return `
        <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-h-56">
          <path d="M35 30 L40 15 L80 15 L85 30 L80 180 L40 180 Z" fill="#F8FAFC" stroke="#F59E0B" stroke-width="2"/>
          <rect x="42" y="5" width="36" height="10" rx="2" fill="#D97706"/>
          <rect x="38" y="60" width="44" height="60" fill="#334155"/>
          <text x="60" y="80" font-family="sans-serif" font-size="8" fill="#FBBF24" text-anchor="middle" font-weight="bold">PRO ELITE</text>
          <text x="60" y="98" font-family="sans-serif" font-size="14" fill="#FFFFFF" text-anchor="middle" font-weight="bold">42g</text>
          <text x="60" y="112" font-family="sans-serif" font-size="7" fill="#E2E8F0" text-anchor="middle">PROTEIN</text>
          <circle cx="60" cy="150" r="10" fill="#78350F" opacity="0.8"/>
        </svg>
      `;
    case "chips":
      default:
      return `
        <svg viewBox="0 0 130 190" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-h-56">
          <path d="M20 20 L27 10 L103 10 L110 20 L115 170 L100 180 L30 180 L15 170 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
          <circle cx="65" cy="100" r="35" fill="#EF4444"/>
          <ellipse cx="65" cy="100" rx="25" ry="12" fill="#FEF08A"/>
          <text x="65" y="152" font-family="serif" font-size="16" fill="#1E293B" font-weight="bold" text-anchor="middle">Lays</text>
          <text x="65" y="165" font-family="sans-serif" font-size="7" fill="#4B5563" text-anchor="middle">CLASSIC SALTED</text>
        </svg>
      `;
  }
}
