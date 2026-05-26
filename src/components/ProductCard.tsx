import { SampleProduct } from "../types";
import { getProductSVG } from "../data";

interface ProductCardProps {
  product: SampleProduct;
  onSelect: (product: SampleProduct) => void;
  isLoading?: boolean;
  key?: string | number;
}

export default function ProductCard({ product, onSelect, isLoading }: ProductCardProps) {
  // Safe color backgrounds
  const getLightBg = (type: string) => {
    switch (type) {
      case "energy": return "rgba(56, 189, 248, 0.06)";
      case "cola": return "rgba(239, 68, 68, 0.06)";
      case "bar": return "rgba(59, 130, 246, 0.06)";
      case "shake": return "rgba(245, 158, 11, 0.06)";
      default: return "rgba(16, 185, 129, 0.06)";
    }
  };

  const svgString = getProductSVG(product.illustrationType, product.brand, product.product_name);

  return (
    <div
      id={`sample-card-${product.id}`}
      onClick={() => !isLoading && onSelect(product)}
      className={`relative group rounded-3xl p-5 border cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[320px] bg-white border-slate-200/80 ${
        isLoading ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-md hover:border-slate-300"
      }`}
    >
      {/* Top Badge */}
      <div 
        className="absolute top-3 right-3 text-[9px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wide"
        style={{
          color: product.accentColor,
          borderColor: `${product.accentColor}30`,
          backgroundColor: `${product.accentColor}0e`,
        }}
      >
        {product.badge}
      </div>

      {/* SVG Packaging Display */}
      <div 
        className="w-full h-40 flex items-center justify-center rounded-2xl p-3 mb-4 transition-all duration-300 group-hover:rotate-1 group-hover:scale-[1.03]"
        style={{
          backgroundColor: getLightBg(product.illustrationType),
        }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      {/* Product Details */}
      <div className="w-full">
        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase block truncate">
          {product.brand}
        </span>
        <h4 className="text-sm font-bold text-slate-900 font-display mt-0.5 line-clamp-1 group-hover:text-slate-700 transition-colors">
          {product.product_name}
        </h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
          {product.flavor}
        </p>
      </div>

      {/* Micro Nutrition Badges */}
      <div className="flex gap-1.5 w-full mt-4 justify-center text-[10px] font-mono">
        <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-200/50">
          🔥 {product.calories}
        </span>
        {product.protein !== "0g" && (
          <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-200/50">
            💪 {product.protein}
          </span>
        )}
        <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-200/50">
          🟢 HS: {product.health_score}
        </span>
      </div>
    </div>
  );
}
