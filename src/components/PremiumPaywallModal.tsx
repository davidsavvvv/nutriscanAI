import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, Zap, TrendingUp, RefreshCw, Star, Layers } from 'lucide-react';

interface PremiumPaywallModalProps {
  onClose: () => void;
  userId: string | null;
  userEmail?: string | null;
  currentPlan: string;
}

export default function PremiumPaywallModal({ onClose, userId, userEmail, currentPlan }: PremiumPaywallModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId, 
          userId: userId || "anonymous",
          customer_email: userEmail 
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      setLoadingPlan(null);
    }
  };

  const isPro = currentPlan === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300 pointer-events-none" 
      />
      
      {/* Animated Green Particles Background (CSS approximated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF88] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-5xl rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-2 mb-10 relative z-10 w-full overflow-hidden pb-4 pt-4">
          {/* Simple CSS Emoji Confetti */}
          {!isPro && (
             <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-70">
                <div className="animate-[fall_3s_ease-out_forwards] absolute -top-10 left-1/4 text-2xl">🎉</div>
                <div className="animate-[fall_2.5s_ease-out_forwards_0.2s] absolute -top-10 left-1/2 text-3xl">🎊</div>
                <div className="animate-[fall_3.5s_ease-out_forwards_0.5s] absolute -top-10 right-1/4 text-2xl">✨</div>
                <div className="animate-[fall_2.8s_ease-out_forwards_0.1s] absolute -top-10 right-1/3 text-xl">🎉</div>
                <div className="animate-[fall_3.2s_ease-out_forwards_0.3s] absolute -top-10 left-1/3 text-xl">🎊</div>
             </div>
          )}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fall {
              0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
            }
          `}} />

          <div className="mx-auto w-24 h-24 mb-6 relative z-10">
            {isPro ? (
              <div className="absolute inset-0 flex items-center justify-center text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                💪
                <span className="absolute -top-4 text-4xl animate-pulse">👑</span>
              </div>
            ) : (
               <div 
                className="w-full h-full text-[80px] flex items-center justify-center animate-[muscleTransform_4s_ease-in-out_infinite]"
              >
                {/* Visual swap handled by CSS content replacement */}
                <div className="octopus-icon relative"></div>
              </div>
            )}
            <style dangerouslySetInnerHTML={{__html: `
              .octopus-icon::before {
                content: "🐙";
                animation: chubbyToMuscular 3s infinite;
              }
              @keyframes chubbyToMuscular {
                0%, 40% { content: "🐙"; filter: grayscale(50%); transform: scale(0.9); }
                50%, 90% { content: "🦑💪"; filter: grayscale(0%) drop-shadow(0 0 15px rgba(0,255,136,0.6)); transform: scale(1.1); }
                100% { content: "🐙"; filter: grayscale(50%); transform: scale(0.9); }
              }
            `}} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight mb-4 select-none relative z-10">
            {isPro ? "Tu es déjà Pro 💪" : "Tu as découvert la puissance de ScanMyMacros !"}
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium select-none relative z-10">
            {isPro 
               ? "Passe à Expert pour débloquer le niveau ultime 👑"
               : "Rejoins des milliers d'utilisateurs qui mangent mieux chaque jour."}
          </p>

          {!isPro && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-tr from-[#00FF88] to-emerald-600 flex items-center justify-center text-[10px] font-bold text-[#0a0a0a]">
                    U{i}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex text-[#FFD700] text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-xs text-slate-400 font-medium">4.9/5 • 2,847 avis</span>
              </div>
            </div>
          )}
        </div>

        {/* Plan Cards */}
        <div className={`grid grid-cols-1 ${isPro ? 'max-w-md mx-auto w-full' : 'lg:grid-cols-2'} gap-6 sm:gap-8 relative z-10`}>
          
          {!isPro && (
            <div className="relative bg-[#111111] border-2 border-[#00FF88]/30 rounded-[32px] p-8 flex flex-col hover:border-[#00FF88]/60 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent pointer-events-none" />
              
              <div className="absolute top-0 right-0 bg-[#00FF88] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl rounded-tr-[28px] uppercase tracking-wider">
                ⭐ Le plus populaire
              </div>

              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                PRO <span className="text-2xl">💪</span>
              </h3>
              
              <div className="mt-4 mb-2 flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white tracking-tighter">6.99€</span>
                  <span className="text-slate-500 font-medium">/mois</span>
                </div>
                <span className="inline-block bg-[#00FF88]/10 text-[#00FF88] text-xs font-bold px-2 py-1 rounded-md mt-2 w-fit">
                  7 jours gratuits
                </span>
                <p className="text-slate-400 text-sm mt-3 flex items-center gap-1.5">
                  ☕ Moins qu'un café par semaine
                </p>
              </div>

              <div className="w-full h-px bg-[#222] my-6" />

              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  { text: "Tout le gratuit +", type: "check-star" },
                  { text: "Scans illimités", type: "check" },
                  { text: "Analyse complète des additifs", type: "check" },
                  { text: "Vitamines et minéraux", type: "check" },
                  { text: "Coach poulpe basique", type: "check" },
                  { text: "Historique illimité", type: "check" },
                  { text: "Calculatrice calories", type: "check" },
                  { text: "Objectif calorique journalier", type: "check" },
                  { text: "Selfie évolution photos", type: "cross-blur" },
                  { text: "Plan alimentaire IA", type: "cross-blur" },
                  { text: "Export PDF", type: "cross-blur" },
                  { text: "Support prioritaire 24/7", type: "cross-blur" }
                ].map((feat, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm font-medium leading-tight ${feat.type === 'cross-blur' ? 'text-slate-500 opacity-50 blur-[2px] select-none scale-95' : 'text-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feat.type === 'cross-blur' ? 'bg-rose-500/10' : 'bg-[#00FF88]/20'}`}>
                      {feat.type === "check-star" ? (
                        <span className="text-xs text-[#00FF88]">✨</span>
                      ) : feat.type === "cross-blur" ? (
                         <span className="text-xs">🔒</span>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF88]" />
                      )}
                    </div>
                    <span>{feat.text} {feat.type === 'cross-blur' && '🔒'}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe("price_1TcVGlIcQouyQI6K6uttG2JD", "pro")}
                disabled={loadingPlan !== null}
                className="w-full bg-[#00FF88] text-black hover:bg-[#00eabf] disabled:opacity-50 py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
              >
                {loadingPlan === "pro" ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Essayer Pro gratuitement →"}
              </button>
            </div>
          )}

          <div className="relative bg-[#111111] border-2 border-purple-500/30 rounded-[32px] p-8 flex flex-col hover:border-[#FFD700]/50 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 to-purple-500/5 pointer-events-none" />
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FFD700] to-amber-500 text-black text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl rounded-tr-[28px] uppercase tracking-wider shadow-lg">
              👑 Maximum
            </div>

            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              EXPERT
            </h3>
            
            <div className="mt-4 mb-2 flex flex-col">
               {isPro && (
                <div className="text-[#FFD700] text-[11px] font-bold uppercase tracking-widest mb-1">
                  Seulement +8€/mois de plus
                </div>
               )}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white tracking-tighter">14.99€</span>
                <span className="text-slate-500 font-medium">/mois</span>
              </div>
              <span className="inline-block bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold px-2 py-1 rounded-md mt-2 w-fit">
                {isPro ? "Mise à niveau immédiate" : "7 jours gratuits"}
              </span>
              <p className="text-slate-400 text-sm mt-3 flex items-center gap-1.5">
                🍽️ Moins qu'un repas au restaurant
              </p>
            </div>

            <div className="w-full h-px bg-[#222] my-6" />

            <ul className="space-y-4 mb-8 flex-grow">
              {!isPro && (
                <li className="flex items-start gap-3 text-white font-bold text-sm leading-tight">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-xs">✨</span>
                  </div>
                  Tout le Pro +
                </li>
              )}
              {[
                "Selfie évolution photos",
                "Plan alimentaire IA hebdomadaire",
                "Export PDF des analyses",
                "Alertes allergènes personnalisées",
                "Support prioritaire 24/7",
                "Coach poulpe avancé avec conseils IA"
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-medium leading-tight">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center shrink-0">
                    {isPro ? <Zap className="w-3.5 h-3.5 text-[#FFD700]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" />}
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe("price_1TcVHFIcQouyQI6KSdytzdTQ", "expert")}
              disabled={loadingPlan !== null}
              className="w-full relative bg-gradient-to-r from-[#FFD700] to-amber-500 text-black hover:opacity-90 disabled:opacity-50 py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-out_infinite]" />
              {loadingPlan === "expert" ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isPro ? "Passer à Expert →" : "Essayer Expert gratuitement →")}
            </button>
          </div>
          
        </div>

        <div className="mt-8 pt-6 border-t border-[#222] flex flex-col items-center justify-center text-center relative z-10 w-full max-w-2xl mx-auto">
          <p className="text-slate-400 text-xs sm:text-sm font-medium flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4">
            <span>🔒 Paiement 100% sécurisé</span>
            <span className="hidden sm:inline">•</span>
            <span>✅ 7 jours gratuits sans carte</span>
            <span className="hidden sm:inline">•</span>
            <span>🔄 Annulation en 1 clic</span>
          </p>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xs font-bold underline underline-offset-4 transition-colors"
          >
            Continuer avec accès limité →
          </button>
        </div>

      </div>
    </div>
  );
}
