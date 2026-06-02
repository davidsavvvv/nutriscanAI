import { ScanResult as ScanResultType } from "../types";
import { RefreshCw } from "lucide-react";
import ScanResult from "./ScanResult";

interface ScanResultPanelProps {
  result: ScanResultType;
  onClear: () => void;
  plan?: string;
  onUnlock?: () => void;
}

export default function ScanResultPanel({ result, onClear, plan = "free", onUnlock }: ScanResultPanelProps) {
  // Extract numerical scores from representations like "8/10" or "8"
  const getScoreNumber = (scoreStr?: string) => {
    if (!scoreStr) return 5;
    const clean = scoreStr.split("/")[0].trim().replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 5 : num;
  };

  const healthScore = getScoreNumber(result.health_score);
  const numericScoreOutOf100 = healthScore <= 10 ? healthScore * 10 : healthScore;
  
  // Score Colors
  const getScoreColor = (score: number) => {
    if (score >= 7) return "#00FF88"; // Vert
    if (score >= 4) return "#F59E0B"; // Orange
    return "#EF4444"; // Rouge
  };
  const scoreColor = getScoreColor(healthScore);

  const calories = result.nutrition_100g?.calories || result.calories || "- kcal";
  const protein = result.nutrition_100g?.protein || result.protein || "- g";
  const carbs = result.nutrition_100g?.carbs || result.carbs || "- g";
  const fat = result.nutrition_100g?.fat || result.fat || "- g";

  return (
    <div id="nutrition-scan-result-panel" className="w-full flex flex-col items-center max-w-lg mx-auto">
      
      {/* 1. Photo with Overlay Card */}
      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden mb-6 border-4 border-slate-900 shadow-xl bg-slate-900">
        {result.imageUrl ? (
          <img 
            src={result.imageUrl} 
            alt={result.product_name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center opacity-30 bg-slate-800">
            <span className="text-4xl mb-2">📸</span>
            <span className="text-xs uppercase tracking-widest font-mono text-white">Image indisponible</span>
          </div>
        )}

        {/* Overlay Card (Slide-up + Fade-in) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000] via-[#000]/90 to-transparent p-4 pb-6 pt-16 flex flex-col justify-end animate-in slide-in-from-bottom-[50%] fade-in duration-700">
          <div className="flex flex-row items-center gap-4">
            {/* Score Circle */}
            <div className="shrink-0">
              <div 
                className="relative w-16 h-16 rounded-full border-[5px] flex items-center justify-center font-bold text-white shadow-xl bg-black/40 backdrop-blur-sm"
                style={{ borderColor: scoreColor }}
              >
                <span className="text-2xl font-display">{healthScore}</span>
                <span className="text-[10px] text-slate-300 mt-1.5 font-sans">/10</span>
              </div>
            </div>
            
            {/* Infos Nom */}
            <div className="flex-1 text-white">
              <h2 className="text-xl font-bold font-display leading-[1.1] mb-1 line-clamp-2">
                {result.product_name || "Produit Inconnu"}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {result.brand || "Marque Inconnue"}
              </p>
            </div>
          </div>

          {/* Macros Grid 2x2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest leading-none mb-1.5">Calories</span>
              <span className="text-sm font-bold text-white font-mono leading-none">{calories}</span>
            </div>
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest leading-none mb-1.5">Protéines</span>
              <span className="text-sm font-bold text-[#00FF88] font-mono leading-none">{protein}</span>
            </div>
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest leading-none mb-1.5">Glucides</span>
              <span className="text-sm font-bold text-slate-200 font-mono leading-none">{carbs}</span>
            </div>
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest leading-none mb-1.5">Lipides</span>
              <span className="text-sm font-bold text-slate-200 font-mono leading-none">{fat}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Poulpe animé */}
      <div className="w-full mb-6 relative z-10">
        <ScanResult score={numericScoreOutOf100} />
      </div>

      {/* Extra Detail Button if useful (e.g., locked) */}
      {(plan === "free" || result.isLocked) && (
        <button onClick={onUnlock} className="w-full bg-[#1e1e1e] border border-[#333] hover:border-[#00FF88] active:scale-[0.98] transition-all rounded-[24px] p-5 mb-6 flex items-center justify-between shadow-lg group">
           <div className="flex items-center gap-4">
              <span className="text-2xl group-hover:animate-ping filter drop-shadow">🔒</span>
              <div className="text-left flex flex-col">
                 <span className="text-sm font-bold text-white leading-tight mb-1">Analyse approfondie absente</span>
                 <span className="text-xs text-slate-400">Vitamines, additifs toxiques, coaching...</span>
              </div>
           </div>
           <span className="bg-[#00FF88] text-black font-extrabold text-[10px] uppercase font-mono px-3 py-1.5 rounded-md shadow-sm">Débloquer</span>
        </button>
      )}

      {/* 3. Restart Scan */}
      <button
        onClick={onClear}
        className="w-full sm:w-auto min-h-[56px] text-slate-300 hover:text-black hover:bg-[#00FF88] hover:border-[#00FF88] active:scale-95 bg-transparent border border-slate-700 px-8 py-4 flex items-center justify-center gap-3 font-bold tracking-widest text-xs uppercase rounded-[16px] transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Scanner un autre produit
      </button>

    </div>
  );
}
