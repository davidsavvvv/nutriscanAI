export interface SelfieEntry {
  id: string;
  date: string;
  weight: string;
  imageUrl: string;
  message: string;
  tips: string[];
  level: string;
  octopusScore: number;
}

export interface ScanResult {
  // Original fields
  brand?: string;
  product_name: string;
  flavor?: string;
  category?: string;
  estimated_weight_or_volume?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  sugar?: string;
  fat?: string;
  caffeine?: string;
  sweeteners?: string[];
  health_score?: string;
  fitness_score?: string;
  summary?: string;
  better_alternative?: string;
  confidence?: string;
  scannedAt?: string;
  imageUrl?: string;
  id?: string;

  // New detailed French fields
  nutrition_100g?: {
    calories: string;
    protein: string;
    carbs: string;
    sugar: string;
    fat: string;
    saturated_fat: string;
    fiber: string;
    salt: string;
    water: string;
  };
  composition?: string;
  benefits?: string[];
  alerts?: string[];
  vitamins_minerals?: string[];
  objectives?: {
    weight_loss: string;
    muscle_gain: string;
    general_health: string;
    sport: string;
    kids: string;
  };
  origin?: string;
  transformation_level?: string;
  health_score_explanation?: string;
  custom_advice?: string;
}

export interface SampleProduct {
  id: string;
  brand: string;
  product_name: string;
  flavor: string;
  category: string;
  illustrationType: "energy" | "cola" | "bar" | "shake" | "chips";
  estimated_weight_or_volume: string;
  calories: string;
  protein: string;
  carbs: string;
  sugar: string;
  fat: string;
  caffeine: string;
  sweeteners: string[];
  health_score: string;
  fitness_score: string;
  summary: string;
  better_alternative: string;
  confidence: string;
  badge: string;
  accentColor: string; // theme match
}
