import { useState } from "react";
import { Check, X, Shield } from "lucide-react";
import { motion } from "motion/react";

interface PricingSectionProps {
  onUpgradeClick: (priceId?: string) => void;
  onDashboardClick: () => void;
  annualBilling: boolean;
  setAnnualBilling: (val: boolean) => void;
  hideFreePlan?: boolean;
}

export function PricingSection({ onUpgradeClick, onDashboardClick, annualBilling, setAnnualBilling, hideFreePlan = false }: PricingSectionProps) {
  
  return (
    <section id="pricing" className="py-32 bg-black border-t border-[#202020] relative">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00FF88] opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
        
        <div className="space-y-6">
          <span className="text-xs text-[#00FF88] font-bold font-mono uppercase tracking-widest pl-1">Investis en toi-même</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
            Le prix de ta santé.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Combien es-tu prêt à payer pour savoir ce qui rentre dans ton corps chaque jour ? Arrête d'engraisser l'industrie, commence à te nourrir.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm ${!annualBilling ? 'text-white font-bold' : 'text-slate-400'}`}>Mensuel</span>
            <button 
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-7 rounded-full bg-[#1a1a1a] border border-[#333] p-1 relative transition-colors focus:outline-none"
            >
              <div className={`w-5 h-5 rounded-full bg-[#00FF88] shadow transition-transform ${annualBilling ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm flex items-center gap-2 ${annualBilling ? 'text-white font-bold' : 'text-slate-400'}`}>
              Annuel <span className="text-[10px] uppercase bg-[#00FF88]/10 text-[#00FF88] font-black px-2 py-0.5 rounded border border-[#00FF88]/30">Éco 35%</span>
            </span>
          </div>
        </div>

        {/* 3 Tier Grid */}
        <div className={`flex flex-col ${hideFreePlan ? 'md:max-w-3xl justify-center items-center mx-auto' : 'md:grid md:grid-cols-3'} gap-8 max-w-5xl mx-auto text-left items-stretch pt-8 w-full`}>
          
          {/* Free plan */}
          {!hideFreePlan && (
            <div className="order-2 md:order-1 w-full bg-[#0a0a0a] border border-[#222] p-8 rounded-[36px] flex flex-col justify-between relative hover:border-[#333] transition-colors gap-8">
              <div className="space-y-4">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Curieux</span>
                <h3 className="text-2xl font-black text-white">Découverte</h3>
                <p className="text-sm text-slate-400 min-h-[40px]">Testez la puissance de l'analyse IA sur vos produits du quotidien.</p>
                <div className="text-4xl font-black font-display text-white transition-all pt-4">
                  0€ <span className="text-sm text-slate-500 font-normal">/ à vie</span>
                </div>
                <ul className="space-y-4 text-sm text-slate-300 pt-6 border-t border-[#222]">
                  <li className="flex items-start gap-3"><Check className="text-slate-500 w-5 h-5 shrink-0" /> <span>3 scans journaliers</span></li>
                  <li className="flex items-start gap-3"><Check className="text-slate-500 w-5 h-5 shrink-0" /> <span>Analyse basique (Calories, Macros)</span></li>
                  <li className="flex items-start gap-3 text-slate-600"><X className="w-5 h-5 shrink-0" /> <span className="line-through">Détection des sucres cachés</span></li>
                  <li className="flex items-start gap-3 text-slate-600"><X className="w-5 h-5 shrink-0" /> <span className="line-through">Alertes additifs & toxiques</span></li>
                </ul>
              </div>
              <button 
                onClick={onDashboardClick}
                className="w-full h-[56px] py-4 bg-[#111] border border-[#333] hover:bg-[#222] text-white font-bold rounded-2xl transition-all text-center text-sm"
              >
                Créer un compte gratuit
              </button>
            </div>
          )}

          {/* Premium Plan */}
          <div className="order-1 md:order-2 w-full bg-[#0f0f0f] border-2 border-[#00FF88] p-8 rounded-[36px] flex flex-col justify-between relative shadow-[0_0_40px_rgba(0,255,136,0.1)] transform md:-translate-y-4 gap-8">
            <span className="absolute -top-4 right-8 bg-[#00FF88] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
              Le plus choisi
            </span>
            <div className="space-y-4">
              <span className="text-xs text-[#00FF88] font-bold uppercase tracking-wider font-mono">Transformation</span>
              <h3 className="text-2xl font-black text-white">Premium</h3>
              <p className="text-sm text-slate-400 min-h-[40px]">Accès total. Pour ceux qui prennent leur corps et leur santé au sérieux.</p>
              <div className="text-4xl font-black font-display text-white transition-all pt-4 flex items-end gap-2">
                {annualBilling ? "5,99€" : "8,99€"}
                <span className="text-sm text-slate-400 font-normal mb-1">/ mois</span>
              </div>
              {annualBilling && <div className="text-xs font-mono text-[#00FF88]">Facturé 71,88€ par an</div>}
              
              <ul className="space-y-4 text-sm text-white pt-6 border-t border-[#00FF88]/20">
                <li className="flex items-start gap-3"><Check className="text-[#00FF88] w-5 h-5 shrink-0" /> <span><strong>Scans illimités</strong> (Assiettes & Codes Barres)</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#00FF88] w-5 h-5 shrink-0" /> <span><strong>Alerte Toxique</strong> (Édulcorants, additifs nocifs)</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#00FF88] w-5 h-5 shrink-0" /> <span>Alternatives saines proposées en temps réel</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#00FF88] w-5 h-5 shrink-0" /> <span>IA Coach Nutrition (Recalcul automatique)</span></li>
              </ul>
            </div>
            <button 
              onClick={() => onUpgradeClick("price_1TcVGlIcQouyQI6K6uttG2JD")}
              className="w-full h-[56px] py-4 bg-[#00FF88] hover:bg-[#00e67a] text-black font-black rounded-2xl transition-transform hover:scale-[1.02] active:scale-95 text-center text-sm shadow-xl shadow-[#00FF88]/20"
            >
              Prendre le contrôle →
            </button>
          </div>

          {/* Pro tier for coaches */}
          <div className="order-3 w-full bg-[#0a0a0a] border border-[#222] p-8 rounded-[36px] flex flex-col justify-between relative hover:border-[#333] transition-colors gap-8">
            <div className="space-y-4">
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider font-mono">Expert</span>
              <h3 className="text-2xl font-black text-white">Pro Coach</h3>
              <p className="text-sm text-slate-400 min-h-[40px]">L'outil ultime pour les professionnels de santé et coachs sportifs.</p>
              <div className="text-4xl font-black font-display text-white transition-all pt-4">
                {annualBilling ? "14,99€" : "19,99€"} <span className="text-sm text-slate-500 font-normal">/ mois</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300 pt-6 border-t border-[#222]">
                <li className="flex items-start gap-3"><Check className="text-purple-400 w-5 h-5 shrink-0" /> <span>Tout de l'offre Premium</span></li>
                <li className="flex items-start gap-3"><Check className="text-purple-400 w-5 h-5 shrink-0" /> <span>Gestion multi-comptes patients/clients</span></li>
                <li className="flex items-start gap-3"><Check className="text-purple-400 w-5 h-5 shrink-0" /> <span>Exports PDF & CSV des rapports</span></li>
              </ul>
            </div>
            <button 
              onClick={() => onUpgradeClick("price_1TcVHFIcQouyQI6KSdytzdTQ")}
              className="w-full h-[56px] py-4 bg-[#111] border border-[#333] hover:border-purple-500/50 hover:bg-purple-900/20 text-white font-bold rounded-2xl transition-all text-center text-sm"
            >
              Ouvrir un compte Pro
            </button>
          </div>

        </div>

        {/* Security badge */}
        <div className="max-w-xl mx-auto mt-12 bg-[#050505] border border-[#222] p-4 rounded-2xl flex items-center justify-center gap-4 text-sm text-slate-400 font-medium">
          <Shield className="text-[#00FF88] w-6 h-6 shrink-0" />
          <span>Garantie 30 jours satisfait ou remboursé. Annulation en 1 clic.</span>
        </div>

      </div>
    </section>
  );
}
