import { ScanResult } from "../types";
import { getProductSVG } from "../data";
import { ShieldAlert, TrendingUp, Sparkles, RefreshCw, Layers, Zap } from "lucide-react";

interface ScanResultPanelProps {
  result: ScanResult;
  onClear: () => void;
}

export default function ScanResultPanel({ result, onClear }: ScanResultPanelProps) {
  // Extract numerical scores from representations like "8/10" or "8"
  const getScoreNumber = (scoreStr: string) => {
    if (!scoreStr) return 5;
    const clean = scoreStr.split("/")[0].trim();
    const num = parseInt(clean, 10);
    return isNaN(num) ? 5 : num;
  };

  const healthScore = getScoreNumber(result.health_score);
  const fitnessScore = getScoreNumber(result.fitness_score);

  // Score Colors & Labels inside minimalist framework
  const getScoreColor = (score: number) => {
    if (score >= 9) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 7) return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
    if (score >= 5) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const hsStyle = getScoreColor(healthScore);
  const fsStyle = getScoreColor(fitnessScore);

  // Match illustrator type for display SVG fallback
  const getIllustrationType = (category: string, name: string): "energy" | "cola" | "bar" | "shake" | "chips" => {
    const cat = category.toLowerCase();
    const nm = name.toLowerCase();
    if (cat.includes("energy") || nm.includes("monster") || nm.includes("red bull")) return "energy";
    if (cat.includes("cola") || cat.includes("soda") || nm.includes("coke") || nm.includes("pepsi")) return "cola";
    if (cat.includes("bar") || nm.includes("cookie") || nm.includes("flapjack")) return "bar";
    if (cat.includes("shake") || cat.includes("milk") || nm.includes("power") || cat.includes("drinkable")) return "shake";
    return "chips";
  };

  const illustrationType = getIllustrationType(result.category, result.product_name);
  const productSvg = getProductSVG(illustrationType, result.brand, result.product_name);

  // Helper for macro values parsing
  const getProgressWidth = (val: string, max: number) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0%";
    const percentage = Math.min((num / max) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div 
      id="nutrition-scan-result-panel"
      className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-8 animate-fade-in relative overflow-hidden shadow-sm text-slate-800"
    >
      {/* Background ambient light green or red touch */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-[0.06] pointer-events-none transition-all duration-700"
        style={{
          background: healthScore >= 7 ? "#10B981" : "#EF4444",
        }}
      />

      {/* Main Header Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-8 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> 
            Analysis Complete • {result.confidence} Confidence
          </span>
        </div>
        <button
          id="btn-scan-another"
          onClick={onClear}
          className="text-xs flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 px-4 py-2 rounded-full border border-slate-200/60 transition-all font-semibold cursor-pointer w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Scan Another Item
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stylized Visual & Dual Score Ring Widgets */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          <div className="bg-slate-50/50 border border-slate-200/65 rounded-[24px] p-6 flex flex-col items-center justify-center relative min-h-[190px]">
            {result.imageUrl ? (
              <img 
                src={result.imageUrl} 
                alt={result.product_name} 
                referrerPolicy="no-referrer"
                className="max-h-52 w-auto object-contain rounded-xl shadow-sm filter contrast-105"
              />
            ) : (
              <div 
                className="w-full flex items-center justify-center scale-95"
                dangerouslySetInnerHTML={{ __html: productSvg }}
              />
            )}
            <div className="text-[9px] font-bold font-mono mt-4 text-slate-400 uppercase tracking-widest bg-slate-100 border border-slate-200/50 px-3 py-1 rounded-full">
              {result.estimated_weight_or_volume} Volume
            </div>
          </div>

          {/* Double Digital Rings Widget */}
          <div className="grid grid-cols-2 gap-4">
            {/* Health Score Card */}
            <div className={`p-5 rounded-[24px] border ${hsStyle.bg} ${hsStyle.border} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <div className="text-3xl font-extrabold tracking-tight font-display text-slate-900 flex items-baseline">
                {healthScore}
                <span className="text-xs font-medium text-slate-500 ml-0.5">/10</span>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${hsStyle.text}`}>
                Health Index
              </span>
              <p className="text-[9px] text-slate-400 mt-1 block">
                {healthScore >= 9 ? "Optimal Cleanliness" : healthScore >= 7 ? "Minor Additives" : healthScore >= 5 ? "Commercial Standard" : "Inflammatory Blend"}
              </p>
            </div>

            {/* Fitness Score Card */}
            <div className={`p-5 rounded-[24px] border ${fsStyle.bg} ${fsStyle.border} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <div className="text-3xl font-extrabold tracking-tight font-display text-slate-900 flex items-baseline">
                {fitnessScore}
                <span className="text-xs font-medium text-slate-500 ml-0.5">/10</span>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${fsStyle.text}`}>
                Fitness Merit
              </span>
              <p className="text-[9px] text-slate-400 mt-1 block">
                {fitnessScore >= 9 ? "Anabolic Target" : fitnessScore >= 7 ? "Clean Refeed" : fitnessScore >= 5 ? "Sub-Optimal Fuel" : "Macro Strain"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth metrics, additive checklists and comparisons */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Titles */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono">
              Category: {result.category}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">
              {result.brand} <span className="font-light text-slate-500">{result.product_name}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Variant: <span className="text-slate-700 italic font-semibold">{result.flavor}</span>
            </p>
          </div>

          {/* Quick Stats Grid with Mini Bars */}
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-[28px] p-6">
            <h3 className="text-slate-800 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 font-display">
              <Layers className="w-4 h-4 text-slate-400" /> Macronutrient Verification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* Calories */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-slate-500">Total Energy</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{result.calories}</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full transition-all duration-500" style={{ width: getProgressWidth(result.calories, 600) }} />
                </div>
              </div>

              {/* Protein */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">💪 Protein Isolate</span>
                  <span className="font-mono text-xs font-semibold text-blue-600">{result.protein}</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full transition-all duration-500" style={{ width: getProgressWidth(result.protein, 50) }} />
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-slate-500">Total Carbohydrate</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{result.carbs}</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full rounded-full transition-all duration-500" style={{ width: getProgressWidth(result.carbs, 100) }} />
                </div>
              </div>

              {/* Sugar */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-xs font-medium flex items-center gap-1 ${parseFloat(result.sugar) > 5 ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                    ⚠️ Sugar Impact
                  </span>
                  <span className={`font-mono text-xs font-semibold ${parseFloat(result.sugar) > 5 ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                    {result.sugar}
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${parseFloat(result.sugar) > 5 ? "bg-rose-500" : "bg-slate-800"}`} style={{ width: getProgressWidth(result.sugar, 50) }} />
                </div>
              </div>

              {/* Lipids / Fats */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-slate-500">Lipids / Fats</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{result.fat}</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: getProgressWidth(result.fat, 30) }} />
                </div>
              </div>

              {/* Caffeine */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1 font-display">
                    ⚡ Stimulants (Caffeine)
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{result.caffeine}</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: getProgressWidth(result.caffeine, 300) }} />
                </div>
              </div>

            </div>
          </div>

          {/* Sweeteners and Artificial Additives */}
          <div className="bg-white border border-slate-200 p-6 rounded-[28px]">
            <h3 className="text-slate-800 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5 font-display">
              <ShieldAlert className="w-4 h-4 text-slate-500" strokeWidth={2.5} /> Sweeteners & Sweetening Agents
            </h3>
            {result.sweeteners && result.sweeteners.length > 0 && result.sweeteners[0] !== "None" ? (
              <div className="flex flex-wrap gap-2">
                {result.sweeteners.map((sw, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-slate-100/80 border border-slate-200 text-slate-600 font-mono text-[10px] rounded-lg font-medium shadow-sm hover:border-slate-300 transition-colors"
                  >
                    🚫 {sw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-700 bg-green-50/55 border border-green-100 rounded-lg p-3 font-semibold">
                ✅ No synthetic sweeteners identified in processed compounds.
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-3 font-mono">
              *Synthetics bypass gastric breakdown but can trigger gut microbiota disruptions and maintain high sweet cravings.
            </p>
          </div>

          {/* AI Narrative Commentary */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-[28px] p-6 flex gap-4">
            <div className="p-2.5 bg-slate-200/60 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-slate-200/60">
              <Zap className="text-slate-800 w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 text-xs font-extrabold uppercase font-display tracking-wider">
                Nutriscan Coach Insight
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Better Cleaner Alternative (Light Green Style) */}
          <div className="p-6 bg-green-50 rounded-[28px] border border-green-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all hover:bg-green-100/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/90 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-green-800 uppercase tracking-widest font-mono">Better Cleaner Alternative</div>
                <div className="text-base font-bold text-green-950 mt-1">{result.better_alternative}</div>
                <div className="text-xs text-green-700 mt-1 leading-relaxed">
                  Optimize cellular ATP production and performance by selecting this natural, unburdened swap recommendation.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
