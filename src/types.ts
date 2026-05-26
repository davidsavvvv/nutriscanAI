export interface ScanResult {
  brand: string;
  product_name: string;
  flavor: string;
  category: string;
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
  scannedAt: string;
  imageUrl?: string;
  id?: string;
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
