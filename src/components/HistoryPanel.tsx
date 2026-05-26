import { ScanResult } from "../types";
import { Trash2, Calendar, Clipboard, CheckCircle } from "lucide-react";

interface HistoryPanelProps {
  history: ScanResult[];
  onSelect: (result: ScanResult) => void;
  onClearHistory: () => void;
  activeId?: string;
}

export default function HistoryPanel({ history, onSelect, onClearHistory, activeId }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div 
        id="history-panel-empty"
        className="bg-white border border-slate-200/80 rounded-[24px] p-6 text-center text-slate-500 font-sans shadow-sm"
      >
        <Clipboard className="w-10 h-10 mx-auto text-slate-350 mb-3" strokeWidth={1.5} />
        <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-400">No previous scans found</h5>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] mx-auto">
          Your scanned products will persist in this sidebar for visual reference.
        </p>
      </div>
    );
  }

  // Format the scanned date beautifully
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return "Scan Recorded";
    }
  };

  return (
    <div 
      id="nutrition-history-panel"
      className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <h4 className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          🕒 Session History ({history.length})
        </h4>
        <button
          onClick={onClearHistory}
          className="text-[10px] text-slate-600 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded border border-slate-200/60 transition-all cursor-pointer font-bold"
        >
          <Trash2 className="w-3 h-3" /> Clear Scans
        </button>
      </div>

      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = activeId && (item.id === activeId || item.scannedAt === activeId);
          return (
            <div
              key={item.id || item.scannedAt}
              onClick={() => onSelect(item)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex items-start justify-between group ${
                isActive
                  ? "bg-slate-900 border-slate-900 shadow-sm translate-x-1"
                  : "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300 hover:translate-x-0.5"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold tracking-wide uppercase truncate block ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {item.brand}
                  </span>
                  {isActive && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                </div>
                <h5 className={`text-xs font-bold mt-0.5 truncate font-display transition-colors ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-950'}`}>
                  {item.product_name}
                </h5>
                <div className={`flex items-center gap-1 text-[9px] mt-1 font-mono ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{formatTime(item.scannedAt)}</span>
                </div>
              </div>

              {/* Quick score display */}
              <div className="text-right ml-3 shrink-0 flex flex-col items-end justify-center">
                <span className={`text-[9px] font-mono ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>HS Score</span>
                <span className={`text-xs font-bold font-mono ${
                  parseInt(item.health_score) >= 7 ? "text-emerald-500" : parseInt(item.health_score) >= 5 ? "text-amber-500" : "text-rose-500"
                }`}>
                  {item.health_score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
