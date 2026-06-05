import { useState } from "react";
import { Check, X, Shield, Star } from "lucide-react";
import { motion } from "motion/react";

interface PricingSectionProps {
  onUpgradeClick: (priceId?: string) => void;
  onDashboardClick: () => void;
  hideFreePlan?: boolean;
}

export function PricingSection({ onUpgradeClick, onDashboardClick, hideFreePlan = false }: PricingSectionProps) {
  
  return (
    <section id="pricing" className="py-32 bg-slate-900 border-t border-slate-800 relative">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500 opacity-[0.05] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
        
        <div className="space-y-6">
          <span className="text-xs text-emerald-500 font-bold font-mono uppercase tracking-widest pl-1">Investis en toi-même</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
            Le prix de ta santé.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Combien es-tu prêt à payer pour savoir ce qui rentre dans ton corps chaque jour ? Arrête d'engraisser l'industrie, commence à te nourrir.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto text-left items-stretch pt-12 w-full">

          {/* Starter Plan */}
          <div className="flex-1 max-w-sm w-full bg-slate-950 border border-slate-800 p-8 rounded-[36px] flex flex-col justify-between relative hover:border-slate-700 transition-colors gap-8 self-center">
            <div className="space-y-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Découverte</span>
              <h3 className="text-2xl font-black text-white">Starter</h3>
              <p className="text-sm text-slate-400 min-h-[40px]">L'essentiel pour commencer à comprendre ce que vous mangez.</p>
              <div className="text-4xl font-black font-display text-white transition-all pt-4">
                0,90€ <span className="text-sm text-slate-500 font-normal">/ mois</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300 pt-6 border-t border-slate-800">
                <li className="flex items-start gap-3"><Check className="text-white w-5 h-5 shrink-0" /> <span>Scans classiques modérés</span></li>
                <li className="flex items-start gap-3"><Check className="text-white w-5 h-5 shrink-0" /> <span>Macros et apports de base</span></li>
                <li className="flex items-start gap-3 text-slate-600"><X className="w-5 h-5 shrink-0" /> <span className="line-through">Alertes Toxiques & Additifs</span></li>
                <li className="flex items-start gap-3 text-slate-600"><X className="w-5 h-5 shrink-0" /> <span className="line-through">Coach IA personnalisé</span></li>
              </ul>
            </div>
            <button 
              onClick={() => onUpgradeClick("starter")}
              className="w-full h-[56px] py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/80 text-white font-bold rounded-2xl transition-all text-center text-sm"
            >
              Choisir Starter
            </button>
          </div>

          {/* Premium Plan */}
          <div className="flex-[1.15] max-w-md w-full bg-slate-950 border-2 border-emerald-500 p-10 rounded-[36px] flex flex-col justify-between relative shadow-[0_0_50px_rgba(16,185,129,0.15)] transform md:-translate-y-4 gap-8">
            <div className="absolute -top-5 left-0 right-0 flex justify-center">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-[12px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-white" /> Populaire
              </span>
            </div>
            <div className="space-y-4 pt-2">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">Transformation</span>
              <h3 className="text-3xl font-black text-white">Premium</h3>
              <p className="text-sm text-slate-400 min-h-[40px]">Accès total. Pour ceux qui prennent leur corps et leur santé au sérieux.</p>
              <div className="text-5xl font-black font-display text-white transition-all pt-4 flex items-end gap-2">
                6,99€
                <span className="text-base text-slate-400 font-normal mb-1.5">/ mois</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-400 font-semibold text-center">
                🎁 7 jours gratuits (sans engagement)
              </div>
              
              <ul className="space-y-4 text-sm text-white pt-6 border-t border-emerald-500/20">
                <li className="flex items-start gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> <span><strong>Scans illimités</strong> (Assiettes & Codes Barres)</span></li>
                <li className="flex items-start gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> <span><strong>Alerte Toxique</strong> (Édulcorants, additifs nocifs)</span></li>
                <li className="flex items-start gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> <span>Alternatives saines proposées en temps réel</span></li>
                <li className="flex items-start gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> <span>IA Coach Nutrition (Recalcul automatique)</span></li>
              </ul>
            </div>
            <button 
              onClick={() => onUpgradeClick("price_1TcVGlIcQouyQI6K6uttG2JD")}
              className="w-full h-[60px] py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-black rounded-2xl transition-transform hover:scale-[1.03] active:scale-95 text-center text-[15px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] mt-4"
            >
              Choisir Premium →
            </button>
          </div>

        </div>

        {/* Security badge */}
        <div className="max-w-xl mx-auto mt-12 bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-4 text-sm text-slate-400 font-medium shadow-sm">
          <Shield className="text-emerald-500 w-6 h-6 shrink-0" />
          <span>Garantie 30 jours satisfait ou remboursé. Annulation en 1 clic.</span>
        </div>

      </div>
    </section>
  );
}
