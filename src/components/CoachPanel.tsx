import React, { useState, useRef, useEffect } from "react";
import { Send, Lock, Loader2, Sparkles } from "lucide-react";
import { ScanResult } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CoachPanelProps {
  history: ScanResult[];
  plan: string;
  onUnlockExpert: () => void;
}

export default function CoachPanel({ history, plan, onUnlockExpert }: CoachPanelProps) {
  const isPremium = plan === "pro" || plan === "expert" || plan === "starter" || plan === "active";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Salut ! Je suis ton Coach IA ScanMyMacros. Je peux t'aider à comprendre tes scans, te suggérer des recettes ou adapter ton alimentation à tes objectifs. Que puis-je faire pour toi aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          history: history,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || "Erreur lors de la communication avec le coach.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Désolé, je ne peux pas répondre pour le moment." }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ Erreur : ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] border border-[#2a2a2a] rounded-[36px] bg-[#0a0a0a]">
        <Lock className="w-12 h-12 text-[#00FF88] mb-4" />
        <h3 className="text-2xl font-black text-white mb-2">Coach IA Privé</h3>
        <p className="text-slate-400 mb-8 max-w-md text-sm leading-relaxed">
          Passe à la vitesse supérieure ! Débloque le Coach IA complet pour obtenir un plan d'action nutritionnel sur mesure, des idées de recettes saines, et des réponses personnalisées basées sur tout l'historique de tes scans.
        </p>
        <button
          onClick={onUnlockExpert}
          className="bg-[#00FF88] text-black font-extrabold px-8 py-4 rounded-[24px] hover:bg-[#00d4aa] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        >
          Débloquer le Coach IA
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] md:h-[650px] border border-[#2a2a2a] rounded-[36px] bg-[#0a0a0a] overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-[#2a2a2a] bg-[#111] flex items-center gap-4 z-10 shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#00FF88]/10 flex items-center justify-center border border-[#00FF88]/20 shrink-0">
          <Sparkles className="w-6 h-6 text-[#00FF88]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Ton Coach IA</h2>
          <p className="text-xs text-[#00FF88] font-medium tracking-wide">Connecté à ton profil et tes scans</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-[24px] px-5 py-4 ${
                m.role === "user"
                  ? "bg-[#00FF88] text-black rounded-br-sm"
                  : "bg-[#161616] text-slate-200 border border-[#2a2a2a] rounded-bl-sm"
              }`}
            >
              <p className="text-sm md:text-[15px] whitespace-pre-wrap leading-relaxed font-medium">
                {m.content}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#161616] text-slate-400 border border-[#2a2a2a] rounded-[24px] rounded-bl-sm px-5 py-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#00FF88]" />
              <span className="text-sm font-medium animate-pulse">Le coach analyse...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-4 bg-[#111] border-t border-[#2a2a2a] shrink-0">
        <form
          className="flex gap-2 relative max-w-4xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose une question à ton coach..."
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-full px-6 py-4 text-[15px] text-white focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 bg-[#00FF88] text-black w-[44px] rounded-full flex items-center justify-center hover:bg-[#00d4aa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 ml-[-2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
